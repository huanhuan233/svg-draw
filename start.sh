#!/bin/bash

# SVG Draw 项目一键启动脚本
# 端口：8626（后端），8625（前端）

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/svg-draw-backend"
FRONTEND_DIR="$PROJECT_ROOT/svg-draw-frontend"
BACKEND_PORT=8626
FRONTEND_PORT=8625

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}正在停止服务...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}服务已停止${NC}"
    exit 0
}

# 捕获退出信号
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SVG Draw 项目启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 Python 环境
echo -e "${YELLOW}[1/4] 检查 Python 环境...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: 未找到 python3${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 环境检查通过${NC}"

# 检查 Node.js 环境
echo -e "${YELLOW}[2/4] 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 node${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 环境检查通过${NC}"

# 启动后端
echo -e "${YELLOW}[3/4] 启动后端服务器 (端口: $BACKEND_PORT)...${NC}"
cd "$BACKEND_DIR" || {
    echo -e "${RED}错误: 无法进入后端目录${NC}"
    exit 1
}

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}创建虚拟环境...${NC}"
    python3 -m venv venv || {
        echo -e "${RED}错误: 创建虚拟环境失败${NC}"
        exit 1
    }
fi

# 激活虚拟环境
source venv/bin/activate || {
    echo -e "${RED}错误: 激活虚拟环境失败${NC}"
    exit 1
}

# 安装依赖
if [ ! -f ".deps_installed" ]; then
    echo -e "${YELLOW}安装后端依赖...${NC}"
    pip install -q -r "$PROJECT_ROOT/requirements.txt" || {
        echo -e "${RED}错误: 安装依赖失败，请检查 requirements.txt${NC}"
        exit 1
    }
    touch .deps_installed
fi

# 执行数据库迁移
echo -e "${YELLOW}执行数据库迁移...${NC}"
python manage.py migrate --noinput || {
    echo -e "${RED}错误: 数据库迁移失败${NC}"
    exit 1
}

# 检查端口是否被占用
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$BACKEND_PORT " || ss -tuln 2>/dev/null | grep -q ":$BACKEND_PORT "; then
    echo -e "${RED}错误: 端口 $BACKEND_PORT 已被占用${NC}"
    exit 1
fi

# 启动后端服务器（后台运行）
echo -e "${YELLOW}启动后端服务...${NC}"
python manage.py runserver 0.0.0.0:$BACKEND_PORT > /tmp/svgdraw-backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动并检查
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}错误: 后端启动失败，请查看日志: /tmp/svgdraw-backend.log${NC}"
    tail -20 /tmp/svgdraw-backend.log
    exit 1
fi

# 检查端口是否真的在监听
for i in {1..10}; do
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$BACKEND_PORT " || ss -tuln 2>/dev/null | grep -q ":$BACKEND_PORT "; then
        break
    fi
    sleep 1
done

if ! lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1 && ! netstat -tuln 2>/dev/null | grep -q ":$BACKEND_PORT " && ! ss -tuln 2>/dev/null | grep -q ":$BACKEND_PORT "; then
    echo -e "${RED}错误: 后端端口 $BACKEND_PORT 未启动，请查看日志: /tmp/svgdraw-backend.log${NC}"
    tail -20 /tmp/svgdraw-backend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✓ 后端服务器已启动 (PID: $BACKEND_PID)${NC}"

# 启动前端
echo -e "${YELLOW}[4/4] 启动前端开发服务器 (端口: $FRONTEND_PORT)...${NC}"
cd "$FRONTEND_DIR" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
}

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install || {
        echo -e "${RED}错误: 安装前端依赖失败${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    }
fi

# 检查端口是否被占用
if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$FRONTEND_PORT " || ss -tuln 2>/dev/null | grep -q ":$FRONTEND_PORT "; then
    echo -e "${RED}错误: 端口 $FRONTEND_PORT 已被占用${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# 启动前端服务器（后台运行）
echo -e "${YELLOW}启动前端服务...${NC}"
npm run dev > /tmp/svgdraw-frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动并检查
sleep 3
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}错误: 前端启动失败，请查看日志: /tmp/svgdraw-frontend.log${NC}"
    tail -20 /tmp/svgdraw-frontend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# 检查端口是否真的在监听
for i in {1..15}; do
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$FRONTEND_PORT " || ss -tuln 2>/dev/null | grep -q ":$FRONTEND_PORT "; then
        break
    fi
    sleep 1
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"

# 获取服务器 IP
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip addr show 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | cut -d'/' -f1 || echo "localhost")

echo -e "${GREEN}后端 API: http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}后端 API (服务器): http://$SERVER_IP:$BACKEND_PORT${NC}"
echo -e "${GREEN}前端页面: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}前端页面 (服务器): http://$SERVER_IP:$FRONTEND_PORT${NC}"
echo -e "${YELLOW}后端日志: /tmp/svgdraw-backend.log${NC}"
echo -e "${YELLOW}前端日志: /tmp/svgdraw-frontend.log${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"

# 保持脚本运行，监控进程
while true; do
    sleep 5
    # 检查后端进程是否还在运行
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}警告: 后端进程已停止${NC}"
        tail -10 /tmp/svgdraw-backend.log
        cleanup
    fi
    # 检查前端进程是否还在运行
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}警告: 前端进程已停止${NC}"
        tail -10 /tmp/svgdraw-frontend.log
        cleanup
    fi
done
