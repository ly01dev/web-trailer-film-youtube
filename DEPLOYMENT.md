# 🚀 Hướng dẫn Deploy lên VPS

Hướng dẫn chi tiết để deploy ứng dụng Phim YouTube lên VPS sử dụng Docker.

## 📋 Yêu cầu hệ thống

### VPS Requirements

- **OS**: Ubuntu 20.04+ hoặc CentOS 8+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Storage**: Tối thiểu 20GB
- **CPU**: 2 cores trở lên

### Software Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🔧 Cài đặt Docker trên VPS

### Ubuntu/Debian

```bash
# Cập nhật package list
sudo apt update

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
```

### CentOS/RHEL

```bash
# Cài đặt dependencies
sudo yum install -y yum-utils

# Thêm Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Cài đặt Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Khởi động Docker
sudo systemctl start docker
sudo systemctl enable docker

# Thêm user vào docker group
sudo usermod -aG docker $USER
```

## 📥 Clone và Setup Project

```bash
# Clone repository
git clone https://github.com/ly01dev/web-trailer-film-youtube.git
cd web-trailer-film-youtube

# Cấp quyền thực thi cho script deploy
chmod +x deploy.sh
```

## ⚙️ Cấu hình Environment

### 1. Tạo file .env cho backend

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
CORS_ORIGIN=http://your-domain.com,http://www.your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Cấu hình Frontend API URL

Chỉnh sửa file `frontend/src/services/api.js`:

```javascript
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://your-domain.com/api"
    : "http://localhost:5000/api";
```

## 🚀 Deploy

### Deploy Development

```bash
./deploy.sh development
```

### Deploy Production

```bash
./deploy.sh production
```

### Deploy thủ công

```bash
# Build và start containers
docker-compose up -d --build

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f
```

## 🔍 Kiểm tra Deployment

### Kiểm tra services

```bash
# Kiểm tra containers đang chạy
docker-compose ps

# Kiểm tra logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Kiểm tra health endpoints
curl http://localhost:5000/health
curl http://localhost:80/health
```

### Kiểm tra ports

```bash
# Kiểm tra ports đang listen
sudo netstat -tlnp | grep -E ':(80|5000|27017)'
```

## 🔧 Quản lý ứng dụng

### Restart services

```bash
# Restart tất cả
docker-compose restart

# Restart service cụ thể
docker-compose restart backend
docker-compose restart frontend
```

### Update ứng dụng

```bash
# Pull code mới
git pull origin main

# Rebuild và restart
docker-compose down
docker-compose up -d --build
```

### Backup database

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)

# Copy backup ra host
docker cp phim-youtube-mongodb:/data/backup ./backup
```

### Restore database

```bash
# Copy backup vào container
docker cp ./backup phim-youtube-mongodb:/data/

# Restore
docker-compose exec mongodb mongorestore /data/backup/
```

## 🔒 Bảo mật Production

### 1. Firewall

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

### 2. SSL/HTTPS với Let's Encrypt

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Thêm dòng: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Cập nhật JWT Secret

```bash
# Tạo secret mạnh
openssl rand -base64 32

# Cập nhật trong .env
JWT_SECRET=your-generated-secret-here
```

## 📊 Monitoring

### Resource usage

```bash
# Xem resource usage
docker stats

# Xem disk usage
docker system df
```

### Logs

```bash
# Xem logs real-time
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
```

## 🆘 Troubleshooting

### Container không start

```bash
# Xem logs chi tiết
docker-compose logs backend

# Kiểm tra port conflicts
sudo netstat -tlnp | grep :5000
```

### Database connection issues

```bash
# Kiểm tra MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Kiểm tra network
docker network ls
docker network inspect phim-youtube_phim-youtube-network
```

### Frontend không load

```bash
# Kiểm tra nginx config
docker-compose exec frontend nginx -t

# Kiểm tra static files
docker-compose exec frontend ls -la /usr/share/nginx/html
```

## 📞 Support

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs: `docker-compose logs`
2. Kiểm tra status: `docker-compose ps`
3. Tạo issue trên GitHub với logs và error messages

---

**Lưu ý**: Đảm bảo thay đổi tất cả passwords và secrets trong production!
