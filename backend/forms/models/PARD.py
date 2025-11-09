from django.db import models
from .submission import Submission

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