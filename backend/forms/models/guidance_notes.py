from django.db import models
from .student import Student
from .submission import Submission
from forms.utils.helperFunctions import check_required_fields
from django.core.exceptions import ValidationError

class GuidanceSpecialistNotes(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, to_field='student_number', related_name='guidance_notes')
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    notes = models.TextField(verbose_name="Guidance Services Specialist Notes", null=True, blank=True)
    specialist = models.ForeignKey('forms.Counselor', on_delete=models.SET_NULL, null=True, blank=True, related_name='guidance_notes_created')
    is_confidential = models.BooleanField(default=True, help_text="If checked, only guidance specialists can view this note")
    date_added = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'guidance_specialist_notes'
        ordering = ['-date_added']
        verbose_name = "Guidance Specialist Note"
        verbose_name_plural = "Guidance Specialist Notes"

    def clean(self):
        """
        Custom validation to enforce required fields based on submission status.
        """
        if self.submission.status == 'draft':
            return

        elif self.submission.status == 'submitted':
            required_fields = {
                'student': 'required',
                'notes': 'required',
                'specialist': 'required'
            }

            check_required_fields(self, required_fields, self.submission.status)

    def __str__(self):
        specialist_name = f"{self.specialist.first_name} {self.specialist.last_name}" if self.specialist else "Unknown"
        return f"Guidance Notes - {self.student.first_name} {self.student.last_name} - by {specialist_name} ({self.date_added.date()})"
    
    
