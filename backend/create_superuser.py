import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import *

User.objects.create_superuser(
    email="admin@sq.com",
    password="admin123",
    full_name="SQ Admin",
    role="admin"
)

print("Admin Created")