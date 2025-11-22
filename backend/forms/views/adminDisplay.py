# students/views.py
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView
from forms.models import Student, Submission, Referral
from forms.serializers import StudentSerializer, AdminSubmissionDetailSerializer, SubmissionSerializer, AdminReferralListSerializer, AdminReferralDetailSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from forms.map import FORM_SECTIONS_MAP, FORM_TYPE_UNSLUG_MAP, FORM_TYPE_SLUG_MAP

class AdminStudentListView(ListAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUser]

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_student_profile_by_id(request, student_id):
    try:
        student = Student.objects.get(student_number=student_id)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_referral_detail(request, referral_id):
    try:
        referral = Referral.objects.get(id=referral_id)
    except Referral.DoesNotExist:
        return Response({"error": "Referral not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user.is_staff or (hasattr(user, "student") and referral.referrer.student == user.student):
        serializer = AdminReferralDetailSerializer(referral)
        return Response(serializer.data)
    else:
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
    
    
class AdminBISList(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Permission denied, admins only.'}, status=403)

        try:
            submissions = Submission.objects.filter(form_type="Basic Information Sheet", status="submitted") 
            serializer = AdminSubmissionDetailSerializer(submissions, many=True)
            return Response(serializer.data, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class AdminSCIFList(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Permission denied, admins only.'}, status=403)

        try:
            submissions = Submission.objects.filter(form_type="Student Cumulative Information File", status="submitted") 
            serializer = AdminSubmissionDetailSerializer(submissions, many=True)
            return Response(serializer.data, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
class AdminReferralListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            referrals = Referral.objects.filter(submission__status="submitted").order_by('-referral_date')
            serializer = AdminReferralListSerializer(referrals, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminStudentFormsView(APIView):
    def get(self, request, student_id):
        try:
            submissions = Submission.objects.filter(student__student_number=student_id, status='submitted')

            serializer = AdminSubmissionDetailSerializer(submissions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AdminStudentFormView(APIView):
    permission_classes = [IsAdminUser]  

    def get(self, request, student_id, form_type):
        form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)
        if not form_type_display:
            return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            submission = Submission.objects.select_related('student').get(
                student__student_number=student_id,
                form_type=form_type_display
            )

        except Submission.DoesNotExist:
            return Response({'error': 'No submission found for this student and form type.'}, status=status.HTTP_404_NOT_FOUND)

        sections = FORM_SECTIONS_MAP.get(form_type)
        if not sections:
            return Response({'error': 'Invalid form type sections.'}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            'submission': SubmissionSerializer(submission).data,
        }

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