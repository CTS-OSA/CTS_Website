from ..models.poster import Poster
from rest_framework import serializers

class PosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poster
        fields = '__all__'

    def validate_image(self, value):
        if value and value.size > 15 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Image size must be less than 5MB.")
        return value