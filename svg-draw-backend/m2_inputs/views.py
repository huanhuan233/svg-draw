from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .models import InputSubmission
from common.responses import success_response, error_response
from common.schemas import InputPayload, ImageInfo
import logging

logger = logging.getLogger(__name__)


class SubmitInputView(APIView):
    """提交输入（文本/图片）"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        try:
            # 解析参数
            text = request.data.get('text')
            image_file = request.FILES.get('image')
            
            # 解析 params
            params = {
                'enable_kg': request.data.get('enable_kg', 'false').lower() == 'true',
                'enable_rag': request.data.get('enable_rag', 'false').lower() == 'true',
                'output_mode': request.data.get('output_mode', 'auto')
            }
            
            # 创建输入记录
            submission = InputSubmission.objects.create(
                text=text,
                image_file=image_file,
                params_json=params
            )
            
            # 构建响应
            images = []
            if submission.image_url:
                images.append(ImageInfo(
                    id=str(submission.id),
                    url=request.build_absolute_uri(submission.image_url),
                    mime='image/jpeg'  # 简化处理
                ))
            
            payload = InputPayload(
                text=text,
                images=images,
                params=params
            )
            
            logger.info(f"Input submitted: {submission.id}")
            
            return success_response({
                'submission_id': submission.id,
                'payload': {
                    'text': payload.text,
                    'images': [img.__dict__ for img in payload.images],
                    'params': payload.params
                }
            })
        except Exception as e:
            logger.error(f"Error submitting input: {str(e)}")
            return error_response(str(e), status=500)
