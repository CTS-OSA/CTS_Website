from django.db import models
from forms.models.counselor import Counselor
from django.core.exceptions import ValidationError
from django.conf import settings

class Poster(models.Model):
    image = models.CharField(max_length=255, null=False, blank=False)
    uploaded_by = models.ForeignKey(Counselor, on_delete=models.CASCADE, null=False, blank=False)
    created_at = models.DateTimeField(null=False, blank=False)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    status = models.IntegerField(null=False, blank=False, default=1)

    class Meta: 
        db_table = 'poster_details'
    
    @property
    def image_url(self):
        if self.image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/posters/{self.image}"
        return None

    def clean(self):
        if self.deleted_at and self.created_at and self.deleted_at < self.created_at:
            raise ValidationError({
                'deleted_at': "Deleted date must be after created date."
            })
        
        if self.updated_at and self.created_at and self.updated_at < self.created_at:
            raise ValidationError({
                'updated_at': "Updated date must be after created date."
            })