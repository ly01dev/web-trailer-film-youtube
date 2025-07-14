/**
 * User Model - Schema định nghĩa cấu trúc dữ liệu cho User
 * Bao gồm: thông tin cá nhân, authentication, role-based access control
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');

/**
 * Schema định nghĩa cấu trúc dữ liệu cho User
 * Bao gồm thông tin cá nhân, authentication, và các liên kết
 */
const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  username: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên người dùng không được quá 30 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    validate: {
      validator: function(password) {
        // Kiểm tra ít nhất 1 chữ hoa
        const hasUpperCase = /[A-Z]/.test(password);
        // Kiểm tra ít nhất 1 số
        const hasNumber = /\d/.test(password);
        // Kiểm tra ít nhất 1 ký tự đặc biệt
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpperCase && hasNumber && hasSpecialChar;
      },
      message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
    }
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Fields cho password reset
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // Tokens cho authentication
  accessToken: {
    type: String,
    default: process.env.ACCESS_TOKEN || ''
  },
  refreshToken: {
    type: String,
    default: process.env.REFRESH_TOKEN || ''
  },
  
  // Dữ liệu liên quan
  favorites: [{ // Danh sách phim yêu thích
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  watchHistory: [{ // Lịch sử xem phim
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastLogout: {
    type: Date,
    default: null
  },
  isLoggedOut: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

/**
 * Middleware: Mã hóa mật khẩu trước khi lưu
 * Chỉ mã hóa khi password được thay đổi
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method: So sánh mật khẩu với hash đã lưu
 * @param {string} candidatePassword - Mật khẩu cần kiểm tra
 * @returns {Promise<boolean>} - True nếu khớp, false nếu không
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method: Tạo reset token cho quên mật khẩu
 * @returns {string} - Reset token chưa mã hóa
 */
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Mã hóa token trước khi lưu vào database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Token hết hạn sau 15 phút
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  
  return resetToken;
};

/**
 * Method: Tạo access token (token ngắn hạn - 15 phút)
 * Chứa thông tin user để xác thực API calls
 * @returns {string} - JWT access token
 */
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    process.env.ACCESS_TOKEN || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
    }
  );
};

/**
 * Method: Tạo refresh token (token dài hạn - 7 ngày)
 * Dùng để refresh access token khi hết hạn
 * @returns {string} - JWT refresh token
 */
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id
    },
    process.env.REFRESH_TOKEN || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d'
    }
  );
};

/**
 * Method: Tạo cả access token và refresh token
 * @returns {Object} - Object chứa cả 2 tokens
 */
userSchema.methods.generateTokens = function() {
  const accessToken = this.generateAccessToken();
  const refreshToken = this.generateRefreshToken();
  
  return {
    accessToken,
    refreshToken
  };
};

/**
 * Method: Kiểm tra user có quyền admin không
 * @returns {boolean} - True nếu là admin
 */
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

/**
 * Method: Kiểm tra user có quyền moderator không
 * @returns {boolean} - True nếu là moderator hoặc admin
 */
userSchema.methods.isModerator = function() {
  return this.role === 'moderator' || this.role === 'admin';
};

/**
 * Method: Thêm phim vào danh sách yêu thích
 * @param {string} movieId - ID của phim
 */
userSchema.methods.addToFavorites = function(movieId) {
  if (!this.favorites.includes(movieId)) {
    this.favorites.push(movieId);
  }
};

/**
 * Method: Xóa phim khỏi danh sách yêu thích
 * @param {string} movieId - ID của phim
 */
userSchema.methods.removeFromFavorites = function(movieId) {
  this.favorites = this.favorites.filter(id => id.toString() !== movieId.toString());
};

/**
 * Method: Kiểm tra phim có trong danh sách yêu thích không
 * @param {string} movieId - ID của phim
 * @returns {boolean} - True nếu có trong favorites
 */
userSchema.methods.hasFavorite = function(movieId) {
  return this.favorites.some(id => id.toString() === movieId.toString());
};

/**
 * Method: Thêm phim vào lịch sử xem
 * @param {string} movieId - ID của phim
 */
userSchema.methods.addToWatchHistory = function(movieId) {
  // Xóa phim cũ khỏi lịch sử nếu đã có
  this.watchHistory = this.watchHistory.filter(
    item => item.movie.toString() !== movieId.toString()
  );
  
  // Thêm phim mới vào đầu danh sách
  this.watchHistory.unshift({
    movie: movieId,
    watchedAt: new Date()
  });
  
  // Giới hạn lịch sử chỉ 50 phim gần nhất
  if (this.watchHistory.length > 50) {
    this.watchHistory = this.watchHistory.slice(0, 50);
  }
};

module.exports = mongoose.model('User', userSchema); 