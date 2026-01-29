"""
SiliconFlow 文本 LLM 客户端（OpenAI 兼容，非流式）
职责：仅调用外部大模型 API，不创建 Run、不存草稿、不参与编排。
"""
import os
import logging
from typing import List, Dict, Any, Optional

import requests

logger = logging.getLogger(__name__)

DEFAULT_BASE_URL = "https://api.siliconflow.cn/v1"
DEFAULT_MODEL = "Qwen/Qwen3-Coder-480B-A35B-Instruct"


def chat_completion(
    messages: List[Dict[str, str]],
    *,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    """
    调用 SiliconFlow chat/completions（非流式），返回 assistant 的 content 字符串。

    :param messages: [{"role": "system"|"user"|"assistant", "content": "..."}, ...]
    :param api_key: 默认从环境变量 SILICONFLOW_API_KEY 读取
    :param base_url: 默认 SILICONFLOW_BASE_URL 或 https://api.siliconflow.cn/v1
    :param model: 默认 SILICONFLOW_MODEL 或 Qwen/Qwen3-Coder-480B-A35B-Instruct
    :param temperature: 默认 0.2
    :return: assistant 的 content 文本
    :raises: ValueError 当 API 失败或返回无法解析时
    """
    key = api_key or os.environ.get("SILICONFLOW_API_KEY")
    if not key:
        raise ValueError("SILICONFLOW_API_KEY is not set")

    url = (base_url or os.environ.get("SILICONFLOW_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
    endpoint = f"{url}/chat/completions"
    model_name = model or os.environ.get("SILICONFLOW_MODEL") or DEFAULT_MODEL

    payload = {
        "model": model_name,
        "messages": messages,
        "stream": False,
        "temperature": temperature,
    }

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(endpoint, json=payload, headers=headers, timeout=120)
    except requests.RequestException as e:
        logger.exception("SiliconFlow request failed: %s", e)
        raise ValueError(f"SiliconFlow request failed: {e}") from e

    if resp.status_code != 200:
        raise ValueError(
            f"SiliconFlow API HTTP {resp.status_code}: {resp.text[:500]}"
        )

    try:
        data = resp.json()
    except Exception as e:
        logger.exception("SiliconFlow response JSON parse failed: %s", e)
        raise ValueError(f"SiliconFlow response not valid JSON: {e}") from e

    choices = data.get("choices")
    if not choices or not isinstance(choices, list):
        raise ValueError("SiliconFlow response missing or empty choices")

    first = choices[0]
    if not isinstance(first, dict):
        raise ValueError("SiliconFlow choices[0] is not an object")

    message = first.get("message")
    if not message or not isinstance(message, dict):
        raise ValueError("SiliconFlow choices[0].message missing or invalid")

    content = message.get("content")
    if content is None:
        content = ""
    return str(content).strip()
