from rest_framework import serializers
from forms.models import Referrer, Referral, AcknowledgementReceipt, Student, Submission, Counselor, ReferredPerson
from django.core.exceptions import ValidationError



class StudentReferrerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referrer
        fields = ["id", "student"] 
        read_only_fields = ["student"] 
        
    def create(self, validated_data):
        user = self.context["request"].user
        student = user.student 
        return Referrer.objects.create(
            student=student,
            first_name=student.first_name,
            last_name=student.last_name,
            contact_number=student.contact_number,
            department_unit=student.degree_program,
        )
        
    def update(self, instance, validated_data):
        return instance

class ReferredPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferredPerson
        fields = [
            "id",
            "first_name",
            "last_name",
            "contact_number",
            "degree_program",
            "year_level",
            "gender"
        ]


class GuestReferrerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referrer
        fields = [
            "id",
            "first_name",
            "last_name",
            "department_unit",
            "contact_number",
        ]

    def validate(self, data):
        # ensure no student FK
        if "student" in data and data["student"] is not None:
            raise serializers.ValidationError("Student must not be provided for anonymous referrer.")

        required_fields = ["first_name", "last_name", "department_unit", "contact_number"]
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        return data

class ReferralSerializer(serializers.ModelSerializer):
    referred_person = ReferredPersonSerializer() 

    class Meta:
        model = Referral
        fields = [
            "id",
            "submission",
            "referred_person",
            "reason_for_referral",
            "initial_actions_taken",
            "referral_status",
            "referral_date"
        ]
        read_only_fields = ["referral_date", "submission"]

    def create(self, validated_data):
        request = self.context["request"]
        student = request.user.student

        # Automatically get or create Referrer linked to student
        referrer, _ = Referrer.objects.get_or_create(student=student)

        # Create referred person
        referred_person_data = validated_data.pop("referred_person")
        referred_person = ReferredPerson.objects.create(**referred_person_data)
        submission = self.context.get('submission')
        if not submission:
            raise serializers.ValidationError("Submission instance is required.")

        # Create the referral
        referral = Referral.objects.create(
            submission=submission,
            referrer=referrer,
            referred_person=referred_person,
            **validated_data
        )
        return referral

class GuestReferralSerializer(serializers.ModelSerializer):
    referred_person = ReferredPersonSerializer() 
    referrer = GuestReferrerSerializer() 

    class Meta:
        model = Referral
        fields = [
            "id",
            "submission",
            "referred_person",
            "referrer",
            "reason_for_referral",
            "initial_actions_taken",
            "referral_status",
            "referral_date"
        ]
        read_only_fields = ["referral_date", "submission"]

    def create(self, validated_data):
        referrer_data = validated_data.pop("referrer")
        referrer = Referrer.objects.create(**referrer_data)

        referred_person_data = validated_data.pop("referred_person")
        referred_person = ReferredPerson.objects.create(**referred_person_data)

        submission = self.context.get("submission")
        if not submission:
            raise serializers.ValidationError("Submission instance is required.")

        referral = Referral.objects.create(
            submission=submission,
            referrer=referrer,
            referred_person=referred_person,
            **validated_data
        )
        return referral

class ReferralSubmissionSerializer(serializers.Serializer):
    referrer_data = GuestReferrerSerializer()
    referred_person_data = ReferredPersonSerializer()
    reason_for_referral = serializers.CharField()
    initial_actions_taken = serializers.CharField()

    def validate_referrer_data(self, value):
        if value.get('student') and any([
            value.get('first_name'),
            value.get('last_name'),
            value.get('department_unit'),
            value.get('contact_number')
        ]):
            raise serializers.ValidationError("Guest fields must be empty for logged-in users.")
        if not value.get('student') and not all([
            value.get('first_name'),
            value.get('last_name'),
            value.get('department_unit'),
            value.get('contact_number')
        ]):
            raise serializers.ValidationError("All guest fields are required for guest referrers.")
        return value

    def validate_referred_person_data(self, value):
        required_fields = ['first_name','last_name','contact_number','degree_program','year_level','gender']
        for field in required_fields:
            if not value.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        return value
