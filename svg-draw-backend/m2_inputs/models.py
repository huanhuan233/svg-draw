from django.db import models
from django.core.files.storage import default_storage
import json


class InputSubmission(models.Model):
    """输入提交"""
    text = models.TextField(null=True, blank=True)
    image_file = models.ImageField(upload_to='inputs/', null=True, blank=True)
    params_json = models.JSONField(default=dict)  # {enable_kg, enable_rag, output_mode}
    created_at = models.DateTimeField(auto_now_add=True)
    
    # 关联到运行记录（可选）
    run = models.ForeignKey('m1_runs.Run', on_delete=models.SET_NULL, null=True, blank=True, related_name='input_submissions')
    
    class Meta:
        db_table = 'input_submissions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Input {self.id} ({self.created_at})"
    
    @property
    def image_url(self):
        """获取图片 URL"""
        if self.image_file:
            return self.image_file.url
        return None
