from rest_framework import serializers
from phonenumber_field.serializerfields import PhoneNumberField
from forms.models import (
    Parent, Sibling, Guardian, FamilyData, HealthData, 
    SchoolAddress, School, PreviousSchoolRecord, Scholarship,
    PersonalityTraits, FamilyRelationship, CounselingInformation, PrivacyConsent, Student, Submission,
    GuidanceSpecialistNotes, Address, CollegeAward, PsychometricData, Membership
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
    id = serializers.IntegerField(read_only=True)
    is_deceased = serializers.BooleanField(required=False, default=False)
    is_none = serializers.BooleanField(required=False, default=False)
    first_name = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    last_name = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    age = serializers.IntegerField(allow_null=True, required=False)
    contact_number = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    highest_educational_attainment = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    job_occupation = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    company_agency = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    company_address = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    

    def to_internal_value(self, data):
        # Handle empty strings -> None for all nullable fields
        nullable_fields = [
            'first_name', 'last_name','age', 'contact_number', 'highest_educational_attainment',
            'job_occupation', 'company_agency', 'company_address'
        ]
        
        for field in nullable_fields:
            if data.get(field) == '' or data.get(field) is None:
                data[field] = None

        # Handle is_deceased as string
        if 'is_deceased' in data:
            if isinstance(data['is_deceased'], str):
                data['is_deceased'] = data['is_deceased'].lower() in ['true', 'yes', '1']

        # Handle is_none as string
        if 'is_none' in data:
            if isinstance(data['is_none'], str):
                data['is_none'] = data['is_none'].lower() in ['true', 'yes', '1']
    
        return super().to_internal_value(data)
    
    def validate(self, data):
        """
        Custom validation based on is_deceased and is_none flags
        """
        is_deceased = data.get('is_deceased', False)
        is_none = data.get('is_none', False)
        
        # If "None" is checked, nothing is required, set all to null
        if is_none:
            # Clear all fields when none is selected
            data['first_name'] = None
            data['last_name'] = None
            data['age'] = None
            data['contact_number'] = None
            data['highest_educational_attainment'] = None
            data['job_occupation'] = None
            data['company_agency'] = None
            data['company_address'] = None
            return data
        
        # If "Deceased" is checked, only first_name and last_name are required
        if is_deceased:
            if not data.get('first_name'):
                raise serializers.ValidationError({'first_name': 'First name is required for deceased parent.'})
            if not data.get('last_name'):
                raise serializers.ValidationError({'last_name': 'Last name is required for deceased parent.'})
            
            # Clear other fields when deceased is selected
            data['age'] = None
            data['contact_number'] = None
            data['highest_educational_attainment'] = None
            data['job_occupation'] = None
            data['company_agency'] = None
            data['company_address'] = None
            return data
        
        # If neither deceased nor none, validate all required fields
        required_fields = ['first_name', 'last_name', 'age', 'contact_number']
        errors = {}
        
        for field in required_fields:
            if not data.get(field):
                errors[field] = f'{field.replace("_", " ").title()} is required.'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
            
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
        extra_kwargs = {
            'specialist': {'required': False},
        }

    def create(self, validated_data):
        """Set specialist from the logged-in user's counselor profile"""
        if 'specialist' not in validated_data or not validated_data['specialist']:
            request = self.context.get('request')
            if request and request.user:
                try:
                    counselor = request.user.counselor
                    validated_data['specialist'] = counselor
                except:
                    pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Set specialist from the logged-in user's counselor profile if not provided"""
        if 'specialist' not in validated_data or not validated_data['specialist']:
            request = self.context.get('request')
            if request and request.user:
                try:
                    counselor = request.user.counselor
                    validated_data['specialist'] = counselor
                except:
                    pass
        return super().update(instance, validated_data)
        
        
class CollegeAwardSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    submission = serializers.PrimaryKeyRelatedField(queryset=Submission.objects.all())

    class Meta:
        model = CollegeAward
        fields = "__all__"
        list_serializer_class = CustomListSerializer

    def to_internal_value(self, data):
        if 'id' in data and isinstance(data['id'], str):
            try:
                data['id'] = int(data['id'])
            except:
                pass
        return super().to_internal_value(data)


class MembershipSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    submission = serializers.PrimaryKeyRelatedField(queryset=Submission.objects.all())

    class Meta:
        model = Membership
        fields = "__all__"
        list_serializer_class = CustomListSerializer

    def to_internal_value(self, data):
        if 'id' in data and isinstance(data['id'], str):
            try:
                data['id'] = int(data['id'])
            except:
                pass
        return super().to_internal_value(data)


class PsychometricDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    submission = serializers.PrimaryKeyRelatedField(queryset=Submission.objects.all())

    class Meta:
        model = PsychometricData
        fields = "__all__"
        list_serializer_class = CustomListSerializer

    def to_internal_value(self, data):
        if 'id' in data and isinstance(data['id'], str):
            try:
                data['id'] = int(data['id'])
            except:
                pass
        return super().to_internal_value(data)
