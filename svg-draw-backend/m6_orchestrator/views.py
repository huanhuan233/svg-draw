from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .services import OrchestrationService
from common.responses import success_response, error_response
import logging

logger = logging.getLogger(__name__)


class RunOrchestratorView(APIView):
    """触发全链路编排"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        try:
            # 解析参数
            submission_id = request.data.get('submission_id')
            text = request.data.get('text')
            image_file = request.FILES.get('image')
            
            # 如果提供了 submission_id，从数据库加载
            if submission_id:
                from m2_inputs.models import InputSubmission
                from m2_inputs.services import get_input_payload
                try:
                    submission = InputSubmission.objects.get(id=submission_id)
                    payload = get_input_payload(submission, request)
                except InputSubmission.DoesNotExist:
                    return error_response(f"Submission {submission_id} not found", status=404)
            else:
                # 否则从请求中构建
                from common.schemas import InputPayload, ImageInfo
                images = []
                if image_file:
                    # 保存文件到 InputSubmission
                    from m2_inputs.models import InputSubmission
                    submission = InputSubmission.objects.create(
                        text=text,
                        image_file=image_file,
                        params_json={
                            'enable_kg': request.data.get('enable_kg', 'false').lower() == 'true',
                            'enable_rag': request.data.get('enable_rag', 'false').lower() == 'true',
                            'output_mode': request.data.get('output_mode', 'auto')
                        }
                    )
                    images.append(ImageInfo(
                        id=str(submission.id),
                        url=request.build_absolute_uri(submission.image_url) if submission.image_url else '',
                        mime='image/jpeg'
                    ))
                
                params = {
                    'enable_kg': request.data.get('enable_kg', 'false').lower() == 'true',
                    'enable_rag': request.data.get('enable_rag', 'false').lower() == 'true',
                    'output_mode': request.data.get('output_mode', 'auto')
                }
                
                payload = InputPayload(
                    text=text,
                    images=images,
                    params=params
                )
            
            # 执行编排
            service = OrchestrationService()
            result = service.run(payload, request)
            
            return success_response(result)
        except Exception as e:
            logger.error(f"Orchestration error: {str(e)}", exc_info=True)
            return error_response(str(e), status=500)
