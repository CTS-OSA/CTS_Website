from rest_framework import viewsets
from forms.models import PrivacyConsent, Submission
from rest_framework import serializers
    
class PrivacyConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyConsent
        fields = '__all__'
        extra_kwargs = {
            field.name: {'required': False} for field in model._meta.fields if field.name != 'id'
        }
        
class SubmissionSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()
     
    class Meta:
        model = Submission
        fields = ['id', 'form_type', 'status', 'saved_on', 'submitted_on', 'created_at', 'updated_at', 'student']
        
    def validate(self, data):
        """
        Enforce conditional validation depending on form type:
        - If the form is not 'Counseling Referral Slip' (CRS),
          then student must be specified.
        """
        if data['form_type'] != 'CRS' and not data.get('student'):
            raise serializers.ValidationError("Student is required for this form type.")
        return data
    
    
# For Guest Submissions
class PendingSubmissionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    data = serializers.DictField()

class VerifySubmissionSerializer(serializers.Serializer):
    pending_id = serializers.IntegerField()
    token = serializers.CharField()