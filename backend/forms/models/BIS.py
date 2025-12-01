from django.db import models
from django.core.exceptions import ValidationError
from .enums import SupportChoices
from .submission import Submission
from forms.utils.helperFunctions import check_required_fields

class Preferences(models.Model):
    student_number = models.ForeignKey('Student', to_field='student_number', on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    influence = models.CharField(max_length=255, null=True, blank=True)  
    reason_for_enrolling = models.TextField(null=True, blank=True) 
    transfer_plans = models.BooleanField(default=False, blank=True)
    transfer_reason = models.TextField(null=True, blank=True)  
    shift_plans = models.BooleanField(default=False, blank=True) 
    planned_shift_degree = models.CharField(max_length=255, blank=True, null=True)  
    reason_for_shifting = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'preferences' 

    def clean(self):
        """
        Custom validation to enforce the conditional fields.
        """
        if  self.submission.status == 'draft':
            return
        
        elif  self.submission.status == 'submitted':        
            required_fields = {
                'student_number': 'required',
                'influence': 'required',
                'reason_for_enrolling': 'required',
                'transfer_plans': 'required',
                'transfer_reason': 'required',
                'shift_plans': 'required'
            }
            
            check_required_fields(self, required_fields, self.submission.status)
            
            if self.shift_plans:
                if not self.planned_shift_degree:
                    raise ValidationError({'planned_shift_degree': 'This field is required when shift plans are true.'})
                
                if not self.reason_for_shifting:
                    raise ValidationError({'reason_for_shifting': 'This field is required when shift plans are true.'})

        
    def __str__(self):
        return f"Preferences for Student {self.student_number}"   
    
class Support(models.Model):
    code = models.CharField(max_length=20, choices=SupportChoices.choices, unique=True)

    def __str__(self):
        return self.get_code_display()

class StudentSupport(models.Model):
    student_number = models.ForeignKey('Student', to_field='student_number', on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    support = models.ManyToManyField(Support)
    other_notes = models.TextField(blank=True, null=True) 
    other_scholarship = models.TextField(blank=True, null=True) 
    combination_notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'student_support'

    def clean(self):
        """
        Custom validation to enforce the conditional fields.
        """
        if  self.submission.status == 'draft':
            return
        
        elif  self.submission.status == 'submitted': 
            required_fields = {
                'student_number': 'required',
                'submission': 'required',
                'support': 'required'
            } 
            
            check_required_fields(self, required_fields, self.submission.status)
            
            if any(support.code == SupportChoices.OTHERS and not self.other_notes for support in self.support.all()):
                raise ValidationError({'other_notes': 'This field is required when "Other" support is selected.'})

            # If support type is 'Scholarship', other_scholarship is required
            if any(support.code == SupportChoices.SCHOLARSHIP and not self.other_scholarship for support in self.support.all()):
                raise ValidationError({'other_scholarship': 'This field is required when "Scholarship" support is selected.'})

            # If support type is 'Combination', combination_notes is required
            if any(support.code == SupportChoices.COMBINATION and not self.combination_notes for support in self.support.all()):
                raise ValidationError({'combination_notes': 'This field is required when "Combination" support is selected.'})

    def __str__(self):
        return f"Support for Student {self.student_number}"

class SocioEconomicStatus(models.Model):
    student_number = models.ForeignKey('Student', to_field='student_number', on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    has_scholarship = models.BooleanField(blank=True, null=True) 
    scholarships = models.TextField(blank=True, null=True) 
    scholarship_privileges = models.TextField(blank=True, null=True) 
    monthly_allowance = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  
    spending_habit = models.TextField(blank=True, null=True)  

    class Meta:
        db_table = 'socio_economic_status'

    def clean(self):
        """
        Custom validation to enforce the conditional scholarship fields.
        """
        
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            required_fields = {
                'student_number': 'required',
                'has_scholarship': 'required',
                'monthly_allowance': 'required',
                'spending_habit': 'required'
            }
            
            check_required_fields(self, required_fields, self.submission.status)
        
            # If the student has a scholarship, scholarships and scholarship_privileges are required
            if self.has_scholarship:
                if not self.scholarships:
                    raise ValidationError({'scholarships': 'This field is required when the student has a scholarship.'})
                if not self.scholarship_privileges:
                    raise ValidationError({'scholarship_privileges': 'This field is required when the student has a scholarship.'})

    def __str__(self):
        return f"Socio-Economic Status for Student {self.student_number}"

class PresentScholasticStatus(models.Model):
    student = models.ForeignKey('Student', to_field='student_number', on_delete=models.CASCADE)
    intended_course = models.CharField(max_length=255, blank=True, null=True)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    first_choice_course = models.CharField(max_length=255, blank=True, null=True)
    admitted_course = models.CharField(max_length=255, blank=True, null=True)
    next_plan = models.TextField(null=True, blank=True)

    def clean(self):
        
        if self.submission.status == 'draft':
            return
        
        elif self.submission.status == 'submitted':
            required_fields = {
                'student': 'required',
                'intended_course': 'required',
                'first_choice_course': 'required',
                'admitted_course': 'required'
            }
            
            check_required_fields(self, required_fields, self.submission.status)
            

            # Validate that next_plan is provided if first_choice_course != admitted_course
            if self.first_choice_course != self.admitted_course and not self.next_plan:
                raise ValidationError('Next plan is required if the first choice and admitted course are different.')
    
    def __str__(self):
        return f"Scholastic Status for {self.student.first_name} {self.student.last_name}"

