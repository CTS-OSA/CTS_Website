from django.db import models
from django.core.exceptions import ValidationError
from .student import Student
from .enums import SemesterEnum
import re
from .submission import Submission
from forms.utils.helperFunctions import check_required_fields

class CollegeAward(models.Model):
    student = models.ForeignKey('Student', to_field='student_number', on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    award = models.CharField(max_length=255)
    semester = models.CharField(
        max_length=15,
        choices=SemesterEnum.choices
    )
    academic_year = models.CharField(
        max_length=9,
        help_text="Format: YYYY-YYYY"
    )
    position = models.CharField(max_length=255)

    class Meta:
        db_table = 'college_award'

    def clean(self):
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            # Validate academic year format (e.g., 2023-2024)
            if not re.match(r"^20\d{2}-20\d{2}$", self.academic_year):
                raise ValidationError({
                    'academic_year': "Academic year must follow the format YYYY-YYYY (e.g., 2023-2024)."
                })

            start_year, end_year = map(int, self.academic_year.split('-'))
            if end_year != start_year + 1:
                raise ValidationError({
                    'academic_year': "The second year must be one more than the first year (e.g., 2023-2024)."
                })

            # Check required fields when the submission is submitted
            required_fields = {
                'student': 'required',
                'award': 'required',
                'semester': 'required',
                'academic_year': 'required',
                'position': 'required',
            }
            check_required_fields(self, required_fields, self.submission.status)

    def __str__(self):
        return f"{self.student.student_number} - {self.award} ({self.academic_year})"
