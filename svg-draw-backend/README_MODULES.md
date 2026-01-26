# Django 多模块最小实现 - 运行说明

## 1. 数据库迁移

```bash
cd svg-draw-backend
python manage.py makemigrations
python manage.py migrate
```

## 2. 创建媒体文件目录

```bash
mkdir -p svg-draw-backend/media/inputs
```

## 3. 启动服务

```bash
python manage.py runserver
```

默认运行在 `http://127.0.0.1:8000`

## 4. API 端点

### 4.1 提交输入
`POST /api/inputs/submit`
- 参数：
  - `text` (可选): 文本输入
  - `image` (可选): 图片文件
  - `enable_kg` (可选): 是否启用 KG，默认 false
  - `enable_rag` (可选): 是否启用 RAG，默认 false
  - `output_mode` (可选): 输出模式，'auto'|'mermaid'|'graphviz'|'svg'，默认 'auto'

### 4.2 触发全链路编排
`POST /api/orchestrator/run`
- 参数：
  - `submission_id` (可选): 输入提交 ID
  - 或直接提供 `text`, `image`, `enable_kg`, `enable_rag`, `output_mode`

### 4.3 查看运行详情
`GET /api/runs/{run_id}`

### 4.4 查看运行产物
`GET /api/runs/{run_id}/artifacts`

### 4.5 获取草稿
`GET /api/editors/drafts/{draft_id}`

### 4.6 创建草稿
`POST /api/editors/drafts/create`
- Body: `{"dsl_type": "mermaid|graphviz|svg", "code": "...", "meta": {...}}`

## 5. curl 示例

### 示例 1: 仅文本 + auto
```bash
curl -X POST http://127.0.0.1:8000/api/orchestrator/run \
  -H "Content-Type: application/json" \
  -d '{
    "text": "创建一个流程图，包含开始、处理和结束步骤",
    "enable_kg": false,
    "enable_rag": false,
    "output_mode": "auto"
  }'
```

### 示例 2: 图片 + 开 KG
```bash
curl -X POST http://127.0.0.1:8000/api/orchestrator/run \
  -F "image=@/path/to/image.jpg" \
  -F "text=这是一个网络拓扑图" \
  -F "enable_kg=true" \
  -F "enable_rag=false" \
  -F "output_mode=auto"
```

### 示例 3: 图片 + 开 KG+RAG + 强制 svg
```bash
curl -X POST http://127.0.0.1:8000/api/orchestrator/run \
  -F "image=@/path/to/image.jpg" \
  -F "text=创建一个精确的 UI 界面图" \
  -F "enable_kg=true" \
  -F "enable_rag=true" \
  -F "output_mode=svg"
```

## 6. 响应格式

所有 API 返回统一格式：
```json
{
  "ok": true,
  "data": {...},
  "error": null
}
```

错误时：
```json
{
  "ok": false,
  "data": null,
  "error": "错误信息"
}
```

## 7. 数据库表

- `runs`: 运行记录
- `run_step_logs`: 运行步骤日志
- `artifacts`: 产物
- `input_submissions`: 输入提交
- `drafts`: 草稿

## 8. 日志

所有步骤都会记录到：
- 数据库：`run_step_logs` 表
- 控制台：标准输出（INFO 级别）

## 9. TODO（未来接入真实服务）

1. **llm_providers**: 接入 GPT-4V / Claude Vision / Gemini Vision
2. **knowledge_graph**: 接入 Neo4j / ArangoDB 等 KG 数据库
3. **rag**: 接入向量数据库（Milvus / Pinecone / Chroma）+ Embedding 模型
4. **codegen**: 增强代码生成逻辑，基于 SceneSpec 生成更复杂的 DSL 代码
