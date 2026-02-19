# Generated migration for renaming ExecutionLog to Execution

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('execution', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ExecutionLog',
            new_name='Execution',
        ),
    ]
