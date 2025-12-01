from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models.poster import Poster
from ..serializers.PosterSerializers import PosterSerializer
from django.utils import timezone
from django.core.files.storage import default_storage
import uuid
import os

def validate_image_extension(filename):
    allowed_extensions = ['.jpg', '.jpeg', '.png']
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions

class webmasterView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all active posters
            posters = Poster.objects.filter(status=1) 
            serializer = PosterSerializer(posters, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
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
            
            # Create poster with filename only
            data = request.data.copy()
            data['image'] = filename
            
            serializer = PosterSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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

            serializer = PosterSerializer(poster, data=request.data, partial=True)
            
            poster.updated_at = timezone.now()  
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Poster.DoesNotExist:
            return Response({"error": "Poster not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

        
