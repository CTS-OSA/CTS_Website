from django.db import models
from django.core.exceptions import ValidationError
from .student import Student
from .submission import Submission
from forms.utils.helperFunctions import check_required_fields  # Assuming this function exists

class PsychometricData(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, to_field='student_number', related_name='psychometric_data')
    testing_date = models.DateField(verbose_name="Date of Testing")
    test_name = models.CharField(max_length=100, verbose_name="Name of Test")
    raw_score = models.CharField(max_length=20, verbose_name="Raw Score")
    percentile = models.CharField(max_length=20, verbose_name="Percentile/IQ")
    classification = models.CharField(max_length=50, verbose_name="Classification")
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-testing_date']
        verbose_name = "Psychometric Data"
        verbose_name_plural = "Psychometric Data"

    def clean(self):
        """
        Custom validation to enforce conditional fields based on submission status.
        """
        if self.submission.status == 'draft':
            # In draft status, fields can be left blank
            return
        elif self.submission.status == 'submitted':
            required_fields = {
                'student': 'required',
                'testing_date': 'required',
                'test_name': 'required',
                'raw_score': 'required',
                'percentile': 'required',
                'classification': 'required'
            }

            check_required_fields(self, required_fields, self.submission.status)

    def __str__(self):
        return f"Psychometric Data - {self.student.first_name} {self.student.last_name} - {self.test_name}"


