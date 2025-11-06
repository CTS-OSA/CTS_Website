from django.core.management.base import BaseCommand
from .factories import (
    StudentFactory,
    StudentPhotoFactory,
    SubmissionFactory,
    PreferencesFactory,
    StudentSupportFactory,
    SocioEconomicStatusFactory,
    PresentScholasticStatusFactory,
    PrivacyConsentFactory,
    SiblingFactory,
    FamilyDataFactory,
    HealthDataFactory,
    PreviousSchoolRecordFactory,
    ScholarshipFactory,
    PersonalityTraitsFactory,
    FamilyRelationshipFactory,
    CounselingInformationFactory,
)

NUM_STUDENTS = 50

class Command(BaseCommand):
    help = 'Seeds the database with fake student data and form submissions.'

    def handle(self, *args, **kwargs):
        for _ in range(NUM_STUDENTS):
            student = StudentFactory()
            
            # Add a photo to profile
            StudentPhotoFactory(student=student)
            
            # Create two separate submissions per student
            submission_bis = SubmissionFactory(student=student)
            submission_scif = SubmissionFactory(student=student)
            
            # Basic Information Sheet (BIS) using submission_bis
            PreferencesFactory(student_number=student, submission=submission_bis)
            StudentSupportFactory(student_number=student, submission=submission_bis)
            SocioEconomicStatusFactory(student_number=student, submission=submission_bis)
            PresentScholasticStatusFactory(student=student, submission=submission_bis)
            PrivacyConsentFactory(student=student, submission=submission_bis)

            # Student Cumulative Information File (SCIF) using submission_scif
            
            # Example: multiple siblings
            for _ in range(2):
                SiblingFactory(submission=submission_scif, students=[student])

            FamilyDataFactory(student=student, submission=submission_scif)
            HealthDataFactory(student_number=student, submission=submission_scif)
            PreviousSchoolRecordFactory(student=student, submission=submission_scif)
            ScholarshipFactory(student=student, submission=submission_scif)
            PersonalityTraitsFactory(student=student, submission=submission_scif)
            FamilyRelationshipFactory(student=student, submission=submission_scif)
            CounselingInformationFactory(student=student, submission=submission_scif)
            PrivacyConsentFactory(student=student, submission=submission_scif)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {NUM_STUDENTS} students with separate BIS and SCIF submissions.'))
