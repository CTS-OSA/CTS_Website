from django.db import models
from .student import Student

class Submission(models.Model):
    FORM_CHOICES = [
        ('Basic Information Sheet', 'Basic Information Sheet'),
        ('Student Cumulative Information File', 'Student Cumulative Information File'),
        ('Psychosocial Assistand and Referral Desk', 'Psychosocial Assistand and Referral Desk')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    form_type = models.CharField(max_length=50, choices=FORM_CHOICES)
    status = models.CharField(max_length=10, choices=[('draft', 'Draft'), ('submitted', 'Submitted')], default='draft')
    created_at = models.DateTimeField(auto_now_add=True) 
    saved_on = models.DateTimeField(null=True, blank=True) 
    submitted_on = models.DateTimeField(null=True, blank=True)  
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'form_type')  

    def __str__(self):
        return f"Submission for {self.student} - {self.form_type} - {self.status}"
