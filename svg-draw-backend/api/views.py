from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .services import SvgDrawService
from .serializers import SvgDrawSerializer, SvgDrawCreateSerializer


class ResponseMixin:
    """统一响应格式混入"""
    
    @staticmethod
    def success_response(data=None, message='ok'):
        """成功响应"""
        return Response({
            'code': 0,
            'message': message,
            'data': data
        })

    @staticmethod
    def error_response(message='请求失败', code=1):
        """错误响应"""
        return Response({
            'code': code,
            'message': message,
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)


class SvgDrawListView(APIView, ResponseMixin):
    """SVG 绘图列表接口"""

    def get(self, request):
        """获取列表"""
        try:
            draws = SvgDrawService.get_svg_draw_list()
            serializer = SvgDrawSerializer(draws, many=True)
            return self.success_response(data=serializer.data)
        except Exception as e:
            import traceback
            if settings.DEBUG:
                return self.error_response(message=f'获取列表失败: {str(e)}')
            return self.error_response(message='获取列表失败')

    def post(self, request):
        """创建"""
        serializer = SvgDrawCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return self.error_response(message='参数验证失败')
        
        try:
            draw = SvgDrawService.create_svg_draw(
                name=serializer.validated_data['name'],
                svg_content=serializer.validated_data['svg_content']
            )
            result_serializer = SvgDrawSerializer(draw)
            return self.success_response(data=result_serializer.data, message='创建成功')
        except Exception as e:
            if settings.DEBUG:
                return self.error_response(message=f'创建失败: {str(e)}')
            return self.error_response(message='创建失败')


class SvgDrawDetailView(APIView, ResponseMixin):
    """SVG 绘图详情接口"""

    def get(self, request, draw_id):
        """获取详情"""
        draw = SvgDrawService.get_svg_draw_by_id(draw_id)
        if not draw:
            return self.error_response(message='资源不存在', code=404)
        
        serializer = SvgDrawSerializer(draw)
        return self.success_response(data=serializer.data)

    def put(self, request, draw_id):
        """更新"""
        serializer = SvgDrawCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return self.error_response(message='参数验证失败')
        
        draw = SvgDrawService.update_svg_draw(
            draw_id=draw_id,
            name=serializer.validated_data.get('name'),
            svg_content=serializer.validated_data.get('svg_content')
        )
        if not draw:
            return self.error_response(message='资源不存在', code=404)
        
        result_serializer = SvgDrawSerializer(draw)
        return self.success_response(data=result_serializer.data, message='更新成功')

    def delete(self, request, draw_id):
        """删除"""
        success = SvgDrawService.delete_svg_draw(draw_id)
        if not success:
            return self.error_response(message='资源不存在', code=404)
        return self.success_response(message='删除成功')
