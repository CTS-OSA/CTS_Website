from django.db import models
from users.models import CustomUser
from forms.utils.helperFunctions import get_phone_validator
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError

def counselor_photo_upload_path(instance, filename):
    return f'counselor_photos/{instance.counselor.user.email}/{filename}'


class Counselor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    last_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    nickname = models.CharField(max_length=50, null=True, blank=True)
    suffix = models.CharField(max_length=20, null=True, blank=True)
    sex = models.CharField(max_length=6, choices=[('Male', 'Male'), ('Female', 'Female')])
    birthdate = models.DateField()
    contact_number = models.CharField(max_length=15, validators=[get_phone_validator()])
    position = ArrayField(models.CharField(max_length=50), null=True, blank=True)
    post_nominal = ArrayField(models.CharField(max_length=50), null=True, blank=True)
    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
     
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
    
    def clean(self):
        # Only staff users can be counselors
        if not self.user.is_staff:
            raise ValidationError("Only staff users can be assigned as counselors.")

    def save(self, *args, **kwargs):
        self.full_clean()   # ensures clean() runs
        super().save(*args, **kwargs)
        
class CounselorLicense(models.Model):
    counselor = models.ForeignKey(
        Counselor, 
        on_delete=models.CASCADE, 
        related_name="licenses"
    )
    name = models.CharField(max_length=255)
    number = models.CharField(max_length=255)
    
    class Meta:
      unique_together = ('counselor', 'number')

    def __str__(self):
        return f"{self.name} ({self.number})"

class CounselorPhoto(models.Model):
    counselor = models.OneToOneField(
        Counselor, 
        on_delete=models.CASCADE, 
        related_name='photo'
    )
    image = models.ImageField(upload_to=counselor_photo_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo of {self.counselor.first_name} {self.counselor.last_name}"