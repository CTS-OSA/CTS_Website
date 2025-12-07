# from rest_framework import viewsets, status
# from rest_framework.response import Response
# from forms.models import Submission, PrivacyConsent
# from forms.serializers import (
#     SubmissionSerializer,
#     PrivacyConsentSerializer,
# )
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from django.core.exceptions import ValidationError
# from forms.map import FORM_SECTIONS_MAP, FORM_TYPE_SLUG_MAP, FORM_TYPE_UNSLUG_MAP, OPTIONAL_SECTIONS
# from users.utils import log_action

# class PrivacyConsentViewSet(viewsets.ModelViewSet):
#     queryset = PrivacyConsent.objects.all()
#     serializer_class = PrivacyConsentSerializer


# class DraftSubmissionMixin:
#     def perform_create(self, serializer):
#         instance = serializer.save()
#         self._conditionally_validate_and_update_submission(instance)

#     def perform_update(self, serializer):
#         instance = serializer.save()
#         self._conditionally_validate_and_update_submission(instance)

#     def _conditionally_validate_and_update_submission(self, instance):
#         submission = instance.submission
#         submission.saved_on = timezone.now()

#         if submission.status == 'submitted':
#             instance.full_clean()
#             submission.submitted_on = timezone.now()

#         submission.save()
#         instance.save()


# class FormBundleView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, form_type):
#         student = request.user.student
#         sections = FORM_SECTIONS_MAP.get(form_type)
#         form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)

#         if not sections:
#             return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             submission = Submission.objects.select_related('student').get(student=student, form_type=form_type_display)
#         except Submission.DoesNotExist:
#             return Response({'error': 'No submission found for this form type.'}, status=status.HTTP_404_NOT_FOUND)

#         data = {
#             'submission': SubmissionSerializer(submission).data
#         }

#         for key, (model, serializer) in sections.items():
#             many = model._meta.model_name in ['sibling', 'previousschoolrecord']  # Add others as needed

#             if any(field.name == 'submission' for field in model._meta.fields):
#                 queryset = model.objects.filter(submission=submission)
#             elif any(field.name == 'student' for field in model._meta.fields):
#                 queryset = model.objects.filter(student=student)
#             else:
#                 queryset = model.objects.none()

#             if many:
#                 data[key] = serializer(queryset, many=True).data
#             else:
#                 instance = queryset.first()
#                 data[key] = serializer(instance).data if instance else None

#         return Response(data)

#     def post(self, request, form_type):
#         # Map slug to display name
#         form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)

#         if not form_type_display:
#             return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

#         student = request.user.student
#         submission, created = Submission.objects.get_or_create(
#             student=student,
#             form_type=form_type_display,  
#             defaults={'status': 'draft'}
#         )

#         if not created:
#             return Response({'message': 'Submission already exists.', 'submission_id': submission.id})

#         submission.saved_on = timezone.now()
#         submission.save()

#         return Response({'message': 'Draft submission created successfully.', 'submission_id': submission.id}, status=status.HTTP_201_CREATED)

#     def patch(self, request, form_type):
#         form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)
#         student = request.user.student
#         sections = FORM_SECTIONS_MAP.get(form_type)

#         if not sections:
#             return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             submission = Submission.objects.get(student=student, form_type=form_type_display)
#         except Submission.DoesNotExist:
#             return Response({'error': 'No submission found for this form type.'}, status=status.HTTP_404_NOT_FOUND)

#         if submission.status == 'submitted':
#             return Response({'error': 'You cannot modify a submitted form.'}, status=status.HTTP_400_BAD_REQUEST)

#         errors = {}
#         updated_data = {}

#         for key, (model, serializer_class) in sections.items():
#             section_data = request.data.get(key)
#             if section_data is not None:
#                 many = isinstance(section_data, list)

#                 if many:
#                     existing_instances = model.objects.filter(submission=submission)

#                     for item in section_data:
#                         if 'submission' not in item and 'submission' in [f.name for f in model._meta.fields]:
#                             item['submission'] = submission.id
#                         if 'student' not in item and 'student' in [f.name for f in model._meta.fields]:
#                             item['student'] = student.student_number

#                     serializer = serializer_class(
#                         instance=existing_instances,
#                         data=section_data,
#                         partial=True,
#                         many=True,
#                         context={'submission': submission, 'student': student}
#                     )
#                 else:
#                     instance = model.objects.filter(submission=submission).first() if 'submission' in [f.name for f in model._meta.fields] else model.objects.filter(student=student).first()

#                     if 'submission' not in section_data and 'submission' in [f.name for f in model._meta.fields]:
#                         section_data['submission'] = submission.id
#                     if 'student' not in section_data and 'student' in [f.name for f in model._meta.fields]:
#                         section_data['student'] = student.student_number

#                     serializer = serializer_class(
#                         instance=instance,
#                         data=section_data,
#                         partial=True,
#                         many=False,
#                         context={'submission': submission, 'student': student}
#                     )

#                 if serializer.is_valid():
#                     saved_data = serializer.save()
#                     updated_data[key] = serializer.data
#                 else:
#                     errors[key] = serializer.errors

#         if errors:
#             return Response({
#                 'message': 'Some sections failed validation.',
#                 'errors': errors,
#                 'data': updated_data,
#             }, status=status.HTTP_400_BAD_REQUEST)

                
#         return Response({'message': 'Form data updated successfully.', 'data': updated_data}, status=status.HTTP_200_OK)

#     def delete(self, request, form_type):
#         form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)

#         if not form_type_display:
#             return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         student = request.user.student

#         try:
#             submission = Submission.objects.get(student=student, form_type=form_type_display)
#         except Submission.DoesNotExist:
#             return Response({'error': 'No submission found for this form type.'}, status=status.HTTP_404_NOT_FOUND)

#         if submission.status != 'draft':
#             return Response({'error': 'You cannot delete a form that is already submitted.'},
#                             status=status.HTTP_400_BAD_REQUEST)

#         submission.delete()

#         return Response({'message': 'Submission deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# class FinalizeSubmissionView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, submission_id):
#         try:
#             submission = Submission.objects.get(id=submission_id)
#         except Submission.DoesNotExist:
#             return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

#         if submission.student != request.user.student:
#             return Response({'error': 'You do not have permission to submit this form.'},
#                             status=status.HTTP_403_FORBIDDEN)

#         if submission.status == 'submitted':
#             return Response({'message': 'Submission has already been finalized.'},
#                             status=status.HTTP_400_BAD_REQUEST)

#         form_type_slug = FORM_TYPE_UNSLUG_MAP.get(submission.form_type)
#         if not form_type_slug:
#             return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

#         sections = FORM_SECTIONS_MAP.get(form_type_slug)
#         if not sections:
#             return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

#         errors = {}

#         for key, (model, _) in sections.items():
#             filter_kwargs = {}
#             if any(field.name == 'submission' for field in model._meta.fields):
#                 filter_kwargs['submission'] = submission

#             if any(field.name == 'student' for field in model._meta.fields):
#                 filter_kwargs['student'] = request.user.student

#             instance = model.objects.filter(**filter_kwargs).first()

#             if instance:
#                 try:
#                     instance.clean() 
#                 except ValidationError as e:
#                     errors[key] = e.message_dict
#             else:
#                 if key not in OPTIONAL_SECTIONS.get(form_type_slug, []):
#                     errors[key] = ['Section is missing.']

#         if errors:
#             return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

#         submission.status = 'submitted'
#         submission.submitted_on = timezone.now()
#         submission.save()
#         log_action(
#             request,
#             "submission",
#             "Form finalized and submitted",
#             f"Submission ID: {submission.id}, Form type: {submission.form_type}"
#         )

#         return Response({'message': 'Submission finalized successfully.'}, status=status.HTTP_200_OK)
    
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.core.exceptions import ValidationError
from forms.models import Submission, PrivacyConsent
from forms.serializers import SubmissionSerializer, PrivacyConsentSerializer
from .BaseFormMixin import BaseFormMixin
from forms.map import FORM_SECTIONS_MAP, FORM_TYPE_UNSLUG_MAP, OPTIONAL_SECTIONS, FORM_TYPE_SLUG_MAP
from users.utils import log_action
from django.http import HttpResponse


class PrivacyConsentViewSet(viewsets.ModelViewSet):
    queryset = PrivacyConsent.objects.all()
    serializer_class = PrivacyConsentSerializer

class DraftSubmissionMixin:
    def perform_create(self, serializer):
        instance = serializer.save()
        self._conditionally_validate_and_update_submission(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._conditionally_validate_and_update_submission(instance)

    def _conditionally_validate_and_update_submission(self, instance):
        submission = instance.submission
        submission.saved_on = timezone.now()

        if submission.status == 'submitted':
            instance.full_clean()
            submission.submitted_on = timezone.now()

        submission.save()
        instance.save()

class FormBundleView(APIView, BaseFormMixin):
    permission_classes = [IsAuthenticated]

    def get(self, request, form_type):
        """Fetch all form sections for a given form type."""
        student = request.user.student
        sections = self.get_form_sections(form_type)
        if not sections:
            return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

        submission, error = self.get_submission(student, form_type)
        if error:
            return error

        response_data = {'submission': SubmissionSerializer(submission).data}

        for key, (model, serializer_class) in sections.items():
            many = key in [
                'siblings',
                'previous_school_record',
                'college_awards',
                'memberships',
                'psychometric_data',
            ]
            if model._meta.model_name == 'pard':
                filter_field = 'submission_id'
                filter_value = submission
            elif 'submission' in [f.name for f in model._meta.fields]:
                filter_field = 'submission'
                filter_value = submission
            else:
                filter_field = 'student'
                filter_value = student
            queryset = model.objects.filter(**{filter_field: filter_value})

            if many:
                response_data[key] = serializer_class(queryset, many=True).data
            else:
                instance = queryset.first()
                response_data[key] = serializer_class(instance).data if instance else None

        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request, form_type):
        """Create a new draft submission."""
        student = request.user.student
        form_type_display = FORM_TYPE_SLUG_MAP.get(form_type)
        if not form_type_display:
            return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

        submission, created = Submission.objects.get_or_create(
            student=student, form_type=form_type_display, defaults={'status': 'draft'}
        )
        if not created:
            return Response({'message': 'Submission already exists.', 'submission_id': submission.id})

        submission.saved_on = timezone.now()
        submission.save()
        return Response({
            'message': 'Draft submission created successfully.',
            'submission_id': submission.id
        }, status=status.HTTP_201_CREATED)

    def patch(self, request, form_type):
        """Update multiple sections at once."""
        student = request.user.student
        sections = self.get_form_sections(form_type)
        if not sections:
            return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

        submission, error = self.get_submission(student, form_type)
        if error:
            return error

        if submission.status == 'submitted':
            return Response({'error': 'You cannot modify a submitted form.'}, status=status.HTTP_400_BAD_REQUEST)

        errors, updated_data = {}, {}

        for key, (model, serializer_class) in sections.items():
            section_data = request.data.get(key)
            if section_data is None:
                continue

            many = isinstance(section_data, list)
            section_data = self._attach_foreign_keys(section_data, model, submission, student, many)
            serializer = self._get_section_serializer(serializer_class, model, submission, student, section_data, many)

            if serializer.is_valid():
                serializer.save()
                updated_data[key] = serializer.data
            else:
                errors[key] = serializer.errors

        if errors:
            return Response({'message': 'Some sections failed validation.', 'errors': errors, 'data': updated_data},
                            status=status.HTTP_400_BAD_REQUEST)

        self.update_submission_timestamp(submission)
        return Response({'message': 'Form updated successfully.', 'data': updated_data}, status=status.HTTP_200_OK)

    def delete(self, request, form_type):
        """Delete a draft submission."""
        student = request.user.student
        submission, error = self.get_submission(student, form_type)
        if error:
            return error

        if submission.status != 'draft':
            return Response({'error': 'Cannot delete a submitted form.'}, status=status.HTTP_400_BAD_REQUEST)

        submission.delete()
        return Response({'message': 'Submission deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

    # --- Helper methods ---

    def _attach_foreign_keys(self, section_data, model, submission, student, many):
        """Ensure each section has submission/student foreign keys attached."""
        def attach_keys(item):
            if 'submission' not in item and 'submission' in [f.name for f in model._meta.fields]:
                item['submission'] = submission.id
            if 'student' not in item and 'student' in [f.name for f in model._meta.fields]:
                item['student'] = student.student_number
            return item

        if many:
            return [attach_keys(item) for item in section_data]
        return attach_keys(section_data)

    def _get_section_serializer(self, serializer_class, model, submission, student, section_data, many):
        """Return a properly configured serializer instance for a given section."""
        if many:
            instances = model.objects.filter(submission=submission)
            return serializer_class(
                instance=instances,
                data=section_data,
                many=True,
                partial=True,
                context={'submission': submission, 'student': student, 'request': self.request}
            )
        else:
            instance = model.objects.filter(submission=submission).first()
            return serializer_class(
                instance=instance,
                data=section_data,
                many=False,
                partial=True,
                context={'submission': submission, 'student': student,  'request': self.request}
            )

class FinalizeSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Permission check
        if submission.student != request.user.student:
            return Response({'error': 'Not authorized to submit this form.'}, status=status.HTTP_403_FORBIDDEN)

        if submission.status == 'submitted':
            return Response({'message': 'Already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        form_type_slug = FORM_TYPE_UNSLUG_MAP.get(submission.form_type)
        sections = FORM_SECTIONS_MAP.get(form_type_slug)
        if not sections:
            return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

        errors = {}
        for key, (model, _) in sections.items():
            filter_kwargs = {}
            if 'submission' in [f.name for f in model._meta.fields]:
                filter_kwargs['submission'] = submission
            if 'student' in [f.name for f in model._meta.fields]:
                filter_kwargs['student'] = request.user.student

            instance = model.objects.filter(**filter_kwargs).first()
            if not instance and key not in OPTIONAL_SECTIONS.get(form_type_slug, []):
                errors[key] = ['Section missing.']
                continue

            if instance:
                try:
                    instance.clean()
                except ValidationError as e:
                    errors[key] = e.message_dict

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        submission.status = 'submitted'
        submission.submitted_on = timezone.now()
        submission.save()

        log_action(request, "submission", "Form finalized and submitted",
                   f"Submission ID: {submission.id}, Form type: {submission.form_type}")

        return Response({'message': 'Submission finalized successfully.'}, status=status.HTTP_200_OK)

# ADMIN FORM EDIT VIEW
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class AdminFormEditView(APIView, BaseFormMixin):
    permission_classes = [IsAuthenticated, IsAdminUser]  # Only admin/counselors

    def patch(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

        form_type_slug = FORM_TYPE_UNSLUG_MAP.get(submission.form_type)
        sections = FORM_SECTIONS_MAP.get(form_type_slug)

        if not sections:
            return Response({'error': 'Invalid form type.'}, status=status.HTTP_400_BAD_REQUEST)

        updated_data = {}
        errors = {}

        for key, (model, serializer_class) in sections.items():
            section_data = request.data.get(key)
            # Accept empty lists/empty objects as valid payloads (they should
            # be processed and may signal deletions). Only skip when the key
            # is absent (None).
            if section_data is None:
                continue

            many = isinstance(section_data, list)
            section_data = self._attach_foreign_keys(
                section_data, model, submission, submission.student, many
            )

            serializer = self._get_section_serializer(
                serializer_class, model, submission, submission.student, section_data, many
            )

            if serializer.is_valid():
                serializer.save()
                updated_data[key] = serializer.data
            else:
                errors[key] = serializer.errors

        if errors:
            return Response(
                {'message': 'Some sections failed validation.', 'errors': errors, 'data': updated_data},
                status=status.HTTP_400_BAD_REQUEST
            )

        submission.saved_on = timezone.now()
        submission.save()

        return Response(
            {'message': 'Form updated successfully by admin.', 'data': updated_data},
            status=status.HTTP_200_OK
        )
        
    def _attach_foreign_keys(self, section_data, model, submission, student, many):
        """Ensure each section has submission/student foreign keys attached."""
        def attach_keys(item):
            if 'submission' not in item and 'submission' in [f.name for f in model._meta.fields]:
                item['submission'] = submission.id
            if 'student' not in item and 'student' in [f.name for f in model._meta.fields]:
                item['student'] = student.student_number
            return item

        if many:
            return [attach_keys(item) for item in section_data]
        return attach_keys(section_data)

    def _get_section_serializer(self, serializer_class, model, submission, student, section_data, many):
        """Return a properly configured serializer instance for a given section."""
        if many:
            instances = model.objects.filter(submission=submission)
            return serializer_class(
                instance=instances,
                data=section_data,
                many=True,
                partial=True,
                context={'submission': submission, 'student': student,  'request': self.request}
            )
        else:
            instance = model.objects.filter(submission=submission).first()
            return serializer_class(
                instance=instance,
                data=section_data,
                many=False,
                partial=True,
                context={'submission': submission, 'student': student,  'request': self.request}
            )