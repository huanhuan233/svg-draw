#!/bin/bash

# SVG Draw 项目一键停止脚本

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 加载统一配置
if [ -f "$PROJECT_ROOT/config.env" ]; then
    source "$PROJECT_ROOT/config.env"
else
    echo -e "${RED}错误: 未找到配置文件 config.env${NC}"
    exit 1
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  停止 SVG Draw 项目服务${NC}"
echo -e "${YELLOW}========================================${NC}"

# 停止后端服务
echo -e "${YELLOW}[1/2] 停止后端服务 (端口: $BACKEND_PORT)...${NC}"
BACKEND_PIDS=$(lsof -ti :$BACKEND_PORT 2>/dev/null || netstat -tlnp 2>/dev/null | grep ":$BACKEND_PORT " | awk '{print $7}' | cut -d'/' -f1 | sort -u || ss -tlnp 2>/dev/null | grep ":$BACKEND_PORT " | grep -oP 'pid=\K[0-9]+' | sort -u || echo "")

if [ -z "$BACKEND_PIDS" ]; then
    # 尝试通过进程名查找
    BACKEND_PIDS=$(ps aux | grep "manage.py runserver.*$BACKEND_PORT" | grep -v grep | awk '{print $2}' | sort -u)
fi

if [ -z "$BACKEND_PIDS" ]; then
    echo -e "${YELLOW}后端服务未运行${NC}"
else
    for PID in $BACKEND_PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}停止后端进程 (PID: $PID)...${NC}"
            kill $PID 2>/dev/null || true
            sleep 1
            # 如果还在运行，强制杀死
            if kill -0 $PID 2>/dev/null; then
                kill -9 $PID 2>/dev/null || true
            fi
        fi
    done
    echo -e "${GREEN}✓ 后端服务已停止${NC}"
fi

# 停止前端服务
echo -e "${YELLOW}[2/2] 停止前端服务 (端口: $FRONTEND_PORT)...${NC}"
FRONTEND_PIDS=$(lsof -ti :$FRONTEND_PORT 2>/dev/null || netstat -tlnp 2>/dev/null | grep ":$FRONTEND_PORT " | awk '{print $7}' | cut -d'/' -f1 | sort -u || ss -tlnp 2>/dev/null | grep ":$FRONTEND_PORT " | grep -oP 'pid=\K[0-9]+' | sort -u || echo "")

if [ -z "$FRONTEND_PIDS" ]; then
    # 尝试通过进程名查找
    FRONTEND_PIDS=$(ps aux | grep -E "(vite|npm.*dev)" | grep -v grep | awk '{print $2}' | sort -u)
    # 进一步过滤，只保留相关的 vite 进程
    FILTERED_PIDS=""
    for PID in $FRONTEND_PIDS; do
        if ps -p $PID -o cmd= 2>/dev/null | grep -qE "(svg-draw-frontend|vite.*8625)"; then
            FILTERED_PIDS="$FILTERED_PIDS $PID"
        fi
    done
    FRONTEND_PIDS=$(echo $FILTERED_PIDS | tr ' ' '\n' | sort -u | tr '\n' ' ')
fi

if [ -z "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}前端服务未运行${NC}"
else
    for PID in $FRONTEND_PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}停止前端进程 (PID: $PID)...${NC}"
            kill $PID 2>/dev/null || true
            sleep 1
            # 如果还在运行，强制杀死
            if kill -0 $PID 2>/dev/null; then
                kill -9 $PID 2>/dev/null || true
            fi
        fi
    done
    echo -e "${GREEN}✓ 前端服务已停止${NC}"
fi

# 等待一下确保进程完全停止
sleep 1

# 最终检查
echo ""
echo -e "${YELLOW}检查端口状态...${NC}"
BACKEND_STILL_RUNNING=$(lsof -ti :$BACKEND_PORT 2>/dev/null || netstat -tlnp 2>/dev/null | grep -q ":$BACKEND_PORT " || ss -tlnp 2>/dev/null | grep -q ":$BACKEND_PORT " || echo "")
FRONTEND_STILL_RUNNING=$(lsof -ti :$FRONTEND_PORT 2>/dev/null || netstat -tlnp 2>/dev/null | grep -q ":$FRONTEND_PORT " || ss -tlnp 2>/dev/null | grep -q ":$FRONTEND_PORT " || echo "")

if [ -z "$BACKEND_STILL_RUNNING" ] && [ -z "$FRONTEND_STILL_RUNNING" ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  所有服务已成功停止！${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}警告: 部分服务可能仍在运行${NC}"
    if [ ! -z "$BACKEND_STILL_RUNNING" ]; then
        echo -e "${RED}后端端口 $BACKEND_PORT 仍被占用${NC}"
    fi
    if [ ! -z "$FRONTEND_STILL_RUNNING" ]; then
        echo -e "${RED}前端端口 $FRONTEND_PORT 仍被占用${NC}"
    fi
    echo -e "${YELLOW}可以手动检查: lsof -i :$BACKEND_PORT 或 lsof -i :$FRONTEND_PORT${NC}"
fi
