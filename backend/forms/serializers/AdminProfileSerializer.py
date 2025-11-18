from rest_framework import serializers
from forms.models.counselor import Counselor, CounselorLicense, CounselorPhoto
from users.models import CustomUser


class CounselorLicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselorLicense
        fields = ['id', 'name', 'number']


class CounselorPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselorPhoto
        fields = ['id', 'image', 'uploaded_at']


class CounselorSerializer(serializers.ModelSerializer):
    licenses = CounselorLicenseSerializer(many=True, required=False)
    photo = CounselorPhotoSerializer(required=False)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Counselor
        fields = [
            'id',
            'user',
            'user_email',
            'first_name',
            'last_name',
            'middle_name',
            'nickname',
            'suffix',
            'sex',
            'birthdate',
            'contact_number',
            'position',
            'post_nominal',
            'licenses',
            'photo'
        ]

    def validate_user(self, value):
        if not value.is_staff:
            raise serializers.ValidationError("Only staff users can be assigned as counselors.")
        return value

    def create(self, validated_data):
        licenses_data = validated_data.pop('licenses', [])
        photo_data = validated_data.pop('photo', None)

        counselor = Counselor.objects.create(**validated_data)

        # Create licenses
        for license_data in licenses_data:
            CounselorLicense.objects.create(counselor=counselor, **license_data)

        # Create photo
        if photo_data:
            CounselorPhoto.objects.create(counselor=counselor, **photo_data)

        return counselor

    def update(self, instance, validated_data):
        licenses_data = validated_data.pop('licenses', None)
        photo_data = validated_data.pop('photo', None)

        # Update counselor fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update licenses (replace existing with new)
        if licenses_data is not None:
            instance.licenses.all().delete()
            for license_data in licenses_data:
                CounselorLicense.objects.create(counselor=instance, **license_data)

        # Update photo
        if photo_data:
            if hasattr(instance, 'photo'):
                # Replace existing photo
                for attr, value in photo_data.items():
                    setattr(instance.photo, attr, value)
                instance.photo.save()
            else:
                CounselorPhoto.objects.create(counselor=instance, **photo_data)

        return instance
