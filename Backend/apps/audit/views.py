"""
Views for Audit Log API
"""
import django_filters
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogFilter(django_filters.FilterSet):
    action = django_filters.ChoiceFilter(choices=AuditLog.ACTION_CHOICES)
    user = django_filters.CharFilter(field_name="user__username", lookup_expr="iexact")
    date_from = django_filters.DateTimeFilter(field_name="timestamp", lookup_expr="gte")
    date_to = django_filters.DateTimeFilter(field_name="timestamp", lookup_expr="lte")
    content_type = django_filters.CharFilter(field_name="content_type__model", lookup_expr="iexact")

    class Meta:
        model = AuditLog
        fields = ["action", "user", "date_from", "date_to", "content_type"]


class AuditLogViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Read-only viewset for audit logs.
    Accessible only by staff/admin users.
    """
    queryset = AuditLog.objects.select_related("user", "content_type").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AuditLogFilter
    search_fields = ["user__username", "ip_address", "object_repr", "extra"]
    ordering_fields = ["timestamp", "action", "user__username"]
    ordering = ["-timestamp"]
