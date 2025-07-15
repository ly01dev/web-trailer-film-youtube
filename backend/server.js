/**
 * Server chính của ứng dụng MovieTube
 * Khởi tạo Express server với các middleware bảo mật, CORS, rate limiting
 * Kết nối database và định nghĩa các routes API
 */

// ===== IMPORT CÁC THƯ VIỆN CẦN THIẾT =====
const express = require('express');           // Framework web chính cho Node.js
const cors = require('cors');                 // Middleware cho phép frontend truy cập API từ domain khác
const helmet = require('helmet');             // Middleware bảo mật - thêm HTTP headers bảo vệ
const morgan = require('morgan');             // Middleware logging - ghi log HTTP requests
const rateLimit = require('express-rate-limit'); // Middleware giới hạn số request từ mỗi IP
const cookieParser = require('cookie-parser'); // Middleware parse cookies từ request headers
const dotenv = require('dotenv');             // Thư viện đọc file .env

// ===== CẤU HÌNH MÔI TRƯỜNG =====
dotenv.config(); // Đọc file .env và load biến môi trường

// ===== IMPORT CÁC ROUTES =====
const authRoutes = require('./routes/auth');      // API: đăng ký, đăng nhập, đăng xuất, quản lý user
const movieRoutes = require('./routes/movies');   // API: quản lý phim (CRUD)
const userRoutes = require('./routes/users');     // API: quản lý profile user

// ===== IMPORT MIDDLEWARE XỬ LÝ LỖI =====
const errorHandler = require('./middleware/errorHandler'); // Xử lý tất cả lỗi chung
const notFound = require('./middleware/notFound');         // Xử lý 404 error

// ===== IMPORT KẾT NỐI DATABASE =====
const { connectDB } = require('./utils/database'); // Kết nối MongoDB

// ===== KHỞI TẠO ỨNG DỤNG =====
const app = express();

// ===== KẾT NỐI DATABASE =====
connectDB(); // Kết nối MongoDB

// ===== MIDDLEWARE BẢO MẬT =====

/**
 * Helmet: Thêm HTTP headers bảo mật
 * Tạm thời tắt để debug
 */
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//       connectSrc: ["'self'"],
//       fontSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
// }));

/**
 * Rate Limiting: Giới hạn số request từ mỗi IP
 * Chỉ áp dụng trong production để tránh spam và DDoS
 * Tạm thời tắt để debug
 */
// if (process.env.NODE_ENV === 'production') {
//   const limiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 request/15 phút
//     message: {
//       error: 'Quá nhiều request từ IP này, vui lòng thử lại sau.'
//     }
//   });
//   app.use('/api/', limiter);
// }

/**
 * CORS: Cho phép frontend truy cập API từ domain khác
 * Tạm thời cho phép tất cả origins để debug
 */
app.use(cors({
  origin: true, // Cho phép tất cả origins
  credentials: true, // Cho phép gửi cookies (cần cho authentication)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ===== MIDDLEWARE XỬ LÝ DỮ LIỆU =====

/**
 * Parse JSON data từ request body (giới hạn 10MB)
 * Khi frontend gửi JSON, middleware này parse thành object
 */
app.use(express.json({ limit: '10mb' }));

/**
 * Parse URL-encoded data (form data)
 * Khi frontend gửi form, middleware này parse thành object
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Parse cookies từ request headers
 * Khi browser gửi cookies, middleware này parse thành req.cookies
 */
app.use(cookieParser());

/**
 * Logging: Chỉ log HTTP requests trong development
 * Format: GET /api/auth/login 200 15.234 ms - 1.2kb
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== ĐỊNH NGHĨA ROUTES =====

/**
 * Health check endpoint
 * Kiểm tra server có hoạt động không
 * GET http://localhost:5000/health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MovieTube API đang hoạt động',
    timestamp: new Date().toISOString()
  });
});

/**
 * Định nghĩa các routes API chính
 * Mỗi route có prefix riêng để tổ chức code
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Test route để debug
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API test route works!' });
});

// Simple test route
app.get('/simple', (req, res) => {
  res.status(200).json({ message: 'Simple route works!' });
});

app.use('/api/auth', authRoutes);    // /api/auth/ (đăng ký, đăng nhập, etc.)
app.use('/api/movies', movieRoutes); // /api/movies/ (quản lý phim)

// ===== XỬ LÝ LỖI =====

/**
 * Middleware xử lý route không tồn tại (404)
 * Phải đặt trước errorHandler
 */
app.use(notFound);

/**
 * Middleware xử lý tất cả lỗi chung
 * Phải đặt cuối cùng để bắt tất cả lỗi
 */
app.use(errorHandler);

// ===== KHỞI ĐỘNG SERVER =====

const PORT = process.env.PORT || 5000;

/**
 * Khởi động server
 * Xử lý lỗi port đã được sử dụng
 */
app.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} đã được sử dụng. Vui lòng tắt process khác hoặc chọn port khác.`);
      process.exit(1);
    } else {
      console.error('❌ Lỗi khởi động server:', err);
      process.exit(1);
    }
  }
  
  // Log thông tin khi server khởi động thành công
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📊 Môi trường: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// ===== XỬ LÝ LỖI KHÔNG ĐƯỢC HANDLE =====

/**
 * Bắt các lỗi Promise không được xử lý
 * Tránh server crash mà không có thông báo
 */
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Lỗi Promise không được xử lý: ${err.message}`);
  console.log(`📍 Promise:`, promise);
  // server.close(() => process.exit(1));
}); 