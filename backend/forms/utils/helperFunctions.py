from django.core.exceptions import ValidationError
from django.db import transaction
from django.core.validators import RegexValidator

def check_required_fields(instance, fields, status):
    """
    This helper function checks if the fields should be required based on the form's status.
    Arguments:
    - instance: The model instance being validated.
    - fields: A dictionary of fields that need to be checked.
    - status: The form submission status ('draft' or 'submitted').
    """
    if status == 'draft':
        return  # Skip validation for draft forms
    
    # Validation logic for submitted forms
    for field, condition in fields.items():
        value = getattr(instance, field, None)
        if condition == 'required' and not value:
            raise ValidationError({field: f'This field is required when the form is submitted.'})

    return None


def get_or_create_school_and_address(school_data):
    """
    This function checks if a SchoolAddress and School already exist.
    If not, it creates new entries.
    """
    from forms.models import School, SchoolAddress
    school_address_data = school_data.get("address", {})

    # Check if School Address exists or create it
    address, created = SchoolAddress.objects.get_or_create(
        address_line_1=school_address_data.get("address_line_1"),
        barangay=school_address_data.get("barangay"),
        city_municipality=school_address_data.get("city_municipality"),
        province=school_address_data.get("province"),
        region=school_address_data.get("region"),
        zip_code=school_address_data.get("zip_code"),
    )

    # Check if School exists or create it
    school, created = School.objects.get_or_create(
        name=school_data.get("name"),
        address=address
    )

    return school


def get_phone_validator():
    return RegexValidator(
        regex=r'^\+?\d{9,15}$',
        message="Enter a valid phone number (9 to 15 digits, optional leading '+')."
    )