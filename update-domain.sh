#!/bin/bash

# Script cập nhật domain cho ứng dụng Phim YouTube
# Usage: ./update-domain.sh your-domain.com

if [ $# -eq 0 ]; then
    echo "❌ Vui lòng cung cấp domain!"
    echo "Usage: ./update-domain.sh your-domain.com"
    exit 1
fi

DOMAIN=$1
echo "🔧 Đang cập nhật domain: $DOMAIN"

# Cập nhật nginx.conf
echo "📝 Cập nhật nginx.conf..."
sed -i "s/your-domain.com/$DOMAIN/g" frontend/nginx.conf

# Cập nhật docker-compose.yml
echo "📝 Cập nhật docker-compose.yml..."
sed -i "s/your-domain.com/$DOMAIN/g" docker-compose.yml

# Cập nhật env.example
echo "📝 Cập nhật env.example..."
sed -i "s/your-domain.com/$DOMAIN/g" backend/env.example

# Tạo .env từ env.example nếu chưa có
if [ ! -f "backend/.env" ]; then
    echo "📝 Tạo file .env từ env.example..."
    cp backend/env.example backend/.env
    echo "⚠️  Vui lòng chỉnh sửa JWT_SECRET trong backend/.env!"
fi

echo "✅ Cập nhật domain hoàn tất!"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Chỉnh sửa JWT_SECRET trong backend/.env"
echo "2. Cấu hình DNS records trong Cloudflare:"
echo "   - A record: @ -> EC2 Public IP"
echo "   - CNAME record: www -> $DOMAIN"
echo "3. Chạy: docker-compose down && docker-compose up -d --build"
echo "4. Kiểm tra: https://$DOMAIN" 