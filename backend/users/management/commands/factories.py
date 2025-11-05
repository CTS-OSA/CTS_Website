import random
import factory
from faker import Faker
from datetime import date
from django.utils import timezone
from datetime import datetime, timedelta
from forms.models import Parent, Sibling, Guardian, FamilyData, FamilyRelationship, CounselingInformation, Scholarship, PreviousSchoolRecord, School, SchoolAddress
from forms.models import (
    Student, StudentPhoto, Address, Submission, Preferences, HealthData,
    PersonalityTraits, SocioEconomicStatus, FamilyData, Support, StudentSupport, PresentScholasticStatus, PrivacyConsent
)
from users.models import CustomUser, Role
from forms.models import (
    CollegeEnum, YearLevelEnum, DegreeProgramEnum, SemesterEnum,
    PhilippineRegionEnum, SupportChoices
)

fake = Faker()

# Constrain birthdate: between 2000 and 2006
def constrained_birthdate():
    return fake.date_of_birth(minimum_age=18, maximum_age=24)

# Constrain student number: "20YY-#####", with 20YY from 2018 to 2024
def constrained_student_number():
    year = random.randint(2018, 2024)
    unique_digits = fake.unique.numerify(text="#####")
    return f"{year}-{unique_digits}"

class AddressFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Address

    address_line_1 = factory.Faker("street_address")
    address_line_2 = factory.Faker("secondary_address")
    barangay = factory.Faker("city_suffix")
    city_municipality = factory.Faker("city")
    province = factory.Faker("state")
    region = factory.Iterator(PhilippineRegionEnum.values)
    zip_code = factory.Faker("postcode")

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomUser

    email = factory.LazyAttribute(
        lambda x: f"{fake.user_name()}@up.edu.ph"
    )
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    role = Role.STUDENT

class StudentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Student

    student_number = factory.LazyAttribute(
        lambda _: f"{random.randint(2018, 2024)}-{fake.unique.numerify(text='#####')}"
    )
    user = factory.SubFactory(UserFactory)
    college = factory.Iterator(CollegeEnum.values)
    current_year_level = factory.Iterator(YearLevelEnum.values)
    degree_program = factory.Iterator(DegreeProgramEnum.values)
    date_initial_entry_sem = factory.Iterator(SemesterEnum.values)
    last_name = factory.Faker("last_name")
    first_name = factory.Faker("first_name")
    middle_name = factory.Faker("first_name")
    nickname = factory.Faker("first_name")
    sex = factory.Iterator(["Male", "Female"])
    religion = "Catholic"
    birth_rank = factory.LazyAttribute(lambda _: random.randint(1, 5))
    birthdate = factory.LazyFunction(lambda: fake.date_of_birth(minimum_age=18, maximum_age=24))
    birthplace = factory.Faker("city")
    contact_number = factory.LazyAttribute(lambda _: fake.msisdn()[0:11])
    landline_number = None
    permanent_address = factory.SubFactory(AddressFactory)
    address_while_in_up = factory.SubFactory(AddressFactory)

    @factory.lazy_attribute
    def date_initial_entry(self):
        year_str = str(self.student_number).split("-")[0]
        try:
            year = int(year_str)
            return f"{year}-{year + 1}"
        except ValueError:
            return "2023-2024" 
        
class StudentPhotoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StudentPhoto

    student = factory.SubFactory(StudentFactory)
    image = factory.django.ImageField(filename="student_photo.jpg")

class SubmissionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Submission

    student = factory.SubFactory(StudentFactory)
    form_type = factory.Iterator(["Basic Information Sheet", "Student Cumulative Information File"])
    status = factory.Iterator(["submitted"])

    @factory.lazy_attribute
    def created_at(self):
        year_str = str(self.student.student_number).split("-")[0]
        year = int(year_str)

        naive_dt = datetime(
            year, random.randint(1, 12), random.randint(1, 28),
            random.randint(8, 17), random.randint(0, 59)
        )
        return timezone.make_aware(naive_dt)

    @factory.lazy_attribute
    def saved_on(self):
        saved = self.created_at + timedelta(days=random.randint(1, 10))
        return timezone.make_aware(saved) if timezone.is_naive(saved) else saved

    @factory.lazy_attribute
    def submitted_on(self):
        if self.status == "submitted":
            submitted = self.saved_on + timedelta(days=random.randint(1, 10))
            return timezone.make_aware(submitted) if timezone.is_naive(submitted) else submitted
        return None

    updated_at = factory.LazyFunction(timezone.now)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        # Enforce unique constraint: get or create the submission by student and form_type
        student = kwargs.get('student')
        form_type = kwargs.get('form_type')
        obj, created = model_class.objects.get_or_create(student=student, form_type=form_type, defaults=kwargs)
        return obj



class PreferencesFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Preferences

    student_number = None
    submission = None
    influence = factory.Faker("sentence", nb_words=6)
    reason_for_enrolling = factory.Faker("paragraph", nb_sentences=2)
    transfer_plans = factory.Faker("boolean")
    transfer_reason = factory.Maybe('transfer_plans', factory.Faker('sentence'), None)
    shift_plans = factory.Faker("boolean")
    planned_shift_degree = factory.Maybe('shift_plans', factory.Faker('word'), None)
    reason_for_shifting = factory.Maybe('shift_plans', factory.Faker('sentence'), None)

class SupportFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Support

    code = factory.Iterator(SupportChoices.values)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        instance, _ = model_class.objects.get_or_create(**kwargs)
        return instance

class StudentSupportFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StudentSupport

    student_number = None
    submission = None

    @factory.post_generation
    def support(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for support in extracted:
                self.support.add(support)
        else:
            support = SupportFactory.create()
            self.support.add(support)

    other_notes = factory.Faker("sentence")
    other_scholarship = factory.Faker("sentence")
    combination_notes = factory.Faker("sentence")

class SocioEconomicStatusFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SocioEconomicStatus

    student_number = None
    submission = None
    has_scholarship = factory.Faker("boolean")
    scholarships = factory.Maybe('has_scholarship', factory.Faker('word'), None)
    scholarship_privileges = factory.Maybe('has_scholarship', factory.Faker('sentence'), None)
    monthly_allowance = factory.Faker("pydecimal", left_digits=4, right_digits=2, positive=True)
    spending_habit = factory.Faker("sentence")

class PresentScholasticStatusFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PresentScholasticStatus

    student = None
    submission = None
    intended_course = factory.Iterator(DegreeProgramEnum.values)
    first_choice_course = factory.Iterator(DegreeProgramEnum.values)
    admitted_course = factory.Iterator(DegreeProgramEnum.values)

    @factory.lazy_attribute
    def next_plan(self):
        if self.first_choice_course != self.admitted_course:
            return fake.sentence()
        return ""
    
class PrivacyConsentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PrivacyConsent
        
    student = None
    has_consented = True



def phone_number():
    # Generate phone number with optional +, 9-15 digits
    num = fake.msisdn()[0:12]  # 12 digits max including optional +
    if random.choice([True, False]):
        return '+' + num
    return num

class ParentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Parent

    first_name = factory.LazyFunction(lambda: fake.first_name()[:50])
    last_name = factory.LazyFunction(lambda: fake.last_name()[:50])
    age = factory.LazyFunction(lambda: random.randint(30, 60))
    job_occupation = factory.LazyFunction(lambda: fake.job()[:50])
    company_agency = factory.LazyFunction(lambda: fake.company()[:50])
    company_address = factory.Faker("address")  # This can be longer, adjust DB if needed
    highest_educational_attainment = factory.Iterator([
        "High School", "Vocational", "Bachelor's", "Master's", "Doctorate"
    ])
    contact_number = factory.LazyFunction(phone_number)
    
from faker import Faker
faker = Faker()

class SiblingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Sibling

    first_name = factory.LazyFunction(lambda: faker.first_name()[:50])
    last_name = factory.LazyFunction(lambda: faker.last_name()[:50])
    sex = factory.Iterator(["Male", "Female"])
    age = factory.LazyFunction(lambda: random.randint(5, 30))
    job_occupation = factory.LazyFunction(lambda: faker.job()[:50])
    company_school = factory.LazyFunction(lambda: faker.company()[:50])
    educational_attainment = factory.Iterator([
        "Elementary", "High School", "College", "Graduate", "None"
    ])
    submission = factory.SubFactory(SubmissionFactory)

    @factory.post_generation
    def students(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for student in extracted:
                self.students.add(student)
        else:
            student = Student.objects.order_by('?').first()
            if student:
                self.students.add(student)

class GuardianFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Guardian

    first_name = factory.LazyFunction(lambda: faker.first_name()[:50])
    last_name = factory.LazyFunction(lambda: faker.last_name()[:50])
    contact_number = factory.LazyFunction(phone_number)
    address = factory.Faker("address")
    relationship_to_guardian = factory.Iterator([
        "Uncle", "Aunt", "Grandparent", "Older sibling", "Other"
    ])
    language_dialect = factory.LazyFunction(lambda: random.sample([
        "Tagalog", "Cebuano", "Ilocano", "English", "Kapampangan", 
        "Hiligaynon", "Bikol", "Pangasinan", "Maranao", "Tausug"
    ], k=random.randint(1, 3))) 

class FamilyDataFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FamilyData

    student = factory.SubFactory('forms.factories.StudentFactory')  
    submission = factory.SubFactory(SubmissionFactory)  

    mother = factory.SubFactory(ParentFactory)
    father = factory.SubFactory(ParentFactory)
    guardian = factory.SubFactory(GuardianFactory)

class HealthDataFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = HealthData

    student_number = factory.SubFactory('forms.factories.StudentFactory')  # or factory.Iterator(Student.objects.all())
    submission = factory.SubFactory('forms.factories.SubmissionFactory')

    health_condition = factory.Iterator(['Excellent', 'Very Good', 'Good', 'Poor'])
    height = factory.LazyFunction(lambda: round(random.uniform(1.40, 1.90), 2))  
    weight = factory.LazyFunction(lambda: round(random.uniform(40, 100), 2))  
    eye_sight = factory.Iterator(['Good', 'Medium', 'Poor'])
    hearing = factory.Iterator(['Good', 'Medium', 'Poor'])
    
    # For ArrayFields, generate lists of strings or empty list
    physical_disabilities = factory.LazyFunction(lambda: random.choices(
        ['None', 'Visual impairment', 'Hearing impairment', 'Mobility impairment'], k=random.randint(0,2)
    ) or None)

    common_ailments = factory.LazyFunction(lambda: random.choices(
        ['Asthma', 'Diabetes', 'Allergies', 'Hypertension'], k=random.randint(0,3)
    ) or None)

    last_hospitalization = factory.LazyFunction(lambda: fake.sentence(nb_words=5) if random.choice([True, False]) else None)

    @factory.lazy_attribute
    def reason_of_hospitalization(self):
        if self.last_hospitalization:
            return fake.paragraph(nb_sentences=2)
        return None
    
    
class PersonalityTraitsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PersonalityTraits

    student = factory.SubFactory('forms.factories.StudentFactory')
    submission = factory.SubFactory('forms.factories.SubmissionFactory')
    enrollment_reason = factory.Faker('paragraph', nb_sentences=3)
    degree_program_aspiration = factory.Faker('boolean')
    aspiration_explanation = factory.Maybe(
        'degree_program_aspiration',
        None,
        factory.Faker('paragraph', nb_sentences=2)
    )
    special_talents = factory.Faker('sentence', nb_words=6)
    musical_instruments = factory.Faker('word')
    hobbies = factory.Faker('sentence', nb_words=6)
    likes_in_people = factory.Faker('sentence', nb_words=6)
    dislikes_in_people = factory.Faker('sentence', nb_words=6)


class FamilyRelationshipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FamilyRelationship

    student = factory.SubFactory('forms.factories.StudentFactory')
    submission = factory.SubFactory('forms.factories.SubmissionFactory')
    closest_to = factory.Iterator(['Father', 'Mother', 'Brother', 'Sister', 'Other'])
    specify_other = factory.LazyAttribute(lambda obj: factory.Faker('word').generate({}) if obj.closest_to == 'Other' else '')



class CounselingInformationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CounselingInformation

    student = factory.SubFactory('forms.factories.StudentFactory')
    submission = factory.SubFactory('forms.factories.SubmissionFactory')
    personal_characteristics = factory.Faker('paragraph', nb_sentences=3)
    problem_confidant = factory.Faker('name')
    confidant_reason = factory.Faker('sentence', nb_words=8)
    anticipated_problems = factory.Faker('paragraph', nb_sentences=2)
    previous_counseling = factory.Faker('boolean')
    
    @factory.lazy_attribute
    def counseling_location(self):
        if self.previous_counseling:
            return fake.city()
        return None

    @factory.lazy_attribute
    def counseling_reason(self):
        if self.previous_counseling:
            return fake.sentence()
        return None

    @factory.lazy_attribute
    def counseling_counselor(self):
        if self.previous_counseling:
            return fake.name()
        return None
    

class ScholarshipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Scholarship

    student = factory.SubFactory(StudentFactory)
    submission = factory.SubFactory(SubmissionFactory)
    scholarships_and_assistance = factory.LazyFunction(lambda: fake.words(nb=3, unique=True))
    
class SchoolAddressFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SchoolAddress

    address_line_1 = factory.LazyFunction(fake.street_address)
    barangay = factory.LazyFunction(lambda: fake.city_suffix())  # or any suitable fake for barangay
    city_municipality = factory.LazyFunction(fake.city)
    province = factory.LazyFunction(fake.state)
    region = factory.LazyFunction(lambda: fake.random_element(PHILIPPINE_REGIONS))
    zip_code = factory.LazyFunction(fake.postcode)


# You can define PHILIPPINE_REGIONS from your enum choices like:
PHILIPPINE_REGIONS = [choice[0] for choice in PhilippineRegionEnum.choices]

class SchoolFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = School

    name = factory.LazyFunction(lambda: f"{fake.company()} High School")
    school_address = factory.SubFactory(SchoolAddressFactory)
    
class PreviousSchoolRecordFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PreviousSchoolRecord

    student = factory.SubFactory(StudentFactory)
    submission = factory.SubFactory(SubmissionFactory)
    school = factory.SubFactory(SchoolFactory)
    
    education_level = factory.Iterator(['Primary', 'Junior High', 'Senior High'])
    
    start_year = factory.LazyFunction(lambda: fake.random_int(min=2000, max=datetime.now().year - 1))
    end_year = factory.LazyAttribute(lambda obj: fake.random_int(min=obj.start_year, max=datetime.now().year))
    honors_received = factory.LazyFunction(lambda: fake.sentence(nb_words=6))
    
    senior_high_gpa = factory.LazyAttribute(
        lambda obj: round(fake.pyfloat(min_value=1.0, max_value=5.0, right_digits=2), 2) if obj.education_level == 'Senior High' else None
    )

def create_records_for_student(student=None, submission=None, school=None):
    records = []
    for level in ['Primary', 'Junior High', 'Senior High']:
        record = PreviousSchoolRecordFactory(
            student=student or StudentFactory(),
            submission=submission or SubmissionFactory(),
            school=school or SchoolFactory(),
            education_level=level
        )
        records.append(record)
    return records