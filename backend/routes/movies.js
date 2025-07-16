const express = require('express');
const router = express.Router();
const { protect, admin, moderator } = require('../middleware/auth');
const {
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
  updateMovieStatus,
  getAllMoviesForAdmin,
  getAllMoviesPublic
} = require('../controllers/movieController');

// ===== PUBLIC ROUTES (Không cần đăng nhập) =====
router.get('/', getMovies);                    // Lấy danh sách phim
router.get('/public/all', getAllMoviesPublic); // Lấy tất cả phim public (copy từ admin)
router.get('/featured', getFeaturedMovies);    // Lấy phim nổi bật
router.get('/slug/:slug', getMovieBySlug);     // Lấy chi tiết phim theo slug

// ===== ADMIN ROUTES =====
router.get('/admin/all', protect, admin, getAllMoviesForAdmin);  // Quản lý tất cả clips (admin)
router.get('/pending', protect, getPendingMovies);           // Xem clip chờ duyệt (admin)

// ===== MODERATOR ROUTES =====
router.get('/my-uploads', protect, getMyUploads);   // Xem uploads của mình (moderator+)

// ===== PROTECTED ROUTES (Cần đăng nhập) =====
router.post('/:id/comments', protect, addComment);  // Thêm bình luận
router.post('/:id/rate', protect, rateMovie);       // Đánh giá phim
// Like phim: ai cũng gọi được, không cần protect
router.post('/:id/like', likeMovie);               // Like phim

// ===== ADMIN ROUTES =====
router.put('/:id/status', protect, admin, updateMovieStatus);       // Duyệt/từ chối clip (admin)

// ===== ADMIN/MODERATOR ROUTES =====
router.post('/', protect, moderator, createMovie);      // Tạo phim (moderator+)
router.post('/test', createMovie);                      // Tạo phim test (không cần auth)
router.put('/:id', protect, moderator, updateMovie);    // Cập nhật phim (moderator+)

// ===== ADMIN ONLY ROUTES =====
router.delete('/:id', protect, admin, deleteMovie);     // Xóa phim (chỉ admin)
router.get('/:id/edit-history', protect, admin, getMovieEditHistory); // Lịch sử chỉnh sửa (chỉ admin)

// ===== PUBLIC ROUTES (Phải đặt cuối để tránh conflict) =====
router.get('/:id', getMovie);                  // Lấy chi tiết phim theo ID

module.exports = router; 