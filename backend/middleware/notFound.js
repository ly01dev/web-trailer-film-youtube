/**
 * Not Found Middleware
 * Xử lý khi không tìm thấy route (404 error)
 * Được gọi khi user truy cập vào URL không tồn tại
 */

/**
 * Middleware xử lý 404 error
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const notFound = (req, res, next) => {
  // Log thông tin về request không tìm thấy
  console.log(`⚠️  404 Not Found: ${req.method} ${req.originalUrl}`);
  console.log(`   IP: ${req.ip}`);
  console.log(`   User-Agent: ${req.get('User-Agent')}`);
  console.log(`   Headers:`, req.headers);
  
  // Tạo lỗi 404 với thông tin chi tiết
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true; // Đánh dấu đây là lỗi có thể xử lý được
  
  // Set status code cho response
  res.status(404);
  
  // Chuyển lỗi cho errorHandler middleware xử lý
  next(error);
};

module.exports = notFound; 