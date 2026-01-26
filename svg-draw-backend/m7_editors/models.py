from django.db import models
import json


class Draft(models.Model):
    """草稿"""
    DSL_TYPE_CHOICES = [
        ('mermaid', 'Mermaid'),
        ('graphviz', 'Graphviz'),
        ('svg', 'SVG'),
    ]
    
    dsl_type = models.CharField(max_length=20, choices=DSL_TYPE_CHOICES)
    code = models.TextField()
    meta_json = models.JSONField(default=dict)  # {title, width, height, editable, router_reason}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # 关联到运行记录（可选）
    run = models.ForeignKey('m1_runs.Run', on_delete=models.SET_NULL, null=True, blank=True, related_name='drafts')
    
    class Meta:
        db_table = 'drafts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Draft {self.id} ({self.dsl_type})"
    
    @property
    def meta(self):
        """获取 meta 字典"""
        return self.meta_json if isinstance(self.meta_json, dict) else {}
