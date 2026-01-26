from django.db import models
from django.utils import timezone
import uuid
import json


class Run(models.Model):
    """运行记录"""
    STATUS_CHOICES = [
        ('created', '已创建'),
        ('running', '运行中'),
        ('success', '成功'),
        ('failed', '失败'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'runs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Run {self.id} ({self.status})"


class RunStepLog(models.Model):
    """运行步骤日志"""
    run = models.ForeignKey(Run, on_delete=models.CASCADE, related_name='steps')
    name = models.CharField(max_length=100)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    input_data = models.JSONField(null=True, blank=True)
    output_data = models.JSONField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'run_step_logs'
        ordering = ['started_at']
    
    def __str__(self):
        return f"{self.run.id} - {self.name}"


class Artifact(models.Model):
    """产物"""
    TYPE_CHOICES = [
        ('scene_spec', '场景规范'),
        ('final_spec', '最终规范'),
        ('dsl_draft', 'DSL 草稿'),
        ('code', '代码'),
    ]
    
    run = models.ForeignKey(Run, on_delete=models.CASCADE, related_name='artifacts')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    ref_id = models.CharField(max_length=255, null=True, blank=True)  # 关联到其他模型的 ID
    preview_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'artifacts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.run.id} - {self.type}"
