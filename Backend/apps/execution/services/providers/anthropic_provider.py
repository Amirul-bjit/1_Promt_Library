"""
Anthropic provider implementation
"""
import time
from typing import Dict, Any
from anthropic import Anthropic
from .base import BaseLLMProvider
from common.exceptions import LLMProviderError


class AnthropicProvider(BaseLLMProvider):
    """
    Anthropic (Claude) LLM provider
    """

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = Anthropic(api_key=api_key)

    def execute(self, prompt: str, model: str, **kwargs) -> Dict[str, Any]:
        """
        Execute a prompt with Anthropic Claude
        """
        try:
            start_time = time.time()
            
            response = self.client.messages.create(
                model=model,
                max_tokens=kwargs.get('max_tokens', 1000),
                temperature=kwargs.get('temperature', 0.7),
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Extract response
            message_content = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            
            # Calculate cost
            cost = self._calculate_cost(model, response.usage.input_tokens, response.usage.output_tokens)
            
            return {
                'response': message_content,
                'tokens_used': tokens_used,
                'cost': cost,
                'duration_ms': duration_ms,
                'metadata': {
                    'model': response.model,
                    'stop_reason': response.stop_reason,
                    'input_tokens': response.usage.input_tokens,
                    'output_tokens': response.usage.output_tokens,
                }
            }
            
        except Exception as e:
            raise LLMProviderError(f"Anthropic execution failed: {str(e)}")

    def get_available_models(self) -> list:
        """
        Get list of available Anthropic models
        """
        return [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0',
        ]

    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """
        Calculate cost based on model and tokens
        Prices are per million tokens (as of 2024)
        """
        pricing = {
            'claude-3-opus-20240229': {'input': 15, 'output': 75},
            'claude-3-sonnet-20240229': {'input': 3, 'output': 15},
            'claude-3-haiku-20240307': {'input': 0.25, 'output': 1.25},
            'claude-2.1': {'input': 8, 'output': 24},
            'claude-2.0': {'input': 8, 'output': 24},
        }
        
        if model not in pricing:
            return 0.0
        
        input_cost = (input_tokens / 1_000_000) * pricing[model]['input']
        output_cost = (output_tokens / 1_000_000) * pricing[model]['output']
        
        return round(input_cost + output_cost, 6)
