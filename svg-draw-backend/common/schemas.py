"""
统一数据结构定义
使用 dataclass 实现，不引入外部依赖
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime


@dataclass
class ImageInfo:
    """图片信息"""
    id: str
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    mime: Optional[str] = None


@dataclass
class InputPayload:
    """输入载荷"""
    text: Optional[str] = None
    images: List[ImageInfo] = field(default_factory=list)
    params: Dict[str, Any] = field(default_factory=lambda: {
        'enable_kg': False,
        'enable_rag': False,
        'output_mode': 'auto'  # 'auto' | 'mermaid' | 'graphviz' | 'svg'
    })


@dataclass
class Entity:
    """实体"""
    name: str
    type: str
    attrs: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Relation:
    """关系"""
    src: str
    rel: str
    dst: str


@dataclass
class SceneSpec:
    """多模态识别输出"""
    intent: str
    entities: List[Entity] = field(default_factory=list)
    relations: List[Relation] = field(default_factory=list)
    missing_slots: List[str] = field(default_factory=list)
    confidence: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            'intent': self.intent,
            'entities': [
                {'name': e.name, 'type': e.type, 'attrs': e.attrs}
                for e in self.entities
            ],
            'relations': [
                {'src': r.src, 'rel': r.rel, 'dst': r.dst}
                for r in self.relations
            ],
            'missing_slots': self.missing_slots,
            'confidence': self.confidence
        }


@dataclass
class Citation:
    """引用"""
    source: str
    title: str
    chunk: str


@dataclass
class FinalSpec:
    """补全后的规范"""
    scene: SceneSpec
    filled: Dict[str, Any] = field(default_factory=dict)
    citations: List[Citation] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'scene': self.scene.to_dict(),
            'filled': self.filled,
            'citations': [
                {'source': c.source, 'title': c.title, 'chunk': c.chunk}
                for c in self.citations
            ]
        }


@dataclass
class DslDraft:
    """DSL 草稿"""
    dsl_type: str  # 'mermaid' | 'graphviz' | 'svg'
    code: str
    meta: Dict[str, Any] = field(default_factory=lambda: {
        'title': '',
        'width': None,
        'height': None,
        'editable': True,
        'router_reason': ''
    })

    def to_dict(self) -> Dict[str, Any]:
        return {
            'dsl_type': self.dsl_type,
            'code': self.code,
            'meta': self.meta
        }


@dataclass
class StepLog:
    """步骤日志"""
    name: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    input: Optional[Dict[str, Any]] = None
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'input': self.input,
            'output': self.output,
            'error': self.error
        }


@dataclass
class ArtifactInfo:
    """产物信息"""
    type: str
    ref_id: str
    preview_text: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type,
            'ref_id': self.ref_id,
            'preview_text': self.preview_text
        }


@dataclass
class RunRecord:
    """运行记录"""
    run_id: str
    status: str  # 'created' | 'running' | 'success' | 'failed'
    steps: List[StepLog] = field(default_factory=list)
    artifacts: List[ArtifactInfo] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'run_id': self.run_id,
            'status': self.status,
            'steps': [s.to_dict() for s in self.steps],
            'artifacts': [a.to_dict() for a in self.artifacts]
        }
