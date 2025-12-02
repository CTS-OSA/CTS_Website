from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from forms.models import Referral, Submission
from forms.serializers import ReferralSerializer
from users.utils import log_action

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
        section_data = request.data.get('referral')  # this should only contain referral info

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