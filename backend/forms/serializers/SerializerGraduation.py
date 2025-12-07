from rest_framework import serializers
from django.shortcuts import get_object_or_404
from forms.models import GraduateStudent, Student, Submission


class GraduateStudentSerializer(serializers.ModelSerializer):
    # Use SlugRelatedField for student_number (maps to Student.student_number)
    student_number = serializers.SlugRelatedField(slug_field='student_number', queryset=Student.objects.all())
    submission = serializers.PrimaryKeyRelatedField(queryset=Submission.objects.all(), required=False, allow_null=True)

    class Meta:
        model = GraduateStudent
        fields = [
            'id',
            'student_number',
            'academic_year',
            'semester',
            'graduation_date',
            'graduation_degree_program',
            'honors_received',
            'submission',
        ]

    def create(self, validated_data):
        # student_number is already a Student instance because of SlugRelatedField
        student = validated_data.pop('student_number')
        submission = validated_data.pop('submission', None)

        # Attach submission if provided
        if submission is not None:
            validated_data['submission'] = submission

        grad_obj = GraduateStudent.objects.create(student_number=student, **validated_data)

        # Set student status to graduated
        try:
            student.status = 'graduated'
            student.save()
        except Exception:
            pass

        return grad_obj

    def update(self, instance, validated_data):
        # Prevent changing linked student through this serializer
        validated_data.pop('student_number', None)

        submission = validated_data.pop('submission', None)
        if submission is not None:
            instance.submission = submission

        for attr in ['academic_year', 'semester', 'graduation_date', 'graduation_degree_program', 'honors_received']:
            if attr in validated_data:
                setattr(instance, attr, validated_data.get(attr))

        instance.save()

        # Ensure student status updated
        try:
            student = instance.student_number
            student.status = 'graduated'
            student.save()
        except Exception:
            pass

        return instance
