"""
Serializers for execution app
"""
from rest_framework import serializers
from .models import Execution, ExecutionFeedback


class ExecutionFeedbackSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ExecutionFeedback
        fields = ['id', 'score', 'rating', 'notes', 'auto_score', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExecutionSerializer(serializers.ModelSerializer):
    executed_by_username = serializers.CharField(source='executed_by.username', read_only=True)
    version_info = serializers.SerializerMethodField()
    feedback_data = ExecutionFeedbackSerializer(source='feedback', read_only=True)
    # Frontend-friendly aliases
    response = serializers.CharField(source='output', read_only=True)
    tokens_used = serializers.IntegerField(source='total_tokens', read_only=True)
    cost = serializers.DecimalField(source='estimated_cost_usd', max_digits=10, decimal_places=6, read_only=True)
    duration_ms = serializers.IntegerField(source='latency_ms', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Execution
        fields = [
            'id', 'version', 'version_info', 'variant', 'provider', 'model',
            'input_variables', 'rendered_prompt', 'output', 'response', 'status',
            'error_message', 'prompt_tokens', 'completion_tokens', 'total_tokens',
            'tokens_used', 'estimated_cost_usd', 'cost', 'latency_ms', 'duration_ms',
            'executed_by', 'executed_by_username', 'executed_at', 'feedback_data'
        ]
        read_only_fields = ['id', 'output', 'error_message', 'prompt_tokens',
                          'completion_tokens', 'total_tokens', 'estimated_cost_usd',
                          'latency_ms', 'executed_at']

    def get_version_info(self, obj):
        if obj.version:
            return {
                'id': obj.version.id,
                'version_number': obj.version.version_number,
                'template_title': obj.version.template.title
            }
        return None

    def get_status(self, obj):
        """Map lowercase model status to uppercase for frontend compatibility."""
        mapping = {
            Execution.STATUS_PENDING: 'PENDING',
            Execution.STATUS_RUNNING: 'RUNNING',
            Execution.STATUS_SUCCESS: 'COMPLETED',
            Execution.STATUS_FAILED: 'FAILED',
        }
        return mapping.get(obj.status, obj.status.upper())


class ExecutionCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new execution
    """
    version_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    provider = serializers.ChoiceField(choices=['openai', 'anthropic', 'mistral'])
    model = serializers.CharField()
    input_variables = serializers.JSONField()


class ExecutionFeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionFeedback
        fields = ['execution', 'score', 'rating', 'notes']
