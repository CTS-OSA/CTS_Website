from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.shortcuts import get_object_or_404
from forms.models import GraduateStudent, Student
from forms.serializers.SerializerGraduation import GraduateStudentSerializer


class GraduationView(APIView):
    """
    GET: Retrieve graduation info for a student_number.
    PUT: Create or update graduation info (admin only).
    """

    def _check_can_view(self, request, student_number):
        if request.user and request.user.is_staff:
            return True
        try:
            student = Student.objects.get(student_number=student_number)
        except Student.DoesNotExist:
            return False
        return hasattr(request.user, 'student') and request.user.student.student_number == student.student_number

    def get(self, request, student_number):
        if not self._check_can_view(request, student_number):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            grad = GraduateStudent.objects.get(student_number__student_number=student_number)
            serializer = GraduateStudentSerializer(grad)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GraduateStudent.DoesNotExist:
            return Response({
                "exists": False,
                "academic_year": "",
                "semester": "",
                "graduation_date": "",
                "graduation_degree_program": "",
                "honors_received": "",
        }, status=status.HTTP_200_OK)


    def put(self, request, student_number):
        # Only admin can create/update
        if not request.user or not request.user.is_staff:
            return Response({'detail': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        # Prepare payload
        payload = request.data.copy()
        payload["student_number"] = student_number  # required by serializer

        try:
            # Try to update existing graduation record
            grad = GraduateStudent.objects.get(student_number__student_number=student_number)
            serializer = GraduateStudentSerializer(grad, data=payload, partial=True)
            status_code = status.HTTP_200_OK

        except GraduateStudent.DoesNotExist:
            # Create new record instead
            serializer = GraduateStudentSerializer(data=payload)
            status_code = status.HTTP_201_CREATED

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        saved_obj = serializer.save()
        return Response(GraduateStudentSerializer(saved_obj).data, status=status_code)
