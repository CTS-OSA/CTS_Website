from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid
from django.utils.timezone import now
from django.conf import settings
from django.contrib.auth.models import Group

class Role(models.TextChoices):
    ADMIN = 'admin', 'Administrator'
    STUDENT = 'student', 'Student'

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.ADMIN)
        user = self.create_user(email, password, **extra_fields)
        
        admin_group, created = Group.objects.get_or_create(name='admin')
        user.groups.add(admin_group)
        
        return user

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  
    objects = CustomUserManager()

    def __str__(self):
        return self.email


class AuditLog(models.Model):
    LOG_TYPES = [
        ('auth', 'Authentication'),
        ('submission', 'Form Submission'),
        ('profile', 'Profile Update'),
        ('password', 'Password Change'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)
    action = models.CharField(max_length=255)
    details = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"[{self.log_type}] {self.action} by {self.user} at {self.timestamp}"
