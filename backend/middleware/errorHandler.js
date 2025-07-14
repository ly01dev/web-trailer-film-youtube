/**
 * Error Handler Middleware
 * Xử lý tất cả lỗi chung cho toàn bộ ứng dụng
 * Được gọi khi có lỗi xảy ra trong các routes hoặc middleware khác
 */

/**
 * Middleware xử lý lỗi chung
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi để debug (chỉ trong development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error Details:');
    console.error('   Message:', err.message);
    console.error('   Stack:', err.stack);
    console.error('   URL:', req.originalUrl);
    console.error('   Method:', req.method);
    console.error('   IP:', req.ip);
  } else {
    // Log ngắn gọn trong production
    console.error('❌ Error:', err.message);
  }

  // ===== XỬ LÝ CÁC LOẠI LỖI MONGODB =====

  // Lỗi duplicate key (trùng lặp dữ liệu)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại trong hệ thống`;
    error = { message, statusCode: 400 };
  }

  // Lỗi validation (dữ liệu không hợp lệ)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Lỗi CastError (ID không hợp lệ)
  if (err.name === 'CastError') {
    const message = 'ID không hợp lệ';
    error = { message, statusCode: 400 };
  }

  // Lỗi MongoDB connection
  if (err.name === 'MongoNetworkError') {
    const message = 'Lỗi kết nối database';
    error = { message, statusCode: 503 };
  }

  // ===== XỬ LÝ CÁC LOẠI LỖI JWT =====

  // Lỗi token không hợp lệ
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: 401 };
  }

  // Lỗi token hết hạn
  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: 401 };
  }

  // ===== XỬ LÝ CÁC LOẠI LỖI KHÁC =====

  // Lỗi file upload
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File quá lớn';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'File không được hỗ trợ';
    error = { message, statusCode: 400 };
  }

  // Lỗi rate limiting
  if (err.status === 429) {
    const message = 'Quá nhiều request, vui lòng thử lại sau';
    error = { message, statusCode: 429 };
  }

  // ===== TRẢ VỀ RESPONSE LỖI =====

  const response = {
    success: false,
    error: error.message || 'Lỗi server nội bộ',
    timestamp: new Date().toISOString()
  };

  // Chỉ hiện stack trace trong development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.url = req.originalUrl;
    response.method = req.method;
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler; 