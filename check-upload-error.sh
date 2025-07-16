#!/bin/bash

echo "🔍 Checking upload error on AWS EC2..."

# Configuration
EC2_IP="13.229.113.215"
EC2_USER="ec2-user"
KEY_PATH="./aws-key.pem"

echo "📋 Configuration:"
echo "   EC2 IP: $EC2_IP"
echo "   User: $EC2_USER"
echo "   Key: $KEY_PATH"

# Check if key file exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: Key file not found at $KEY_PATH"
    exit 1
fi

echo "🔑 Connecting to EC2 and checking upload error..."

# SSH into EC2 and check
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'EOF'
    echo "📁 Navigating to project directory..."
    cd web-trailer-film-youtube
    
    echo "🐳 Checking container status..."
    docker-compose ps
    
    echo "🔧 Checking backend logs..."
    docker-compose logs backend --tail=20
    
    echo "📊 Checking API health..."
    curl -f http://localhost:5000/api/health || echo "❌ Backend health check failed"
    
    echo "🔍 Checking uploads directory..."
    docker-compose exec backend ls -la /app/uploads
    
    echo "📋 Checking backend environment..."
    docker-compose exec backend env | grep -E "(MONGODB|JWT|NODE_ENV)"
    
    echo "✅ Upload error check completed!"
EOF

echo "🎉 Upload error check completed!" 