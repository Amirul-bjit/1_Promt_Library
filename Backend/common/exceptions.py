"""
Custom exceptions for the application
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class LLMProviderError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'LLM provider service is unavailable.'
    default_code = 'llm_provider_error'


class PromptNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Prompt not found.'
    default_code = 'prompt_not_found'


class ExecutionFailedError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Prompt execution failed.'
    default_code = 'execution_failed'


class InvalidPromptVersionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid prompt version.'
    default_code = 'invalid_prompt_version'
