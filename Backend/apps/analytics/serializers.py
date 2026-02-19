"""
Serializers for analytics
"""
from rest_framework import serializers
from .models import TemplateAnalytics


class TemplateAnalyticsSerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source='template.title', read_only=True)
    success_rate = serializers.SerializerMethodField()

    class Meta:
        model = TemplateAnalytics
        fields = [
            'id', 'template', 'template_title', 'date', 'execution_count',
            'success_count', 'failure_count', 'success_rate', 'total_tokens',
            'total_cost_usd', 'avg_latency_ms', 'avg_rating'
        ]
        read_only_fields = ['id']

    def get_success_rate(self, obj):
        if obj.execution_count == 0:
            return 0
        return round((obj.success_count / obj.execution_count) * 100, 2)
