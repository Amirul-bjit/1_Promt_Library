from .models import AuditLog
from django.contrib.contenttypes.models import ContentType


class AuditableMixin:
    """
    Add to any DRF APIView or ViewSet to auto-log create/update/delete.
    """
    def get_audit_user(self, request):
        return request.user if request.user.is_authenticated else None

    def log_action(self, request, instance, action, changes=None, extra=None):
        AuditLog.objects.create(
            user=self.get_audit_user(request),
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.pk,
            object_repr=str(instance),
            action=action,
            changes=changes or {},
            extra=extra or {},
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )
