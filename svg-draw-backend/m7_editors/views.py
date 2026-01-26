from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from django.shortcuts import get_object_or_404
from .models import Draft
from common.responses import success_response, error_response
import logging

logger = logging.getLogger(__name__)


class DraftListView(APIView):
    """获取草稿列表"""
    parser_classes = [JSONParser]
    
    def get(self, request):
        try:
            drafts = Draft.objects.all()[:50]  # 限制返回数量
            result = []
            for draft in drafts:
                result.append({
                    'id': draft.id,
                    'dsl_type': draft.dsl_type,
                    'meta': draft.meta,
                    'created_at': draft.created_at.isoformat(),
                    'updated_at': draft.updated_at.isoformat()
                })
            return success_response(result)
        except Exception as e:
            return error_response(str(e), status=500)


class DraftDetailView(APIView):
    """获取草稿详情"""
    parser_classes = [JSONParser]
    
    def get(self, request, draft_id):
        try:
            draft = get_object_or_404(Draft, id=draft_id)
            return success_response({
                'id': draft.id,
                'dsl_type': draft.dsl_type,
                'code': draft.code,
                'meta': draft.meta,
                'created_at': draft.created_at.isoformat(),
                'updated_at': draft.updated_at.isoformat()
            })
        except Exception as e:
            return error_response(str(e), status=500)


class DraftCreateView(APIView):
    """创建/保存草稿"""
    parser_classes = [JSONParser]
    
    def post(self, request):
        try:
            dsl_type = request.data.get('dsl_type')
            code = request.data.get('code')
            meta = request.data.get('meta', {})
            
            if not dsl_type or not code:
                return error_response("dsl_type and code are required", status=400)
            
            if dsl_type not in ['mermaid', 'graphviz', 'svg']:
                return error_response(f"Invalid dsl_type: {dsl_type}", status=400)
            
            draft = Draft.objects.create(
                dsl_type=dsl_type,
                code=code,
                meta_json=meta
            )
            
            logger.info(f"Draft created: {draft.id}")
            
            return success_response({
                'id': draft.id,
                'dsl_type': draft.dsl_type,
                'code': draft.code,
                'meta': draft.meta
            }, status=201)
        except Exception as e:
            logger.error(f"Error creating draft: {str(e)}")
            return error_response(str(e), status=500)
