from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models.poster import Poster
from ..serializers.PosterSerializers import PosterSerializer
from django.utils import timezone

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
            # Create a new poster
            serializer = PosterSerializer(data=request.data)
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
        
    def patch(self, request):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Update an existing poster
            poster_id = request.data.get('id')

            poster = Poster.objects.get(id=poster_id)

            serializer = PosterSerializer(poster, data=request.data, partial=True)
            
            poster.updated_at = timezone.now()  # Update deleted timestamp
            
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
        
    def delete(self, request):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Soft delete a poster
            poster_id = request.data.get('id')
            poster = Poster.objects.get(id=poster_id)
            
            poster.status = 2  # Set status to deleted
            poster.deleted_at = timezone.now()  # Update deleted timestamp
            poster.save()

            return Response({"message": "Poster deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Poster.DoesNotExist:
            return Response({"error": "Poster not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
