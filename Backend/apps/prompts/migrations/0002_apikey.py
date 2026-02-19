from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('prompts', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='APIKey',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('key_prefix', models.CharField(max_length=8)),
                ('key_hash', models.CharField(max_length=64, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_used_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='api_keys',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
    ]
