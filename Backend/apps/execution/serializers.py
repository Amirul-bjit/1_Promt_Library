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

    class Meta:
        model = Execution
        fields = [
            'id', 'version', 'version_info', 'variant', 'provider', 'model',
            'input_variables', 'rendered_prompt', 'output', 'status',
            'error_message', 'prompt_tokens', 'completion_tokens', 'total_tokens',
            'estimated_cost_usd', 'latency_ms', 'executed_by', 'executed_by_username',
            'executed_at', 'feedback_data'
        ]
        read_only_fields = ['id', 'status', 'output', 'error_message', 'prompt_tokens',
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
