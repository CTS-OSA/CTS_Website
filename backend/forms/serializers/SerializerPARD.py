from rest_framework import serializers
from ..models.PARD import PARD
from ..models.submission import Submission
from datetime import date, time
from ..models.student import Student

class PARDSerializer(serializers.ModelSerializer):
    class Meta:
        model = PARD
        fields = '__all__'
    
    def validate_preferred_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Preferred date must be today or in the future.")
        return value
    
    def validate_date_diagnosed(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("Date diagnosed cannot be in the future.")
        return value
    
    def validate_preferred_time(self, value):
        if value:
            min_time = time(8, 0)  # 8:00 AM
            max_time = time(16, 0)  # 4:00 PM
            if value < min_time or value > max_time:
                raise serializers.ValidationError("Time must be between 8:00 AM and 4:00 PM.")
        return value

class PARDSubmissionSerializer(serializers.Serializer):
    # Contact Info
    pard_contact_info = serializers.DictField(required=False)
    
    # Psych Assessment
    pard_psych_assessment = serializers.DictField(required=False)
    
    # Consent fields
    consent_agreed = serializers.BooleanField(required=False)
    authorization_agreed = serializers.BooleanField(required=False)
    
    def create(self, validated_data):
        submission_id = self.context.get('submission_id')
        student_number = self.context.get('student_number')
        
        # Get Student and Submission instances
        student = Student.objects.get(student_number=student_number)
        submission = Submission.objects.get(id=submission_id)
        
        # Extract psych assessment data
        psych_data = validated_data.get('pard_psych_assessment', {})
        contact_data = validated_data.get('pard_contact_info', {})
        
        pard_data = {
            'student_number': student,
            'submission_id': submission,
            'preferred_date': contact_data.get('preferred_date'),
            'preferred_time': contact_data.get('preferred_time'),
            'date_started': psych_data.get('date_started'),
            'is_currently_on_medication': psych_data.get('is_currently_on_medication') == 'yes',
            'symptoms_observed': psych_data.get('symptoms_observed'),
            'date_diagnosed': psych_data.get('date_diagnosed'),
            'communication_platform': psych_data.get('communication_platform'),
            'diagnosed_by': ','.join(psych_data.get('diagnosed_by', [])) if isinstance(psych_data.get('diagnosed_by'), list) else psych_data.get('diagnosed_by', ''),
        }
        
        # Remove None values
        pard_data = {k: v for k, v in pard_data.items() if v is not None}
        
        pard_instance = PARD.objects.create(**pard_data)
        
        return pard_instance