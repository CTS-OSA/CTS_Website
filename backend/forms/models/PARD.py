from django.db import models
from .submission import Submission
from forms.utils.helperFunctions import check_required_fields
import datetime
from django.core.exceptions import ValidationError

class PARD(models.Model):
    student_number = models.ForeignKey('Student', to_field='student_number', on_delete=models.CASCADE)
    submission_id = models.ForeignKey(Submission, on_delete=models.CASCADE)
    
    # CONTACT INFO PAGE
    preferred_date = models.CharField(max_length=10, blank=True, null=True)
    preferred_time = models.TimeField(blank=True, null=True)
    
    # PSYCH ASSESSMENT PAGE
    date_started = models.DateField(blank=True, null=True)
    is_currently_on_medication = models.BooleanField(default=False)
    is_diagnosed = models.BooleanField(default=False)
    symptoms_observed = models.CharField(blank=True, null=True)
    date_diagnosed = models.DateField(blank=True, null=True)
    communication_platform = models.CharField(max_length=100, blank=True, null=True)
    diagnosed_by = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'pard_details'

    def clean(self):
        """
        Custom validation to enforce required fields based on submission status.
        """

        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            required_fields = [
                'preferred_date', 'preferred_time', 'date_started',
                'is_currently_on_medication', 'is_diagnosed', 'symptoms_observed',
                'date_diagnosed', 'communication_platform', 'diagnosed_by'
            ]

            check_required_fields(self, required_fields, self.submission.status)
            

            if 'preferred_date' < datetime.date.today():
                raise ValidationError({
                    'preferred_date': "Preferred date must be in the future."
                })

            if 'preferred_time' < datetime.datetime.now().time():
                raise ValidationError({
                    'preferred_time': "Preferred time must be in the future."
                })
            