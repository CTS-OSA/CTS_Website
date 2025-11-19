from django.db import models
from utils.helperFunctions import get_phone_validator
from .enums import ReferralStatus, ReceiptStatus
from .submission import Submission
from .student import Student
from .counselor import Counselor
from django.core.exceptions import ValidationError
from users.models import CustomUser

class Referrer(models.Model):
    # If logged-in: link to user account
    student = models.ForeignKey( Student, null=True, blank=True, on_delete=models.SET_NULL,)
    # If not logged-in: store entered info
    last_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    email = models.EmailField()
    department_unit = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=15, validators=[get_phone_validator()])
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    def is_registered(self):
        return self.user is not None
    
class Referral(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    referrer = models.ForeignKey(Referrer, on_delete=models.CASCADE)
    referral_date = models.DateTimeField(auto_now=True)
    reason_for_referral =  models.TextField() 
    initial_actions_taken =  models.TextField() 
    referral_status = models.CharField(max_length=15, choices=ReferralStatus.choices, null=True, default=ReferralStatus.UNREAD)
    def clean(self):
        if not self.reason_for_referral or not self.reason_for_referral.strip():
            raise ValidationError("Reason for referral cannot be empty.")
        if not self.initial_actions_taken or not self.initial_actions_taken.strip():
         raise ValidationError("Initial Actions Taken cannot be empty.")
        
    def __str__(self):
        return f"Referral from {self.referrer} for submission {self.submission.id}"

        
class AcknowledgementReceipt(models.Model):
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE)
    counselor = models.ForeignKey(Counselor, on_delete=models.CASCADE)
    date_of_visitation = models.DateField()
    date_of_receipt = models.DateField()
    status = models.CharField(max_length=30, choices=ReceiptStatus.choices)
    follow_up = models.IntegerField(null=True, blank=True)
    referred_to = models.CharField(max_length=50, null=True, blank=True)

    def clean(self):
        if self.date_of_visitation > self.date_of_receipt:
            raise ValidationError("Date of visitation cannot be after date of receipt.")
        if self.status == ReceiptStatus.NO_SHOW and self.follow_up is None:
            raise ValidationError("Follow-up count is required for 'Student did not show up' status.")

        if self.status == ReceiptStatus.REFERRED and not self.referred_to:
            raise ValidationError("'Referred to' field is required when status is Referred.")

    def __str__(self):
        return f"Acknowledgement by {self.counselor} for referral {self.referral.id}"
