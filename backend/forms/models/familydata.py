from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from .student import Student
from .submission import Submission
from forms.utils.helperFunctions import check_required_fields
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

def get_phone_validator():
    return RegexValidator(
        regex=r'^\+?\d{9,11}$',
        message="Enter a valid phone number (9 to 15 digits, optional leading '+')."
    )

class Parent(models.Model):
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    job_occupation = models.CharField(max_length=50, null=True, blank=True)
    company_agency = models.CharField(max_length=50, null=True, blank=True)
    company_address = models.TextField(null=True, blank=True)
    highest_educational_attainment = models.CharField(max_length=50, null=True, blank=True)
    contact_number = models.CharField(max_length=15, validators=[get_phone_validator()], null=True, blank=True)
    is_deceased = models.BooleanField(default=False)
    is_none = models.BooleanField(default=False)

    def clean(self):
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            # If marked as deceased, only first_name and last_name are required
            if self.is_deceased:
                required_fields = {
                    'first_name': 'required',
                    'last_name': 'required'
                }
                check_required_fields(self, required_fields, self.submission.status)
                return
            
            # If marked as none, skip all validation
            if self.is_none:
                return
            
            # Otherwise, all fields are required
            required_fields = {
                'first_name': 'required',
                'last_name': 'required',
                'contact_number': 'required',
                'age': 'required'
            }
            check_required_fields(self, required_fields, self.submission.status)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

class Sibling(models.Model):
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    sex = models.CharField(choices=[('Male', 'Male'), ('Female', 'Female')], max_length=6, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    job_occupation = models.CharField(max_length=50, null=True, blank=True)
    company_school = models.CharField(max_length=100, null=True, blank=True)
    educational_attainment = models.CharField(max_length=50, null=True, blank=True)
    students = models.ManyToManyField('Student', related_name='siblings')
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)

    def clean(self):
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            required_fields = {
                'first_name': 'required',
                'last_name': 'required',
                'sex': 'required',
                'age': 'required',
                'educational_attainment': 'required'
            }
            check_required_fields(self, required_fields, self.submission.status)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

class Guardian(models.Model):
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    contact_number = models.CharField(max_length=15, validators=[get_phone_validator()], null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    relationship_to_guardian = models.CharField(max_length=50, null=True, blank=True)
    language_dialect = models.JSONField(null=True, blank=True)
    

    def clean(self):
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            required_fields = {
                'first_name': 'required',
                'last_name': 'required',
                'contact_number': 'required',
                'address': 'required',
                'relationship_to_guardian': 'required'
            }
            check_required_fields(self, required_fields, self.submission.status)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class FamilyData(models.Model):
    student = models.OneToOneField(Student, to_field='student_number', on_delete=models.CASCADE, related_name='family_data')
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    mother = models.ForeignKey(Parent, null=True, blank=True, on_delete=models.CASCADE, related_name='children_mother')
    father = models.ForeignKey(Parent, null=True, blank=True, on_delete=models.CASCADE, related_name='children_father')
    guardian = models.ForeignKey(Guardian, null=True, blank=True, on_delete=models.CASCADE)
    
   

    def clean(self):
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            required_fields = {
                'student': 'required',  # student is always required
                'mother': 'required_if_present',  # mother is required if present
                'father': 'required_if_present',  # father is required if present
                'guardian': 'required_if_present'  # guardian is required if present
            }

            # Check required fields
            for field, status in required_fields.items():
                field_value = getattr(self, field)

                if status == 'required' and not field_value:
                    raise ValidationError(f"The field '{field}' is required.")

                if status == 'required_if_present' and field_value:
                    if not field_value.id:  # Check if the related model object exists
                        raise ValidationError(f"The field '{field}' must be valid if present.")

    def __str__(self):
        return f'Family Data for {self.student.first_name} {self.student.last_name}'