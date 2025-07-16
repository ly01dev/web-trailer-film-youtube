# Cloudflare HTTPS Setup Guide

## Vấn đề hiện tại

HTTPS API endpoint không hoạt động do cấu hình Cloudflare SSL chưa đúng.

## Các bước fix HTTPS API

### 1. Cấu hình SSL/TLS trong Cloudflare

1. Đăng nhập vào Cloudflare Dashboard
2. Chọn domain `film8x.xyz`
3. Vào tab **SSL/TLS**
4. Cấu hình như sau:

#### SSL/TLS encryption mode:

- Chọn **"Full (strict)"** thay vì "Flexible"
- Điều này sẽ yêu cầu server có SSL certificate hợp lệ

#### Edge Certificates:

- Bật **"Always Use HTTPS"**
- Bật **"Minimum TLS Version"** và chọn **"TLS 1.2"**
- Bật **"Opportunistic Encryption"**
- Bật **"TLS 1.3"**

### 2. Cấu hình Page Rules

Tạo Page Rules để đảm bảo API hoạt động đúng:

1. Vào tab **Page Rules**
2. Tạo rule mới:
   - **URL Pattern**: `film8x.xyz/api/*`
   - **Settings**:
     - SSL: **Full (strict)**
     - Cache Level: **Bypass**
     - Security Level: **Medium**

### 3. Cấu hình DNS

Đảm bảo DNS records đúng:

1. Vào tab **DNS**
2. Kiểm tra các records:

   ```
   Type: A
   Name: film8x.xyz
   Content: [Your EC2 IP]
   Proxy status: Proxied (orange cloud)

   Type: A
   Name: www.film8x.xyz
   Content: [Your EC2 IP]
   Proxy status: Proxied (orange cloud)
   ```

### 4. Cấu hình Security

1. Vào tab **Security**
2. **Security Level**: Medium
3. **Challenge Passage**: 30 minutes
4. **Browser Integrity Check**: On

### 5. Cấu hình Caching

1. Vào tab **Caching**
2. **Configuration**:
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
   - Always Online: On

### 6. Purge Cache

Sau khi thay đổi cấu hình:

1. Vào tab **Caching**
2. Click **"Configuration"**
3. Click **"Purge Everything"**

## Test sau khi cấu hình

### Test từ local:

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://film8x.xyz/api/health

# Test HTTPS
curl -I https://film8x.xyz/api/health

# Test frontend
curl -I https://film8x.xyz/
```

### Test từ browser:

1. Mở https://film8x.xyz
2. Mở Developer Tools (F12)
3. Vào tab Network
4. Refresh page và kiểm tra các API calls

## Troubleshooting

### Nếu vẫn lỗi 521:

1. Kiểm tra EC2 security group có mở port 443
2. Kiểm tra containers đang chạy: `docker-compose ps`
3. Restart containers: `docker-compose restart`

### Nếu lỗi CORS:

1. Kiểm tra CORS headers trong Network tab
2. Đảm bảo origin đúng trong backend CORS config

### Nếu lỗi SSL:

1. Đảm bảo Cloudflare SSL mode là "Full (strict)"
2. Kiểm tra nginx SSL configuration
3. Restart nginx container

## Lưu ý quan trọng

- **SSL Mode**: Phải dùng "Full (strict)" để HTTPS API hoạt động
- **Cache**: API endpoints nên bypass cache
- **Headers**: Đảm bảo CORS headers được gửi đúng
- **DNS**: Tất cả subdomains phải được proxy qua Cloudflare
