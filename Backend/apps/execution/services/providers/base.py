"""
Base provider class for LLM integrations
"""
from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseLLMProvider(ABC):
    """
    Abstract base class for LLM providers
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    def execute(self, prompt: str, model: str, **kwargs) -> Dict[str, Any]:
        """
        Execute a prompt with the LLM
        
        Returns:
            Dict containing:
                - response: str
                - tokens_used: int
                - cost: float
                - metadata: dict
        """
        pass

    @abstractmethod
    def get_available_models(self) -> list:
        """
        Get list of available models for this provider
        """
        pass

    def validate_model(self, model: str) -> bool:
        """
        Check if model is valid for this provider
        """
        return model in self.get_available_models()
