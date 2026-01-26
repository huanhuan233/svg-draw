# URL 路由修复说明

## 问题
Django 的 `APPEND_SLASH` 中间件在 POST 请求时无法重定向（会丢失 POST 数据），导致错误。

## 解决方案
已更新 URL 配置，同时支持带斜杠和不带斜杠的 URL：

### 更新的文件
- `m6_orchestrator/urls.py` - 添加了不带斜杠的路由
- `m2_inputs/urls.py` - 添加了不带斜杠的路由

### 使用方式

现在以下两种 URL 都可以使用：

```bash
# 带斜杠（推荐）
curl -X POST http://127.0.0.1:8626/api/orchestrator/run/ \
  -H "Content-Type: application/json" \
  -d '{"text": "创建一个流程图", "output_mode": "auto"}'

# 不带斜杠（现在也支持）
curl -X POST http://127.0.0.1:8626/api/orchestrator/run \
  -H "Content-Type: application/json" \
  -d '{"text": "创建一个流程图", "output_mode": "auto"}'
```

### 其他 API 端点

所有 API 端点都支持带斜杠的 URL（推荐使用）：

- `POST /api/inputs/submit/`
- `POST /api/orchestrator/run/`
- `GET /api/runs/{run_id}/`
- `GET /api/runs/{run_id}/artifacts/`
- `GET /api/editors/drafts/{draft_id}/`
- `POST /api/editors/drafts/create/`
