"""
URLs for execution app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExecutionViewSet, ExecutionFeedbackViewSet

router = DefaultRouter()
router.register(r'', ExecutionViewSet, basename='execution')
router.register(r'feedback', ExecutionFeedbackViewSet, basename='execution-feedback')

urlpatterns = [
    path('', include(router.urls)),
]
