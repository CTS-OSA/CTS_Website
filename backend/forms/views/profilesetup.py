from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from forms.models import Student, Address, StudentPhoto
from forms.serializers import StudentSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from users.utils import log_action
import json

@api_view(['POST'])
def create_student_profile(request):
    required_fields = ['student_number', 'college', 'current_year_level', 'degree_program', 'last_name', 
                       'first_name', 'sex', 'birth_rank', 'birthdate', 'birthplace', 'contact_number', 
                       'permanent_address', 'address_while_in_up', 'photo']
    
    for field in required_fields[:-1]:
        if field not in request.data:
            return Response({ 'error': f'{field} is required' }, status=status.HTTP_400_BAD_REQUEST)

    if 'photo' not in request.FILES:
        return Response({'error': 'A photo file is required.'}, status=status.HTTP_400_BAD_REQUEST)

    photo_file = request.FILES['photo']
    student_data = request.data
    
    if Student.objects.filter(student_number=student_data['student_number']).exists():
        return Response(
            {'error': 'Student number must be unique. This student number already exists.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    permanent_address_data = student_data.get('permanent_address')
    address_while_in_up_data = student_data.get('address_while_in_up')

    def get_or_create_address(address_data):
        try:
            address = Address.objects.get(
                address_line_1=address_data['address_line_1'],
                barangay=address_data['barangay'],
                city_municipality=address_data['city_municipality'],
                province=address_data['province'],
                region=address_data['region'],
                zip_code=address_data['zip_code']
            )
        except Address.DoesNotExist:
            address = Address.objects.create(**address_data)
        
        return address

    try:
        permanent_address_data = json.loads(student_data.get('permanent_address'))
        address_while_in_up_data = json.loads(student_data.get('address_while_in_up'))
        
    except json.JSONDecodeError:
        return Response(
            {'error': 'Invalid format for address data. Must be valid JSON strings.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
    permanent_address = get_or_create_address(permanent_address_data)
    address_while_in_up = get_or_create_address(address_while_in_up_data)
    
    student = Student.objects.create(
        student_number=student_data['student_number'],
        college=student_data['college'],
        current_year_level=student_data['current_year_level'],
        degree_program=student_data['degree_program'],
        user=request.user, 
        last_name=student_data['last_name'],
        first_name=student_data['first_name'],
        middle_name=student_data.get('middle_name', ''),
        nickname=student_data.get('nickname', ''),
        sex=student_data['sex'],
        religion=student_data.get('religion', ''),
        birth_rank=student_data['birth_rank'],
        birthdate=student_data['birthdate'],
        birthplace=student_data['birthplace'],
        contact_number=student_data['contact_number'],
        landline_number=student_data.get('landline_number', ''),
        permanent_address=permanent_address,
        address_while_in_up=address_while_in_up,
        is_complete=student_data.get('is_complete', False),
        date_initial_entry = student_data.get('date_initial_entry'),
        date_initial_entry_sem = student_data.get('date_initial_entry_sem')
    )

    try:
        StudentPhoto.objects.create(
            student=student, 
            image=photo_file
        )
    except Exception as e:
        # Optional: You might want to log this error and/or delete the student
        # profile to maintain data integrity if the photo fails to save.
        print(f"Error saving student photo: {e}")
        # Consider adding cleanup: student.delete()
        return Response({'error': 'Profile created, but failed to save photo.', 'details': str(e)}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    serializer = StudentSerializer(student)
    log_action(
        request,
        "profile",
        "Student profile completed",
        f"Student ID: {student.student_number}, Name: {student.first_name} {student.last_name}"
    )

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_student_profile(request):
    try:
        student = Student.objects.get(user=request.user)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
@api_view(['PATCH'])
def update_student_profile(request, student_id=None):
    try:
        if request.user.is_staff or request.user.is_superuser:
            if not student_id:
                return Response({'error': 'student_id is required for admin updates'}, status=400)
            student = Student.objects.get(student_number=student_id)
        else:
            student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    student_data = request.data
    
    permanent_address_data = None
    if 'permanent_address' in student_data:
        permanent_address_data = json.loads(student_data['permanent_address'])
    
    address_while_in_up_data = None
    if 'address_while_in_up' in student_data:
        address_while_in_up_data = json.loads(student_data['address_while_in_up'])

    def get_or_create_address(existing_address, address_data):
        """Merge existing address with updates and get or create the address record.
        
        This prevents shared address updates by:
        1. Merging existing address fields with partial updates
        2. Checking if the merged address exists in the database
        3. Reusing existing address if found, otherwise creating new one
        """
        if not address_data:
            return existing_address
        
        # Remove 'id' to prevent conflicts
        address_data = address_data.copy()
        address_data.pop('id', None)
        
        # Update existing address object with new values (in-memory only)
        if existing_address:
            for key, value in address_data.items():
                setattr(existing_address, key, value)
        
        # Build complete address dict from existing + updates
        full_address = {
            'address_line_1': existing_address.address_line_1 if existing_address else address_data.get('address_line_1'),
            'barangay': existing_address.barangay if existing_address else address_data.get('barangay'),
            'city_municipality': existing_address.city_municipality if existing_address else address_data.get('city_municipality'),
            'province': existing_address.province if existing_address else address_data.get('province'),
            'region': existing_address.region if existing_address else address_data.get('region'),
            'zip_code': existing_address.zip_code if existing_address else address_data.get('zip_code')
        }
        
        # Override with new values from address_data
        for key, value in address_data.items():
            full_address[key] = value
        
        # Check if this exact address exists in DB, create if not
        try:
            address = Address.objects.get(**full_address)
        except Address.DoesNotExist:
            address = Address.objects.create(**full_address)
        
        return address

    if permanent_address_data:
        student.permanent_address = get_or_create_address(
            student.permanent_address, 
            permanent_address_data
        )
    if address_while_in_up_data:
        student.address_while_in_up = get_or_create_address(
            student.address_while_in_up, 
            address_while_in_up_data
        )

    updatable_fields = [
        'college', 'current_year_level', 'degree_program',
        'last_name', 'first_name', 'middle_name', 'nickname', 'sex', 'religion',
        'birth_rank', 'birthdate', 'birthplace', 'contact_number', 'landline_number', 'status'
    ]

    changed_fields = {}
    for field in updatable_fields:
        if field in student_data:
            old_value = getattr(student, field)
            new_value = student_data[field]
            if old_value != new_value:
                changed_fields[field] = {"old": old_value, "new": new_value}
            setattr(student, field, new_value)

    if 'photo' in request.FILES:
        photo_file = request.FILES['photo']
        student_photo, created = StudentPhoto.objects.get_or_create(student=student)
        student_photo.image.delete(save=False)

        student_photo.image = photo_file
        student_photo.save()

        changed_fields['photo'] = "updated"
    
    student.save()

    serializer = StudentSerializer(student)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_student_number(request):
    student_number = request.query_params.get('student_number')
    student_number = student_number.strip().rstrip('/')
    if not student_number:
        return Response({'error': 'student_number query parameter is required'}, status=400)

    exists = Student.objects.filter(student_number=student_number).exists()
    return Response({'exists': exists})