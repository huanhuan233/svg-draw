from common.schemas import SceneSpec, Entity, Relation
import logging

logger = logging.getLogger(__name__)


class VisionService:
    """多模态识别服务（Stub）"""
    
    @staticmethod
    def perceive(text: str = None, images: list = None) -> SceneSpec:
        """
        多模态识别（Stub）
        
        TODO: 接入真实的多模态模型（如 GPT-4V, Claude Vision, Gemini Vision）
        1. 准备图片数据（base64 或 URL）
        2. 调用模型 API
        3. 解析返回结果，构建 SceneSpec
        """
        logger.info("VisionService.perceive called (stub)")
        
        # Stub 逻辑：基于输入生成固定结构
        intent = "process_flow"  # 默认意图
        
        if text:
            text_lower = text.lower()
            if any(word in text_lower for word in ['flow', 'process', 'workflow']):
                intent = "process_flow"
            elif any(word in text_lower for word in ['network', 'graph', 'connection']):
                intent = "network_graph"
            elif any(word in text_lower for word in ['ui', 'interface', 'layout']):
                intent = "ui_diagram"
            else:
                # 从文本首句提取意图
                first_sentence = text.split('。')[0] if '。' in text else text.split('.')[0]
                intent = first_sentence[:20] if len(first_sentence) > 20 else first_sentence
        
        if images:
            # 基于文件名做简单变化
            image_name = images[0].get('url', '') if images else ''
            if 'flow' in image_name.lower():
                intent = "process_flow"
            elif 'network' in image_name.lower():
                intent = "network_graph"
            elif 'ui' in image_name.lower() or 'svg' in image_name.lower():
                intent = "ui_diagram"
        
        # 生成示例实体和关系
        entities = [
            Entity(name="开始", type="node", attrs={"label": "开始"}),
            Entity(name="处理", type="node", attrs={"label": "处理"}),
            Entity(name="结束", type="node", attrs={"label": "结束"}),
        ]
        
        relations = [
            Relation(src="开始", rel="leads_to", dst="处理"),
            Relation(src="处理", rel="leads_to", dst="结束"),
        ]
        
        missing_slots = ["参数", "标准"] if intent == "process_flow" else []
        
        scene = SceneSpec(
            intent=intent,
            entities=entities,
            relations=relations,
            missing_slots=missing_slots,
            confidence=0.85  # Stub 固定置信度
        )
        
        logger.info(f"Generated SceneSpec with intent: {intent}")
        return scene
