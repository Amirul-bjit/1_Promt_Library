"""
Service for analytics operations
"""
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from apps.execution.models import Execution
from apps.analytics.models import DailyUsageMetrics, PromptPerformanceMetrics


class AnalyticsService:
    """
    Business logic for analytics operations
    """

    @staticmethod
    def get_user_dashboard(user):
        """
        Get dashboard metrics for a user
        """
        # Get metrics for the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        executions = Execution.objects.filter(user=user, created_at__gte=thirty_days_ago)
        
        total_executions = executions.count()
        successful = executions.filter(status='COMPLETED').count()
        failed = executions.filter(status='FAILED').count()
        
        total_tokens = executions.filter(status='COMPLETED').aggregate(
            total=Sum('tokens_used')
        )['total'] or 0
        
        total_cost = executions.filter(status='COMPLETED').aggregate(
            total=Sum('cost')
        )['total'] or 0
        
        avg_duration = executions.filter(status='COMPLETED').aggregate(
            avg=Avg('duration_ms')
        )['avg'] or 0
        
        provider_breakdown = dict(
            executions.values('provider').annotate(count=Count('id')).values_list('provider', 'count')
        )
        
        return {
            'total_executions': total_executions,
            'successful_executions': successful,
            'failed_executions': failed,
            'success_rate': round((successful / total_executions * 100) if total_executions > 0 else 0, 2),
            'total_tokens': total_tokens,
            'total_cost': float(total_cost),
            'avg_duration_ms': int(avg_duration),
            'provider_breakdown': provider_breakdown,
        }

    @staticmethod
    def get_daily_trends(user, days=30):
        """
        Get daily trend data for a user
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        daily_metrics = DailyUsageMetrics.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
        
        return daily_metrics

    @staticmethod
    def get_prompt_performance(prompt_id):
        """
        Get performance metrics for a specific prompt
        """
        try:
            return PromptPerformanceMetrics.objects.get(prompt_id=prompt_id)
        except PromptPerformanceMetrics.DoesNotExist:
            return None

    @staticmethod
    def get_top_prompts(user, limit=10):
        """
        Get top performing prompts for a user
        """
        # Get prompts ordered by execution count
        from apps.prompts.models import Prompt
        
        prompts = Prompt.objects.filter(
            created_by=user
        ).annotate(
            execution_count=Count('executions')
        ).order_by('-execution_count')[:limit]
        
        result = []
        for prompt in prompts:
            executions = prompt.executions.filter(user=user)
            total = executions.count()
            successful = executions.filter(status='COMPLETED').count()
            
            result.append({
                'prompt_id': prompt.id,
                'title': prompt.title,
                'execution_count': total,
                'success_rate': round((successful / total * 100) if total > 0 else 0, 2),
            })
        
        return result

    @staticmethod
    def get_cost_analysis(user, days=30):
        """
        Get cost analysis for a user
        """
        start_date = timezone.now() - timedelta(days=days)
        
        executions = Execution.objects.filter(
            user=user,
            created_at__gte=start_date,
            status='COMPLETED'
        )
        
        # Cost by provider
        cost_by_provider = {}
        for provider in ['OPENAI', 'ANTHROPIC']:
            cost = executions.filter(provider=provider).aggregate(
                total=Sum('cost')
            )['total'] or 0
            cost_by_provider[provider] = float(cost)
        
        # Cost by prompt
        from apps.prompts.models import Prompt
        prompts = Prompt.objects.filter(
            executions__user=user,
            executions__created_at__gte=start_date,
            executions__status='COMPLETED'
        ).annotate(
            total_cost=Sum('executions__cost')
        ).order_by('-total_cost')[:10]
        
        cost_by_prompt = [
            {
                'prompt_id': p.id,
                'title': p.title,
                'cost': float(p.total_cost or 0)
            }
            for p in prompts
        ]
        
        total_cost = sum(cost_by_provider.values())
        
        return {
            'total_cost': total_cost,
            'cost_by_provider': cost_by_provider,
            'cost_by_prompt': cost_by_prompt,
        }

    @staticmethod
    def update_daily_metrics(user, date):
        """
        Update daily metrics for a user
        """
        executions = Execution.objects.filter(
            user=user,
            created_at__date=date
        )
        
        total = executions.count()
        successful = executions.filter(status='COMPLETED').count()
        failed = executions.filter(status='FAILED').count()
        
        tokens = executions.filter(status='COMPLETED').aggregate(
            total=Sum('tokens_used')
        )['total'] or 0
        
        cost = executions.filter(status='COMPLETED').aggregate(
            total=Sum('cost')
        )['total'] or 0
        
        provider_breakdown = dict(
            executions.values('provider').annotate(count=Count('id')).values_list('provider', 'count')
        )
        
        metrics, created = DailyUsageMetrics.objects.update_or_create(
            user=user,
            date=date,
            defaults={
                'total_executions': total,
                'successful_executions': successful,
                'failed_executions': failed,
                'total_tokens': tokens,
                'total_cost': cost,
                'provider_breakdown': provider_breakdown,
            }
        )
        
        return metrics
