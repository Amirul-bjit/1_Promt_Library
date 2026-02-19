import secrets
import hashlib
from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class PromptTemplate(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_ARCHIVED, "Archived"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="templates"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="templates")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name="created_templates"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def current_version(self):
        return self.versions.order_by("-version_number").first()


class APIKey(models.Model):
    """Per-user API key for programmatic access. Only the hash is stored."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="api_keys"
    )
    name = models.CharField(max_length=100)
    key_prefix = models.CharField(max_length=8)       # first 8 chars shown in UI
    key_hash = models.CharField(max_length=64, unique=True)  # SHA-256
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.key_prefix}…)"

    @classmethod
    def generate_key(cls):
        """Return (prefix, key_hash, raw_key). Call before saving."""
        raw = secrets.token_urlsafe(32)
        prefix = raw[:8]
        key_hash = hashlib.sha256(raw.encode()).hexdigest()
        return prefix, key_hash, raw


class PromptVersion(models.Model):
    template = models.ForeignKey(
        PromptTemplate, on_delete=models.CASCADE, related_name="versions"
    )
    version_number = models.PositiveIntegerField()
    body = models.TextField()                        # The actual prompt text with {{variables}}
    variables = models.JSONField(default=list)       # ["topic", "tone", "audience"]
    change_note = models.CharField(max_length=500, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name="created_versions"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("template", "version_number")
        ordering = ["-version_number"]

    def __str__(self):
        return f"{self.template.title} v{self.version_number}"


class PromptVariant(models.Model):
    """A/B testing variants tied to a specific version."""
    version = models.ForeignKey(
        PromptVersion, on_delete=models.CASCADE, related_name="variants"
    )
    name = models.CharField(max_length=100)          # e.g. "Variant A", "Variant B"
    body = models.TextField()
    variables = models.JSONField(default=list)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.version} - {self.name}"
