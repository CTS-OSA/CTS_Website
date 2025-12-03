from rest_framework import serializers
from forms.models import Referrer, Referral, AcknowledgementReceipt, Student, Submission, Counselor, ReferredPerson
from django.core.exceptions import ValidationError
from django.utils import timezone


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

class AcknowledgementReceiptSerializer(serializers.ModelSerializer):
        referred_person_name = serializers.SerializerMethodField()
        referring_person_name = serializers.SerializerMethodField()
        referring_department = serializers.SerializerMethodField()
        referral_date = serializers.SerializerMethodField()
        counselor_name = serializers.SerializerMethodField()

        class Meta:
            model = AcknowledgementReceipt
            fields = [
                "id",
                "referral",
                "counselor",
                "date_of_visitation",
                "date_of_receipt",
                "status",
                "follow_up",
                "referred_to",

                # Computed slip fields
                "referred_person_name",
                "referring_person_name",
                "referring_department",
                "referral_date",
                "counselor_name",
            ]
            read_only_fields = [
                "id",
                "referral",
                "counselor",
                "date_of_receipt",
                "referred_person_name",
                "referring_person_name",
                "referring_department",
                "referral_date",
                "counselor_name",
            ]

        # ---- STUDENT BEING ATTENDED TO ----
        def get_referred_person_name(self, obj):
            rp = obj.referral.referred_person
            return f"{rp.first_name} {rp.last_name}"

        # ---- REFERRER NAME ----
        def get_referring_person_name(self, obj):
            ref = obj.referral.referrer

            # student referrer
            if ref.student:
                s = ref.student
                return f"{s.first_name} {s.last_name}"

            # guest referrer
            return f"{ref.first_name} {ref.last_name}"

        # ---- REFERRER DEPARTMENT / UNIT ----
        def get_referring_department(self, obj):
            ref = obj.referral.referrer

            if ref.student:
                return ref.student.degree_program
            return ref.department_unit

        # ---- DATE REFERRED ----
        def get_referral_date(self, obj):
            return obj.referral.referral_date

        # ---- COUNSELOR NAME ----
        def get_counselor_name(self, obj):
            # If AcknowledgementReceipt exists, use its counselor
            if obj.counselor:
                return f"{obj.counselor.first_name} {obj.counselor.last_name}"
            
            # Otherwise, use the logged-in admin's counselor (from context)
            request = self.context.get("request")
            if request and hasattr(request.user, "counselor"):
                c = request.user.counselor
                return f"{c.first_name} {c.last_name}"

            return ""
         # ---- CREATE METHOD ----
        def create(self, validated_data):
            referral = self.context.get('referral')
            counselor = self.context.get('counselor')
            date_of_receipt = timezone.now()

            return AcknowledgementReceipt.objects.create(
                referral=referral,
                counselor=counselor,
                date_of_receipt=date_of_receipt,
                **validated_data
            )

        # ---- UPDATE METHOD ----
        def update(self, instance, validated_data):
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance