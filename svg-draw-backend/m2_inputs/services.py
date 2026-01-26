from .models import InputSubmission
from common.schemas import InputPayload, ImageInfo
import logging

logger = logging.getLogger(__name__)


def get_input_payload(submission: InputSubmission, request=None) -> InputPayload:
    """从 InputSubmission 构建 InputPayload"""
    images = []
    if submission.image_file:
        url = submission.image_url
        if request:
            url = request.build_absolute_uri(submission.image_url)
        images.append(ImageInfo(
            id=str(submission.id),
            url=url,
            mime='image/jpeg'  # 简化处理
        ))
    
    return InputPayload(
        text=submission.text,
        images=images,
        params=submission.params_json
    )
