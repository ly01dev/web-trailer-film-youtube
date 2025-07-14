# 🎬 Phim YouTube - Web Trailer Film

Ứng dụng web xem phim và trailer từ YouTube với giao diện đẹp mắt và tính năng quản lý nội dung.

## ✨ Tính năng chính

### 👥 Người dùng

- **Xem phim/trailer**: Giao diện đẹp mắt với video player tích hợp
- **Tìm kiếm & lọc**: Tìm kiếm theo tên, lọc theo thể loại
- **Infinite scroll**: Tải thêm phim tự động khi cuộn
- **Responsive**: Tương thích với mọi thiết bị

### 🔐 Xác thực

- **Đăng ký/Đăng nhập**: Hệ thống xác thực an toàn
- **Phân quyền**: User, Moderator, Admin
- **JWT Token**: Bảo mật session

### 👨‍💼 Admin Dashboard

- **Quản lý User**: Thay đổi role, xóa user
- **Duyệt phim**: Phê duyệt/từ chối phim upload
- **Quản lý nội dung**: Xem, xóa phim
- **Thống kê**: Số liệu chi tiết về users và phim

### 📤 Upload & Quản lý

- **Upload phim**: Chỉ admin/moderator
- **Quản lý upload**: Xem danh sách phim đã upload
- **Chỉnh sửa**: Cập nhật thông tin phim

## 🛠️ Công nghệ sử dụng

### Frontend

- **React 18** - UI Framework
- **React Router** - Routing
- **Bootstrap 5** - CSS Framework
- **Vite** - Build tool
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **CORS** - Cross-origin

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js (v16+)
- MongoDB
- Git

### Backend

```bash
cd backend
npm install
cp env.example .env
# Chỉnh sửa .env với thông tin database
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Biến môi trường (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/phim-youtube
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 📁 Cấu trúc dự án

```
phim-youtube/
├── backend/
│   ├── controllers/     # Logic xử lý
│   ├── middleware/      # Middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utilities
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── hooks/      # Custom hooks
│   │   └── contexts/   # React contexts
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Auth

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin user

### Movies

- `GET /api/movies` - Lấy danh sách phim
- `POST /api/movies` - Upload phim (Admin/Mod)
- `PUT /api/movies/:id/status` - Cập nhật trạng thái
- `DELETE /api/movies/:id` - Xóa phim

### Users (Admin)

- `GET /api/users` - Lấy danh sách users
- `PUT /api/users/:id/role` - Cập nhật role
- `DELETE /api/users/:id` - Xóa user

## 👨‍💻 Tác giả

**Ly01Dev** - [GitHub](https://github.com/ly01dev)

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Liên hệ

- GitHub: [@ly01dev](https://github.com/ly01dev)
- Email: [your-email@example.com]

---

⭐ Nếu dự án này hữu ích, hãy cho tôi một star nhé!
