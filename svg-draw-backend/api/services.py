from typing import Dict, Any, Optional
from .models import SvgDraw


class SvgDrawService:
    """SVG 绘图业务逻辑服务"""

    @staticmethod
    def create_svg_draw(name: str, svg_content: str) -> SvgDraw:
        """创建 SVG 绘图"""
        return SvgDraw.objects.create(
            name=name,
            svg_content=svg_content
        )

    @staticmethod
    def get_svg_draw_list() -> list:
        """获取 SVG 绘图列表"""
        return list(SvgDraw.objects.all())

    @staticmethod
    def get_svg_draw_by_id(draw_id: int) -> Optional[SvgDraw]:
        """根据 ID 获取 SVG 绘图"""
        try:
            return SvgDraw.objects.get(id=draw_id)
        except SvgDraw.DoesNotExist:
            return None

    @staticmethod
    def update_svg_draw(draw_id: int, name: str = None, svg_content: str = None) -> Optional[SvgDraw]:
        """更新 SVG 绘图"""
        draw = SvgDrawService.get_svg_draw_by_id(draw_id)
        if not draw:
            return None
        
        if name is not None:
            draw.name = name
        if svg_content is not None:
            draw.svg_content = svg_content
        draw.save()
        return draw

    @staticmethod
    def delete_svg_draw(draw_id: int) -> bool:
        """删除 SVG 绘图"""
        draw = SvgDrawService.get_svg_draw_by_id(draw_id)
        if not draw:
            return False
        draw.delete()
        return True
