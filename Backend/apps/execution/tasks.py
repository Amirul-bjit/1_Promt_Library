"""
Celery tasks for async execution
"""
from celery import shared_task
from apps.execution.services.execution_service import ExecutionService


@shared_task
def execute_prompt_async(execution_id):
    """
    Execute a prompt asynchronously
    """
    service = ExecutionService()
    execution = service.get_execution(execution_id)
    service._execute_prompt(execution)
    return execution.id


@shared_task
def execute_batch(batch_id):
    """
    Execute a batch of prompts
    """
    # Implementation for batch execution
    pass
