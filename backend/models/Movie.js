/**
 * Movie Model - Schema định nghĩa cấu trúc dữ liệu cho Movie
 * Bao gồm: thông tin phim, metadata, user interactions, admin management
 */

const mongoose = require('mongoose');
const validator = require('validator');

/**
 * Schema định nghĩa cấu trúc dữ liệu cho Movie
 * Bao gồm thông tin phim, metadata, và các tương tác của user
 */
const movieSchema = new mongoose.Schema({
  // Thông tin cơ bản
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Thông tin YouTube
  youtubeUrl: {
    type: String,
    required: [true, 'YouTube URL is required'],
    validate: {
      validator: function(v) {
        return validator.isURL(v) && (v.includes('youtube.com') || v.includes('youtu.be'));
      },
      message: 'Please provide a valid YouTube URL'
    }
  },
  youtubeId: {
    type: String,
    required: [true, 'YouTube ID is required'],
    unique: true
  },
  thumbnail: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide a valid thumbnail URL'
    }
  },
  duration: {
    type: String,
    required: false,
    default: '0:00'
  },
  
  // Phân loại
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Action', 'Romance', 'Comedy', 'Horror', 'Sci-Fi', 'Animation', 'Documentary', 'Other']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Thống kê tương tác
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  
  // Đánh giá
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  
  // Thông tin upload
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'pending'
  },
  statusReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Status reason cannot exceed 500 characters']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  year: {
    type: Number,
    min: [1900, 'Year cannot be less than 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  director: {
    type: String,
    trim: true,
    maxlength: [100, 'Director name cannot exceed 100 characters']
  },
  cast: [{
    type: String,
    trim: true,
    maxlength: [100, 'Cast name cannot exceed 100 characters']
  }],
  
  // Tương tác user
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Lịch sử chỉnh sửa
  editHistory: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: String,
      required: true
    }
  }],
  
  // Like/Dislike tracking
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Ratings tracking
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

/**
 * Indexes để tối ưu hiệu suất truy vấn
 */
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ category: 1, status: 1 });
movieSchema.index({ uploadedBy: 1 });
movieSchema.index({ createdAt: -1 });

/**
 * Virtual: Tính điểm đánh giá trung bình
 * @returns {string} - Điểm đánh giá trung bình với 1 chữ số thập phân
 */
movieSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

/**
 * Method: Cập nhật đánh giá
 * @param {number} newRating - Điểm đánh giá mới (1-5)
 * @returns {Promise} - Promise khi lưu thành công
 */
movieSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.ratingCount) + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
  return this.save();
};

/**
 * Method: Tăng lượt xem
 * @returns {Promise} - Promise khi lưu thành công
 */
movieSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

/**
 * Method: Toggle like cho user
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Kết quả like và số lượng likes
 */
movieSchema.methods.toggleLike = async function(userId) {
  const userObjectId = mongoose.Types.ObjectId(userId);
  
  // Kiểm tra user đã like chưa
  const hasLiked = this.likedBy.includes(userObjectId);
  
  if (hasLiked) {
    // Nếu đã like thì unlike
    this.likedBy = this.likedBy.filter(id => id.toString() !== userId);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    // Nếu chưa like thì like
    this.likedBy.push(userObjectId);
    this.likes += 1;
    
    // Nếu user đã dislike thì bỏ dislike
    if (this.dislikedBy.includes(userObjectId)) {
      this.dislikedBy = this.dislikedBy.filter(id => id.toString() !== userId);
      this.dislikes = Math.max(0, this.dislikes - 1);
    }
  }
  
  await this.save();
  
  return {
    liked: !hasLiked,
    likes: this.likes
  };
};

/**
 * Method: Toggle dislike cho user
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Kết quả dislike và số lượng dislikes
 */
movieSchema.methods.toggleDislike = async function(userId) {
  const userObjectId = mongoose.Types.ObjectId(userId);
  
  // Kiểm tra user đã dislike chưa
  const hasDisliked = this.dislikedBy.includes(userObjectId);
  
  if (hasDisliked) {
    // Nếu đã dislike thì undislike
    this.dislikedBy = this.dislikedBy.filter(id => id.toString() !== userId);
    this.dislikes = Math.max(0, this.dislikes - 1);
  } else {
    // Nếu chưa dislike thì dislike
    this.dislikedBy.push(userObjectId);
    this.dislikes += 1;
    
    // Nếu user đã like thì bỏ like
    if (this.likedBy.includes(userObjectId)) {
      this.likedBy = this.likedBy.filter(id => id.toString() !== userId);
      this.likes = Math.max(0, this.likes - 1);
    }
  }
  
  await this.save();
  
  return {
    disliked: !hasDisliked,
    dislikes: this.dislikes
  };
};

/**
 * Method: Kiểm tra user đã like phim chưa
 * @param {string} userId - ID của user
 * @returns {boolean} - True nếu đã like
 */
movieSchema.methods.hasUserLiked = function(userId) {
  return this.likedBy.some(id => id.toString() === userId);
};

/**
 * Method: Kiểm tra user đã dislike phim chưa
 * @param {string} userId - ID của user
 * @returns {boolean} - True nếu đã dislike
 */
movieSchema.methods.hasUserDisliked = function(userId) {
  return this.dislikedBy.some(id => id.toString() === userId);
};

/**
 * Method: Lấy đánh giá của user
 * @param {string} userId - ID của user
 * @returns {number|null} - Điểm đánh giá hoặc null nếu chưa đánh giá
 */
movieSchema.methods.getUserRating = function(userId) {
  const rating = this.ratings.find(r => r.user.toString() === userId);
  return rating ? rating.rating : null;
};

module.exports = mongoose.model('Movie', movieSchema); 