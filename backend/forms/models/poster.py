from django.db import models
from .counselor import Counselor
from django.core.exceptions import ValidationError
from forms.utils.helperFunctions import check_required_fields

class Poster(models.Model):
    image = models.CharField(max_length=100, null=True)
    uploaded_by = models.ForeignKey(Counselor, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    status = models.IntegerField(null=True)

    class Meta: 
        db_table = 'poster_details'

    def clean(self):
        required_fields = [
            'image', 'uploaded_by', 'created_at', 'status'
        ]

        check_required_fields(self, required_fields)

        if 'deleted_at' > 'created_at':
            raise ValidationError({
                'deleted_at': "Deleted date must be after created date."
            })
        
        if 'updated_at' < 'created_at':
            raise ValidationError({
                'updated_at': "Updated date must be after created date."
            })