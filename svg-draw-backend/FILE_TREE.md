# Django 多模块最小实现 - 完整文件树

## 新增/修改的文件

### 1. 统一数据结构模块
```
svg-draw-backend/
├── common/
│   ├── __init__.py
│   ├── schemas.py          # 统一数据结构定义（InputPayload, SceneSpec, FinalSpec, DslDraft, RunRecord 等）
│   └── responses.py        # 统一 API 响应格式
```

### 2. Runs App（运行记录核心）
```
svg-draw-backend/
├── runs/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # Run, RunStepLog, Artifact 模型
│   ├── admin.py
│   ├── views.py            # RunDetailView, RunArtifactsView
│   ├── urls.py
│   ├── services.py         # RunLogger 服务
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
```

### 3. Inputs App（输入接收）
```
svg-draw-backend/
├── inputs/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # InputSubmission 模型
│   ├── admin.py
│   ├── views.py            # SubmitInputView
│   ├── urls.py
│   ├── services.py         # get_input_payload 辅助函数
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
```

### 4. LLM Providers App（多模态识别 Stub）
```
svg-draw-backend/
├── llm_providers/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # 空（服务层）
│   ├── admin.py            # 空
│   ├── services.py         # VisionService.perceive (Stub)
│   ├── tests.py
│   ├── urls.py             # 空
│   ├── views.py            # 空
│   └── migrations/
│       └── __init__.py
```

### 5. Knowledge Graph App（KG 补全 Stub）
```
svg-draw-backend/
├── knowledge_graph/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # 空（服务层）
│   ├── admin.py            # 空
│   ├── services.py         # KnowledgeGraphService.augment (Stub)
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
```

### 6. RAG App（RAG 检索 Stub）
```
svg-draw-backend/
├── rag/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # 空（服务层）
│   ├── admin.py            # 空
│   ├── services.py         # RagService.augment (Stub)
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
```

### 7. Orchestrator App（编排核心）
```
svg-draw-backend/
├── orchestrator/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # 空（服务层）
│   ├── admin.py            # 空
│   ├── views.py            # RunOrchestratorView
│   ├── urls.py
│   ├── services.py         # OrchestrationService.run (核心编排逻辑)
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
```

### 8. Editors App（草稿存储）
```
svg-draw-backend/
├── editors/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py           # Draft 模型
│   ├── admin.py
│   ├── views.py            # DraftListView, DraftDetailView, DraftCreateView
│   ├── urls.py
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
```

### 9. 配置文件修改
```
svg-draw-backend/
├── backend/
│   ├── settings.py          # 修改：添加新 apps，配置 MEDIA 和 LOGGING
│   └── urls.py             # 修改：添加新路由，配置 MEDIA 文件服务
└── README_MODULES.md        # 新增：运行说明文档
```

## API 路由结构

```
/api/
├── inputs/submit/              # POST: 提交输入
├── orchestrator/run/          # POST: 触发全链路编排
├── runs/
│   ├── <run_id>/              # GET: 运行详情
│   └── <run_id>/artifacts/    # GET: 运行产物列表
└── editors/
    ├── drafts/                # GET: 草稿列表
    ├── drafts/<draft_id>/     # GET: 草稿详情
    └── drafts/create/         # POST: 创建草稿
```

## 数据库表结构

1. **runs** (Run)
   - id (UUID)
   - status (CharField)
   - created_at, updated_at

2. **run_step_logs** (RunStepLog)
   - run (ForeignKey)
   - name, started_at, ended_at
   - input_data, output_data (JSONField)
   - error (TextField)

3. **artifacts** (Artifact)
   - run (ForeignKey)
   - type, ref_id, preview_text
   - created_at

4. **input_submissions** (InputSubmission)
   - text, image_file
   - params_json (JSONField)
   - run (ForeignKey, nullable)
   - created_at

5. **drafts** (Draft)
   - dsl_type, code
   - meta_json (JSONField)
   - run (ForeignKey, nullable)
   - created_at, updated_at

## 数据流

```
InputPayload
  ↓
[Perception] → SceneSpec
  ↓
[KG Augmentation] (可选) → filled (结构字段)
  ↓
[RAG Augmentation] (可选) → filled (描述字段) + citations
  ↓
FinalSpec
  ↓
[DSL Router] → dsl_type + router_reason
  ↓
[Code Generation] → DslDraft
  ↓
保存到 Draft 模型
```
