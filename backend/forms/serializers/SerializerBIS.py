from rest_framework import serializers

from forms.models import Preferences, StudentSupport, SocioEconomicStatus, PresentScholasticStatus, Submission
from forms.models import StudentSupport, Support, Student


class BISStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'current_year_level', 'degree_program',  
            'last_name', 'first_name', 'middle_name', 'nickname', 
             ]
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

class PreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preferences
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

class StudentSupportSerializer(serializers.ModelSerializer):
    support = serializers.SlugRelatedField(
        queryset=Support.objects.all(),
        slug_field='code',
        many=True
    )

    class Meta:
        model = StudentSupport
        fields = '__all__'
        extra_kwargs = {
            field.name: {'required': False}
            for field in model._meta.fields if field.name != 'id'
        }

    def create(self, validated_data):
        supports = validated_data.pop('support', None)
        student_support = StudentSupport.objects.create(**validated_data)
        if supports is not None:
            student_support.support.set(supports)
        return student_support

    def update(self, instance, validated_data):
        supports = validated_data.pop('support', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if supports is not None:
            instance.support.set(supports)
        instance.save()
        return instance

class SocioEconomicStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocioEconomicStatus
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

class PresentScholasticStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresentScholasticStatus
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}