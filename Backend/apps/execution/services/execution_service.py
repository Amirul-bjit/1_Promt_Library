"""
Service for managing prompt executions
"""
import re
from django.conf import settings
from apps.execution.models import Execution
from apps.execution.repositories.execution_repository import ExecutionRepository
from apps.prompts.models import PromptTemplate, PromptVersion
from apps.execution.services.providers.openai_provider import OpenAIProvider
from apps.execution.services.providers.anthropic_provider import AnthropicProvider
from apps.execution.services.providers.mistral_provider import MistralProvider
from common.exceptions import ExecutionFailedError, PromptNotFoundError


class ExecutionService:
    """
    Business logic for execution operations
    """

    def __init__(self):
        self.repository = ExecutionRepository()
        self.providers = {
            'OPENAI': OpenAIProvider(settings.OPENAI_API_KEY),
            'ANTHROPIC': AnthropicProvider(settings.ANTHROPIC_API_KEY),
            'MISTRAL': MistralProvider(settings.MISTRAL_API_KEY),
        }

    def create_execution(self, user, prompt_id, version_number, provider, model, input_variables):
        """
        Create and execute a prompt
        """
        # Get prompt and version
        try:
            prompt = PromptTemplate.objects.get(id=prompt_id)
            if version_number:
                prompt_version = PromptVersion.objects.get(prompt=prompt, version_number=version_number)
            else:
                prompt_version = prompt.current_version
                
            if not prompt_version:
                raise PromptNotFoundError("No version available for this prompt")
                
        except (PromptTemplate.DoesNotExist, PromptVersion.DoesNotExist):
            raise PromptNotFoundError()

        # Render prompt with variables
        rendered_prompt = self._render_prompt(prompt_version.body, input_variables)

        # Create execution record
        execution = self.repository.create_execution({
            'user': user,
            'prompt': prompt,
            'prompt_version': prompt_version,
            'provider': provider,
            'model': model,
            'input_variables': input_variables,
            'rendered_prompt': rendered_prompt,
            'status': 'PENDING',
        })

        # Execute asynchronously (in production, this would be a Celery task)
        try:
            self._execute_prompt(execution)
        except Exception as e:
            self.repository.update_execution(execution, {
                'status': 'FAILED',
                'error_message': str(e)
            })
            raise

        return execution

    def _render_prompt(self, template, variables):
        """
        Render prompt template with variables
        Uses simple string replacement for {{variable}} patterns
        """
        rendered = template
        for key, value in variables.items():
            rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
        return rendered

    def _execute_prompt(self, execution):
        """
        Execute the prompt with the specified provider
        """
        provider = self.providers.get(execution.provider)
        
        if not provider:
            raise ExecutionFailedError(f"Provider {execution.provider} not available")

        # Update status to running
        self.repository.update_execution(execution, {'status': 'RUNNING'})

        try:
            # Execute with provider
            result = provider.execute(
                prompt=execution.rendered_prompt,
                model=execution.model,
            )

            # Update execution with results
            self.repository.update_execution(execution, {
                'status': 'COMPLETED',
                'response': result['response'],
                'tokens_used': result['tokens_used'],
                'cost': result['cost'],
                'duration_ms': result['duration_ms'],
                'metadata': result['metadata'],
            })

        except Exception as e:
            self.repository.update_execution(execution, {
                'status': 'FAILED',
                'error_message': str(e)
            })
            raise ExecutionFailedError(f"Execution failed: {str(e)}")

    def get_execution(self, execution_id):
        """
        Get an execution by ID
        """
        return self.repository.get_execution_by_id(execution_id)

    def list_executions(self, user=None, filters=None):
        """
        List executions with filters
        """
        return self.repository.get_all_executions(user, filters)

    def get_statistics(self, user=None):
        """
        Get execution statistics
        """
        return self.repository.get_execution_statistics(user)

    def get_available_providers(self):
        """
        Get list of available providers and their models
        """
        return {
            'OPENAI': {
                'name': 'OpenAI',
                'models': self.providers['OPENAI'].get_available_models()
            },
            'ANTHROPIC': {
                'name': 'Anthropic (Claude)',
                'models': self.providers['ANTHROPIC'].get_available_models()
            }
        }
