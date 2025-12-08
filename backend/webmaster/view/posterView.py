from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from ..models.poster import Poster
from ..serializers.PosterSerializers import PosterSerializer
from django.utils import timezone
from django.core.files.storage import default_storage
import uuid
import os
from dotenv import load_dotenv
from forms.models.counselor import Counselor

load_dotenv()

photo_url = os.getenv('AWS_S3_STORAGE_URL')

def validate_image_extension(filename):
    allowed_extensions = ['.jpg', '.jpeg', '.png']
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions

class posterView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get(self, request):
        try:
            # Get all active posters
            posters = Poster.objects.filter(status=1).order_by('order')
            is_authenticated = request.user and request.user.is_authenticated

            data = []
            for p in posters:
                poster_data = {
                    'image_url': f"{photo_url}/posters/{p.image}" if p.image else None,
                    'order': p.order
                }
                if is_authenticated:
                    poster_data['id'] = p.id
                data.append(poster_data)
            
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def post(self, request):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Handle file upload
            image_file = request.FILES.get('image')
            if not image_file:
                return Response({"error": "Image file is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file extension
            if not validate_image_extension(image_file.name):
                return Response({"error": "Only JPG, JPEG, and PNG files are allowed"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use original filename
            filename = image_file.name
            
            # Upload to S3
            file_path = f"posters/{filename}"
            default_storage.save(file_path, image_file)
            
            # Get counselor profile
            counselor = Counselor.objects.get(user=request.user)
            
            # Get last order from active posters
            last_poster = Poster.objects.filter(status=1).order_by('-order').first()
            next_order = (last_poster.order + 1) if last_poster else 0
            
            # Create poster
            poster = Poster.objects.create(
                image=filename,
                uploaded_by=counselor,
                created_at=timezone.now(),
                status=1,
                order=next_order
            )
            
            serializer = PosterSerializer(poster)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def patch(self, request, poster_id=None):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Update an existing poster
            if not poster_id:
                poster_id = request.data.get('id')
            
            if not poster_id:
                return Response({"error": "Poster ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            poster = Poster.objects.get(id=poster_id)
            
            # Handle file upload if new image provided
            image_file = request.FILES.get('image')

            if image_file:
                if not validate_image_extension(image_file.name):
                    return Response({"error": "Only JPG, JPEG, and PNG files are allowed"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Delete old image from S3
                if poster.image:
                    old_file_path = f"posters/{poster.image}"
                    if default_storage.exists(old_file_path):
                        default_storage.delete(old_file_path)
                
                filename = image_file.name
                file_path = f"posters/{filename}"
                default_storage.save(file_path, image_file)
                poster.image = filename 
            
            poster.updated_at = timezone.now()
            poster.save()
            
            serializer = PosterSerializer(poster)
            return Response(serializer.data, status=status.HTTP_200_OK)
                        
        except Poster.DoesNotExist:
            return Response({"error": "Poster not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def delete(self, request, poster_id=None):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Update an existing poster
            if not poster_id:
                poster_id = request.data.get('id')
            
            if not poster_id:
                return Response({"error": "Poster ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            poster = Poster.objects.get(id=poster_id)
            
            # Delete image from S3
            if poster.image:
                file_path = f"posters/{poster.image}"
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
            
            poster.status = 2
            poster.updated_at = timezone.now()
            poster.deleted_at = timezone.now()
            poster.save()
            
            serializer = PosterSerializer(poster)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Poster.DoesNotExist:
            return Response({"error": "Poster not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_posters(request):
    try:
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        posters_data = request.data.get('posters', [])
        
        for poster_data in posters_data:
            poster = Poster.objects.get(id=poster_data['id'])
            poster.order = poster_data['order']
            poster.save()
        
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
