from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class AuditLog(models.Model):
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"
    ACTION_RESTORE = "restore"
    ACTION_ARCHIVE = "archive"
    ACTION_EXECUTE = "execute"
    ACTION_EXPORT = "export"
    ACTION_IMPORT = "import"
    ACTION_LOGIN = "login"
    ACTION_LOGOUT = "logout"
    ACTION_CHOICES = [
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
        (ACTION_RESTORE, "Restore"),
        (ACTION_ARCHIVE, "Archive"),
        (ACTION_EXECUTE, "Execute"),
        (ACTION_EXPORT, "Export"),
        (ACTION_IMPORT, "Import"),
        (ACTION_LOGIN, "Login"),
        (ACTION_LOGOUT, "Logout"),
    ]

    # Who
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="audit_logs"
    )
    # What (generic FK — works for any model)
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")
    object_repr = models.CharField(max_length=500, blank=True) # snapshot of __str__ at time of action

    # Action
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    changes = models.JSONField(default=dict, blank=True)  # {"field": {"old": ..., "new": ...}}
    extra = models.JSONField(default=dict, blank=True)    # any additional context

    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user", "timestamp"]),
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["action", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.user} | {self.action} | {self.object_repr} | {self.timestamp}"
