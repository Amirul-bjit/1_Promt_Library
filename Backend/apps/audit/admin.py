from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'object_repr', 'timestamp', 'ip_address')
    list_filter = ('action', 'timestamp', 'content_type')
    search_fields = ('user__username', 'ip_address', 'object_repr')
    readonly_fields = ('user', 'action', 'timestamp', 'ip_address', 'user_agent', 
                      'content_type', 'object_id', 'object_repr', 'changes', 'extra')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
