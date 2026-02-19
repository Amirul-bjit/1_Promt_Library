import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='1q2w3E4$'
)
print(f'Created superuser: {user.username}')
