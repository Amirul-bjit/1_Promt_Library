from django.db import models
from apps.prompts.models import PromptTemplate


class TemplateAnalytics(models.Model):
    """Aggregated daily stats per template — populated by a Celery beat task."""
    template = models.ForeignKey(
        PromptTemplate, on_delete=models.CASCADE, related_name="analytics"
    )
    date = models.DateField()
    execution_count = models.PositiveIntegerField(default=0)
    success_count = models.PositiveIntegerField(default=0)
    failure_count = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveBigIntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=12, decimal_places=6, default=0)
    avg_latency_ms = models.FloatField(null=True, blank=True)
    avg_rating = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("template", "date")
        ordering = ["-date"]
