from django.db import models
from .student import Student
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class Submission(models.Model):
    FORM_CHOICES = [
        ('Basic Information Sheet', 'Basic Information Sheet'),
        ('Student Cumulative Information File', 'Student Cumulative Information File'),
        ('Psychosocial Assistance and Referral Desk', 'Psychosocial Assistance and Referral Desk'),
        ('Counseling Referral Slip', 'Counseling Referral Slip')
    ]

    student = models.ForeignKey(Student, null=True, blank=True, on_delete=models.SET_NULL)
    form_type = models.CharField(max_length=50, choices=FORM_CHOICES)
    status = models.CharField(max_length=10, choices=[('draft', 'Draft'), ('submitted', 'Submitted')], default='draft')
    created_at = models.DateTimeField(auto_now_add=True) 
    saved_on = models.DateTimeField(null=True, blank=True) 
    submitted_on = models.DateTimeField(null=True, blank=True)  
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'form_type')  

    def clean(self):
        # Conditional validation for logged-in student submissions
        if self.form_type == 'Counseling Referral Slip':  
            if not self.student and not self.student_name:
                raise ValidationError("Student information is required for referral slip submissions.")
            
    def __str__(self):
        return f"Submission for {self.student} - {self.form_type} - {self.status}"

class PendingSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('expired', 'Expired'),
    ]

    email = models.EmailField()
    data = models.JSONField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        """Returns True if submission is pending and older than 1 day"""
        return self.status == 'pending' and timezone.now() > self.created_at + timedelta(days=1)

    def mark_expired(self):
        self.status = 'expired'
        self.save()