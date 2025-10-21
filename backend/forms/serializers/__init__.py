from .SerializerBIS import (
    PreferencesSerializer,
    StudentSupportSerializer,
    SocioEconomicStatusSerializer,
    PresentScholasticStatusSerializer,
    BISStudentSerializer
)

from .ProfileSetupSerializers import (
    StudentSerializer,
    AddressSerializer,
    StudentSummarySerializer,
)

from .SerializerGeneralForm import (
    PrivacyConsentSerializer,
    SubmissionSerializer
)

from .SerializerSCIF import (
    ParentSerializer,
    SiblingSerializer,
    GuardianSerializer,
    FamilyDataSerializer,
    HealthDataSerializer, 
    SchoolAddressSerializer,
    SchoolSerializer, 
    PreviousSchoolRecordSerializer, 
    ScholarshipSerializer, 
    PersonalityTraitsSerializer, 
    CounselingInformationSerializer,
    FamilyRelationshipSerializer,
    GuidanceSpecialistNotesSerializer,
    SCIFStudentSerializer
)

from .AdminSerializers import (
    AdminSubmissionDetailSerializer,
)