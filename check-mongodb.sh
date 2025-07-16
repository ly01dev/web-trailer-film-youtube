#!/bin/bash

echo "🔍 Checking MongoDB connection on AWS EC2..."

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

echo "🔑 Connecting to EC2 and checking MongoDB..."

# SSH into EC2 and check MongoDB
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'EOF'
    echo "📁 Navigating to project directory..."
    cd web-trailer-film-youtube
    
    echo "🐳 Checking Docker containers status..."
    docker-compose ps
    
    echo "🔍 Checking MongoDB container logs..."
    docker-compose logs mongodb --tail=20
    
    echo "🔗 Testing MongoDB connection..."
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
    
    echo "📊 Checking databases..."
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('listDatabases')"
    
    echo "📋 Checking collections in phim-youtube database..."
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.getCollectionNames()"
    
    echo "👥 Checking users count..."
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.users.countDocuments()"
    
    echo "🎬 Checking movies count..."
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.movies.countDocuments()"
    
    echo "🔧 Checking backend logs..."
    docker-compose logs backend --tail=10
EOF

echo "✅ MongoDB check completed!" 