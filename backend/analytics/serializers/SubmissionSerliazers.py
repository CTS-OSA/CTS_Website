from rest_framework import serializers
from forms.models import Submission

class RecentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_number = serializers.SerializerMethodField()
    submitted_on = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") 
    
    class Meta:
        model = Submission
        fields = ['id', 'student_name', 'student_number', 'form_type', 'status', 'submitted_on']

    def get_student_name(self, obj):
        if obj.student is None:
            return "Guest Submission"
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_student_number(self, obj):
        if obj.student is None:
            return "N/A"  # or None, or "Guest"
        return obj.student.student_number