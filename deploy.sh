#!/bin/bash

# 配置服务器信息 (请修改此处)
SERVER_IP="your_server_ip"
SERVER_USER="root"
SERVER_PATH="/var/www/html/ocr-demo"

echo "Using server: $SERVER_USER@$SERVER_IP:$SERVER_PATH"

# 1. 重新构建
echo "Building project..."
npm run build

# 2. 检查构建结果
if [ ! -d "dist" ]; then
    echo "Error: Build failed, dist directory not found."
    exit 1
fi

# 3. 上传文件 (使用 rsync)
echo "Uploading files..."
# 确保目标目录存在 (需要 SSH 权限)
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"
# 同步 dist 目录内容到服务器
rsync -avz --delete dist/ "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

echo "Deployment complete! Visit http://$SERVER_IP"
