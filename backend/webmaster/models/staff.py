from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings

class Staff(models.Model):
    image = models.CharField(max_length=255, null=False, blank=False)
    name = models.CharField(max_length=255, null=False, blank=False)
    post_nominal = models.CharField(max_length=30, null=False, blank=False)
    position = models.CharField(max_length=100, null=False, blank=False)
    license = models.CharField(max_length=200, null=False, blank=False)
    created_at = models.DateTimeField(null=False, blank=False)
    updated_at = models.DateTimeField(null=True, blank=True)
    status = models.IntegerField(null=False, blank=False, default=1)
    order = models.IntegerField(null=False, blank=False, default=0)

    class Meta: 
        db_table = 'staff_details'
        ordering = ['order']
    
    @property
    def image_url(self):
        if self.image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/staff/{self.image}"
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