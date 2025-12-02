# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from forms.models import PendingSubmission
from forms.tokens import submission_token
from forms.models import Referrer, ReferredPerson, Referral, Submission, PendingSubmission
from django.utils import timezone
from forms.serializers import ReferralSerializer, GuestReferralSerializer
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

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
        required_referrer_fields = ['first_name', 'last_name', 'department_unit', 'contact_number']
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
        other_required_fields = ['reason_for_referral', 'initial_actions_taken', 'guest_email']
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

        guest_email = data.get("guest_email")
        if not guest_email:
            return Response({"error": "guest_email is required."}, status=400)

        pending = PendingSubmission.objects.create(
            email=guest_email,
            data=data
        )

        # Generate token and link
        token = submission_token.make_token(pending)
        verify_url = f"{settings.FRONTEND_URL}/verify?pending_id={pending.id}&token={token}"

        # Send email
        context = {
            "verify_url": verify_url,
            "site_name": "Your Counseling Office",
            "year": 2025,
        }

        html_content = render_to_string("referral_verification.html", context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject="Counseling Referral Slip Verification",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[pending.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()


        return Response({"message": "Verification email sent."}, status=200)

    # -------------------------------
    # LOGGED-IN USERS
    # -------------------------------
    serializer = ReferralSerializer(data=data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({"message": "Referral created successfully."}, status=201)

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
        guest_email=pending.data['guest_email'],
        status='draft',
        submitted_on=timezone.now(),
        saved_on=timezone.now()
    )

    # ------------------------
    # Create the Referral using the serializer
    # ------------------------
    serializer = GuestReferralSerializer(data=pending.data, context={"submission": submission})
    serializer.is_valid(raise_exception=True)
    serializer.save()

    
    # Mark pending as verified
    pending.status = 'verified'
    pending.save()
    submission.status = 'submitted'
    submission.save()

    context = {
        "referred_person_first_name": pending_data['referred_person']['first_name'],
        "referred_person_last_name": pending_data['referred_person']['last_name'],
        "referred_person_degree_program": pending_data['referred_person']['degree_program'],
        "referred_person_year_level": pending_data['referred_person']['year_level'],
        "referred_person_gender": pending_data['referred_person']['gender'],
        "referred_person_contact_number": pending_data['referred_person']['contact_number'],
        "reason_for_referral": pending_data['reason_for_referral'],
        "initial_actions_taken": pending_data['initial_actions_taken'],
        "referrer_first_name": pending_data['referrer']['first_name'],
        "referrer_last_name": pending_data['referrer']['last_name'],
        "referrer_department": pending_data['referrer']['department_unit'],
        "referrer_contact_number": pending_data['referrer']['contact_number'],
        "referrer_email": pending_data['guest_email'],
        "referral_date": timezone.now,
        "site_name": "Your Counseling Office",
        "year": 2025,
        "up_logo_url": "up_logo.png",
        "up_28th_logo_url": "up28_logo.png",
    }

    html_content = render_to_string("referral_verified.html", context) 
    text_content = strip_tags(html_content) 
    email = EmailMultiAlternatives( 
        subject="Your Referral Slip Has Been Sent to the Counselor", 
        body=text_content, from_email=settings.DEFAULT_FROM_EMAIL, 
        to=[pending_data['guest_email']], ) 
    
    email.attach_alternative(html_content, "text/html") 
    email.send()
    return Response({"message": "Referral verified and saved successfully."}, status=201)