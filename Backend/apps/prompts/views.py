"""
Views for prompts API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Category, Tag, PromptTemplate, PromptVersion, PromptVariant
from .serializers import (
    CategorySerializer, TagSerializer, PromptTemplateSerializer, PromptTemplateDetailSerializer,
    PromptVersionSerializer, PromptVariantSerializer, PromptVersionCreateSerializer,
    PromptTemplateCreateSerializer
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
