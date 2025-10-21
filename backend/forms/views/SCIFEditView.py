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

    def put(self, request, student_id):
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
            if 'first_name' in data:
                student.first_name = data['first_name']
            if 'last_name' in data:
                student.last_name = data['last_name']
            if 'middle_name' in data:
                student.middle_name = data['middle_name']
            if 'nickname' in data:
                student.nickname = data['nickname']
            if 'sex' in data:
                student.sex = data['sex']
            if 'religion' in data:
                student.religion = data['religion']
            if 'birth_rank' in data:
                student.birth_rank = data['birth_rank']
            if 'email' in data:
                student.email = data['email']
            if 'contact_number' in data: 
                student.contact_number = data['contact_number']
            if 'landline_number' in data: 
                student.landline_number = data['landline_number']
            if 'permanent_address' in data:
                address_parts = data['permanent_address'].split(', ')
                if len(address_parts) >= 4:
                    student.permanent_address.address_line_1 = address_parts[0]
                    student.permanent_address.barangay = address_parts[1]
                    student.permanent_address.city_municipality = address_parts[2]
                    student.permanent_address.province = address_parts[3]
                    student.permanent_address.save()
            
            student_serializer = SCIFStudentSerializer(student, data=data)
            if student_serializer.is_valid(raise_exception=True):
                student_serializer.save()
            student.save()

            # Update health data
            health_data, created = HealthData.objects.get_or_create(
                student_number=student,
                submission=submission
            )

            if 'health_condition' in data:
                health_data.health_condition = data['health_condition']
            if 'height' in data:
                health_data.height = float(data['height']) if data['height'] else None
            if 'weight' in data:
                health_data.weight = float(data['weight']) if data['weight'] else None
            if 'eyesight' in data:
                health_data.eye_sight = data['eyesight']
            if 'hearing' in data:
                health_data.hearing = data['hearing']
            if 'physical_disabilities' in data:
                if isinstance(data['physical_disabilities'], str):
                    health_data.physical_disabilities = data['physical_disabilities'].split(', ') if data['physical_disabilities'] else []
                else:
                    health_data.physical_disabilities = data['physical_disabilities']
            if 'common_ailments' in data:
                if isinstance(data['common_ailments'], str):
                    health_data.common_ailments = data['common_ailments'].split(', ') if data['common_ailments'] else []
                else:
                    health_data.common_ailments = data['common_ailments']
            if 'last_hospitalization' in data:
                health_data.last_hospitalization = data['last_hospitalization']
            if 'reason_of_hospitalization' in data:
                health_data.reason_of_hospitalization = data['reason_of_hospitalization']
                
            health_data_serializer = HealthDataSerializer(health_data, data=data)
            if health_data_serializer.is_valid():
                health_data_serializer.save()
            else:
                logger.error(f"Error on health data validation: {health_data_serializer.errors}")
            
            scholarship, created = Scholarship.objects.get_or_create(submission=submission)
            if 'scholarships_and_assistance' in data:
                scholarship.scholarships_and_assistance = data.get('scholarships_and_assistance', [])
                scholarship.save()

            # Update family data
            family_data, created = FamilyData.objects.get_or_create(
                student=student,
                submission=submission
            )
            
            # Update father data
            if any(key.startswith('father_') for key in data.keys()):
                if not family_data.father:
                    family_data.father = Parent.objects.create()
                
                father = family_data.father
                if 'father_name' in data:
                    name_parts = data['father_name'].split(' ')
                    father.first_name = name_parts[0] if name_parts else ''
                    father.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                if 'father_age' in data:
                    father.age = int(data['father_age']) if data['father_age'] else None
                if 'father_job_occupation' in data:
                    father.job_occupation = data['father_job_occupation']
                if 'father_company_agency' in data:
                    father.company_agency = data['father_company_agency']
                if 'father_company_address' in data:
                    father.company_address = data['father_company_address']
                if 'father_highest_educational_attainment' in data:
                    father.highest_educational_attainment = data['father_highest_educational_attainment']
                if 'father_contact_number' in data:
                    father.contact_number = data['father_contact_number']
                
                father.save()
                family_data.father = father
            
            # Update mother data
            if any(key.startswith('mother_') for key in data.keys()):
                if not family_data.mother:
                    family_data.mother = Parent.objects.create()
                
                mother = family_data.mother
                if 'mother_name' in data:
                    name_parts = data['mother_name'].split(' ')
                    mother.first_name = name_parts[0] if name_parts else ''
                    mother.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                if 'mother_age' in data:
                    mother.age = int(data['mother_age']) if data['mother_age'] else None
                if 'mother_job_occupation' in data:
                    mother.job_occupation = data['mother_job_occupation']
                if 'mother_company_agency' in data:
                    mother.company_agency = data['mother_company_agency']
                if 'mother_company_address' in data:
                    mother.company_address = data['mother_company_address']
                if 'mother_highest_educational_attainment' in data:
                    mother.highest_educational_attainment = data['mother_highest_educational_attainment']
                if 'mother_contact_number' in data:
                    mother.contact_number = data['mother_contact_number']
                
                mother.save()
                family_data.mother = mother
            
            # Update guardian data
            if any(key.startswith('guardian_') for key in data.keys()):
                if not family_data.guardian:
                    family_data.guardian = Guardian.objects.create()
                
                guardian = family_data.guardian
                if 'guardian_name' in data:
                    name_parts = data['guardian_name'].split(' ')
                    guardian.first_name = name_parts[0] if name_parts else ''
                    guardian.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                if 'guardian_contact' in data:
                    guardian.contact_number = data['guardian_contact']
                if 'guardian_address' in data:
                    guardian.address = data['guardian_address']
                if 'guardian_relationship_to_guardian' in data:
                    guardian.relationship_to_guardian = data['guardian_relationship_to_guardian']
                if 'guardian_language_dialect' in data:
                    if isinstance(data['guardian_language_dialect'], str):
                        guardian.language_dialect = data['guardian_language_dialect'].split(', ') if data['guardian_language_dialect'] else []
                    else:
                        guardian.language_dialect = data['guardian_language_dialect']
                
                guardian.save()
                family_data.guardian = guardian
            
            family_data_serializer = FamilyDataSerializer(family_data, data=data)
            if family_data_serializer.is_valid():
                family_data_serializer.save()
            else:
                logger.error(f"Error on family data validation: {family_data_serializer.errors}")

            personality_traits, created = PersonalityTraits.objects.get_or_create(
                student=student,
                submission=submission
            )

            if 'enrollment_reason' in data: 
                personality_traits.enrollment_reason = data['enrollment_reason']
            if 'degree_program_aspiration' in data: 
                personality_traits.degree_program_aspiration = data['degree_program_aspiration']    
            if 'aspiration_explanation' in data: 
                personality_traits.aspiration_explanation = data['aspiration_explanation']
            if 'special_talents' in data: 
                personality_traits.special_talents = data['special_talents']
            if 'musical_instruments' in data: 
                personality_traits.musical_instruments = data['musical_instruments']
            if 'hobbies' in data:
                personality_traits.hobbies = data['hobbies']    
            if 'likes_in_people' in data:
                personality_traits.likes_in_people = data['likes_in_people']
            if 'dislikes_in_people' in data:
                personality_traits.dislikes_in_people = data['dislikes_in_people']
            
            personality_traits_serializer = PersonalityTraitsSerializer(personality_traits, data=data)
            if personality_traits_serializer.is_valid():
                personality_traits_serializer.save()
            else:
                logger.error(f"Error on personality traits validation: {personality_traits_serializer.errors}")
            
            # Update counseling info
            counseling_info, created = CounselingInformation.objects.get_or_create(
                submission=submission
            )
            
            if 'personal_characteristics' in data:
                counseling_info.personal_characteristics = data['personal_characteristics']
            if 'problem_confidant' in data:
                counseling_info.problem_confidant = data['problem_confidant']
            if 'confidant_reason' in data:
                counseling_info.confidant_reason = data['confidant_reason']
            if 'anticipated_problems' in data:
                counseling_info.anticipated_problems = data['potential_problems']
            if 'previous_counseling' in data:
                counseling_info.previous_counseling = data['previous_counseling'] in ['Yes', 'True', True]
            if 'counseling_location' in data:
                counseling_info.counseling_location = data['counseling_location']
            if 'counseling_counselor' in data:
                counseling_info.counseling_counselor = data['counseling_counselor']
            if 'counseling_reason' in data:
                counseling_info.counseling_reason = data['counseling_reason']
                
            counseling_info_serializer = CounselingInformationSerializer(counseling_info, data=data)
            if counseling_info_serializer.is_valid():
                counseling_info_serializer.save()
            else:
                logger.error(f"Validation failed: {counseling_info_serializer.errors}")

            guidance_notes, created = GuidanceSpecialistNotes.objects.get_or_create(
                student=student,
                submission=submission
            )

            # Update guidance notes
            if 'guidance_notes' in data:
                guidance_notes.notes = data['guidance_notes']

                guidance_serializer = GuidanceSpecialistNotesSerializer(guidance_notes, data=data)
                if guidance_serializer.is_valid():
                    guidance_serializer.save
                else: 
                    logger.error(f"Validation failed: {guidance_serializer.errors}")

            
            return Response({'message': 'SCIF form updated successfully'}, status=status.HTTP_200_OK)

        except Submission.DoesNotExist:
            return Response({'error': 'SCIF form not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)