# MovieTube Backend API

Backend API cho ứng dụng MovieTube - Website xem phim cộng đồng miễn phí tích hợp với YouTube.

## 🚀 Tính năng

- **Authentication**: Đăng ký, đăng nhập, refresh token, đăng xuất
- **User Management**: Quản lý profile, đổi mật khẩu
- **Movie Management**: CRUD operations cho phim
- **Security**: JWT authentication, password hashing, rate limiting
- **Database**: MongoDB với Mongoose ODM

## 📋 Yêu cầu hệ thống

- Node.js (version 14 trở lên)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd phim-youtube/backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment variables

```bash
# Copy file env.example thành .env
cp env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

### 4. Cấu hình MongoDB

- **Local MongoDB**: Đảm bảo MongoDB đang chạy trên localhost:27017
- **MongoDB Atlas**: Cập nhật MONGO_URI trong file .env

### 5. Chạy ứng dụng

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

## 🔧 Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend` với các biến sau:

```env
# Database
MONGO_URI=mongodb://localhost:27017/movietube

# JWT Secrets (thay đổi thành chuỗi ngẫu nhiên mạnh)
JWT_SECRET=your-super-secret-jwt-key
ACCESS_TOKEN=your-access-token-secret
REFRESH_TOKEN=your-refresh-token-secret

# Token Expiration
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

## 📚 API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/password` - Đổi mật khẩu

### Movie Routes

- `GET /api/movies` - Lấy danh sách phim
- `GET /api/movies/:id` - Lấy thông tin phim theo ID
- `POST /api/movies` - Tạo phim mới (Admin/Moderator)
- `PUT /api/movies/:id` - Cập nhật phim (Admin/Moderator)
- `DELETE /api/movies/:id` - Xóa phim (Admin)

### User Routes

- `GET /api/users` - Lấy danh sách users (Admin)
- `GET /api/users/:id` - Lấy thông tin user (Admin)
- `PUT /api/users/:id` - Cập nhật user (Admin)
- `DELETE /api/users/:id` - Xóa user (Admin)

## 🔐 Authentication

API sử dụng JWT (JSON Web Tokens) cho authentication:

1. **Access Token**: Token ngắn hạn (15 phút) để xác thực API calls
2. **Refresh Token**: Token dài hạn (7 ngày) để refresh access token

### Cách sử dụng:

```bash
# Thêm header Authorization vào request
Authorization: Bearer <access_token>
```

## 🏗️ Cấu trúc thư mục

```
backend/
├── controllers/          # Logic xử lý business
│   ├── authController.js
│   ├── movieController.js
│   └── userController.js
├── middleware/           # Middleware functions
│   ├── auth.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/              # Database models
│   ├── User.js
│   └── Movie.js
├── routes/              # API routes
│   ├── auth.js
│   ├── movies.js
│   └── users.js
├── utils/               # Utility functions
│   └── database.js
├── server.js            # Entry point
├── package.json
└── .env                 # Environment variables
```

## 🛡️ Bảo mật

- **Password Hashing**: Sử dụng bcrypt với salt rounds
- **JWT Tokens**: Access token và refresh token riêng biệt
- **Rate Limiting**: Giới hạn số request từ mỗi IP
- **CORS**: Chỉ cho phép domain được cấu hình
- **Helmet**: Bảo mật HTTP headers
- **Input Validation**: Validate dữ liệu đầu vào

## 🧪 Testing

```bash
# Chạy tests (sẽ implement sau)
npm test
```

## 📝 Logs

- **Development**: Sử dụng morgan để log HTTP requests
- **Production**: Log errors và important events

## 🚀 Deployment

### Heroku

```bash
# Tạo app trên Heroku
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub.
