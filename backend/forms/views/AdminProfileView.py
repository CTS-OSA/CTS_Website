from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from forms.models.counselor import Counselor, CounselorLicense, CounselorPhoto
from users.models import CustomUser
from forms.serializers import CounselorSerializer
import json
from users.utils import log_action
from django.utils import timezone


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_counselor_profile(request):
    required_fields = [
        'last_name', 'first_name', 'sex', 'birthdate',
        'contact_number'
    ]

    # Validate required text fields
    for field in required_fields:
        if field not in request.data:
            return Response(
                {"error": f"{field} is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Validate staff user
    if not request.user.is_staff:
        return Response(
            {"error": "Only staff accounts can be counselors."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Validate photo
    if 'photo' not in request.FILES:
        return Response(
            {"error": "A counselor photo is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    photo_file = request.FILES['photo']

    # Validate & parse licenses (JSON array)
    licenses_raw = request.data.get('licenses', "[]")
    try:
        licenses_data = json.loads(licenses_raw)
        if not isinstance(licenses_data, list):
            raise ValueError()
    except Exception:
        return Response(
            {"error": "Invalid format for licenses. Must be a JSON array."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create counselor
    try:
        counselor = Counselor.objects.create(
            user=request.user,
            last_name=request.data['last_name'],
            first_name=request.data['first_name'],
            middle_name=request.data.get('middle_name', ""),
            nickname=request.data.get('nickname', ""),
            suffix=request.data.get('suffix', ""),
            sex=request.data['sex'],
            birthdate=request.data['birthdate'],
            contact_number=request.data['contact_number'],
            position=json.loads(request.data.get('position', "[]")),
            post_nominal=json.loads(request.data.get('post_nominal', "[]")),
        )
    except ValidationError as e:
        print("VALIDATION ERROR:", e)
        print("VALIDATION ERROR DETAILS:", e.messages)
        return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)
    # Create licenses
    for lic in licenses_data:
        CounselorLicense.objects.create(
            counselor=counselor,
            name=lic.get('name'),
            number=lic.get('number')
        )

    # Create photo
    CounselorPhoto.objects.create(
        counselor=counselor,
        image=photo_file
    )
    
    counselor.is_complete = True
    counselor.completed_at = timezone.now()
    counselor.save()

    serializer = CounselorSerializer(counselor)

    log_action(
        request,
        "counselor_profile",
        "Counselor profile created",
        f"{counselor.first_name} {counselor.last_name}"
    )

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_counselor_profile(request):
    try:
        counselor = Counselor.objects.get(user=request.user)
    except Counselor.DoesNotExist:
        return Response(
            {"error": "Counselor profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = CounselorSerializer(counselor)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_counselor_profile(request, counselor_id=None):
    # Determine if admin updating someone else
    if request.user.is_staff and counselor_id:
        try:
            counselor = Counselor.objects.get(id=counselor_id)
        except Counselor.DoesNotExist:
            return Response(
                {"error": "Counselor not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # Counselor updating their own profile
        try:
            counselor = Counselor.objects.get(user=request.user)
        except Counselor.DoesNotExist:
            return Response(
                {"error": "Counselor profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    data = request.data

    # Fields that can be updated
    updatable_fields = [
        "last_name", "first_name", "middle_name", "nickname",
        "suffix", "sex", "birthdate", "contact_number", 
    ]

    changed_fields = {}

    for field in updatable_fields:
        if field in data:
            old_value = getattr(counselor, field)
            new_value = data[field]
            if old_value != new_value:
                changed_fields[field] = {"old": old_value, "new": new_value}
            setattr(counselor, field, new_value)

    # Update position / post_nominal arrays
    for field in ["position", "post_nominal"]:
        if field in data:
            value = data[field]
            if isinstance(value, str):
                value = json.loads(value)
            setattr(counselor, field, value)

    # Update licenses
    if "licenses" in data:
        licenses_input = data["licenses"]
        
        if isinstance(licenses_input, str):
            try:
                licenses_input = json.loads(licenses_input)
            except json.JSONDecodeError:
                return Response({"error": "licenses must be a JSON array"}, status=400)

        # Clear old licenses and create new ones
        counselor.licenses.all().delete()
        for lic in licenses_input:
            CounselorLicense.objects.create(
                counselor=counselor,
                name=lic.get("name"),
                number=lic.get("number")
            )

        changed_fields["licenses"] = "updated"

    # Update photo
    if "photo" in request.FILES:
        photo_file = request.FILES["photo"]
        if hasattr(counselor, "photo"):
            counselor.photo.image.delete(save=False)
            counselor.photo.image = photo_file
            counselor.photo.save()
        else:
            CounselorPhoto.objects.create(counselor=counselor, image=photo_file)

        changed_fields["photo"] = "updated"

    counselor.save()

    serializer = CounselorSerializer(counselor)

    # log_action(
    #     request,
    #     "counselor_update",
    #     f"Updated Counselor {counselor.first_name} {counselor.last_name}",
    #     changed_fields
    # )

    return Response(serializer.data, status=status.HTTP_200_OK)