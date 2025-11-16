from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models.submission import Submission
from ..models.PARD import PARD
from ..serializers.SerializerPARD import PARDSubmissionSerializer, PARDSerializer
from ..models.student import Student


class PARDSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_student_data(self, student, request):
        """Extract student profile and address data"""
        data = {
            "submission": {},
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
        
        if student.permanent_address:
            data["permanent_address"] = {
                "address_line_1": student.permanent_address.address_line_1,
                "address_line_2": student.permanent_address.address_line_2,
                "barangay": student.permanent_address.barangay,
                "city_municipality": student.permanent_address.city_municipality,
                "province": student.permanent_address.province,
                "region": student.permanent_address.region,
            }
        
        if student.address_while_in_up:
            data["address_while_in_up"] = {
                "address_line_1": student.address_while_in_up.address_line_1,
                "address_line_2": student.address_while_in_up.address_line_2,
                "barangay": student.address_while_in_up.barangay,
                "city_municipality": student.address_while_in_up.city_municipality,
                "province": student.address_while_in_up.province,
                "region": student.address_while_in_up.region,
            }
        
        return data
    
    def get_pard_data(self, student, submission):
        """Get PARD data if submission is submitted"""
        if submission.status != 'submitted':
            return None
            
        try:
            pard_instance = PARD.objects.get(
                student_number=student,
                submission_id=submission
            )
            return PARDSerializer(instance=pard_instance).data
        except PARD.DoesNotExist:
            return None
    
    # Retrieve data for: 
    # STUDENT: Return basic information for pre-filled input fields
    # ADMIN: Return both student and PARD data 
    def get(self, request, student_number):
        try:
            student = get_object_or_404(Student, student_number=student_number)
            submission = Submission.objects.get(
                student=student,
                form_type="Psychosocial Assistance and Referral Desk"
            )
            
            # Retrieve student data
            response_data = self.get_student_data(student, request)
            response_data["submission"]["id"] = submission.id

            # Get pard data only for admin
            if request.user.is_staff:
                response_data["pard_data"] = self.get_pard_data(student, submission)
            
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

    # Updates data from the admin side  
    def patch(self, request,student_number):
        try: 
            if request.user.is_staff: 
                pard_instance = get_object_or_404(
                    PARD,
                    student_number__student_number=student_number,
                )
                
                serializer = PARDSerializer(
                    pard_instance,
                    data=request.data,
                    partial=True
                )
                
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        "message": "PARD schedule updated successfully!",
                        "pard_id": pard_instance.id
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "Error updating data": serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
                
            else: 
                return Response(
                    {
                        "error": (
                            "You don't have permission to edit this form."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
