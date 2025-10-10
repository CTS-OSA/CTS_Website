from django.contrib import admin
from .models import CustomUser
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from .models import AuditLog

admin.site.register(CustomUser)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'log_type', 'action', 'timestamp')
    list_filter = ('log_type', 'timestamp', 'user')