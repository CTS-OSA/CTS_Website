from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models.staff import Staff
from ..serializers.StaffSerializers import StaffSerializer
from django.utils import timezone
from django.core.files.storage import default_storage
import uuid
import os
from dotenv import load_dotenv
from rest_framework.decorators import api_view, permission_classes

load_dotenv()

photo_url = os.getenv('AWS_S3_STORAGE_URL')

def validate_image_extension(filename):
    allowed_extensions = ['.jpg', '.jpeg', '.png']
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions

class staffView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all active staff
            staff = Staff.objects.filter(status=1) 
            serializer = StaffSerializer(staff, many=True)

            data = serializer.data

            # Return the full s3 url of the posteres
            for staff in data:
                if staff.get('image'):
                    staff['image'] = f"{photo_url}/staff/{staff['image']}"
            
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

            serializer = StaffSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            image_file = request.FILES.get('image')
            if not image_file:
                return Response({"error": "Image file is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            if not validate_image_extension(image_file.name):
                return Response({"error": "Only JPG, JPEG, and PNG files are allowed"}, status=status.HTTP_400_BAD_REQUEST)
            
            filename = image_file.name        
            file_path = f"staff/{filename}"
            default_storage.save(file_path, image_file)

            staff = Staff.objects.create(
                image=filename,
                name=serializer.validated_data['name'],
                post_nominal=serializer.validated_data['post_nominal'],
                position=serializer.validated_data['position'],
                license=serializer.validated_data['license'],
                created_at=timezone.now(),
                status=1
            )

            return Response(StaffSerializer(staff).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, staff_id=None):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not staff_id:
                staff_id = request.data.get('id')
            
            if not staff_id:
                return Response({"error": "Staff ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            staff = Staff.objects.get(id=staff_id)
            
            image_file = request.FILES.get('image')
            if image_file:
                if not validate_image_extension(image_file.name):
                    return Response({"error": "Only JPG, JPEG, and PNG files are allowed"}, status=status.HTTP_400_BAD_REQUEST)
                
                if staff.image:
                    old_file_path = f"staff/{staff.image}"
                    if default_storage.exists(old_file_path):
                        default_storage.delete(old_file_path)
                
                filename = image_file.name
                file_path = f"staff/{filename}"
                default_storage.save(file_path, image_file)
                staff.image = filename
            
            name = request.data.get('name', '').strip()
            post_nominal = request.data.get('post_nominal', '').strip()
            position = request.data.get('position', '').strip()
            license = request.data.get('license', '').strip()
            
            if name:
                if len(name) > 255:
                    return Response({"error": "Name too long"}, status=status.HTTP_400_BAD_REQUEST)
                staff.name = name
            if post_nominal:
                if len(post_nominal) > 30:
                    return Response({"error": "Post nominal too long"}, status=status.HTTP_400_BAD_REQUEST)
                staff.post_nominal = post_nominal
            if position:
                if len(position) > 100:
                    return Response({"error": "Position too long"}, status=status.HTTP_400_BAD_REQUEST)
                staff.position = position
            if license:
                if len(license) > 200:
                    return Response({"error": "License too long"}, status=status.HTTP_400_BAD_REQUEST)
                staff.license = license
            
            staff.updated_at = timezone.now()
            staff.save()
            
            serializer = StaffSerializer(staff)
            return Response(serializer.data, status=status.HTTP_200_OK)
                        
        except Staff.DoesNotExist:
            return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, staff_id=None):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not staff_id:
                staff_id = request.data.get('id')
            
            if not staff_id:
                return Response({"error": "Staff ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            staff = Staff.objects.get(id=staff_id)
            
            if staff.image:
                file_path = f"staff/{staff.image}"
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
            
            staff.status = 2
            staff.updated_at = timezone.now()
            staff.save()
            
            serializer = StaffSerializer(staff)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Staff.DoesNotExist:
            return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_professional(request):
    try:
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        staff_data = request.data.get('staff', [])
        
        for staff_data in staff_data:
            staff = Staff.objects.get(id=staff_data['id'])
            staff.order = staff_data['order']
            staff.save()
        
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_staff(request):
    try:
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        staff_data = request.data.get('staff', [])
        
        for item in staff_data:
            staff = Staff.objects.get(id=item['id'])
            staff.order = item['order']
            staff.save()
        
        return Response({"message": "Order updated successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
