"""
Service for managing prompts
"""
from apps.prompts.repositories.prompt_repository import PromptRepository
from apps.prompts.models import Prompt
from common.exceptions import PromptNotFoundError


class PromptService:
    """
    Business logic for prompt operations
    """

    def __init__(self):
        self.repository = PromptRepository()

    def list_prompts(self, filters=None):
        """
        List all prompts with filters
        """
        return self.repository.get_all_prompts(filters)

    def get_prompt(self, prompt_id):
        """
        Get a single prompt
        """
        try:
            return self.repository.get_prompt_by_id(prompt_id)
        except Prompt.DoesNotExist:
            raise PromptNotFoundError()

    def create_prompt(self, data, user):
        """
        Create a new prompt
        """
        return self.repository.create_prompt(data, user)

    def update_prompt(self, prompt_id, data, user):
        """
        Update an existing prompt
        """
        prompt = self.get_prompt(prompt_id)
        return self.repository.update_prompt(prompt, data, user)

    def delete_prompt(self, prompt_id):
        """
        Delete a prompt
        """
        prompt = self.get_prompt(prompt_id)
        prompt.delete()

    def archive_prompt(self, prompt_id, user):
        """
        Archive a prompt
        """
        prompt = self.get_prompt(prompt_id)
        prompt.status = 'ARCHIVED'
        prompt.updated_by = user
        prompt.save()
        return prompt

    def activate_prompt(self, prompt_id, user):
        """
        Activate a prompt
        """
        prompt = self.get_prompt(prompt_id)
        prompt.status = 'ACTIVE'
        prompt.updated_by = user
        prompt.save()
        return prompt

    def get_statistics(self):
        """
        Get prompt statistics
        """
        return self.repository.get_prompt_statistics()
