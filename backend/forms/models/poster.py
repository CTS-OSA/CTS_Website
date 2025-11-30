from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Poster(models.Model):
    image = models.CharField(null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True) 
    deleted_at = models.DateTimeField(null=True, blank=True)
    status = models.IntegerField(default=0, blank=True) # 1 => active, 0 => inactive

    class Meta: 
        db_table = 'poster_details'

    def clean(self):
        """
            Custom validation to enforce fields based on poster details
        """

        if self.image is None:
            raise ValidationError("Image is required.")
        
        if 'updated_at' > 'created_at':
            raise ValidationError({
                'updated_at': "Updated date must be later than created date."
            })
        
        if 'deleted_at' > 'created_at':
            raise ValidationError({
                'deleted_at': "Deleted date must be later than created date."
            })