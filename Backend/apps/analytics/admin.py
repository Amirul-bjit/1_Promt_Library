from django.contrib import admin
from .models import TemplateAnalytics


@admin.register(TemplateAnalytics)
class TemplateAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('template', 'date', 'execution_count', 'success_count', 'failure_count', 'total_cost_usd', 'avg_latency_ms')
    list_filter = ('date',)
    search_fields = ('template__title',)
