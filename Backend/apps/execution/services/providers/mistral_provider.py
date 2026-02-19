"""
Mistral AI provider implementation
"""
import time
from typing import Dict, Any
from mistralai import Mistral
from .base import BaseLLMProvider
from common.exceptions import LLMProviderError


class MistralProvider(BaseLLMProvider):
    """
    Mistral AI LLM provider
    """

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = Mistral(api_key=api_key)

    def execute(self, prompt: str, model: str, **kwargs) -> Dict[str, Any]:
        """
        Execute a prompt with Mistral AI
        """
        try:
            start_time = time.time()
            
            response = self.client.chat.complete(
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
            
            # Calculate tokens and cost
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            tokens_used = response.usage.total_tokens
            
            cost = self._calculate_cost(model, prompt_tokens, completion_tokens)
            
            return {
                'response': message_content,
                'tokens_used': tokens_used,
                'cost': cost,
                'duration_ms': duration_ms,
                'metadata': {
                    'model': response.model,
                    'finish_reason': response.choices[0].finish_reason,
                    'prompt_tokens': prompt_tokens,
                    'completion_tokens': completion_tokens,
                }
            }
            
        except Exception as e:
            raise LLMProviderError(f"Mistral AI execution failed: {str(e)}")

    def get_available_models(self) -> list:
        """
        Get list of available Mistral AI models
        """
        return [
            'mistral-large-latest',
            'mistral-medium-latest',
            'mistral-small-latest',
            'mistral-tiny',
            'codestral-latest',
            'open-mistral-7b',
            'open-mixtral-8x7b',
            'open-mixtral-8x22b',
        ]

    def _calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Calculate cost based on model and tokens
        Prices are per 1M tokens (as of 2024)
        """
        pricing = {
            'mistral-large-latest': {'input': 4.00, 'output': 12.00},
            'mistral-medium-latest': {'input': 2.70, 'output': 8.10},
            'mistral-small-latest': {'input': 1.00, 'output': 3.00},
            'mistral-tiny': {'input': 0.25, 'output': 0.25},
            'codestral-latest': {'input': 1.00, 'output': 3.00},
            'open-mistral-7b': {'input': 0.25, 'output': 0.25},
            'open-mixtral-8x7b': {'input': 0.70, 'output': 0.70},
            'open-mixtral-8x22b': {'input': 2.00, 'output': 6.00},
        }
        
        model_pricing = pricing.get(model, {'input': 1.00, 'output': 3.00})
        
        # Calculate cost (per 1M tokens)
        input_cost = (prompt_tokens / 1_000_000) * model_pricing['input']
        output_cost = (completion_tokens / 1_000_000) * model_pricing['output']
        
        return input_cost + output_cost
