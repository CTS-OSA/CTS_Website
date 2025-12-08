# forms/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from forms.models import Submission
from forms.serializers import SubmissionSerializer
from rest_framework.exceptions import PermissionDenied

class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing submissions. Admins can view all submissions,
    while regular users can only see their own.
    """
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns all submissions if the user is an admin/staff,
        otherwise only the submissions of the logged-in student.
        """
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return Submission.objects.all().order_by('-submitted_on')
        
        if not hasattr(user, 'student'):
            raise PermissionDenied("You must complete your student profile first.")

        # Assuming every non-admin user has a related student profile
        return Submission.objects.filter(student=user.student).order_by('-submitted_on')

