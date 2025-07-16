/**
 * MovieController - Xử lý tất cả logic liên quan đến phim
 * Bao gồm: CRUD operations, search, filter, admin functions, user interactions
 */

const Movie = require('../models/Movie');

/**
 * Lấy danh sách phim với filter và pagination
 * GET /api/movies
 * @param {Object} req.query - { page, limit, category, search, status, exclude }
 * @returns {Object} Danh sách phim và pagination info
 */
const getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const status = req.query.status || 'active';
    const exclude = req.query.exclude;

    // Xây dựng query filter
    let query = { status };

    // Filter theo category
    if (category && category.trim()) {
      const categoryValue = category.trim();
      const categoryMap = {
        'action': 'Action',
        'comedy': 'Comedy', 
        'drama': 'Drama',
        'horror': 'Horror',
        'romance': 'Romance',
        'sci-fi': 'Sci-Fi',
        'thriller': 'Thriller',
        'animation': 'Animation',
        'documentary': 'Documentary',
        'other': 'Other'
      };
      
      query.category = categoryMap[categoryValue.toLowerCase()] || categoryValue;
    }

    // Filter theo search
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Loại trừ phim cụ thể
    if (exclude) {
      query._id = { $ne: exclude };
    }

    // Thực hiện query với pagination
    const movies = await Movie.find(query)
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Đếm tổng số phim
    const total = await Movie.countDocuments(query);

    res.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movies',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách phim nổi bật
 * GET /api/movies/featured
 * @returns {Object} Danh sách phim nổi bật
 */
const getFeaturedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ 
      status: 'active', 
      isFeatured: true 
    })
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Get featured movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured movies',
      error: error.message
    });
  }
};

/**
 * Lấy chi tiết phim theo ID
 * GET /api/movies/:id
 * @param {string} req.params.id - ID của phim
 * @returns {Object} Chi tiết phim và thông tin like/dislike
 */
const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('uploadedBy', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Tăng lượt xem
    await movie.incrementViews();

    // Thêm thông tin like/dislike của user hiện tại
    const movieData = movie.toObject();
    if (req.user) {
      movieData.hasLiked = movie.hasUserLiked(req.user.id);
      movieData.hasDisliked = movie.hasUserDisliked(req.user.id);
    } else {
      movieData.hasLiked = false;
      movieData.hasDisliked = false;
    }

    res.json({
      success: true,
      data: movieData
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movie',
      error: error.message
    });
  }
};

/**
 * Lấy chi tiết phim theo slug
 * GET /api/movies/slug/:slug
 * @param {string} req.params.slug - Slug của phim
 * @returns {Object} Chi tiết phim và thông tin like/dislike
 */
const getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug })
      .populate('uploadedBy', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Tăng lượt xem
    await movie.incrementViews();

    // Thêm thông tin like/dislike của user hiện tại
    const movieData = movie.toObject();
    if (req.user) {
      movieData.hasLiked = movie.hasUserLiked(req.user.id);
      movieData.hasDisliked = movie.hasUserDisliked(req.user.id);
    } else {
      movieData.hasLiked = false;
      movieData.hasDisliked = false;
    }

    res.json({
      success: true,
      data: movieData
    });
  } catch (error) {
    console.error('Get movie by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movie',
      error: error.message
    });
  }
};

/**
 * Tạo phim mới (chỉ admin/moderator)
 * POST /api/movies
 * @param {Object} req.body - Dữ liệu phim (title, description, youtubeId, etc.)
 * @returns {Object} Thông tin phim đã tạo
 */
const createMovie = async (req, res) => {
  try {
    // Kiểm tra quyền admin/moderator
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin và moderator mới có quyền tạo phim'
      });
    }

    const movieData = {
      ...req.body,
      uploadedBy: req.user.id
    };

    const movie = new Movie(movieData);
    await movie.save();

    // Populate thông tin uploader
    await movie.populate('uploadedBy', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Phim đã được tạo thành công',
      data: movie
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create movie',
      error: error.message
    });
  }
};

/**
 * Cập nhật phim (chỉ admin/moderator hoặc người upload)
 * PUT /api/movies/:id
 * @param {string} req.params.id - ID của phim
 * @param {Object} req.body - Dữ liệu cập nhật
 * @returns {Object} Thông tin phim đã cập nhật
 */
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Kiểm tra quyền: admin/moderator hoặc người upload
    if (!req.user || 
        (req.user.role !== 'admin' && 
         req.user.role !== 'moderator' && 
         movie.uploadedBy.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật phim này'
      });
    }

    // Cập nhật phim
    Object.assign(movie, req.body);
    await movie.save();

    // Populate thông tin uploader
    await movie.populate('uploadedBy', 'username avatar');

    res.json({
      success: true,
      message: 'Phim đã được cập nhật thành công',
      data: movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie',
      error: error.message
    });
  }
};

/**
 * Xóa phim (chỉ admin/moderator hoặc người upload)
 * DELETE /api/movies/:id
 * @param {string} req.params.id - ID của phim
 * @returns {Object} Thông báo xóa thành công
 */
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Kiểm tra quyền: admin/moderator hoặc người upload
    if (!req.user || 
        (req.user.role !== 'admin' && 
         req.user.role !== 'moderator' && 
         movie.uploadedBy.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa phim này'
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Phim đã được xóa thành công'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error.message
    });
  }
};

/**
 * Thêm bình luận cho phim (cần đăng nhập)
 * POST /api/movies/:id/comments
 * @param {string} req.params.id - ID của phim
 * @param {Object} req.body - { text }
 * @returns {Object} Bình luận đã thêm
 */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Thêm bình luận
    movie.comments.push({
      user: req.user.id,
      text: text.trim()
    });

    await movie.save();
    await movie.populate('comments.user', 'username avatar');

    res.json({
      success: true,
      message: 'Bình luận đã được thêm thành công',
      data: movie.comments[movie.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

/**
 * Đánh giá phim (cần đăng nhập)
 * POST /api/movies/:id/rate
 * @param {string} req.params.id - ID của phim
 * @param {Object} req.body - { rating }
 * @returns {Object} Thông báo đánh giá thành công
 */
const rateMovie = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating phải từ 1 đến 5'
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Kiểm tra xem user đã đánh giá chưa
    const existingRating = movie.ratings.find(
      r => r.user.toString() === req.user.id
    );

    if (existingRating) {
      // Cập nhật rating cũ
      existingRating.rating = rating;
    } else {
      // Thêm rating mới
      movie.ratings.push({
        user: req.user.id,
        rating: rating
      });
    }

    await movie.save();

    res.json({
      success: true,
      message: 'Đánh giá đã được lưu thành công'
    });
  } catch (error) {
    console.error('Rate movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate movie',
      error: error.message
    });
  }
};

/**
 * Like phim (cần đăng nhập)
 * POST /api/movies/:id/like
 * @param {string} req.params.id - ID của phim
 * @returns {Object} Thông báo like thành công
 */
const likeMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Toggle like
    const result = await movie.toggleLike(req.user.id);

    res.json({
      success: true,
      message: result.liked ? 'Đã like phim' : 'Đã unlike phim',
      data: { liked: result.liked, likes: result.likes }
    });
  } catch (error) {
    console.error('Like movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like movie',
      error: error.message
    });
  }
};

/**
 * Dislike phim (cần đăng nhập)
 * POST /api/movies/:id/dislike
 * @param {string} req.params.id - ID của phim
 * @returns {Object} Thông báo dislike thành công
 */
const dislikeMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Toggle dislike
    const result = await movie.toggleDislike(req.user.id);

    res.json({
      success: true,
      message: result.disliked ? 'Đã dislike phim' : 'Đã undislike phim',
      data: { disliked: result.disliked, dislikes: result.dislikes }
    });
  } catch (error) {
    console.error('Dislike movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dislike movie',
      error: error.message
    });
  }
};

/**
 * Lấy lịch sử chỉnh sửa phim (chỉ admin)
 * GET /api/movies/:id/edit-history
 * @param {string} req.params.id - ID của phim
 * @returns {Object} Lịch sử chỉnh sửa
 */
const getMovieEditHistory = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      data: movie.editHistory || []
    });
  } catch (error) {
    console.error('Get movie edit history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get edit history',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách phim đã upload của user hiện tại
 * GET /api/movies/my-uploads
 * @param {Object} req.query - { page, limit, status }
 * @returns {Object} Danh sách phim và pagination
 */
const getMyUploads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';

    // Xây dựng query filter
    let query = { uploadedBy: req.user.id };
    if (status !== 'all') {
      query.status = status;
    }

    // Thực hiện query với pagination
    const movies = await Movie.find(query)
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Đếm tổng số phim
    const total = await Movie.countDocuments(query);

    // Tính toán statistics
    const totalActive = await Movie.countDocuments({ 
      uploadedBy: req.user.id, 
      status: 'active' 
    });
    const totalPending = await Movie.countDocuments({ 
      uploadedBy: req.user.id, 
      status: 'pending' 
    });
    const totalRejected = await Movie.countDocuments({ 
      uploadedBy: req.user.id, 
      status: 'rejected' 
    });

    res.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        totalActive,
        totalPending,
        totalRejected,
        total: total
      }
    });
  } catch (error) {
    console.error('Get my uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get uploads',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách phim đang chờ duyệt (chỉ admin/moderator)
 * GET /api/movies/pending
 * @param {Object} req.query - { page, limit }
 * @returns {Object} Danh sách phim pending và pagination
 */
const getPendingMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Thực hiện query với pagination
    const movies = await Movie.find({ status: 'pending' })
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Đếm tổng số phim pending
    const total = await Movie.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending movies',
      error: error.message
    });
  }
};

/**
 * Lấy tất cả phim public với filter và pagination
 * GET /api/movies/public/all
 * @param {Object} req.query - { page, limit, category, search, status }
 * @returns {Object} Danh sách phim và pagination
 */
const getAllMoviesPublic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const status = req.query.status || 'active';

    // Xây dựng query filter
    let query = { status };

    // Filter theo category
    if (category && category.trim()) {
      const categoryValue = category.trim();
      const categoryMap = {
        'action': 'Action',
        'comedy': 'Comedy', 
        'drama': 'Drama',
        'horror': 'Horror',
        'romance': 'Romance',
        'sci-fi': 'Sci-Fi',
        'thriller': 'Thriller',
        'animation': 'Animation',
        'documentary': 'Documentary',
        'other': 'Other'
      };
      
      query.category = categoryMap[categoryValue.toLowerCase()] || categoryValue;
    }

    // Filter theo search
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Thực hiện query với pagination
    const movies = await Movie.find(query)
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Đếm tổng số phim
    const total = await Movie.countDocuments(query);

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all movies public error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movies',
      error: error.message
    });
  }
};

/**
 * Lấy tất cả phim cho admin (bao gồm cả phim private)
 * GET /api/movies/admin/all
 * @param {Object} req.query - { page, limit, category, search, status }
 * @returns {Object} Danh sách phim và pagination
 */
const getAllMoviesForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const status = req.query.status || 'all';

    // Xây dựng query filter
    let query = {};

    // Filter theo status
    if (status !== 'all') {
      query.status = status;
    }

    // Filter theo category
    if (category && category.trim()) {
      const categoryValue = category.trim();
      const categoryMap = {
        'action': 'Action',
        'comedy': 'Comedy', 
        'drama': 'Drama',
        'horror': 'Horror',
        'romance': 'Romance',
        'sci-fi': 'Sci-Fi',
        'thriller': 'Thriller',
        'animation': 'Animation',
        'documentary': 'Documentary',
        'other': 'Other'
      };
      
      query.category = categoryMap[categoryValue.toLowerCase()] || categoryValue;
    }

    // Filter theo search
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Thực hiện query với pagination
    const movies = await Movie.find(query)
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Đếm tổng số phim
    const total = await Movie.countDocuments(query);

    // Tính toán statistics
    const totalActive = await Movie.countDocuments({ status: 'active' });
    const totalPending = await Movie.countDocuments({ status: 'pending' });
    const totalRejected = await Movie.countDocuments({ status: 'rejected' });

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit
      },
      statistics: {
        totalActive,
        totalPending,
        totalRejected,
        total: total
      }
    });
  } catch (error) {
    console.error('Get all movies for admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movies',
      error: error.message
    });
  }
};

/**
 * Cập nhật trạng thái phim (chỉ admin/moderator)
 * PUT /api/movies/:id/status
 * @param {string} req.params.id - ID của phim
 * @param {Object} req.body - { status, reason }
 * @returns {Object} Thông tin phim đã cập nhật
 */
const updateMovieStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    // Validate status
    const validStatuses = ['active', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status không hợp lệ. Status phải là: active, pending, hoặc rejected'
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Lưu trạng thái cũ trước khi cập nhật
    const oldStatus = movie.status;

    // Cập nhật status và reason
    movie.status = status;
    if (reason) {
      movie.statusReason = reason;
    }

    // Thêm vào edit history với cấu trúc đúng theo schema
    movie.editHistory.push({
      editedBy: req.user.id,
      editedAt: new Date(),
      changes: `Trạng thái thay đổi từ "${oldStatus}" thành "${status}"${reason ? ` - Lý do: ${reason}` : ''}`
    });

    await movie.save();
    await movie.populate('uploadedBy', 'username avatar');

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái phim thành ${status}`,
      data: movie
    });
  } catch (error) {
    console.error('Update movie status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie status',
      error: error.message
    });
  }
};

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovie,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
  addComment,
  rateMovie,
  likeMovie,
  dislikeMovie,
  getMovieEditHistory,
  getMyUploads,
  getPendingMovies,
  getAllMoviesPublic,
  getAllMoviesForAdmin,
  updateMovieStatus
}; 