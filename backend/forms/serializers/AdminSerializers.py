from rest_framework import serializers, generics
from forms.models import Submission, Referral
from .ProfileSetupSerializers import StudentSummarySerializer
from .SerializerReferral import StudentReferrerSerializer, ReferredPersonSerializer

class AdminSubmissionDetailSerializer(serializers.ModelSerializer):
    student = StudentSummarySerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'form_type', 'status', 'saved_on', 'submitted_on', 'student']
        
class AdminReferralListSerializer(serializers.ModelSerializer):
    referrer = serializers.SerializerMethodField()
    referred_person = serializers.SerializerMethodField()
    submission_id = serializers.SerializerMethodField()

    class Meta:
        model = Referral
        fields = [
            "id",
            "submission_id",
            "referral_date",
            "referral_status",
            "referrer",
            "referred_person",
        ]

    def get_referrer(self, obj):
        if obj.referrer:
            if obj.referrer.is_registered():
                return {
                    "name": f"{obj.referrer.student.first_name} {obj.referrer.student.last_name}",
                }
            else:
                return {
                    "name": f"{obj.referrer.first_name} {obj.referrer.last_name}",
                }
        return None

    def get_referred_person(self, obj):
        if obj.referred_person:
            return {
                "name": f"{obj.referred_person.first_name} {obj.referred_person.last_name}",
                "year_level": obj.referred_person.year_level,
                "degree_program": obj.referred_person.degree_program
            }
        return None
    
    def get_submission_id(self, obj):
        if obj.submission:
            return obj.submission.id
        return None
    
class AdminReferralDetailSerializer(serializers.ModelSerializer):
    referred_person = ReferredPersonSerializer(read_only=True)
    

    class Meta:
        model = Referral
        fields = [
            "id",
            "submission",
            "referrer",
            "referred_person",
            "reason_for_referral",
            "initial_actions_taken",
            "referral_status",
            "referral_date",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Dynamically choose referrer serializer
        if instance.referrer.student is None:
            from forms.serializers import GuestReferrerSerializer
            data['referrer'] = GuestReferrerSerializer(instance.referrer).data
            data['guest_email'] = Submission.objects.get(id=instance.submission.id).guest_email
        else:
            from forms.serializers import StudentReferrerSerializer
            data['referrer'] = StudentReferrerSerializer(instance.referrer).data

        return {"referral": data}

