# Webmaster/admin.py
from django.contrib import admin
from .models import *

@admin.register(Poster)
class PosterAdmin(admin.ModelAdmin):
    list_display = ('image', 'uploaded_by', 'created_at', 'deleted_at', 'status')
    search_fields = ('uploaded_by__first_name', 'uploaded_by__last_name')
    list_filter = ('status', 'created_at')

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('image', 'name', 'post_nominal', 'position', 'license', 'created_at', 'updated_at', 'status')
    search_fields = ('name',)
    list_filter = ('status', 'created_at', 'updated_at')