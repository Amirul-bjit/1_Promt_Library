"""
Signal handlers for audit logging
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog


def create_audit_log(instance, action, changes=None):
    """
    Helper function to create audit logs
    """
    content_type = ContentType.objects.get_for_model(instance)
    AuditLog.objects.create(
        action=action,
        content_type=content_type,
        object_id=instance.pk,
        changes=changes or {},
        metadata={
            'model': instance.__class__.__name__,
        }
    )


# You can connect specific signals here for models that need tracking
# Example:
# @receiver(post_save, sender=YourModel)
# def log_model_save(sender, instance, created, **kwargs):
#     action = 'CREATE' if created else 'UPDATE'
#     create_audit_log(instance, action)
