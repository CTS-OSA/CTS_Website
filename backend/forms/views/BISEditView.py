from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from forms.models import Submission, StudentSupport, Support
from forms.models import SocioEconomicStatus, Preferences, PresentScholasticStatus
from forms.serializers import PreferencesSerializer,StudentSupportSerializer, SocioEconomicStatusSerializer, PresentScholasticStatusSerializer, BISStudentSerializer
from forms.serializers import AdminSubmissionDetailSerializer
from forms.map import FORM_SECTIONS_MAP
import logging 

logger = logging.getLogger(__name__)

class BISEditView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        """Get BIS form data for editing"""
        try:
            submission = Submission.objects.select_related('student').get(
                student__student_number=student_id,
                form_type="Basic Information Sheet"
            )
            
            # Check permissions
            if not request.user.is_staff and submission.student.user != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            sections = FORM_SECTIONS_MAP.get('bis')
            if not sections:
                return Response({'error': 'Invalid form type'}, status=status.HTTP_400_BAD_REQUEST)

            data = {'submission': AdminSubmissionDetailSerializer(submission).data}

            for key, (model, serializer) in sections.items():
                many = model._meta.model_name in ['sibling', 'previousschoolrecord']
                
                if any(field.name == 'submission' for field in model._meta.fields):
                    queryset = model.objects.filter(submission=submission)
                elif any(field.name == 'student' for field in model._meta.fields):
                    queryset = model.objects.filter(student=submission.student)
                else:
                    queryset = model.objects.none()

                if many:
                    data[key] = serializer(queryset, many=True).data
                else:
                    instance = queryset.first()
                    data[key] = serializer(instance).data if instance else None

            return Response(data, status=status.HTTP_200_OK)

        except Submission.DoesNotExist:
            return Response({'error': 'BIS form not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, student_id):
        """Update BIS form data"""
        try:
            submission = Submission.objects.select_related('student').get(
                student__student_number=student_id,
                form_type="Basic Information Sheet"
            )
            
            # Check permissions
            if not request.user.is_staff and submission.student.user != request.user:
                logger.info("Permission not allowed. User is not a staff or a student.")
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get the data from request
            data = request.data
            
            # Update student profile fields
            student = submission.student
            student_serializer = BISStudentSerializer(student, data=data, partial=True)
            if student_serializer.is_valid():
                student_serializer.save()
            else:
                logger.error(f"Error updating student profile: {student_serializer.errors}")
                return Response({'An error occured while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update support data
            student_support, created = StudentSupport.objects.get_or_create(submission=submission)
            student_support_serializer = StudentSupportSerializer(student_support, data=data, partial=True)
            if student_support_serializer.is_valid():
                student_support_serializer.save()
            else:
                logger.error(f"Error updating student support: {student_support_serializer.errors}")
                return Response({'An error occured while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update socio-economic status 
            socio_status, created = SocioEconomicStatus.objects.get_or_create(submission=submission)
            socio_status_serializer = SocioEconomicStatusSerializer(socio_status, data=data, partial=True)
            
            if socio_status_serializer.is_valid():
                socio_status_serializer.save()
            else: 
                logger.error(f"Error updating socio-economic status: {socio_status_serializer.errors}")
                return Response({'An error occured while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update preferences
            preferences, created = Preferences.objects.get_or_create(submission=submission)
            preferences_serializer = PreferencesSerializer(preferences, data=data, partial=True)
            
            if preferences_serializer.is_valid():
                preferences_serializer.save()
            else:
                logger.error(f"Error updating preferences: {preferences_serializer.errors}")
                return Response({'An error occured while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update scholastic status
            scholastic, created = PresentScholasticStatus.objects.get_or_create(submission=submission)
            scholastic_serializer = PresentScholasticStatusSerializer(scholastic, data=data, partial=True)
            
            if scholastic_serializer.is_valid():
                scholastic_serializer.save()
            else:
                logger.error(f"Error updating scholastic status: {scholastic_serializer.errors}")
                return Response({'An error occured while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Only log success if all updates were successful
            logger.info(f"BIS form for student {student.student_number} has been updated successfully.")
            return Response({'message': 'BIS form has been updated successfully.'}, status=status.HTTP_200_OK)

        except Submission.DoesNotExist:
            return Response({'error': 'BIS form not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)