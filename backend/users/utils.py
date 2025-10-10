from .models import AuditLog

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

def log_action(request, log_type, action, details=None):
    AuditLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        log_type=log_type,
        action=action,
        details=details,
    )
