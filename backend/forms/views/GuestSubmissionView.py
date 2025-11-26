# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from forms.models import PendingSubmission
from forms.serializers import ReferralSerializer
from forms.tokens import submission_token
from rest_framework.permissions import AllowAny
from forms.models import Referrer, ReferredPerson, Referral, Submission


@api_view(["POST"])
@permission_classes([AllowAny])
def create_referral_submission(request):
    """
    Handles creation of referrals. 
    - Logged-in users: creates normally.
    - Anonymous users: validates data, saves as PendingSubmission, sends verification email.
    """
    user = request.user
    data = request.data

    # -------------------------------
    # ANONYMOUS USERS
    # -------------------------------
    if not user.is_authenticated:
        # Extract the guest sub-fields
        referrer_data = data.get("referrer")
        referred_data = data.get("referred_person")

        # ----- REFERRER VALIDATION -----
        required_referrer_fields = ['first_name', 'last_name', 'email', 'department_unit', 'contact_number']
        missing_referrer_fields = [f for f in required_referrer_fields if not referrer_data.get(f)]
        if missing_referrer_fields:
            return Response(
                {"error": f"Missing required referrer fields: {', '.join(missing_referrer_fields)}"},
                status=400
            )

        # ----- REFERRED PERSON VALIDATION -----
        required_referred_fields = ['first_name', 'last_name', 'contact_number', 'degree_program', 'year_level', 'gender']
        missing_referred_fields = [f for f in required_referred_fields if not referred_data.get(f)]
        if missing_referred_fields:
            return Response(
                {"error": f"Missing required referred person fields: {', '.join(missing_referred_fields)}"},
                status=400
            )

        # ----- OTHER REQUIRED FIELDS -----
        other_required_fields = ['reason_for_referral', 'initial_actions_taken']
        missing_other_fields = [f for f in other_required_fields if not data.get(f)]
        if missing_other_fields:
            return Response(
                {"error": f"Missing required fields: {', '.join(missing_other_fields)}"},
                status=400
            )
        # ----- SERIALIZER VALIDATION -----
        serializer = ReferralSerializer(data=data, context={"request": request})
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=400)

        # Save as PendingSubmission for email verification
        pending = PendingSubmission.objects.create(
            email=serializer.validated_data['referrer']['email'],
            data=data
        )

        # Generate token and link
        token = submission_token.make_token(pending)
        verify_url = f"{settings.FRONTEND_URL}/verify?pending_id={pending.id}&token={token}"

        # Send email
        send_mail(
            subject="Verify your referral submission",
            message=f"Click here to verify your submission: {verify_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[pending.email]
        )

        return Response({"message": "Verification email sent."}, status=200)

    # -------------------------------
    # LOGGED-IN USERS
    # -------------------------------
    serializer = ReferralSerializer(data=data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({"message": "Referral created successfully."}, status=201)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from forms.models import PendingSubmission, Submission
from forms.serializers import ReferralSerializer
from forms.tokens import submission_token

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_referral_submission(request):
    """
    Verifies a guest referral submission using a pending submission and token.
    Once verified, creates the actual Submission and Referral instances.
    """
    pending_id = request.data.get("pending_id")
    token = request.data.get("token")

    # Fetch pending submission
    try:
        pending = PendingSubmission.objects.get(id=pending_id)
    except PendingSubmission.DoesNotExist:
        return Response({"error": "Pending submission not found."}, status=404)

    # Already verified
    if pending.status == 'verified':
        return Response({"message": "Submission already verified."})

    # Expiry check
    if pending.is_expired():
        pending.mark_expired()
        return Response({"error": "Submission has expired."}, status=400)

    # Token validation
    if not submission_token.check_token(pending, token):
        return Response({"error": "Invalid token."}, status=400)

    # ------------------------
    # Create actual Submission
    # ------------------------
    pending_data = pending.data
    submission = Submission.objects.create(
        student=None,  # guest submission
        form_type=pending.data.get("form_type", "Counseling Referral Slip"),
        status='draft',
        submitted_on=timezone.now()
    )

    # ------------------------
    # Create the Referral using the serializer
    # ------------------------
    serializer = ReferralSerializer(data=pending.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save(submission=submission) 
    
    # Mark pending as verified
    pending.status = 'verified'
    pending.save()
    submission.status = 'submitted'
    submission.save()

    return Response({"message": "Referral verified and saved successfully."}, status=201)