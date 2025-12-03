from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from forms.models import Student, Submission

class FormStatusView(APIView):
    """
    Generic view to check if a user has submitted a specific form type
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Check form submission status for all forms"""
        try:
            # Check if user has a student profile
            if not hasattr(request.user, 'student') or request.user.is_staff:
                # Return empty status for admin users or users without student profile
                result = {
                    'bis': False,
                    'scif': False,
                    'pard': False,
                    'referral-form': False
                }
                return Response(result, status=status.HTTP_200_OK)
            
            student = request.user.student
            
            # Check each form type for students
            result = {
                'bis': Submission.objects.filter(
                    student=student,
                    form_type='Basic Information Sheet',
                    status='submitted'
                ).exists(),
                'scif': Submission.objects.filter(
                    student=student,
                    form_type='Student Cumulative Information File',
                    status='submitted'
                ).exists(),
                'pard': Submission.objects.filter(
                    student=student,
                    form_type='Psychosocial Assistance and Referral Desk',
                    status='submitted'
                ).exists(),
                'referral-form': Submission.objects.filter(
                    student=student,
                    form_type='Counseling Referral Slip',
                    status='submitted'
                ).exists()
            }
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )