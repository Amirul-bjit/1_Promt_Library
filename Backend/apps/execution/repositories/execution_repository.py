"""
Repository for execution data access
"""
from django.db.models import Count, Q
from apps.execution.models import Execution


class ExecutionRepository:
    """
    Handles database operations for executions
    """

    @staticmethod
    def get_all_executions(user=None, filters=None):
        """
        Get all executions with optional filters
        """
        queryset = Execution.objects.select_related('user', 'prompt', 'prompt_version')
        
        if user:
            queryset = queryset.filter(user=user)
        
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            if 'provider' in filters:
                queryset = queryset.filter(provider=filters['provider'])
            if 'prompt' in filters:
                queryset = queryset.filter(prompt_id=filters['prompt'])
        
        return queryset

    @staticmethod
    def create_execution(data):
        """
        Create a new execution
        """
        return Execution.objects.create(**data)

    @staticmethod
    def update_execution(execution, data):
        """
        Update an execution
        """
        for key, value in data.items():
            setattr(execution, key, value)
        execution.save()
        return execution

    @staticmethod
    def get_execution_by_id(execution_id):
        """
        Get a single execution by ID
        """
        return Execution.objects.select_related('user', 'prompt', 'prompt_version').get(id=execution_id)

    @staticmethod
    def get_execution_statistics(user=None):
        """
        Get statistics about executions
        """
        queryset = Execution.objects.all()
        if user:
            queryset = queryset.filter(user=user)
        
        total = queryset.count()
        by_status = dict(queryset.values('status').annotate(count=Count('id')).values_list('status', 'count'))
        by_provider = dict(queryset.values('provider').annotate(count=Count('id')).values_list('provider', 'count'))
        
        return {
            'total': total,
            'by_status': by_status,
            'by_provider': by_provider,
        }
