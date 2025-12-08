from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models.submission import Submission
from ..models.student import Student
from django.utils import timezone

class webmasterView(APIView):
    permission_classes = [IsAuthenticated]

    # def get()