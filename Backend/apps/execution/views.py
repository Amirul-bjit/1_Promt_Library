"""
Views for execution API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings as django_settings
import re
import time

from .models import Execution, ExecutionFeedback
from .serializers import ExecutionSerializer, ExecutionFeedbackSerializer
from apps.prompts.models import PromptTemplate, PromptVersion


PROVIDER_DEFAULTS = {
    "OPENAI": {"name": "OpenAI", "model": "gpt-4o-mini", "env_key": "OPENAI_API_KEY"},
    "ANTHROPIC": {"name": "Anthropic", "model": "claude-3-haiku-20240307", "env_key": "ANTHROPIC_API_KEY"},
    "MISTRAL": {"name": "Mistral AI", "model": "mistral-small-latest", "env_key": "MISTRAL_API_KEY"},
}


class ExecutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing executions
    """
    serializer_class = ExecutionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Execution.objects.filter(executed_by=self.request.user).select_related('version', 'variant')
        prompt_id = self.request.query_params.get('prompt')
        if prompt_id:
            qs = qs.filter(version__template_id=prompt_id)
        return qs

    def create(self, request, *args, **kwargs):
        """
        Accept { prompt, provider, model, input_variables }, run synchronously, return result.
        """
        prompt_id = request.data.get('prompt')
        provider_key = (request.data.get('provider') or '').upper()
        model_name = request.data.get('model', '')
        input_vars = request.data.get('input_variables', {})

        if not prompt_id:
            return Response({'error': '"prompt" (template id) is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if provider_key not in PROVIDER_DEFAULTS:
            return Response({'error': f'Unknown provider "{provider_key}". Choose from: {list(PROVIDER_DEFAULTS.keys())}'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve template → latest version
        try:
            template = PromptTemplate.objects.get(id=prompt_id)
        except PromptTemplate.DoesNotExist:
            return Response({'error': f'Prompt {prompt_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

        version = template.current_version
        if not version:
            return Response({'error': 'This prompt has no versions yet.'}, status=status.HTTP_400_BAD_REQUEST)

        # Render prompt body with variables
        rendered = version.body
        for key, val in (input_vars or {}).items():
            rendered = rendered.replace(f'{{{{{key}}}}}', str(val))

        # Create execution record
        execution = Execution.objects.create(
            version=version,
            provider=provider_key,
            model=model_name,
            input_variables=input_vars,
            rendered_prompt=rendered,
            status=Execution.STATUS_RUNNING,
            executed_by=request.user,
        )

        # Run provider
        meta = PROVIDER_DEFAULTS[provider_key]
        api_key = getattr(django_settings, meta['env_key'], '')
        if not api_key:
            execution.status = Execution.STATUS_FAILED
            execution.error_message = f'{meta["env_key"]} is not configured on the server.'
            execution.save()
            return Response(ExecutionSerializer(execution).data, status=status.HTTP_200_OK)

        try:
            start = time.time()
            if provider_key == 'OPENAI':
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                resp = client.chat.completions.create(
                    model=model_name,
                    messages=[{'role': 'user', 'content': rendered}],
                )
                output = resp.choices[0].message.content
                prompt_tokens = resp.usage.prompt_tokens
                completion_tokens = resp.usage.completion_tokens
                total_tokens = resp.usage.total_tokens

            elif provider_key == 'ANTHROPIC':
                from anthropic import Anthropic
                client = Anthropic(api_key=api_key)
                resp = client.messages.create(
                    model=model_name,
                    max_tokens=2048,
                    messages=[{'role': 'user', 'content': rendered}],
                )
                output = resp.content[0].text
                prompt_tokens = resp.usage.input_tokens
                completion_tokens = resp.usage.output_tokens
                total_tokens = prompt_tokens + completion_tokens

            elif provider_key == 'MISTRAL':
                from mistralai import Mistral
                client = Mistral(api_key=api_key)
                resp = client.chat.complete(
                    model=model_name,
                    messages=[{'role': 'user', 'content': rendered}],
                )
                output = resp.choices[0].message.content
                prompt_tokens = resp.usage.prompt_tokens
                completion_tokens = resp.usage.completion_tokens
                total_tokens = resp.usage.total_tokens

            latency_ms = int((time.time() - start) * 1000)

            execution.status = Execution.STATUS_SUCCESS
            execution.output = output
            execution.prompt_tokens = prompt_tokens
            execution.completion_tokens = completion_tokens
            execution.total_tokens = total_tokens
            execution.latency_ms = latency_ms
            execution.save()

        except Exception as e:
            execution.status = Execution.STATUS_FAILED
            execution.error_message = str(e)
            execution.save()

        return Response(ExecutionSerializer(execution).data, status=status.HTTP_201_CREATED)

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
