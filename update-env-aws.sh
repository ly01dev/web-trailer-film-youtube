#!/bin/bash

echo "🔄 Updating .env file on AWS EC2..."

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

echo "🔑 Connecting to EC2 and updating .env..."

# SSH into EC2 and update .env
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'EOF'
    echo "📁 Navigating to project directory..."
    cd web-trailer-film-youtube/backend
    
    echo "📝 Updating .env file with MongoDB Atlas..."
    cat > .env << 'ENV_CONTENT'
# Database Configuration
MONGODB_URI=mongodb+srv://lyhuuthanhtv:OyJgFuu02T4Ewi8O@cluster0.sgv9a1t.mongodb.net/web-phim-youtube?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://film8x.xyz,https://www.film8x.xyz

# Frontend URL (for password reset links)
FRONTEND_URL=https://film8x.xyz

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
ENV_CONTENT
    
    echo "✅ .env file updated successfully!"
    
    echo "🔄 Restarting containers with new configuration..."
    cd ..
    docker-compose down
    docker-compose up -d --build
    
    echo "⏳ Waiting for containers to be ready..."
    sleep 30
    
    echo "📊 Checking container status..."
    docker-compose ps
    
    echo "🎉 Update completed!"
EOF

echo "✅ Environment update completed!"
echo "🌐 Check your website at: https://film8x.xyz" 