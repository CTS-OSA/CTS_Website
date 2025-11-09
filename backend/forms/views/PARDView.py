from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models.submission import Submission
from ..models.PARD import PARD
from ..serializers.SerializerPARD import PARDSubmissionSerializer

class PARDSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, submission_id):
        try:
            # Get the submission
            submission = get_object_or_404(Submission, id=submission_id)
            
            # Verify the submission belongs to the authenticated user
            if submission.student_number.user != request.user:
                return Response(
                    {"error": "You don't have permission to submit this form."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if already submitted
            if submission.status == 'submitted':
                return Response(
                    {"error": "This form has already been submitted."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Serialize and validate the data
            serializer = PARDSubmissionSerializer(
                data=request.data,
                context={
                    'submission_id': submission_id,
                    'student_number': submission.student_number.student_number
                }
            )
            
            if serializer.is_valid():
                # Save the PARD data
                pard_instance = serializer.save()
                
                # Update submission status
                submission.status = 'submitted'
                submission.save()
                
                return Response({
                    "message": "PARD form submitted successfully!",
                    "submission_id": submission_id,
                    "pard_id": pard_instance.id
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "error": "Validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)