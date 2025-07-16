#!/bin/bash

echo "🔍 Testing MongoDB connection..."

ssh -i aws-key.pem ec2-user@13.229.113.215 << 'EOF'
cd web-trailer-film-youtube
echo "📊 Checking databases:"
docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('listDatabases')"
echo "📋 Checking collections:"
docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.getCollectionNames()"
echo "👥 Users count:"
docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.users.countDocuments()"
echo "🎬 Movies count:"
docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin phim-youtube --eval "db.movies.countDocuments()"
EOF 