"""
编排服务：perception（Stub）→ augmentation（Stub）→ codegen（SiliconFlow 生成 SVG）
m6 为编排核心，流程控制仅在此模块；m3 仅负责调用 LLM API。
"""
import re
import logging
from common.schemas import (
    InputPayload, SceneSpec, FinalSpec, DslDraft,
)
from m3_llm_providers.services import VisionService
from m4_knowledge_graph.services import KnowledgeGraphService
from m5_rag.services import RagService
from m3_llm_providers.siliconflow_client import chat_completion as siliconflow_chat
from m1_runs.services import RunLogger
from m1_runs.models import Run

logger = logging.getLogger(__name__)

# 第一版仅生成 SVG，system prompt 强约束只输出 <svg>...</svg>
SVG_SYSTEM_PROMPT = """你是一个 SVG 代码生成器。根据用户的自然语言描述，只输出一段完整的、可直接使用的 SVG 代码。
要求：
1. 只输出一个完整的 <svg ...>...</svg> 文档，不要任何解释、不要 markdown 代码块包裹。
2. 不要输出除 SVG 以外的文字。
3. 使用标准 SVG 元素（rect, circle, path, text 等），确保语法正确、可被浏览器渲染。"""


def _extract_svg_from_llm_response(raw: str) -> str:
    """从 LLM 返回文本中提取 SVG：去除 markdown 代码块、前后空白，保证是 <svg>...</svg>。"""
    text = (raw or "").strip()
    if not text:
        return ""

    # 去掉 ```xml / ```svg / ``` 代码块
    for pattern in [
        r"```(?:xml|svg|html)?\s*\n?(.*?)```",
        r"```\s*\n?(.*?)```",
    ]:
        m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if m:
            text = m.group(1).strip()

    # 定位第一个 <svg 到最后一个 </svg>
    start = text.find("<svg")
    if start == -1:
        return text
    end = text.rfind("</svg>")
    if end == -1:
        return text
    return text[start : end + len("</svg>")].strip()


class OrchestrationService:
    """编排服务：perception → augmentation（可选 Stub）→ codegen（SiliconFlow）"""

    def run(self, payload: InputPayload, request=None) -> dict:
        """执行全链路编排（第一版：仅 SVG 生成，m3/m4/m5 保留调用结构）"""
        run = RunLogger.create_run()
        RunLogger.update_status(run, "running")

        try:
            # Step 1: Perception（多模态识别，Stub）
            step_perception = RunLogger.log_step(
                run, "perception", input_data={
                    "text": payload.text,
                    "has_images": len(payload.images) > 0,
                }
            )
            RunLogger.start_step(step_perception)

            scene = VisionService.perceive(
                text=payload.text,
                images=[img.__dict__ for img in payload.images] if payload.images else None,
            )

            RunLogger.end_step(step_perception, output_data=scene.to_dict())
            RunLogger.add_artifact(run, "scene_spec", preview_text=f"Intent: {scene.intent}")

            # Step 2: Augmentation（补全，当前阶段跳过真实逻辑，仅保留调用结构）
            final_spec = FinalSpec(scene=scene)

            if payload.params.get("enable_kg", False):
                step_kg = RunLogger.log_step(run, "kg_augmentation")
                RunLogger.start_step(step_kg)
                kg_filled = KnowledgeGraphService.augment(scene)
                for k, v in kg_filled.items():
                    if k not in final_spec.filled or k in ["工艺", "材料", "设备", "网络类型", "协议", "组件库", "样式"]:
                        final_spec.filled[k] = v
                RunLogger.end_step(step_kg, output_data={"filled": kg_filled})

            if payload.params.get("enable_rag", False):
                step_rag = RunLogger.log_step(run, "rag_augmentation")
                RunLogger.start_step(step_rag)
                rag_filled, citations = RagService.augment(scene)
                final_spec.citations = citations
                for k, v in rag_filled.items():
                    if k not in final_spec.filled or k in ["参数", "标准", "配置参数", "安全标准", "设计规范", "响应式参数"]:
                        final_spec.filled[k] = v
                RunLogger.end_step(
                    step_rag,
                    output_data={"filled": rag_filled, "citations_count": len(citations)},
                )

            RunLogger.add_artifact(run, "final_spec", preview_text=f"Filled {len(final_spec.filled)} slots")

            # 第一版：仅 SVG，不跑 dsl_router，直接进入 codegen
            dsl_type = "svg"
            router_reason = "第一版仅生成 SVG"

            # Step 3: Code Generation（调用 m3 SiliconFlow，非流式）
            step_codegen = RunLogger.log_step(run, "codegen")
            RunLogger.start_step(step_codegen)

            messages = [
                {"role": "system", "content": SVG_SYSTEM_PROMPT},
                {"role": "user", "content": payload.text or "请输出一个最简单的 SVG，画一个矩形，写 Hello SVG"},
            ]
            raw_content = siliconflow_chat(messages, temperature=0.2)
            svg_text = _extract_svg_from_llm_response(raw_content)
            if not svg_text:
                svg_text = raw_content  # 回退为原始内容

            draft = DslDraft(
                dsl_type="svg",
                code=svg_text,
                meta={
                    "title": "SVG 草稿",
                    "width": None,
                    "height": None,
                    "editable": True,
                    "router_reason": router_reason,
                },
            )

            RunLogger.end_step(step_codegen, output_data=draft.to_dict())
            RunLogger.add_artifact(
                run, "draft_svg", preview_text=(svg_text[:200] + "..." if len(svg_text) > 200 else svg_text)
            )

            # m7 草稿：仅当 output_mode != "preview-only" 时写入
            draft_model = None
            output_mode = (payload.params or {}).get("output_mode", "auto")
            if output_mode != "preview-only":
                from m7_editors.models import Draft

                draft_model = Draft.objects.create(
                    dsl_type="svg",
                    code=svg_text,
                    meta_json=draft.meta,
                    run=run,
                )
                RunLogger.add_artifact(run, "code", ref_id=str(draft_model.id), preview_text=svg_text[:100])

            RunLogger.update_status(run, "success")

            return {
                "run_id": str(run.id),
                "status": "success",
                "draft": {
                    "dsl_type": "svg",
                    "code": svg_text,
                    "meta": draft.meta,
                },
                "draft_id": draft_model.id if draft_model else None,
                "final_spec": final_spec.to_dict(),
            }

        except Exception as e:
            logger.error("Orchestration failed: %s", e, exc_info=True)
            RunLogger.update_status(run, "failed")
            RunLogger.log_step(run, "error", error=str(e))
            raise
