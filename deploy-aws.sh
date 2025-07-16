#!/bin/bash

# Deploy script for AWS EC2
# Usage: ./deploy-aws.sh

echo "🚀 Starting deployment to AWS EC2..."

# Configuration - UPDATE THESE VALUES
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
    echo "Please make sure aws-key.pem is in the current directory"
    exit 1
fi

echo "🔑 Connecting to EC2 and deploying..."

# SSH into EC2 and deploy
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'EOF'
    echo "📁 Navigating to project directory..."
    cd web-trailer-film-youtube
    
    echo "📥 Pulling latest code from Git..."
    git pull origin main
    
    echo "🐳 Stopping containers..."
    docker-compose down
    
    echo "🔨 Rebuilding containers..."
    docker-compose up -d --build
    
    echo "✅ Deployment completed!"
    echo "🌐 Website should be available at: https://film8x.xyz"
    
    # Show container status
    echo "📊 Container status:"
    docker-compose ps
EOF

echo "🎉 Deployment script completed!"
echo "🌐 Check your website at: https://film8x.xyz" 