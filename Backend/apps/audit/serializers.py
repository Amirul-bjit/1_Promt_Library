"""
Serializers for the Audit Log API
"""
from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user_username",
            "content_type_name",
            "object_id",
            "object_repr",
            "action",
            "changes",
            "extra",
            "ip_address",
            "user_agent",
            "timestamp",
        ]
        read_only_fields = fields

    def get_user_username(self, obj):
        return obj.user.username if obj.user else None

    def get_content_type_name(self, obj):
        return obj.content_type.model if obj.content_type else None
