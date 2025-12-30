# 部署指南 (Nginx + Linux)

您的项目已构建完成，生成的文件在 `dist/` 目录下。以下是部署到 Linux 服务器 (如 Ubuntu/CentOS) 的标准步骤。

## 1. 准备文件 (已完成)
您已经运行了 `npm run build`，`dist` 文件夹包含了所有静态资源 (HTML, CSS, JS)。

## 2. 上传文件到服务器
您可以使用 SCP、FTP 或我刚刚创建的 `deploy.sh` 脚本将文件上传到服务器目录（例如 `/var/www/html/ocr-demo`）。

## 3. 配置 Nginx
由于是 React 单页应用 (SPA)，需要配置 Nginx 将所有 404 请求重定向到 `index.html`，否则刷新非首页路径时会报错。

新建或修改 Nginx 配置文件 (例如 `/etc/nginx/conf.d/ocr-demo.conf`):

```nginx
server {
    listen 80;
    server_name your_domain.com; # 替换域名或 IP

    root /var/www/html/ocr-demo; # 替换为实际上传路径
    index index.html;

    # 开启 gzip 压缩 (优化加载速度)
    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    gzip_comp_level 5;
    gzip_types text/plain application/javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;

    location / {
        try_files $uri $uri/ /index.html; # 关键: 支持 React Router
    }

    # 可选: 代理 API 请求 (如果后端不在同一域名)
    location /baidu-api/ {
        proxy_pass https://aip.baidubce.com/;
        proxy_set_header Host aip.baidubce.com;
        proxy_ssl_server_name on;
    }
}
```

## 4. 重启 Nginx
```bash
sudo nginx -t  # 检查配置是否正确
sudo systemctl reload nginx # 重启生效
```

## 5. 环境变量
注意：`.env` 文件中的变量在 `npm run build` 时已经被打包进去了。如果您需要修改 `VITE_OCR_TOKEN` 等变量，需要**重新修改本地代码并重新打包**，然后再次上传。
