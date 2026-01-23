from rest_framework import serializers
from .models import SvgDraw


class SvgDrawSerializer(serializers.ModelSerializer):
    """SVG 绘图序列化器"""
    
    class Meta:
        model = SvgDraw
        fields = ['id', 'name', 'svg_content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SvgDrawCreateSerializer(serializers.Serializer):
    """创建 SVG 绘图输入序列化器"""
    name = serializers.CharField(max_length=200, required=True)
    svg_content = serializers.CharField(required=True)
