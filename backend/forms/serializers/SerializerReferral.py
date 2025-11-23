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
            email=student.user.email,
            contact_number=student.contact_number,
            department_unit=student.degree_program,
        )
        
    # update should NEVER modify student
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
            "email",
            "department_unit",
            "contact_number",
        ]

    def validate(self, data):
        # ensure no student FK
        if "student" in data and data["student"] is not None:
            raise serializers.ValidationError("Student must not be provided for anonymous referrer.")

        required_fields = ["first_name", "last_name", "email", "department_unit", "contact_number"]
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        return data

class ReferralSerializer(serializers.ModelSerializer):
    referrer = serializers.DictField(write_only=True)  
    referred_person = ReferredPersonSerializer()  

    class Meta:
        model = Referral
        fields = ["id", "submission", "referrer", "referred_person",
                  "reason_for_referral", "initial_actions_taken",
                  "referral_status", "referral_date"]
        read_only_fields = ["referral_date"]

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        submission = validated_data.pop("submission", None)

        # Detect student vs guest automatically
        if user.is_authenticated and hasattr(user, "student"):
            # Use the logged-in student's info
            referrer, _ = Referrer.objects.get_or_create(student=user.student)
        else:
            # Create a new guest referrer from the provided data
            referrer_data = validated_data.pop("referrer")
            referrer = Referrer.objects.create(**referrer_data)

        # Create referred person (always required)
        referred_person_data = validated_data.pop("referred_person")
        referred_person = ReferredPerson.objects.create(**referred_person_data)

        # Create the referral
        referral = Referral.objects.create(
            submission=submission,
            referrer=referrer,
            referred_person=referred_person,
            **validated_data
        )

        return referral
    
    def update(self, instance, validated_data):
        referred_person_data = validated_data.pop("referred_person", None)
        
        # Update the referral fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update the nested referred_person if present
        if referred_person_data:
            referred_person = instance.referred_person
            for attr, value in referred_person_data.items():
                setattr(referred_person, attr, value)
            referred_person.save()

        return instance
    
