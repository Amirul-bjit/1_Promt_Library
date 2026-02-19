"""
URLs for prompts app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TagViewSet, PromptTemplateViewSet, PromptVersionViewSet, PromptVariantViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'templates', PromptTemplateViewSet, basename='template')
router.register(r'versions', PromptVersionViewSet, basename='version')
router.register(r'variants', PromptVariantViewSet, basename='variant')

urlpatterns = [
    path('', include(router.urls)),
]
