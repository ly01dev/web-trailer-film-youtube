/**
 * Authentication Middleware
 * Xử lý xác thực JWT token và kiểm tra quyền truy cập
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Bảo vệ các routes yêu cầu đăng nhập
 * Kiểm tra và xác thực access token từ cookies hoặc headers
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const protect = async (req, res, next) => {
  let token;

  console.log('Cookies received:', req.cookies);
  console.log('Headers received:', req.headers);

  // Kiểm tra access token từ cookies trước
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
    console.log('Token found in cookies:', token.substring(0, 20) + '...');
  }
  // Fallback: kiểm tra từ header Authorization (cho Postman testing)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in headers:', token.substring(0, 20) + '...');
  }

  if (!token) {
    console.log('No token found');
    return res.status(401).json({
      success: false,
      message: 'Không được phép, thiếu token'
    });
  }

  try {
    // Xác thực JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong database dựa trên userId từ token
    req.user = await User.findById(decoded.userId).select('-password');

    // Kiểm tra user có tồn tại không
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra user ID trong token có khớp với user hiện tại không
    if (req.user._id.toString() !== decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ cho user này',
        code: 'INVALID_USER_TOKEN'
      });
    }

    // Nếu mọi thứ OK, chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    // Chỉ log trong development, không log trong production
    if (process.env.NODE_ENV === 'development') {
      console.error('Lỗi xác thực token:', error);
    }
    
    // Kiểm tra xem token có hết hạn không
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token đã hết hạn. Vui lòng refresh token.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Các lỗi khác (token không hợp lệ, sai format, etc.)
    return res.status(401).json({
      success: false,
      message: 'Không được phép, token không hợp lệ'
    });
  }
};

/**
 * Middleware: Kiểm tra quyền admin
 * Chỉ cho phép user có role = 'admin' truy cập
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Cho phép truy cập
  } else {
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Yêu cầu quyền admin.'
    });
  }
};

/**
 * Middleware: Kiểm tra quyền moderator hoặc admin
 * Cho phép user có role = 'moderator' hoặc 'admin' truy cập
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const moderator = (req, res, next) => {
  if (req.user && (req.user.role === 'moderator' || req.user.role === 'admin')) {
    next(); // Cho phép truy cập
  } else {
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Yêu cầu quyền moderator.'
    });
  }
};

module.exports = { protect, admin, moderator }; 