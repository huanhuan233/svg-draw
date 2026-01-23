from django.db import models


class SvgDraw(models.Model):
    """SVG 绘图数据模型"""
    name = models.CharField(max_length=200, verbose_name='名称')
    svg_content = models.TextField(verbose_name='SVG 内容')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'svg_draw'
        verbose_name = 'SVG 绘图'
        verbose_name_plural = 'SVG 绘图'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
