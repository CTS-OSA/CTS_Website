from django.db import models
from forms.utils.helperFunctions import get_phone_validator, check_required_fields
from .enums import ReferralStatus, ReceiptStatus
from .submission import Submission
from .student import Student
from .counselor import Counselor
from django.core.exceptions import ValidationError
from users.models import CustomUser
from django.utils import timezone
   
class Referrer(models.Model):
    # Logged-in referrer
    student = models.ForeignKey(Student, null=True, blank=True, on_delete=models.SET_NULL)
    # Guest (anonymous) fields
    last_name = models.CharField(max_length=50, null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    department_unit = models.CharField(max_length=50, null=True, blank=True)
    contact_number = models.CharField(
        max_length=15,
        validators=[get_phone_validator()],
        null=True,
        blank=True,
    )

    def __str__(self):
        first = self.first_name or ""
        last = self.last_name or ""
        return f"{first} {last}".strip()

    def is_registered(self):
        return self.student is not None

    def clean(self):
        submission_status = self.referral.submission.status

        # skip validation in draft
        if submission_status == 'draft':
            return
        
        errors = {}
        # Logged-in referrer validations
        if self.student:
            guest_fields = [
                self.first_name, self.last_name,
                self.department_unit, self.contact_number
            ]
            if any(guest_fields):
                errors['guest_fields'] = "Guest fields must be empty for logged-in users."
        # Guest referrer validations
        else:
            required_fields = [
                self.first_name, self.last_name,
                self.department_unit, self.contact_number
            ]
            if not all(required_fields):
                errors['guest_fields'] = "All guest fields are required for guest referrers."

        if errors:
            raise ValidationError(errors)


class ReferredPerson(models.Model):
    student = models.ForeignKey(Student, null=True, blank=True, on_delete=models.SET_NULL)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    degree_program = models.CharField(max_length=100, null=True, blank=True)
    year_level = models.CharField(max_length=10, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)

    def clean(self):
        if self.referral.submission.status == 'submitted':
            required_fields = {
                'first_name': 'required',
                'last_name': 'required',
                'contact_number': 'required',
                'degree_program': 'required',
                'year_level': 'required',
                'gender': 'required'
            }
            
            check_required_fields(self, required_fields, self.submission.status)

       
class Referral(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    referrer = models.ForeignKey(Referrer, null=True, blank=True, on_delete=models.SET_NULL)
    referred_person = models.ForeignKey(ReferredPerson, null=True, blank=True, on_delete=models.SET_NULL)
    referral_date = models.DateTimeField(auto_now_add=True)
    reason_for_referral = models.TextField(blank=True)
    initial_actions_taken = models.TextField(blank=True)
    referral_status = models.CharField(
        max_length=15, choices=ReferralStatus.choices, null=True, default=ReferralStatus.UNREAD
    )

    def clean(self):
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == "submitted":
            required_fields = {
                'referrer': 'required',
                'referred_person': 'required',
                'reason_for_referral': 'required',
                'initial_actions_taken': 'required'
            }
            
            check_required_fields(self, required_fields, self.submission.status)    
            # Enforce required fields only if submission is not draft
            if not self.referrer:
                raise ValidationError("Referrer is required for submitted referrals.")
            if not self.referred_person:
                raise ValidationError("Referred person is required for submitted referrals.")
            if not self.reason_for_referral.strip():
                raise ValidationError("Reason for referral cannot be empty.")
            if not self.initial_actions_taken.strip():
                raise ValidationError("Initial actions taken cannot be empty.")

    def __str__(self):
        return f"Referral {self.id} from {self.referrer}"

class AcknowledgementReceipt(models.Model):
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE)
    counselor = models.ForeignKey(Counselor, on_delete=models.CASCADE)
    date_of_visitation = models.DateField()
    date_of_receipt = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=30, choices=ReceiptStatus.choices)
    follow_up = models.IntegerField(null=True, blank=True)
    referred_to = models.CharField(max_length=50, null=True, blank=True)

    def clean(self):
        # Get submission status through referral
        submission_status = self.referral.submission.status

        # 2) Validate on submitted
        errors = {}

        if self.date_of_visitation > self.date_of_receipt:
            errors['date_of_visitation'] = "Visitation date cannot be after date of receipt."

        if self.status == ReceiptStatus.NO_SHOW and self.follow_up is None:
            errors['follow_up'] = "Follow-up count is required when student did not show up."

        if self.status == ReceiptStatus.REFERRED and not self.referred_to:
            errors['referred_to'] = "'Referred to' is required when status is Referred."

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"Acknowledgement by {self.counselor} for referral {self.referral.id}"

