from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from forms.models import (
    CollegeEnum, YearLevelEnum, SemesterEnum,
    DegreeProgramEnum, PhilippineRegionEnum, SupportChoices, DEGREE_TO_COLLEGE, StudentStatus
)
from collections import defaultdict


def enum_to_dict(enum_class):
    try:
        return [{"value": e.value, "label": e.label} for e in enum_class]
    except AttributeError as e:
        return {"error": f"Error processing enum: {str(e)}"}


def get_degree_to_college_mapping():
    return {
        degree.value: [college.value for college in colleges]
        for degree, colleges in DEGREE_TO_COLLEGE.items()
    }

def get_college_to_degree_mapping():
    reverse_map = defaultdict(list)
    for degree, colleges in DEGREE_TO_COLLEGE.items():
        for college in colleges:
            reverse_map[college.value].append(degree.value)
    return dict(reverse_map)


class EnumChoicesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            enum_data = {
                "college": enum_to_dict(CollegeEnum),
                "year_level": enum_to_dict(YearLevelEnum),
                "semester": enum_to_dict(SemesterEnum),
                "degree_program": enum_to_dict(DegreeProgramEnum),
                "region": enum_to_dict(PhilippineRegionEnum),
                "support": enum_to_dict(SupportChoices),
                "degree_to_college": get_degree_to_college_mapping(),  
                "college_to_degree": get_college_to_degree_mapping(), 
                "student_status": enum_to_dict(StudentStatus),
            }
            return Response(enum_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
