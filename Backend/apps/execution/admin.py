from django.contrib import admin
from .models import Execution, ExecutionFeedback


class ExecutionFeedbackInline(admin.TabularInline):
    model = ExecutionFeedback
    extra = 0
    readonly_fields = ('created_at', 'created_by')


@admin.register(Execution)
class ExecutionAdmin(admin.ModelAdmin):
    list_display = ('version', 'executed_by', 'provider', 'model', 'status', 'executed_at', 'latency_ms')
    list_filter = ('status', 'provider', 'executed_at')
    search_fields = ('version__template__title', 'executed_by__username')
    readonly_fields = ('executed_at',)
    inlines = [ExecutionFeedbackInline]


@admin.register(ExecutionFeedback)
class ExecutionFeedbackAdmin(admin.ModelAdmin):
    list_display = ('execution', 'score', 'rating', 'created_by', 'created_at')
    list_filter = ('score', 'rating', 'created_at')
    search_fields = ('execution__version__template__title', 'notes')
    readonly_fields = ('created_at',)
