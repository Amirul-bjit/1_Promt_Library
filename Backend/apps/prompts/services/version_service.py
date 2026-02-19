"""
Service for managing prompt versions
"""
from apps.prompts.models import PromptVersion
from common.exceptions import InvalidPromptVersionError


class VersionService:
    """
    Business logic for prompt version operations
    """

    @staticmethod
    def create_version(prompt, data, user):
        """
        Create a new version for a prompt
        """
        # Get the next version number
        latest_version = prompt.versions.order_by('-version_number').first()
        next_version = (latest_version.version_number + 1) if latest_version else 1

        # Create new version
        version = PromptVersion.objects.create(
            prompt=prompt,
            version_number=next_version,
            content=data['content'],
            variables=data.get('variables', []),
            model_config=data.get('model_config', {}),
            change_notes=data.get('change_notes', ''),
            created_by=user,
            updated_by=user
        )

        # Update current version
        prompt.current_version = version
        prompt.updated_by = user
        prompt.save()

        return version

    @staticmethod
    def get_version(prompt, version_number):
        """
        Get a specific version of a prompt
        """
        try:
            return PromptVersion.objects.get(prompt=prompt, version_number=version_number)
        except PromptVersion.DoesNotExist:
            raise InvalidPromptVersionError(f"Version {version_number} not found")

    @staticmethod
    def list_versions(prompt):
        """
        List all versions of a prompt
        """
        return prompt.versions.all()

    @staticmethod
    def rollback_to_version(prompt, version_number, user):
        """
        Rollback to a specific version
        """
        version = VersionService.get_version(prompt, version_number)
        
        # Create a new version with the old content
        latest_version = prompt.versions.order_by('-version_number').first()
        new_version_number = latest_version.version_number + 1

        new_version = PromptVersion.objects.create(
            prompt=prompt,
            version_number=new_version_number,
            content=version.content,
            variables=version.variables,
            model_config=version.model_config,
            change_notes=f"Rolled back to version {version_number}",
            created_by=user,
            updated_by=user
        )

        prompt.current_version = new_version
        prompt.updated_by = user
        prompt.save()

        return new_version

    @staticmethod
    def compare_versions(prompt, version1_number, version2_number):
        """
        Compare two versions of a prompt
        """
        version1 = VersionService.get_version(prompt, version1_number)
        version2 = VersionService.get_version(prompt, version2_number)

        return {
            'version1': {
                'number': version1.version_number,
                'content': version1.content,
                'variables': version1.variables,
                'created_at': version1.created_at,
            },
            'version2': {
                'number': version2.version_number,
                'content': version2.content,
                'variables': version2.variables,
                'created_at': version2.created_at,
            },
        }
