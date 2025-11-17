from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from forms.models import Submission, HealthData, FamilyData, Parent, Guardian, Scholarship, PersonalityTraits, CounselingInformation, GuidanceSpecialistNotes
from forms.serializers import AdminSubmissionDetailSerializer,ParentSerializer,SiblingSerializer,GuardianSerializer,FamilyDataSerializer,HealthDataSerializer, SchoolAddressSerializer,SchoolSerializer, PreviousSchoolRecordSerializer, ScholarshipSerializer, PersonalityTraitsSerializer, CounselingInformationSerializer,FamilyRelationshipSerializer,GuidanceSpecialistNotesSerializer, SCIFStudentSerializer
from forms.map import FORM_SECTIONS_MAP
import logging 

logger = logging.getLogger(__name__)

class SCIFEditView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        """Get SCIF form data for editing"""
        try:
            submission = Submission.objects.select_related('student').get(
                student__student_number=student_id,
                form_type="Student Cumulative Information File"
            )
            
            # Check permissions
            if not request.user.is_staff and submission.student.user != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            sections = FORM_SECTIONS_MAP.get('scif')
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
            return Response({'error': 'SCIF form not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, student_id):
        """Update SCIF form data"""
        try:
            submission = Submission.objects.select_related('student').get(
                student__student_number=student_id,
                form_type="Student Cumulative Information File"
            )
            
            # Check permissions
            if not request.user.is_staff and submission.student.user != request.user:
                logger.info("Permission not allowed. User is not a staff or a student.")
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            data = request.data
            student = submission.student
            
            # Update student profile fields
            student_serializer = SCIFStudentSerializer(student, data=data, partial=True)
            
            if student_serializer.is_valid(raise_exception=True):
                student_serializer.save()
            else: 
                logger.error(f"Error on student profile validation: {student_serializer.errors}")
                return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)

            # Update health data
            health_data, created = HealthData.objects.get_or_create(
                student_number=student,
                submission=submission
            )

            health_data_serializer = HealthDataSerializer(health_data, data=data, partial=True)
            if health_data_serializer.is_valid():
                health_data_serializer.save()
            else:
                logger.error(f"Error on health data validation: {health_data_serializer.errors}")
                return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            scholarship, created = Scholarship.objects.get_or_create(
                student=student,
                submission=submission
            )
            scholarship_serializer = ScholarshipSerializer(scholarship, data=data, partial=True)
            if scholarship_serializer.is_valid():
                scholarship_serializer.save()
            else: 
                logger.error(f"Error on scholarship data validation: {scholarship_serializer.errors}")
                return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)

            # Update family data
            family_data, created = FamilyData.objects.get_or_create(
                student=student,
                submission=submission
            )

            family_data_serializer = FamilyDataSerializer(family_data, data=data, partial=True)
            
            if family_data_serializer.is_valid():
                family_data_serializer.save()
            else:
                logger.error(f"Error on family data validation: {family_data_serializer.errors}")
                return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)
            
            personality_traits, created = PersonalityTraits.objects.get_or_create(
                student=student,
                submission=submission
            )

            personality_traits_serializer = PersonalityTraitsSerializer(personality_traits, data=data, partial=True)
            if personality_traits_serializer.is_valid():
                personality_traits_serializer.save()
            else:
                logger.error(f"Error on personality traits validation: {personality_traits_serializer.errors}")
                return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)

            # Update counseling info
            counseling_info, created = CounselingInformation.objects.get_or_create(
                student=student,
                submission=submission
            )
                
            counseling_info_serializer = CounselingInformationSerializer(counseling_info, data=data, partial=True)
            if counseling_info_serializer.is_valid():
                counseling_info_serializer.save()
            else:
                logger.error(f"Error on counselling information validation:", {personality_traits_serializer.errors})
                return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)

            guidance_notes, created = GuidanceSpecialistNotes.objects.get_or_create(
                student=student,
                submission=submission
            )

            # Update guidance notes
            if 'guidance_notes' in data:
                guidance_notes.notes = data['guidance_notes']

                guidance_serializer = GuidanceSpecialistNotesSerializer(guidance_notes, data=data, partial=True)
                if guidance_serializer.is_valid():
                    guidance_serializer.save
                else: 
                    logger.error(f"Error on guidance notes validation:", {personality_traits_serializer.errors})
                    return Response({'An error occurred while updating the data.'}, status=status.HTTP_400_BAD_REQUEST)

            
            return Response({'message': 'SCIF form updated successfully'}, status=status.HTTP_200_OK)

        except Submission.DoesNotExist:
            return Response({'error': 'SCIF form not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)