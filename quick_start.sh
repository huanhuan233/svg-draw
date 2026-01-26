#!/bin/bash
# 快速启动脚本

cd "$(dirname "$0")/svg-draw-backend"

echo "=== Django 多模块最小实现 - 快速启动 ==="
echo ""

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖（如果需要）
if [ ! -f ".deps_installed" ]; then
    echo "安装依赖..."
    pip install -q -r ../requirements.txt
    touch .deps_installed
fi

# 创建媒体目录
mkdir -p media/inputs

# 执行迁移
echo "执行数据库迁移..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "=== 启动完成 ==="
echo "服务运行在: http://127.0.0.1:8000"
echo ""
echo "测试命令示例:"
echo "curl -X POST http://127.0.0.1:8000/api/orchestrator/run \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"text\": \"创建一个流程图\", \"output_mode\": \"auto\"}'"
echo ""
echo "启动服务器: python manage.py runserver"
