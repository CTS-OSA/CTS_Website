from rest_framework import serializers
from phonenumber_field.serializerfields import PhoneNumberField
from forms.models import (
    Parent, Sibling, Guardian, FamilyData, HealthData, 
    SchoolAddress, School, PreviousSchoolRecord, Scholarship,
    PersonalityTraits, FamilyRelationship, CounselingInformation, PrivacyConsent, Student, Submission,
    GuidanceSpecialistNotes, Address
)

class CustomListSerializer(serializers.ListSerializer):
   def update(self, instance, validated_data):
    instance_mapping = {item.id: item for item in instance}
    data_mapping = {item.get('id'): item for item in validated_data if item.get('id') is not None}

    ret = []

    # Update existing instances
    for item_id, data in data_mapping.items():
        if item_id in instance_mapping:
            ret.append(self.child.update(instance_mapping[item_id], data))

    # Create new instances
    create_data = [item for item in validated_data 
                   if item.get('id') is None or item.get('id') not in instance_mapping]
    
    for data in create_data:
        ret.append(self.child.create(data))

    # Optionally delete items not in payload
    payload_ids = set(data_mapping.keys())
    existing_ids = set(instance_mapping.keys())
    for item_id in existing_ids - payload_ids:
        instance_mapping[item_id].delete()

    return ret
   
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

class SCIFStudentSerializer(serializers.ModelSerializer):
    permanent_address = AddressSerializer(required=False)
    landline_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Student
        fields = [
            'current_year_level', 'degree_program',  
            'last_name', 'first_name', 'middle_name', 'nickname', 'sex', 'religion', 'birth_rank', 'contact_number', 'landline_number', 'permanent_address'
        ]
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}
    
    def to_internal_value(self, data):
        # Handle permanent_address as string
        if isinstance(data.get('permanent_address'), str):
            data['permanent_address'] = {
                'address_line_1': data['permanent_address'],
                'barangay': '',
                'city_municipality': '',
                'province': '',
                'region': '',
                'zip_code': ''
            }
        
        # Handle empty landline_number
        if data.get('landline_number') == '':
            data['landline_number'] = None
            
        return super().to_internal_value(data)
    
    def update(self, instance, validated_data):
        address_data = validated_data.pop('permanent_address', None)
        
        if address_data:
            if instance.permanent_address:
                for attr, value in address_data.items():
                    setattr(instance.permanent_address, attr, value)
                instance.permanent_address.save()
            else:
                instance.permanent_address = Address.objects.create(**address_data)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class SiblingSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)  
    submission = serializers.PrimaryKeyRelatedField(queryset=Submission.objects.all())
    students = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Student.objects.all(),
        required=False
    )

    class Meta:
        model = Sibling
        fields = '__all__'
        list_serializer_class = CustomListSerializer

    def to_internal_value(self, data):
        if 'id' in data and isinstance(data['id'], str):
            try:
                data['id'] = int(data['id'])
            except (ValueError, TypeError):
                pass
        return super().to_internal_value(data)

class ParentSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(allow_null=True, required=False)

    def to_internal_value(self, data):
        if data.get('age') == '':
            data['age'] = None
    
        return super().to_internal_value(data)
            
    class Meta:
        model = Parent
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

class FamilyDataSerializer(serializers.ModelSerializer):
    mother = ParentSerializer(required=False, allow_null=True)
    father = ParentSerializer(required=False, allow_null=True)
    guardian = GuardianSerializer(required=False, allow_null=True)

    class Meta:
        model = FamilyData
        fields = '__all__'
        extra_kwargs = {field.name: {'required': False} for field in model._meta.fields if field.name != 'id'}

    def validate(self, data):
        submission = data.get('submission')  

        if submission and submission.status == 'draft':
            return data

        return super().validate(data)
    
    def create(self, validated_data):
        mother_data = validated_data.pop('mother', None)
        father_data = validated_data.pop('father', None)
        guardian_data = validated_data.pop('guardian', None)

        if mother_data:
            mother = Parent.objects.create(**mother_data)
            validated_data['mother'] = mother
        if father_data:
            father = Parent.objects.create(**father_data)
            validated_data['father'] = father
        if guardian_data:
            guardian = Guardian.objects.create(**guardian_data)
            validated_data['guardian'] = guardian

        return FamilyData.objects.create(**validated_data)

    def update(self, instance, validated_data):
        mother_data = validated_data.pop('mother', None)
        father_data = validated_data.pop('father', None)
        guardian_data = validated_data.pop('guardian', None)

        if mother_data is not None:
            if instance.mother:
                for attr, value in mother_data.items():
                    setattr(instance.mother, attr, value)
                instance.mother.save()
            else:
                instance.mother = Parent.objects.create(**mother_data)

        if father_data is not None:
            if instance.father:
                for attr, value in father_data.items():
                    setattr(instance.father, attr, value)
                instance.father.save()
            else:
                instance.father = Parent.objects.create(**father_data)

        if guardian_data is not None:
            if instance.guardian:
                for attr, value in guardian_data.items():
                    setattr(instance.guardian, attr, value)
                instance.guardian.save()
            else:
                instance.guardian = Guardian.objects.create(**guardian_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class HealthDataSerializer(serializers.ModelSerializer):
    height = serializers.FloatField(allow_null=True, required=False)
    weight = serializers.FloatField(allow_null=True, required=False)

    def to_internal_value(self, data):
        # Convert blank strings to None for float fields
        if data.get('height') == '':
            data['height'] = None
        if data.get('weight') == '':
            data['weight'] = None

        # Optional: Normalize text-based dropdowns
        for field in ['health_condition', 'eye_sight', 'hearing']:
            if data.get(field) == '':
                data[field] = None

        # Optional: Normalize list fields if sent as comma-separated strings (safety net)
        for field in ['physical_disabilities', 'common_ailments']:
            if isinstance(data.get(field), str):
                data[field] = [item.strip() for item in data[field].split(',') if item.strip()]

        return super().to_internal_value(data)

    class Meta:
        model = HealthData
        fields = '__all__'


class SchoolAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolAddress
        fields = '__all__'

class SchoolSerializer(serializers.ModelSerializer):
    school_address = SchoolAddressSerializer()
    class Meta:
        model = School 
        fields = ['id', 'name', 'school_address']

class PreviousSchoolRecordSerializer(serializers.ModelSerializer):
    school = SchoolSerializer()
    id = serializers.IntegerField(required=False)
    start_year = serializers.IntegerField(allow_null=True, required=False)
    end_year = serializers.IntegerField(allow_null=True, required=False)

    def to_internal_value(self, data):
        if data.get('start_year') == '':
            data['start_year'] = None
        if data.get('end_year') == '':
            data['end_year'] = None
    
        return super().to_internal_value(data)

    class Meta:
        model = PreviousSchoolRecord
        fields = [
            'id',
            'school',
            'education_level',
            'start_year',
            'end_year',
            'honors_received',
            'senior_high_gpa',
            'submission',
        ]
        list_serializer_class = CustomListSerializer

    def create(self, validated_data):
        # Pop school and school_address data from validated_data
        school_data = validated_data.pop('school')
        school_address_data = school_data.pop('school_address', None)  # If no address is passed, None

        # Handle SchoolAddress creation or update
        if school_address_data:
            school_address, _ = SchoolAddress.objects.update_or_create(
                id=school_address_data.get('id'),
                defaults=school_address_data
            )
            school_data['school_address'] = school_address
        else:
            # You may want to raise an error or handle the case where there's no address data.
            raise serializers.ValidationError("School address data is required")

        # Handle School creation or update
        school, _ = School.objects.update_or_create(
            id=school_data.get('id'),
            defaults=school_data
        )

        # Add student and submission context if not present
        if 'student' not in validated_data and 'student' in self.context:
            validated_data['student'] = self.context['student']

        if 'submission' not in validated_data and 'submission' in self.context:
            validated_data['submission'] = self.context['submission']

        # Create the PreviousSchoolRecord with the provided data
        return PreviousSchoolRecord.objects.create(school=school, **validated_data)

    def update(self, instance, validated_data):
        # Pop school and school_address data from validated_data
        school_data = validated_data.pop('school', None)

        if school_data:
            address_data = school_data.pop('school_address', None)

            school = instance.school
            if school:
                # Update or create address if address data is provided
                if address_data:
                    address = school.school_address
                    for attr, value in address_data.items():
                        setattr(address, attr, value)
                    address.save()

                # Update school data
                for attr, value in school_data.items():
                    setattr(school, attr, value)
                school.save()
            else:
                # If there's no associated school, create a new one
                address = SchoolAddress.objects.create(**address_data)
                school = School.objects.create(school_address=address, **school_data)
                instance.school = school

        # Update other attributes of the PreviousSchoolRecord instance
        for attr, value in validated_data.items():
            if attr != 'id':  # Avoid overwriting the id field
                setattr(instance, attr, value)

        # Save the instance
        instance.save()
        return instance


class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = '__all__'

class PersonalityTraitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalityTraits
        fields = '__all__'

class FamilyRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyRelationship
        fields = '__all__'

class CounselingInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselingInformation
        fields = '__all__'
  
class GuidanceSpecialistNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuidanceSpecialistNotes
        fields = '__all__'
  