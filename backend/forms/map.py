from forms.models import (
    Preferences, StudentSupport, SocioEconomicStatus, PresentScholasticStatus, PrivacyConsent,
    Parent, Sibling, Guardian, 
    FamilyData, HealthData, 
    SchoolAddress, School, PreviousSchoolRecord, 
    Scholarship, PersonalityTraits, FamilyRelationship, CounselingInformation, Support, GuidanceSpecialistNotes,
    PARD
)
from forms.serializers import (
    PreferencesSerializer, StudentSupportSerializer, SocioEconomicStatusSerializer, PresentScholasticStatusSerializer, PrivacyConsentSerializer,
    ParentSerializer, SiblingSerializer, GuardianSerializer,
    FamilyDataSerializer, HealthDataSerializer, 
    SchoolAddressSerializer, SchoolSerializer, PreviousSchoolRecordSerializer, 
    ScholarshipSerializer, PersonalityTraitsSerializer, FamilyRelationshipSerializer, CounselingInformationSerializer, GuidanceSpecialistNotesSerializer,
    SerializerPARD
)


# These are the mappings only for the sections that are needed to be filled up upon the first submission of the student
FORM_SECTIONS_MAP = {
    'basic-information-sheet': {
        'preferences': (Preferences, PreferencesSerializer),
        'student_support': (StudentSupport, StudentSupportSerializer),
        'socio_economic_status': (SocioEconomicStatus, SocioEconomicStatusSerializer),
        'scholastic_status': (PresentScholasticStatus, PresentScholasticStatusSerializer),
        'privacy_consent': (PrivacyConsent, PrivacyConsentSerializer)
    },
    'student-cumulative-information-file': {
        'siblings': (Sibling, SiblingSerializer),
        'family_data': (FamilyData, FamilyDataSerializer),
        'health_data': (HealthData, HealthDataSerializer),
        'previous_school_record': (PreviousSchoolRecord, PreviousSchoolRecordSerializer),
        'scholarship': (Scholarship, ScholarshipSerializer),
        'personality_traits': (PersonalityTraits, PersonalityTraitsSerializer),
        'family_relationship': (FamilyRelationship, FamilyRelationshipSerializer),
        'counseling_info': (CounselingInformation, CounselingInformationSerializer),
        'guidance_notes': (GuidanceSpecialistNotes, GuidanceSpecialistNotesSerializer),
        'privacy_consent': (PrivacyConsent, PrivacyConsentSerializer)
    },
    'psychosocial-assistance-and-referral-desk' : {
        'preferred_date': (PARD, SerializerPARD),
        'preferred_time': (PARD, SerializerPARD),
        'date_started': (PARD, SerializerPARD),
        'is_currently_on_medication': (PARD, SerializerPARD),
        'symptoms_observed': (PARD, SerializerPARD),
        'date_diagnosed': (PARD, SerializerPARD),
        'communication_platform': (PARD, SerializerPARD),
        'diagnosed_by': (PARD, SerializerPARD),
    }
}

OPTIONAL_SECTIONS = {
    'student-cumulative-information-file': ['siblings', 'scholarship', 'counseling_info'],
    'basic-information-sheet': [],
    'psychosocial-assistance-and-referral-desk': []
}

FORM_TYPE_SLUG_MAP = {
    'basic-information-sheet': 'Basic Information Sheet',
    'student-cumulative-information-file': 'Student Cumulative Information File',
    'pard': 'Psychosocial Assistance and Referral Desk'
}

FORM_TYPE_UNSLUG_MAP = {
    'Basic Information Sheet': 'basic-information-sheet',
    'Student Cumulative Information File': 'student-cumulative-information-file',
    'Psychosocial Assistand and Referral Desk': 'psychosocial-assistance-and-referral-desk'
}
