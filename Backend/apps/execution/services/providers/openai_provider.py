"""
OpenAI provider implementation
"""
import time
from typing import Dict, Any
from openai import OpenAI
from .base import BaseLLMProvider
from common.exceptions import LLMProviderError


class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI LLM provider
    """

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = OpenAI(api_key=api_key)

    def execute(self, prompt: str, model: str, **kwargs) -> Dict[str, Any]:
        """
        Execute a prompt with OpenAI
        """
        try:
            start_time = time.time()
            
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=kwargs.get('temperature', 0.7),
                max_tokens=kwargs.get('max_tokens', 1000),
                top_p=kwargs.get('top_p', 1.0),
            )
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Extract response
            message_content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            # Calculate cost (approximate pricing)
            cost = self._calculate_cost(model, tokens_used)
            
            return {
                'response': message_content,
                'tokens_used': tokens_used,
                'cost': cost,
                'duration_ms': duration_ms,
                'metadata': {
                    'model': response.model,
                    'finish_reason': response.choices[0].finish_reason,
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                }
            }
            
        except Exception as e:
            raise LLMProviderError(f"OpenAI execution failed: {str(e)}")

    def get_available_models(self) -> list:
        """
        Get list of available OpenAI models
        """
        return [
            'gpt-4',
            'gpt-4-turbo-preview',
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k',
        ]

    def _calculate_cost(self, model: str, tokens: int) -> float:
        """
        Calculate approximate cost based on model and tokens
        Prices are per 1000 tokens (as of 2024)
        """
        pricing = {
            'gpt-4': 0.03,
            'gpt-4-turbo-preview': 0.01,
            'gpt-3.5-turbo': 0.002,
            'gpt-3.5-turbo-16k': 0.004,
        }
        
        price_per_1k = pricing.get(model, 0.002)
        return round((tokens / 1000) * price_per_1k, 6)
