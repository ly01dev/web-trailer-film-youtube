# 🚀 Deploy lên AWS EC2 với Cloudflare

Hướng dẫn chi tiết deploy ứng dụng Phim YouTube lên AWS EC2 và cấu hình Cloudflare.

## 📋 Chuẩn bị

### 1. EC2 Instance Info

- **Instance ID**: i-08b2915a1a63dcf32
- **OS**: Ubuntu 20.04+ (khuyến nghị)
- **Security Group**: Cần mở ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. Domain & Cloudflare

- Domain đã được thêm vào Cloudflare
- DNS records đã được cấu hình

## 🔧 Bước 1: Kết nối EC2 Instance

### Kết nối SSH

```bash
# Nếu dùng .pem file
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Hoặc nếu đã cấu hình key trong AWS
ssh ubuntu@your-ec2-public-ip
```

### Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

## 🐳 Bước 2: Cài đặt Docker

```bash
# Cài đặt dependencies
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Thêm Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Thêm user vào docker group
sudo usermod -aG docker $USER

# Khởi động Docker
sudo systemctl start docker
sudo systemctl enable docker

# Logout và login lại để áp dụng group
exit
# SSH lại vào instance
```

## 📥 Bước 3: Clone Project

```bash
# Clone repository
git clone https://github.com/ly01dev/web-trailer-film-youtube.git
cd web-trailer-film-youtube

# Cấp quyền thực thi cho script deploy
chmod +x deploy.sh
```

## ⚙️ Bước 4: Cấu hình Environment

### Tạo file .env cho backend

```bash
cd backend
cp env.example .env
nano .env
```

Cấu hình file `.env`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/phim-youtube?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Cấu hình Frontend API URL

```bash
cd ../frontend/src/services
nano api.js
```

Chỉnh sửa:

```javascript
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-domain.com/api"
    : "http://localhost:5000/api";
```

## 🔒 Bước 5: Cấu hình Security Group

### Mở ports cần thiết

1. Vào AWS Console → EC2 → Security Groups
2. Chọn Security Group của instance
3. Thêm rules:
   - **SSH (22)**: Source 0.0.0.0/0 (hoặc IP của bạn)
   - **HTTP (80)**: Source 0.0.0.0/0
   - **HTTPS (443)**: Source 0.0.0.0/0

## 🚀 Bước 6: Deploy

```bash
# Deploy production
./deploy.sh production

# Hoặc deploy thủ công
docker-compose up -d --build
```

## 🌐 Bước 7: Cấu hình Cloudflare

### 1. Thêm Domain vào Cloudflare

1. Đăng nhập Cloudflare
2. Add Site → Nhập domain của bạn
3. Chọn plan (Free plan đủ dùng)
4. Cập nhật nameservers tại domain registrar

### 2. Cấu hình DNS Records

Thêm A record:

- **Type**: A
- **Name**: @ (hoặc domain chính)
- **Content**: Public IP của EC2 instance
- **Proxy status**: Proxied (orange cloud)

Thêm CNAME record (nếu cần):

- **Type**: CNAME
- **Name**: www
- **Content**: your-domain.com
- **Proxy status**: Proxied

### 3. Cấu hình SSL/TLS

1. Vào SSL/TLS → Overview
2. Chọn "Full (strict)" mode
3. Vào Edge Certificates → Enable "Always Use HTTPS"

### 4. Cấu hình Page Rules (Optional)

Tạo page rule để redirect HTTP → HTTPS:

- **URL**: http://your-domain.com/*
- **Settings**: Always Use HTTPS

## 🔧 Bước 8: Cấu hình Nginx cho Production

### Tạo nginx config cho production

```bash
mkdir -p nginx
nano nginx/nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL Configuration (Cloudflare sẽ handle SSL)
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;

        # Frontend
        location / {
            proxy_pass http://frontend:80;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Rate limiting
            limit_req zone=api burst=20 nodelay;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Cập nhật docker-compose.yml

```bash
nano docker-compose.yml
```

Thêm nginx service:

```yaml
# Nginx Reverse Proxy
nginx:
  image: nginx:alpine
  container_name: phim-youtube-nginx
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  depends_on:
    - frontend
    - backend
  networks:
    - phim-youtube-network
```

## 🔄 Bước 9: Deploy với Nginx

```bash
# Deploy với nginx
docker-compose --profile production up -d --build
```

## 🔍 Bước 10: Kiểm tra

### Kiểm tra services

```bash
# Kiểm tra containers
docker-compose ps

# Kiểm tra logs
docker-compose logs -f

# Test endpoints
curl http://localhost/health
curl http://localhost/api/health
```

### Kiểm tra domain

```bash
# Test domain
curl -I https://your-domain.com
curl -I https://your-domain.com/api/health
```

## 📊 Bước 11: Monitoring

### Cài đặt monitoring tools

```bash
# Cài đặt htop
sudo apt install htop

# Cài đặt nginx status
sudo apt install nginx-extras
```

### Script monitoring

```bash
nano monitor.sh
```

```bash
#!/bin/bash
echo "=== System Resources ==="
free -h
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Docker Containers ==="
docker-compose ps
echo ""
echo "=== Recent Logs ==="
docker-compose logs --tail=10
```

```bash
chmod +x monitor.sh
./monitor.sh
```

## 🔒 Bước 12: Bảo mật

### Cấu hình firewall

```bash
# Cài đặt UFW
sudo apt install ufw

# Cấu hình firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Backup script

```bash
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup/$DATE
docker cp phim-youtube-mongodb:/data/backup/$DATE $BACKUP_DIR/

# Backup uploads
docker cp phim-youtube-backend:/app/uploads $BACKUP_DIR/uploads_$DATE

echo "Backup completed: $BACKUP_DIR"
```

```bash
chmod +x backup.sh
```

## 🆘 Troubleshooting

### Container không start

```bash
# Xem logs chi tiết
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Kiểm tra port conflicts
sudo netstat -tlnp | grep -E ':(80|443|5000)'
```

### Domain không hoạt động

1. Kiểm tra DNS propagation: https://www.whatsmydns.net/
2. Kiểm tra Cloudflare proxy status
3. Kiểm tra SSL/TLS settings
4. Kiểm tra nginx logs: `docker-compose logs nginx`

### Performance issues

```bash
# Kiểm tra resource usage
docker stats

# Kiểm tra nginx performance
docker-compose exec nginx nginx -t
```

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs`
2. Kiểm tra Cloudflare status
3. Kiểm tra EC2 instance status
4. Tạo issue trên GitHub với logs

---

**Lưu ý quan trọng:**

- Thay đổi tất cả passwords và secrets
- Backup database thường xuyên
- Monitor resource usage
- Cập nhật security patches
