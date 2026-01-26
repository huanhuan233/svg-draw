"""
统一 API 响应格式
"""
from rest_framework.response import Response
from typing import Any, Optional


def success_response(data: Any = None, status: int = 200) -> Response:
    """成功响应"""
    return Response({
        'ok': True,
        'data': data,
        'error': None
    }, status=status)


def error_response(error: str, status: int = 400, data: Any = None) -> Response:
    """错误响应"""
    return Response({
        'ok': False,
        'data': data,
        'error': error
    }, status=status)
