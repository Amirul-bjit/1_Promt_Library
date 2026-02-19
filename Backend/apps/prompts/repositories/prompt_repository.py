"""
Repository for prompt data access
"""
from django.db.models import Count, Q
from apps.prompts.models import PromptTemplate, PromptVersion


class PromptRepository:
    """
    Handles database operations for prompts
    """

    @staticmethod
    def get_all_prompts(filters=None):
        """
        Get all prompts with optional filters
        """
        queryset = PromptTemplate.objects.select_related('created_by')
        
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            if 'category' in filters:
                queryset = queryset.filter(category=filters['category'])
            if 'search' in filters:
                queryset = queryset.filter(
                    Q(title__icontains=filters['search']) |
                    Q(description__icontains=filters['search'])
                )
        
        return queryset

    @staticmethod
    def get_prompt_by_id(prompt_id):
        """
        Get a single prompt by ID
        """
        return PromptTemplate.objects.prefetch_related('versions').get(id=prompt_id)

    @staticmethod
    def create_prompt(data, user):
        """
        Create a new prompt
        """
        prompt = PromptTemplate.objects.create(
            title=data['title'],
            description=data.get('description', ''),
            category=data.get('category', ''),
            tags=data.get('tags', []),
            status='DRAFT',
            created_by=user,
        )
        return prompt

    @staticmethod
    def update_prompt(prompt, data, user):
        """
        Update an existing prompt
        """
        for key, value in data.items():
            if hasattr(prompt, key) and key not in ['id', 'created_at', 'created_by']:
                setattr(prompt, key, value)
        prompt.save()
        return prompt

    @staticmethod
    def get_prompt_statistics():
        """
        Get statistics about prompts
        """
        return {
            'total': PromptTemplate.objects.count(),
            'by_status': dict(PromptTemplate.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_category': dict(PromptTemplate.objects.values('category').annotate(count=Count('id')).values_list('category', 'count')),
        }
