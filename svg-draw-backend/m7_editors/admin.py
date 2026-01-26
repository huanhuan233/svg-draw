from django.contrib import admin
from .models import Draft


@admin.register(Draft)
class DraftAdmin(admin.ModelAdmin):
    list_display = ['id', 'dsl_type', 'title_preview', 'created_at']
    list_filter = ['dsl_type', 'created_at']
    search_fields = ['code', 'meta_json']
    
    def title_preview(self, obj):
        return obj.meta.get('title', '-')
    title_preview.short_description = '标题'
