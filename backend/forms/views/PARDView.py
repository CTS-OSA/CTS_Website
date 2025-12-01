from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models.submission import Submission
from ..models.PARD import PARD, PARDSchedule
from ..serializers.SerializerPARD import PARDSubmissionSerializer, PARDSerializer
from ..models.student import Student
from django.utils import timezone

# Global helper functions
def get_student_data(student, request):
        """Extract student profile and address data"""
        data = {
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

def get_student_data_pard_form_view(student):
    """Get basic student data"""
    return {
        "student_number": student.student_number,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "middle_name": student.middle_name,
        "degree_program": student.degree_program,
        "current_year_level": student.current_year_level,
        "contact_number": student.contact_number,
    }

def get_pard_data(student, submission):
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

class PARDSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    # Retrieve data for: 
    # STUDENT: Return basic information for pre-filled input fields
    # ADMIN: Return both student and PARD data 
    def get(self, request, student_number):
        try:
            student = get_object_or_404(Student, student_number=student_number)
            
            # Retrieve student data
            response_data = get_student_data(student, request)

            # Only include submission data for admin users
            if request.user.is_staff:
                response_data["submission"] = {}
                try:
                    submission = Submission.objects.get(
                        student=student,
                        form_type="Psychosocial Assistance and Referral Desk"
                    )
                    response_data["submission"]["id"] = submission.id
                    response_data["pard_data"] = get_pard_data(student, submission)
                except Submission.DoesNotExist:
                    response_data["submission"]["id"] = None
                    response_data["pard_data"] = None
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, student_number):
        try:
            # Get the student
            student = get_object_or_404(Student, student_number=student_number)
            
            # Verify the student belongs to the authenticated user
            if student.user != request.user:
                return Response(
                    {"error": "You don't have permission to submit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Create new submission
            submission = Submission.objects.create(
                student=student,
                form_type="Psychosocial Assistance and Referral Desk",
                status='draft'
            )

            # Serialize and validate the data
            serializer = PARDSubmissionSerializer(
                data=request.data,
                context={
                    'submission_id': submission.id,
                    'student_number': student_number
                }
            )
            
            if serializer.is_valid():
                # Save the PARD data
                serializer.save()
                
                # Update submission status
                submission.status = 'submitted'
                submission.saved_on = timezone.now()
                submission.submitted_on = timezone.now()
                submission.save()
                
                return Response({"success": True}, status=status.HTTP_200_OK)
            else:
                return Response({
                    "Error saving data": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, student_number):
        try:
            if request.user.is_staff: 
                student = get_object_or_404(Student, student_number=student_number)
                
                # Get the submission
                submission = get_object_or_404(
                    Submission,
                    student=student,
                    form_type="Psychosocial Assistance and Referral Desk"
                )

                # Verify the submission belongs to the authenticated user
                if submission.student.user != request.user:
                    return Response(
                        {"error": "You don't have permission to delete this form."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Update PARD status if it exists
                try:
                    pard = PARD.objects.get(student_number=student)
                    pard.status = 'deleted'
                    pard.save()
                except PARD.DoesNotExist:
                    pass
                
                return Response(
                    {"message": "PARD draft deleted successfully."},
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response(
                        {"error": "You don't have permission to delete this form."},
                        status=status.HTTP_403_FORBIDDEN
                    )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def hasSubmittedPARD(self,student):
        # Check if there's a submitted PARD submission
        submission_exists = Submission.objects.filter(
            student=student,
            form_type="Psychosocial Assistance and Referral Desk",
            status='submitted'
        ).exists()

        return submission_exists

    def head(self, request):
        """Check if logged-in user has submitted PARD form"""
        try:
            student = request.user.student
            
            # Check if there's a submitted PARD submission
            submission_exists = self.hasSubmittedPARD(student)
            
            return Response({"has_submitted": submission_exists}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Updates data from the admin side  
    def patch(self, request, submission_id):
        try: 
            if request.user.is_staff: 
                submission = get_object_or_404(
                    Submission,
                    id=submission_id,
                    form_type="Psychosocial Assistance and Referral Desk"
                )
                
                pard_instance = get_object_or_404(
                    PARD,
                    student_number=submission.student,
                    submission_id=submission
                )
                
                serializer = PARDSerializer(
                    pard_instance,
                    data=request.data,
                    partial=True
                )
                
                if serializer.is_valid():
                    serializer.save()
                    return Response(status=status.HTTP_200_OK)
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

class PARDFormView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, submission_id):
        """Get PARD form data by submission ID"""
        try:
            submission = get_object_or_404(
                Submission,
                id=submission_id,
                form_type="Psychosocial Assistance and Referral Desk"
            )

            # Verify user has permission to view this submission
            if submission.student.user != request.user and not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to view this form."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get student and PARD data using global helper functions
            student = submission.student
            student_data = get_student_data_pard_form_view(student)
            pard_data = get_pard_data(student, submission)
            
            # Set PARD status to 'read' if admin opens the form
            if request.user.is_staff:
                try:
                    pard_instance = PARD.objects.get(
                        student_number=student,
                        submission_id=submission
                    )

                    if pard_instance.status == 'unread':
                        pard_instance.status = 'read'
                        pard_instance.save()
                except PARD.DoesNotExist:
                    pass

            
            response_data = {
                "submission": {
                    "id": submission.id,
                    "submitted_on": submission.submitted_on
                },
                "pard_data": pard_data,
                "student_data": student_data,
                "email": student.user.email
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, submission_id):
        """Update PARD appointment details (admin only)"""
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to edit this form."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            submission = get_object_or_404(
                Submission,
                id=submission_id,
                form_type="Psychosocial Assistance and Referral Desk"
            )
            
            pard_instance = get_object_or_404(
                PARD,
                student_number=submission.student,
                submission_id=submission
            )

            # FIX ME: IF THE STATUS IS COMPLETED, IT SHOULD ADD THE SCHEDULE DATE TO PARDSCHEDUlE            
            serializer = PARDSerializer(
                pard_instance,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Appointment updated successfully!"},
                    status=status.HTTP_200_OK
                )
            
            # if pard_instance.status == 'completed':
                
            #     PARDSchedule.objects.create(
            #         student=student, 
            #         scheduled_date=,
            #         scheduled_time=
            #     )

            #     serializer = PARDScheduleSerializer(
            #         data=request.data, 
            #         partial=True
            #     )
                
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PARDStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get PARD status choices"""
        from ..models.enums import PARDStatus
        return Response({"status_choices": list(PARDStatus.choices)}, status=status.HTTP_200_OK)