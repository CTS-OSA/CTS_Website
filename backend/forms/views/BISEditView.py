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

    def put(self, request, student_id):
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
            if 'name' in data:
                name_parts = data['name'].split(', ')
                if len(name_parts) >= 2:
                    student.last_name = name_parts[0]
                    first_middle = name_parts[1].split(' ')
                    student.first_name = first_middle[0] if first_middle else ''
                    student.middle_name = ' '.join(first_middle[1:]) if len(first_middle) > 1 else ''
           
            if 'nickname' in data:
                student.nickname = data['nickname']
            
            if 'year_course' in data: 
                year_course_parts = data['year_course'].split(' - ')
                if len(year_course_parts) == 2:
                    student.current_year_level = year_course_parts[0]
                    student.degree_program = year_course_parts[1]
            
            student_serializer = BISStudentSerializer(student, data=data)
            if student_serializer.is_valid(raise_exception=True):
                student_serializer.save()
            else:
                logger.error(f"Error on student validation: {student_serializer.errors}")
            
            # Update support data
            student_support, created = StudentSupport.objects.get_or_create(submission=submission)
            
            # Handle support many-to-many field
            if 'support' in data:
                support_choices = []
                for choice in data['support']:
                    support_obj, created = Support.objects.get_or_create(code=choice)
                    support_choices.append(support_obj)
                student_support.support.set(support_choices)
            
            # Update support-related notes
            if 'scholarship_notes' in data:
                student_support.other_scholarship = data['scholarship_notes']
            if 'combination_notes' in data:
                student_support.combination_notes = data['combination_notes']
            if 'others_notes' in data:
                student_support.other_notes = data['others_notes']
            
            student_support_serializer = StudentSupportSerializer(student_support, data=data)
            if student_support_serializer.is_valid():
                student_support_serializer.save()
            else:
                logger.error(f"Error on student support validation: {student_support_serializer.errors}")
            
            # Update socio-economic status 
            socio_status, created = SocioEconomicStatus.objects.get_or_create(submission=submission)
            
            if 'scholarships' in data:
                socio_status.scholarships = data['scholarships']
            if 'scholarship_privileges' in data:
                socio_status.scholarship_privileges = data['scholarship_privileges']
            if 'monthly_allowance' in data:
                socio_status.monthly_allowance = data['monthly_allowance']
            if 'spending_habit' in data:
                socio_status.spending_habit = data['spending_habit']

            socio_status_serializer = SocioEconomicStatusSerializer(socio_status, data=data)
            if socio_status_serializer.is_valid():
                socio_status_serializer.save()
            else: 
                logger.error(f"Error on socio-economic status validation: {socio_status_serializer.errors}")
            
            # Update preferences
            preferences, created = Preferences.objects.get_or_create(submission=submission)
            if 'influence' in data:
                preferences.influence = data['influence']
            if 'reason_for_enrolling' in data:
                preferences.reason_for_enrolling = data['reason_for_enrolling']
            if 'transfer_plans' in data:
                preferences.transfer_plans = data['transfer_plans'] in ['Yes', 'True', True, 'true', '1']
            if 'shift_plans' in data:
                preferences.shift_plans = data['shift_plans'] in ['Yes', 'True', True, 'true', '1']
            if 'transfer_reason' in data:
                preferences.transfer_reason = data['transfer_reason']
            if 'planned_shift_degree' in data:
                preferences.planned_shift_degree = data['planned_shift_degree']
            if 'reason_for_shifting' in data:
                preferences.reason_for_shifting = data['reason_for_shifting']
            
            preferences_serializer = PreferencesSerializer(preferences, data=data)
            if preferences_serializer.is_valid():
                preferences_serializer.save()
            else:
                logger.error(f"Error on preference validation: {preferences_serializer.errors}")
            
            # Update scholastic status
            scholastic, created = PresentScholasticStatus.objects.get_or_create(submission=submission)
            if 'intended_course' in data:
                scholastic.intended_course = data['intended_course']
            if 'first_choice_course' in data:
                scholastic.first_choice_course = data['first_choice_course']
            if 'admitted_course' in data:
                scholastic.admitted_course = data['admitted_course']    
            if 'next_plan' in data:
                scholastic.next_plan = data['next_plan'] 

            scholastic_serializer = PresentScholasticStatusSerializer(scholastic, data=data) 
            if scholastic_serializer.is_valid():
                scholastic_serializer.save()
            else:
                logger.error(f"Error on scholastic status validation: {scholastic_serializer.errors}")
            
            logger.info(f"BIS form for student {student.student_number} has been updated successfully.")
            return Response({'message': 'BIS form has been updated successfully.'}, status=status.HTTP_200_OK)

        except Submission.DoesNotExist:
            return Response({'error': 'BIS form not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)