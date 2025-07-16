# Cloudflare Page Rules & Cache Purge Guide

## 🎯 Mục tiêu

- Tạo Page Rule cho `/api/*` để bypass cache
- Purge cache để áp dụng thay đổi mới

## 📋 Bước 1: Tạo Page Rule

### 1.1 Đăng nhập Cloudflare

- Mở: https://dash.cloudflare.com
- Chọn domain: `film8x.xyz`

### 1.2 Vào Page Rules

- Menu trái → **"Page Rules"**
- Click **"Create Page Rule"**

### 1.3 Cấu hình URL Pattern

```
URL Pattern: film8x.xyz/api/*
```

**Lưu ý:** Dấu `*` ở cuối để match tất cả API endpoints

### 1.4 Thêm Settings

#### Setting 1: SSL/TLS Encryption Mode

- Click **"Add a Setting"**
- Chọn **"SSL/TLS Encryption Mode"**
- Chọn **"Full (strict)"**
- **Lý do:** Đảm bảo HTTPS hoạt động đúng

#### Setting 2: Cache Level

- Click **"Add a Setting"**
- Chọn **"Cache Level"**
- Chọn **"Bypass Cache"**
- **Lý do:** API không nên bị cache để luôn có data mới nhất

#### Setting 3: Security Level

- Click **"Add a Setting"**
- Chọn **"Security Level"**
- Chọn **"Medium"**
- **Lý do:** Bảo vệ vừa phải, không quá strict

#### Setting 4: Browser Cache TTL

- Click **"Add a Setting"**
- Chọn **"Browser Cache TTL"**
- Chọn **"Bypass"**
- **Lý do:** Browser không cache API responses

#### Setting 5: Always Online

- Click **"Add a Setting"**
- Chọn **"Always Online"**
- Chọn **"Off"**
- **Lý do:** API cần real-time data

### 1.5 Lưu Page Rule

- Click **"Save and Deploy"**
- Đợi status chuyển thành **"Active"**

## 🗑️ Bước 2: Purge Cache

### 2.1 Vào Caching

- Menu trái → **"Caching"**
- Click tab **"Configuration"**

### 2.2 Purge Everything (Khuyến nghị)

- Tìm section **"Purge Cache"**
- Click **"Purge Everything"**
- Xác nhận: **"Purge Everything"**

### 2.3 Hoặc Purge by URL

```
URL: https://film8x.xyz/api/*
```

### 2.4 Hoặc Purge by Hostname

```
Hostname: film8x.xyz
```

## ✅ Kiểm tra sau khi cấu hình

### Test từ browser:

1. Mở https://film8x.xyz
2. F12 → Network tab
3. Refresh page
4. Kiểm tra API calls có status 200

### Test từ terminal:

```bash
# Test API health
curl -I https://film8x.xyz/api/health

# Test API với data
curl https://film8x.xyz/api/test

# Test CORS
curl -I -X OPTIONS \
  -H "Origin: https://film8x.xyz" \
  -H "Access-Control-Request-Method: GET" \
  https://film8x.xyz/api/health
```

## 🔍 Troubleshooting

### Nếu Page Rule không hoạt động:

1. Kiểm tra URL Pattern có đúng không
2. Đợi 1-2 phút để rule được áp dụng
3. Purge cache lại

### Nếu vẫn lỗi 521:

1. Kiểm tra containers đang chạy
2. Restart containers
3. Kiểm tra SSL mode trong Cloudflare

### Nếu CORS lỗi:

1. Kiểm tra CORS headers trong Network tab
2. Đảm bảo origin đúng
3. Kiểm tra backend CORS config

## 📊 Monitoring

### Kiểm tra Page Rules:

- Vào **"Page Rules"** → Xem status **"Active"**

### Kiểm tra Analytics:

- Vào **"Analytics"** → **"Traffic"**
- Xem API requests có thành công không

### Kiểm tra Logs:

- Vào **"Logs"** → **"Requests"**
- Filter theo domain và API endpoints

## 🎯 Kết quả mong đợi

Sau khi cấu hình đúng:

- ✅ HTTPS API hoạt động bình thường
- ✅ Không có lỗi CORS
- ✅ API responses không bị cache
- ✅ SSL handshake thành công
- ✅ Không có lỗi 521 từ Cloudflare
