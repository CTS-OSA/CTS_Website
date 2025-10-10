from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from forms.models import Student, Address
from forms.serializers import StudentSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from users.utils import log_action

@api_view(['POST'])
def create_student_profile(request):
    required_fields = ['student_number', 'college', 'current_year_level', 'degree_program', 'last_name', 
                       'first_name', 'sex', 'birth_rank', 'birthdate', 'birthplace', 'contact_number', 
                       'permanent_address', 'address_while_in_up']
    
    for field in required_fields:
        if field not in request.data:
            return Response({ 'error': f'{field} is required' }, status=status.HTTP_400_BAD_REQUEST)
    
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
    is_partial = request.method == 'PATCH'

    def get_or_create_address(address_data):
        if not address_data:
            return None
        address_data = address_data.copy()
        address_data.pop('id', None)

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

    
    if 'permanent_address' in student_data:
        student.permanent_address = get_or_create_address(student_data['permanent_address'])
    if 'address_while_in_up' in student_data:
        student.address_while_in_up = get_or_create_address(student_data['address_while_in_up'])

    updatable_fields = [
        'college', 'current_year_level', 'degree_program',
        'last_name', 'first_name', 'middle_name', 'nickname', 'sex', 'religion',
        'birth_rank', 'birthdate', 'birthplace', 'contact_number', 'landline_number',
    ]

    changed_fields = {}
    for field in updatable_fields:
        if field in student_data:
            old_value = getattr(student, field)
            new_value = student_data[field]
            if old_value != new_value:
                changed_fields[field] = {"old": old_value, "new": new_value}
            setattr(student, field, new_value)

    student.save()

    serializer = StudentSerializer(student)
    details = (
        f"Student ID: {student.student_number}, Name: {student.first_name} {student.last_name}. "
        f"Changed fields: {changed_fields if changed_fields else 'None'}"
    )
    log_action(
        request,
        "profile",
        "Student profile updated",
        details
    )
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