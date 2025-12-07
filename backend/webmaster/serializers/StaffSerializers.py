from ..models.staff import Staff
from rest_framework import serializers

class StaffSerializer(serializers.ModelSerializer):
    image_url = serializers.ReadOnlyField()

    class Meta:
        model = Staff
        exclude = ['image', 'created_at', 'updated_at', 'status']
    
    def validate_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Name is required")
        return value.strip()
    
    def validate_post_nominal(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Post nominal is required")
        return value.strip()
    
    def validate_position(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Position is required")
        return value.strip()
    
    def validate_license(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("License is required")
        return value.strip()

    


