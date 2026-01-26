from common.schemas import (
    InputPayload, SceneSpec, FinalSpec, DslDraft,
    Entity, Relation, Citation
)
from m3_llm_providers.services import VisionService
from m4_knowledge_graph.services import KnowledgeGraphService
from m5_rag.services import RagService
from m1_runs.services import RunLogger
from m1_runs.models import Run
import logging

logger = logging.getLogger(__name__)


class OrchestrationService:
    """编排服务：perception → augmentation → dsl_router → codegen"""
    
    def run(self, payload: InputPayload, request=None) -> dict:
        """执行全链路编排"""
        # 创建运行记录
        run = RunLogger.create_run()
        RunLogger.update_status(run, 'running')
        
        try:
            # Step 1: Perception（多模态识别）
            step_perception = RunLogger.log_step(run, 'perception', input_data={
                'text': payload.text,
                'has_images': len(payload.images) > 0
            })
            RunLogger.start_step(step_perception)
            
            scene = VisionService.perceive(
                text=payload.text,
                images=[img.__dict__ for img in payload.images] if payload.images else None
            )
            
            RunLogger.end_step(step_perception, output_data=scene.to_dict())
            RunLogger.add_artifact(run, 'scene_spec', preview_text=f"Intent: {scene.intent}")
            
            # Step 2: Augmentation（补全）
            final_spec = FinalSpec(scene=scene)
            
            if payload.params.get('enable_kg', False):
                step_kg = RunLogger.log_step(run, 'kg_augmentation')
                RunLogger.start_step(step_kg)
                
                kg_filled = KnowledgeGraphService.augment(scene)
                # KG 优先结构字段
                for k, v in kg_filled.items():
                    if k not in final_spec.filled or k in ['工艺', '材料', '设备', '网络类型', '协议', '组件库', '样式']:
                        final_spec.filled[k] = v
                
                RunLogger.end_step(step_kg, output_data={'filled': kg_filled})
            
            if payload.params.get('enable_rag', False):
                step_rag = RunLogger.log_step(run, 'rag_augmentation')
                RunLogger.start_step(step_rag)
                
                rag_filled, citations = RagService.augment(scene)
                final_spec.citations = citations
                # RAG 优先描述字段
                for k, v in rag_filled.items():
                    if k not in final_spec.filled or k in ['参数', '标准', '配置参数', '安全标准', '设计规范', '响应式参数']:
                        final_spec.filled[k] = v
                
                RunLogger.end_step(step_rag, output_data={
                    'filled': rag_filled,
                    'citations_count': len(citations)
                })
            
            RunLogger.add_artifact(run, 'final_spec', preview_text=f"Filled {len(final_spec.filled)} slots")
            
            # Step 3: DSL Router（路由）
            step_router = RunLogger.log_step(run, 'dsl_router')
            RunLogger.start_step(step_router)
            
            dsl_type, router_reason = self._route_dsl(
                output_mode=payload.params.get('output_mode', 'auto'),
                intent=scene.intent
            )
            
            RunLogger.end_step(step_router, output_data={
                'dsl_type': dsl_type,
                'reason': router_reason
            })
            
            # Step 4: Code Generation（代码生成）
            step_codegen = RunLogger.log_step(run, 'code_generation')
            RunLogger.start_step(step_codegen)
            
            draft = self._generate_code(dsl_type, scene, router_reason)
            
            RunLogger.end_step(step_codegen, output_data=draft.to_dict())
            RunLogger.add_artifact(run, 'dsl_draft', preview_text=draft.code[:100])
            
            # 保存草稿
            from m7_editors.models import Draft
            draft_model = Draft.objects.create(
                dsl_type=dsl_type,
                code=draft.code,
                meta_json=draft.meta,
                run=run
            )
            
            RunLogger.add_artifact(run, 'code', ref_id=str(draft_model.id), preview_text=draft.code[:100])
            
            # 完成
            RunLogger.update_status(run, 'success')
            
            return {
                'run_id': str(run.id),
                'status': 'success',
                'final_spec': final_spec.to_dict(),
                'draft': draft.to_dict(),
                'draft_id': draft_model.id
            }
            
        except Exception as e:
            logger.error(f"Orchestration failed: {str(e)}", exc_info=True)
            RunLogger.update_status(run, 'failed')
            RunLogger.log_step(run, 'error', error=str(e))
            raise
    
    def _route_dsl(self, output_mode: str, intent: str):
        """DSL 路由"""
        if output_mode != 'auto':
            return output_mode, f"用户指定使用 {output_mode}"
        
        # 自动路由规则
        intent_lower = intent.lower()
        
        if any(word in intent_lower for word in ['flow', 'state', 'process']):
            return 'mermaid', f"意图 '{intent}' 包含流程/状态/过程关键词，使用 mermaid"
        elif any(word in intent_lower for word in ['network', 'graph', 'layout']):
            return 'graphviz', f"意图 '{intent}' 包含网络/图/布局关键词，使用 graphviz"
        elif any(word in intent_lower for word in ['ui', 'svg', 'diagram', 'precise']):
            return 'svg', f"意图 '{intent}' 包含 UI/SVG/图表/精确关键词，使用 svg"
        else:
            return 'mermaid', f"默认使用 mermaid（意图: {intent}）"
    
    def _generate_code(self, dsl_type: str, scene: SceneSpec, router_reason: str) -> DslDraft:
        """代码生成（最小模板）"""
        if dsl_type == 'mermaid':
            # 生成简单的 flowchart
            code = "flowchart TD\n"
            code += "    A[开始] --> B[处理]\n"
            code += "    B --> C[结束]"
            
            return DslDraft(
                dsl_type='mermaid',
                code=code,
                meta={
                    'title': '流程图',
                    'width': None,
                    'height': None,
                    'editable': True,
                    'router_reason': router_reason
                }
            )
        
        elif dsl_type == 'graphviz':
            # 生成简单的 digraph
            code = "digraph G {\n"
            code += "    A -> B;\n"
            code += "}"
            
            return DslDraft(
                dsl_type='graphviz',
                code=code,
                meta={
                    'title': '有向图',
                    'width': None,
                    'height': None,
                    'editable': True,
                    'router_reason': router_reason
                }
            )
        
        elif dsl_type == 'svg':
            # 生成简单的 SVG
            code = '<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">\n'
            code += '  <rect x="10" y="10" width="180" height="80" fill="#e0e0e0" stroke="#333"/>\n'
            code += '  <text x="100" y="55" text-anchor="middle" font-family="Arial" font-size="16">示例</text>\n'
            code += '</svg>'
            
            return DslDraft(
                dsl_type='svg',
                code=code,
                meta={
                    'title': 'SVG 图表',
                    'width': 200,
                    'height': 100,
                    'editable': True,
                    'router_reason': router_reason
                }
            )
        
        else:
            raise ValueError(f"Unknown DSL type: {dsl_type}")
