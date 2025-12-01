from ..models.poster import Poster
from rest_framework import serializers

class PosterSerializer(serializers.ModelSerializer):
    image_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Poster
        fields = '__all__'
    


