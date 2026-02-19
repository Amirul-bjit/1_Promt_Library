"""
Views for execution API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Execution, ExecutionFeedback
from .serializers import ExecutionSerializer, ExecutionFeedbackSerializer
from apps.prompts.models import PromptVersion


class ExecutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing executions
    """
    serializer_class = ExecutionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Execution.objects.filter(executed_by=self.request.user).select_related('version', 'variant')

    def perform_create(self, serializer):
        serializer.save(executed_by=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get execution statistics for the current user
        """
        executions = Execution.objects.filter(executed_by=request.user)
        total = executions.count()
        success = executions.filter(status=Execution.STATUS_SUCCESS).count()
        failed = executions.filter(status=Execution.STATUS_FAILED).count()
        
        stats = {
            'total_executions': total,
            'successful_executions': success,
            'failed_executions': failed,
            'success_rate': round((success / total * 100) if total > 0 else 0, 2)
        }
        return Response(stats)


class ExecutionFeedbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing execution feedback
    """
    serializer_class = ExecutionFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExecutionFeedback.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
