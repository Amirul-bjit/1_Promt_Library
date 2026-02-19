from django.db import models
from django.contrib.auth.models import User
from apps.prompts.models import PromptVersion, PromptVariant


class Execution(models.Model):
    STATUS_PENDING = "pending"
    STATUS_RUNNING = "running"
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_RUNNING, "Running"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
    ]

    version = models.ForeignKey(
        PromptVersion, on_delete=models.SET_NULL,
        null=True, related_name="executions"
    )
    variant = models.ForeignKey(
        PromptVariant, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="executions"
    )
    provider = models.CharField(max_length=50)       # "openai", "anthropic", "mistral"
    model = models.CharField(max_length=100)         # "gpt-4o", "claude-sonnet-4-6"
    input_variables = models.JSONField(default=dict) # {"topic": "AI", "tone": "formal"}
    rendered_prompt = models.TextField()             # Final prompt after variable injection
    output = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    error_message = models.TextField(blank=True)
    prompt_tokens = models.PositiveIntegerField(null=True, blank=True)
    completion_tokens = models.PositiveIntegerField(null=True, blank=True)
    total_tokens = models.PositiveIntegerField(null=True, blank=True)
    estimated_cost_usd = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    executed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-executed_at"]

    def __str__(self):
        return f"{self.version} | {self.provider} | {self.status}"


class ExecutionFeedback(models.Model):
    SCORE_THUMBS_UP = 1
    SCORE_THUMBS_DOWN = -1
    SCORE_CHOICES = [
        (SCORE_THUMBS_UP, "👍 Good"),
        (SCORE_THUMBS_DOWN, "👎 Bad"),
    ]

    execution = models.OneToOneField(
        Execution, on_delete=models.CASCADE, related_name="feedback"
    )
    score = models.IntegerField(choices=SCORE_CHOICES)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)  # 1–5 stars
    notes = models.TextField(blank=True)
    auto_score = models.FloatField(null=True, blank=True)             # LLM-as-a-judge score
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
