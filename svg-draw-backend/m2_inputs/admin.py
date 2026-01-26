from django.contrib import admin
from .models import InputSubmission


@admin.register(InputSubmission)
class InputSubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'text_preview', 'has_image', 'created_at']
    list_filter = ['created_at']
    search_fields = ['text']
    
    def text_preview(self, obj):
        if obj.text:
            return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
        return '-'
    text_preview.short_description = '文本预览'
    
    def has_image(self, obj):
        return bool(obj.image_file)
    has_image.boolean = True
    has_image.short_description = '有图片'
