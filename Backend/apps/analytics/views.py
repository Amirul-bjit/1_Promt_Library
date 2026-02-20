"""
Views for analytics API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from django.db.models import Sum, Avg

from .models import TemplateAnalytics
from .serializers import TemplateAnalyticsSerializer
from apps.execution.models import Execution


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for analytics endpoints
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='dashboard_metrics')
    def dashboard(self, request):
        """
        Get dashboard metrics for the current user
        """
        executions = Execution.objects.filter(executed_by=request.user)
        
        total_executions = executions.count()
        successful = executions.filter(status=Execution.STATUS_SUCCESS).count()
        failed = executions.filter(status=Execution.STATUS_FAILED).count()
        
        total_cost = executions.aggregate(Sum('estimated_cost_usd'))['estimated_cost_usd__sum'] or 0
        total_tokens = executions.aggregate(Sum('total_tokens'))['total_tokens__sum'] or 0
        avg_latency = executions.aggregate(Avg('latency_ms'))['latency_ms__avg'] or 0
        
        # Provider breakdown
        from django.db.models import Count
        provider_breakdown = {}
        provider_stats = executions.values('provider').annotate(count=Count('id'))
        for stat in provider_stats:
            provider_breakdown[stat['provider']] = stat['count']
        
        metrics = { 
            'total_executions': total_executions,
            'successful_executions': successful,
            'failed_executions': failed,
            'success_rate': round((successful / total_executions * 100) if total_executions > 0 else 0, 2),
            'total_cost': float(total_cost),
            'total_tokens': total_tokens,
            'avg_duration_ms': round(avg_latency, 2),
            'provider_breakdown': provider_breakdown
        }
        return Response(metrics)

    @action(detail=False, methods=['get'])
    def templates(self, request):
        """
        Get analytics for all templates
        """
        days = int(request.query_params.get('days', 30))
        start_date = datetime.now().date() - timedelta(days=days)
        
        analytics = TemplateAnalytics.objects.filter(date__gte=start_date).order_by('-date')
        serializer = TemplateAnalyticsSerializer(analytics, many=True)
        return Response(serializer.data)
