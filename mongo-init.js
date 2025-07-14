// Khởi tạo database và user admin
db = db.getSiblingDB('phim-youtube');

// Tạo user admin cho database
db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    { role: 'readWrite', db: 'phim-youtube' },
    { role: 'dbAdmin', db: 'phim-youtube' }
  ]
});

// Tạo collections cần thiết
db.createCollection('users');
db.createCollection('movies');

// Tạo indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.movies.createIndex({ "slug": 1 }, { unique: true });
db.movies.createIndex({ "youtubeId": 1 });
db.movies.createIndex({ "category": 1 });
db.movies.createIndex({ "status": 1 });
db.movies.createIndex({ "uploadedBy": 1 });

print('MongoDB initialized successfully!'); 