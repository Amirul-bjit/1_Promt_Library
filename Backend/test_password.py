import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='admin')

print(f'User: {user.username}')
print(f'Active: {user.is_active}')
print(f'Has usable password: {user.has_usable_password()}')

# Test different passwords
passwords_to_test = [
    '1q2w3E4$',
    '1q2w3E4\$',
]

for pwd in passwords_to_test:
    result = user.check_password(pwd)
    print(f'Password "{pwd}": {result}')
