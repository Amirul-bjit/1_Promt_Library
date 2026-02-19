"""
Views for execution API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings as django_settings

from .models import Execution, ExecutionFeedback
from .serializers import ExecutionSerializer, ExecutionFeedbackSerializer
from apps.prompts.models import PromptVersion


PROVIDER_DEFAULTS = {
    "openai": {"name": "OpenAI", "model": "gpt-4o-mini", "env_key": "OPENAI_API_KEY"},
    "anthropic": {"name": "Anthropic", "model": "claude-3-haiku-20240307", "env_key": "ANTHROPIC_API_KEY"},
    "mistral": {"name": "Mistral AI", "model": "mistral-small-latest", "env_key": "MISTRAL_API_KEY"},
}


class ExecutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing executions
    """
    serializer_class = ExecutionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Execution.objects.filter(executed_by=self.request.user).select_related('version', 'variant')

    def perform_create(self, serializer):
        serializer.save(executed_by=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get execution statistics for the current user
        """
        executions = Execution.objects.filter(executed_by=request.user)
        total = executions.count()
        success = executions.filter(status=Execution.STATUS_SUCCESS).count()
        failed = executions.filter(status=Execution.STATUS_FAILED).count()
        
        stats = {
            'total_executions': total,
            'successful_executions': success,
            'failed_executions': failed,
            'success_rate': round((success / total * 100) if total > 0 else 0, 2)
        }
        return Response(stats)

    @action(detail=False, methods=['get'], url_path='providers')
    def providers(self, request):
        """
        Return configuration status of each LLM provider (reads from server settings).
        """
        result = []
        for provider_id, meta in PROVIDER_DEFAULTS.items():
            is_configured = bool(getattr(django_settings, meta["env_key"], ""))
            result.append({
                "id": provider_id,
                "name": meta["name"],
                "is_configured": is_configured,
            })
        return Response(result)

    @action(detail=False, methods=['post'], url_path='test-provider')
    def test_provider(self, request):
        """
        Test an LLM provider connection with the supplied API key.
        Uses a minimal, low-cost request to verify the key is valid.
        """
        provider_id = request.data.get("provider")
        api_key = request.data.get("api_key", "").strip()

        if not provider_id or not api_key:
            return Response(
                {"error": "Both 'provider' and 'api_key' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if provider_id not in PROVIDER_DEFAULTS:
            return Response(
                {"error": f"Unknown provider '{provider_id}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if provider_id == "openai":
                from openai import OpenAI, AuthenticationError
                client = OpenAI(api_key=api_key)
                client.models.list()  # cheap: no token usage

            elif provider_id == "anthropic":
                from anthropic import Anthropic, AuthenticationError
                client = Anthropic(api_key=api_key)
                # Minimal 1-token call to validate the key
                client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=1,
                    messages=[{"role": "user", "content": "hi"}],
                )

            elif provider_id == "mistral":
                from mistralai import Mistral
                client = Mistral(api_key=api_key)
                client.models.list()  # cheap: no token usage

            return Response({"status": "success", "message": "Connection successful"})

        except Exception as e:
            return Response(
                {"status": "failed", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ExecutionFeedbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing execution feedback
    """
    serializer_class = ExecutionFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExecutionFeedback.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
