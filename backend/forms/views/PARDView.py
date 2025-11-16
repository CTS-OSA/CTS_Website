from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models.submission import Submission
from ..models.PARD import PARD
from ..serializers.SerializerPARD import PARDSubmissionSerializer
from ..models.student import Student

class PARDSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, student_number):
        try:
            # Get student data by student number
            student = get_object_or_404(Student, student_number=student_number)

            # Get or create submission for PARD
            submission = Submission.objects.get(
                student=student,
                form_type="Psychosocial Assistance and Referral Desk"
            )

            # Pre-populate with student data
            response_data = {
                "submission": {
                    "id": submission.id,
                },
                "student_profile": {
                    "student_number": student.student_number,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "middle_name": student.middle_name,
                    "nickname": student.nickname,
                    "degree_program": student.degree_program,
                    "current_year_level": student.current_year_level,
                    "contact_number": student.contact_number,
                },
                "user": {
                    "email": request.user.email,
                }
            }
            
            # Add permanent address
            if student.permanent_address:
                response_data["permanent_address"] = {
                    "address_line_1": student.permanent_address.address_line_1,
                    "address_line_2": student.permanent_address.address_line_2,
                    "barangay": student.permanent_address.barangay,
                    "city_municipality": student.permanent_address.city_municipality,
                    "province": student.permanent_address.province,
                    "region": student.permanent_address.region,
                }
            
            # Add UP address
            if student.address_while_in_up:
                response_data["address_while_in_up"] = {
                    "address_line_1": student.address_while_in_up.address_line_1,
                    "address_line_2": student.address_while_in_up.address_line_2,
                    "barangay": student.address_while_in_up.barangay,
                    "city_municipality": student.address_while_in_up.city_municipality,
                    "province": student.address_while_in_up.province,
                    "region": student.address_while_in_up.region,
                }

            

            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, submission_id):
        try:
            # Get the submission
            submission = get_object_or_404(Submission, id=submission_id)

            # Verify the submission belongs to the authenticated user
            if submission.student.user != request.user:
                return Response(
                    {
                        "error": (
                            "You don't have permission to submit this form."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # Serialize and validate the data
            serializer = PARDSubmissionSerializer(
                data=request.data,
                context={
                    'submission_id': submission_id,
                    'student_number': submission.student.student_number
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
                    "Error saving data": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)