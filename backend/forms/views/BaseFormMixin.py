from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from forms.map import FORM_SECTIONS_MAP, FORM_TYPE_SLUG_MAP
from forms.models import Submission

class BaseFormMixin:
    """Common utilities for form-based views."""

    def get_form_sections(self, form_type):
        """Retrieve the sections for a given form slug."""
        return FORM_SECTIONS_MAP.get(form_type)

    def get_submission(self, student, form_type):
        """Fetch the student's submission for a given form type."""
        form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)
        if not form_type_display:
            return None, Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            submission = Submission.objects.get(student=student, form_type=form_type_display)
            return submission, None
        except Submission.DoesNotExist:
            return None, Response({'error': 'No submission found for this form type.'}, status=status.HTTP_404_NOT_FOUND)

    def update_submission_timestamp(self, submission):
        submission.saved_on = timezone.now()
        submission.save()
