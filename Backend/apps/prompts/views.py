"""
Views for prompts API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone

from .models import Category, Tag, PromptTemplate, PromptVersion, PromptVariant, APIKey
from .serializers import (
    CategorySerializer, TagSerializer, PromptTemplateSerializer, PromptTemplateDetailSerializer,
    PromptVersionSerializer, PromptVariantSerializer, PromptVersionCreateSerializer,
    PromptTemplateCreateSerializer, APIKeySerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class PromptTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing prompt templates
    """
    queryset = PromptTemplate.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PromptTemplateDetailSerializer
        elif self.action == 'create':
            return PromptTemplateCreateSerializer
        return PromptTemplateSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        Archive a template
        """
        template = self.get_object()
        template.status = PromptTemplate.STATUS_ARCHIVED
        template.save()
        serializer = self.get_serializer(template)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a template
        """
        template = self.get_object()
        template.status = PromptTemplate.STATUS_ACTIVE
        template.save()
        serializer = self.get_serializer(template)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """Export all templates belonging to the current user as JSON."""
        templates = (
            PromptTemplate.objects
            .filter(created_by=request.user)
            .prefetch_related('versions', 'tags', 'category')
        )
        prompts = []
        for t in templates:
            latest = t.current_version
            prompts.append({
                'title': t.title,
                'description': t.description,
                'category': t.category.name if t.category else None,
                'tags': [tag.name for tag in t.tags.all()],
                'status': t.status,
                'content': latest.body if latest else '',
                'variables': latest.variables if latest else [],
            })
        return Response({
            'version': '1.0',
            'exported_at': timezone.now().isoformat(),
            'prompts': prompts,
        })

    @action(detail=False, methods=['post'], url_path='import')
    def import_prompts(self, request):
        """Import prompts from a previously exported JSON payload."""
        data = request.data
        if not isinstance(data, dict) or 'prompts' not in data:
            return Response(
                {'error': 'Invalid format. Expected {"prompts": [...]}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        imported = 0
        skipped = 0
        for p in data['prompts']:
            title = (p.get('title') or '').strip()
            if not title:
                skipped += 1
                continue
            if PromptTemplate.objects.filter(title=title, created_by=request.user).exists():
                skipped += 1
                continue
            category = None
            if p.get('category'):
                category, _ = Category.objects.get_or_create(name=p['category'])
            template = PromptTemplate.objects.create(
                title=title,
                description=p.get('description', ''),
                category=category,
                status=p.get('status', PromptTemplate.STATUS_ACTIVE),
                created_by=request.user,
            )
            for tag_name in p.get('tags', []):
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                template.tags.add(tag)
            content = p.get('content', '')
            if content:
                PromptVersion.objects.create(
                    template=template,
                    version_number=1,
                    body=content,
                    variables=p.get('variables', []),
                    created_by=request.user,
                )
            imported += 1
        return Response({'imported': imported, 'skipped': skipped})


class APIKeyViewSet(viewsets.ModelViewSet):
    """Create, list, and delete per-user API keys."""
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        prefix, key_hash, raw_key = APIKey.generate_key()
        instance = serializer.save(
            user=self.request.user,
            key_prefix=prefix,
            key_hash=key_hash,
        )
        instance._raw_key = raw_key  # attached for this response only


class PromptVersionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing prompt versions
    """
    queryset = PromptVersion.objects.all()
    serializer_class = PromptVersionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['version_number', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        template_id = self.request.query_params.get('template')
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PromptVariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing prompt variants (A/B testing)
    """
    queryset = PromptVariant.objects.all()
    serializer_class = PromptVariantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        version_id = self.request.query_params.get('version')
        if version_id:
            queryset = queryset.filter(version_id=version_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
