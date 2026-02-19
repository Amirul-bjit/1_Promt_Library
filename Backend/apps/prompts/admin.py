from django.contrib import admin
from .models import Category, Tag, PromptTemplate, PromptVersion, PromptVariant


class PromptVersionInline(admin.TabularInline):
    model = PromptVersion
    extra = 0
    readonly_fields = ('version_number', 'created_at', 'created_by')


class PromptVariantInline(admin.TabularInline):
    model = PromptVariant
    extra = 0
    readonly_fields = ('created_at', 'created_by')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'category', 'created_by', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'description')
    filter_horizontal = ('tags',)
    inlines = [PromptVersionInline]


@admin.register(PromptVersion)
class PromptVersionAdmin(admin.ModelAdmin):
    list_display = ('template', 'version_number', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('template__title', 'body')
    inlines = [PromptVariantInline]


@admin.register(PromptVariant)
class PromptVariantAdmin(admin.ModelAdmin):
    list_display = ('version', 'name', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'version__template__title')
