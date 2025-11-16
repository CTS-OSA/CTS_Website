from rest_framework import serializers
from ..models.PARD import PARD
from ..models.submission import Submission

class PARDSerializer(serializers.ModelSerializer):
    class Meta:
        model = PARD
        fields = '__all__'

class PARDSubmissionSerializer(serializers.Serializer):
    # Demographic Profile
    # pard_demographic_profile = serializers.DictField(required=False)
    
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
        
        # Extract psych assessment data
        psych_data = validated_data.get('pard_psych_assessment', {})
        contact_data = validated_data.get('pard_contact_info', {})
        
        pard_data = {
            'student_number_id': student_number,
            'submission_id_id': submission_id,
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
        
        pard_instance, created = PARD.objects.update_or_create(
            student_number_id=student_number,
            submission_id_id=submission_id,
            defaults=pard_data
        )
        
        return pard_instance