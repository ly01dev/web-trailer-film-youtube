#!/bin/bash

echo "🚀 Importing data to AWS EC2..."

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

echo "🔑 Connecting to EC2 and importing data..."

# SSH into EC2 and import data
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'EOF'
    echo "📁 Navigating to project directory..."
    cd web-trailer-film-youtube
    
    echo "🔍 Checking current database status..."
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.movies.countDocuments()" --quiet
    
    echo "📁 Checking if movies.json exists in backend directory..."
    ls -la backend/movies.json
    
    echo "📥 Importing movies data..."
    docker-compose exec backend node backend/import-movies.js
    
    echo "👤 Creating admin user..."
    docker-compose exec backend node backend/create-test-user.js
    
    echo "✅ Data import completed!"
    echo "📊 Final database status:"
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.movies.countDocuments()" --quiet
    docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.users.countDocuments()" --quiet
EOF

echo "🎉 Data import completed!"
echo "🌐 Check your website at: https://film8x.xyz" 