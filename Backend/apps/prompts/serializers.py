"""
Serializers for prompts
"""
import re
from rest_framework import serializers
from .models import Category, Tag, PromptTemplate, PromptVersion, PromptVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class PromptVariantSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PromptVariant
        fields = ['id', 'name', 'body', 'variables', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_at']


class PromptVersionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    variants = PromptVariantSerializer(many=True, read_only=True)

    class Meta:
        model = PromptVersion
        fields = [
            'id', 'version_number', 'body', 'variables', 'change_note',
            'created_by', 'created_by_username', 'created_at', 'variants'
        ]
        read_only_fields = ['id', 'version_number', 'created_at']


class PromptTemplateSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags_data = TagSerializer(source='tags', many=True, read_only=True)
    current_version_data = serializers.SerializerMethodField()

    class Meta:
        model = PromptTemplate
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'tags', 'tags_data', 'status', 'created_by', 'created_by_username',
            'created_at', 'updated_at', 'current_version_data'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_current_version_data(self, obj):
        version = obj.current_version
        if version:
            return PromptVersionSerializer(version).data
        return None


class PromptTemplateDetailSerializer(PromptTemplateSerializer):
    versions = PromptVersionSerializer(many=True, read_only=True)

    class Meta(PromptTemplateSerializer.Meta):
        fields = PromptTemplateSerializer.Meta.fields + ['versions']


class PromptTemplateCreateSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for creating templates with content in a single request.
    Accepts category/tags as names or IDs, and content field to auto-create first version.
    """
    # Accept category as either ID or name
    category = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    # Accept tags as either IDs or names
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    # New field for prompt content
    content = serializers.CharField(required=False, allow_blank=True)
    change_note = serializers.CharField(required=False, allow_blank=True, default="Initial version")
    
    class Meta:
        model = PromptTemplate
        fields = [
            'id', 'title', 'description', 'category', 'tags', 'status',
            'content', 'change_note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def _extract_variables(self, content):
        """Extract {{variable}} patterns from content"""
        if not content:
            return []
        pattern = r'\{\{(\w+)\}\}'
        variables = re.findall(pattern, content)
        return list(set(variables))  # Remove duplicates
    
    def _get_or_create_category(self, category_value):
        """Get or create category from ID or name"""
        if not category_value:
            return None
        
        # Try as ID first
        try:
            category_id = int(category_value)
            return Category.objects.get(id=category_id)
        except (ValueError, Category.DoesNotExist):
            # Treat as name
            category, _ = Category.objects.get_or_create(name=category_value)
            return category
    
    def _get_or_create_tags(self, tags_list):
        """Get or create tags from IDs or names"""
        if not tags_list:
            return []
        
        tag_objects = []
        for tag_value in tags_list:
            # Try as ID first
            try:
                tag_id = int(tag_value)
                tag = Tag.objects.get(id=tag_id)
                tag_objects.append(tag)
            except (ValueError, Tag.DoesNotExist):
                # Treat as name
                tag, _ = Tag.objects.get_or_create(name=tag_value)
                tag_objects.append(tag)
        
        return tag_objects
    
    def create(self, validated_data):
        # Extract custom fields
        category_value = validated_data.pop('category', None)
        tags_list = validated_data.pop('tags', [])
        content = validated_data.pop('content', None)
        change_note = validated_data.pop('change_note', 'Initial version')
        
        # Normalize status (accept both "ACTIVE" and "active")
        status = validated_data.get('status', 'active')
        if status:
            validated_data['status'] = status.lower()
        
        # Get or create category
        category = self._get_or_create_category(category_value)
        if category:
            validated_data['category'] = category
        
        # Create template
        template = PromptTemplate.objects.create(**validated_data)
        
        # Handle tags
        tags = self._get_or_create_tags(tags_list)
        if tags:
            template.tags.set(tags)
        
        # Create first version if content provided
        if content:
            variables = self._extract_variables(content)
            PromptVersion.objects.create(
                template=template,
                version_number=1,
                body=content,
                variables=variables,
                change_note=change_note,
                created_by=validated_data.get('created_by')
            )
        
        return template
    
    def to_representation(self, instance):
        """Use the standard serializer for output"""
        return PromptTemplateDetailSerializer(instance).data


class PromptVersionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromptVersion
        fields = ['template', 'body', 'variables', 'change_note']

    def create(self, validated_data):
        template = validated_data['template']
        # Auto-increment version number
        last_version = template.versions.order_by('-version_number').first()
        version_number = (last_version.version_number + 1) if last_version else 1
        validated_data['version_number'] = version_number
        return super().create(validated_data)


class PromptVariantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromptVariant
        fields = ['version', 'name', 'body', 'variables']
