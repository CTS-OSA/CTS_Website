import re
from django.db import models
from django.core.exceptions import ValidationError
from users.models import CustomUser
from .address import Address  
from .enums import CollegeEnum, YearLevelEnum, DegreeProgramEnum, SemesterEnum 
from django.core.validators import RegexValidator
from django.db.models.signals import post_delete
from django.dispatch import receiver
import os

def validate_student_number(value):
    if not re.match(r'^\d{4}-\d{5}$', value):
        raise ValidationError('Student number must be in the format YYYY-XXXXX')

def get_phone_validator():
    return RegexValidator(
        regex=r'^\+?\d{9,15}$',
        message="Enter a valid phone number (9 to 15 digits, optional leading '+')."
    )

def student_photo_upload_path(instance, filename):
    return f'student_photos/{instance.student.student_number}/{filename}'

class Student(models.Model):
    # Education
    student_number = models.CharField(max_length=10, unique=True,  primary_key=True, validators=[validate_student_number])
    college = models.CharField(max_length=20, choices=CollegeEnum.choices)
    current_year_level = models.CharField(max_length=10, choices=YearLevelEnum.choices)
    degree_program = models.CharField(max_length=50, choices=DegreeProgramEnum.choices)
    date_initial_entry = models.CharField(
        max_length=9,
        help_text="Format: YYYY-YYYY (e.g., 2023-2024)"
    )
    date_initial_entry_sem = models.CharField(
        max_length=15,
        choices=SemesterEnum.choices
    )
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    
    # Personal Information
    last_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    nickname = models.CharField(max_length=50, null=True, blank=True)
    sex = models.CharField(max_length=6, choices=[('Male', 'Male'), ('Female', 'Female')])
    religion = models.CharField(max_length=50, null=True, blank=True)
    birth_rank = models.PositiveIntegerField()  
    birthdate = models.DateField()
    birthplace = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=15, validators=[get_phone_validator()])
    landline_number = models.CharField(max_length=15, validators=[get_phone_validator()], null=True, blank=True)
    
    # Address
    permanent_address = models.ForeignKey(Address, related_name='permanent_students', on_delete=models.CASCADE)
    
    # Adress while in UP
    address_while_in_up = models.ForeignKey(Address, related_name='students_in_up', on_delete=models.CASCADE)

    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def clean(self):
        if not re.match(r"^20\d{2}-20\d{2}$", self.date_initial_entry):
            raise ValidationError({
                'date_initial_entry': "Format must be YYYY-YYYY using years from 2000 onward (e.g., 2023-2024)."
            })

        start_year, end_year = map(int, self.date_initial_entry.split('-'))
        if end_year != start_year + 1:
            raise ValidationError({
                'date_initial_entry': "The second year must be the first year plus one (e.g., 2023-2024)."
            })
    
    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.student_number})'

    def save(self, *args, **kwargs):
        if self.is_complete and not self.completed_at:
            from django.utils.timezone import now
            self.completed_at = now()
        super().save(*args, **kwargs)
        
    def delete(self, *args, **kwargs):
        if hasattr(self, 'photo') and self.photo:
            self.photo.image.delete(save=False)
            self.photo.delete() 
        super().delete(*args, **kwargs)
        
class StudentPhoto(models.Model):
    student = models.OneToOneField(
        Student, 
        on_delete=models.CASCADE, 
        related_name='photo'
    )
    image = models.ImageField(upload_to=student_photo_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo of {self.student.student_number}"