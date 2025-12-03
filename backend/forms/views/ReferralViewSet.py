from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from forms.models import Referral, Submission, AcknowledgementReceipt, enums, Counselor
from forms.serializers import ReferralSerializer
from users.utils import log_action
from rest_framework.permissions import IsAdminUser
from forms.serializers import AcknowledgementReceiptSerializer
from users.models import CustomUser
from forms.models.enums import ReferralStatus

class ReferralSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, referral_id):
        """
        Retrieve a specific referral submission for the logged-in student
        based on the referral_id.
        """
        student = request.user.student

        try:
            submission = Submission.objects.get(id=referral_id, student=student)
        except Submission.DoesNotExist:
            return Response(
                {'error': 'Submission not found or not owned by this student.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            referral_instance = Referral.objects.get(submission=submission)
        except Referral.DoesNotExist:
            return Response(
                {'error': 'Referral does not exist for this submission.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReferralSerializer(referral_instance)
        return Response({'referral': serializer.data}, status=status.HTTP_200_OK)


    def post(self, request):
        student = request.user.student
        section_data = request.data.get('referral') 

        if not section_data:
            return Response({'error': 'Referral data is required.'}, status=status.HTTP_400_BAD_REQUEST)

        submission = Submission.objects.create(
            student=student,
            status='submitted', 
            form_type='Counseling Referral Slip', 
            submitted_on=timezone.now(),
            saved_on=timezone.now()
        )
        serializer = ReferralSerializer(data=section_data, context={'request': request, 'submission': submission})
        if serializer.is_valid():
            referral_instance = serializer.save()
            return Response({
                'message': 'Referral submitted successfully.',
                'referral_id': referral_instance.id,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class IsAdminCounselor(permissions.BasePermission):
    """
    Allows access only to authenticated admin users who have a counselor profile.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "is_staff", False) and
            hasattr(request.user, "counselor")
        )


class AcknowledgementReceiptView(APIView):
    permission_classes = [IsAdminCounselor]

    def get(self, request, submission_id):
        """
        Retrieve existing acknowledgement receipt OR referral data
        to prefill receipt form WITHOUT creating a DB record.
        """
        try:
            submission = Submission.objects.get(id=submission_id)
            referral = Referral.objects.get(submission=submission)
        except Submission.DoesNotExist:
            return Response({"error": "Submission not found."}, status=404)
        except Referral.DoesNotExist:
            return Response({"error": "Referral not found."}, status=404)

        # Try to fetch existing receipt
        try:
            receipt = AcknowledgementReceipt.objects.get(referral=referral)
        except AcknowledgementReceipt.DoesNotExist:
            # Create an UNSAVED instance only for serializer prefill
            receipt = AcknowledgementReceipt(
                referral=referral,
                counselor=getattr(request.user, "counselor", None),
                # DO NOT set date_of_visitation — frontend must supply it
            )

        serializer = AcknowledgementReceiptSerializer(
            receipt,
            context={"request": request}
        )
        return Response(serializer.data, status=200)


    def post(self, request, submission_id):
        """
        Create or update the acknowledgement receipt.
        Counselor is automatically assigned based on logged-in user.
        """
        # Fetch submission and referral
        try:
            submission = Submission.objects.get(id=submission_id)
            referral = Referral.objects.get(submission=submission)
        except (Submission.DoesNotExist, Referral.DoesNotExist):
            return Response({"error": "Submission or referral not found."}, status=404)

        # Ensure the user has a counselor profile
        counselor = getattr(request.user, "counselor", None)
        if not counselor:
            return Response({"error": "Only counselors can submit acknowledgement receipts."}, status=403)

        # Try to fetch existing receipt
        try:
            receipt = AcknowledgementReceipt.objects.get(referral=referral)
            serializer = AcknowledgementReceiptSerializer(
                receipt,
                data=request.data,
                partial=True,  
                context={"request": request, "referral": referral, "counselor": counselor}
            )
        except AcknowledgementReceipt.DoesNotExist:
            serializer = AcknowledgementReceiptSerializer(
                data=request.data,
                context={"request": request, "referral": referral, "counselor": counselor}
            )

        if serializer.is_valid():
            # The serializer's create/update will handle referral, counselor, and date_of_receipt
            receipt_obj = serializer.save()

            # Update referral status
            referral.referral_status = 'acknowledged'
            referral.save()

            return Response({
                "message": "Acknowledgement receipt submitted successfully.",
                "data": AcknowledgementReceiptSerializer(receipt_obj, context={"request": request}).data
            }, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)