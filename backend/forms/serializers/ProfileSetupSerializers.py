from rest_framework import serializers
from forms.models import Student, Address, StudentPhoto
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView
from users.models import CustomUser


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__' 

class StudentPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentPhoto
        fields = ['image', 'uploaded_at']
        
class StudentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    permanent_address = AddressSerializer()
    address_while_in_up = AddressSerializer()
    photo = StudentPhotoSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            'student_number', 'college', 'current_year_level', 'degree_program', 'user', 
            'last_name', 'first_name', 'middle_name', 'nickname', 'sex', 'religion', 
            'birth_rank', 'birthdate', 'birthplace', 'contact_number', 'landline_number', 
            'permanent_address', 'address_while_in_up', 'email', 'date_initial_entry', 'date_initial_entry_sem', 'is_complete', 'photo', 'status'
        ]
    
class StudentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_number', 'first_name', 'last_name', 'current_year_level', 'degree_program']