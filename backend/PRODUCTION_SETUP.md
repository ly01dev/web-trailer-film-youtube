# 🚀 Production Setup Guide

## 📋 Checklist trước khi Deploy

### 1. Environment Variables (.env)

```env
# ===== CẤU HÌNH DATABASE =====
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/movietube

# ===== CẤU HÌNH JWT TOKENS =====
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ACCESS_TOKEN=your-access-token-secret-key
REFRESH_TOKEN=your-refresh-token-secret-key

# ===== THỜI GIAN HẾT HẠN TOKENS =====
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# ===== CẤU HÌNH BẢO MẬT =====
BCRYPT_ROUNDS=12

# ===== CẤU HÌNH RATE LIMITING =====
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===== CẤU HÌNH CORS =====
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# ===== CẤU HÌNH SERVER =====
PORT=5000
NODE_ENV=production
```

### 2. Security Checklist

- [ ] Thay đổi tất cả secret keys
- [ ] Sử dụng MongoDB Atlas (cloud database)
- [ ] Cấu hình CORS cho domain thực tế
- [ ] Bật rate limiting
- [ ] Kiểm tra HTTPS
- [ ] Backup database

### 3. Performance Checklist

- [ ] Enable compression
- [ ] Setup caching
- [ ] Optimize database queries
- [ ] Monitor logs

### 4. Monitoring Checklist

- [ ] Setup error tracking (Sentry)
- [ ] Setup logging (Winston)
- [ ] Setup health checks
- [ ] Setup uptime monitoring

## 🔐 Security Best Practices

### JWT Secrets

- Sử dụng ít nhất 32 ký tự
- Kết hợp chữ hoa, chữ thường, số, ký tự đặc biệt
- Không commit vào git

### Database

- Sử dụng MongoDB Atlas
- Enable network access control
- Setup database user với quyền hạn chế

### CORS

- Chỉ cho phép domain thực tế
- Không sử dụng wildcard (\*)
- Test kỹ trước khi deploy

## 🚀 Deploy Commands

```bash
# Install dependencies
npm install --production

# Start server
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start server.js --name movietube-api
pm2 save
pm2 startup
```

## 📊 Monitoring

```bash
# Check server status
pm2 status

# View logs
pm2 logs movietube-api

# Monitor resources
pm2 monit
```
