import api from './api';

/**
 * Service quản lý tất cả API calls liên quan đến phim
 * Bao gồm: CRUD operations, search, filter, admin functions
 */

/**
 * Lấy danh sách phim với params tùy chọn
 * @param {Object} params - Query parameters (page, limit, category, search, etc.)
 * @returns {Promise} Response từ API
 */
export const getMovies = async (params = {}) => {
  const response = await api.get('/movies', { params });
  return response;
};

/**
 * Lấy phim nổi bật (featured)
 * @returns {Promise} Response từ API
 */
export const getFeaturedMovies = async () => {
  const response = await api.get('/movies/featured');
  return response;
};

/**
 * Lấy chi tiết phim theo ID
 * @param {string} id - ID của phim
 * @returns {Promise} Response từ API
 */
export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response;
};

/**
 * Lấy chi tiết phim theo slug (URL-friendly)
 * @param {string} slug - Slug của phim
 * @returns {Promise} Response từ API
 */
export const getMovieBySlug = async (slug) => {
  const response = await api.get(`/movies/slug/${slug}`);
  return response;
};

/**
 * Tạo phim mới (cần authentication)
 * @param {Object} movieData - Dữ liệu phim (title, description, youtubeId, etc.)
 * @returns {Promise} Response từ API
 */
export const createMovie = async (movieData) => {
  const response = await api.post('/movies', movieData);
  return response;
};

/**
 * Cập nhật thông tin phim (cần authentication)
 * @param {string} id - ID của phim
 * @param {Object} movieData - Dữ liệu cập nhật
 * @returns {Promise} Response từ API
 */
export const updateMovie = async (id, movieData) => {
  const response = await api.put(`/movies/${id}`, movieData);
  return response;
};

/**
 * Xóa phim (cần authentication)
 * @param {string} id - ID của phim
 * @returns {Promise} Response từ API
 */
export const deleteMovie = async (id) => {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
};

/**
 * Thêm bình luận cho phim (cần authentication)
 * @param {string} id - ID của phim
 * @param {string} comment - Nội dung bình luận
 * @returns {Promise} Response từ API
 */
export const addComment = async (id, comment) => {
  const response = await api.post(`/movies/${id}/comments`, { text: comment });
  return response.data;
};

/**
 * Đánh giá phim (cần authentication)
 * @param {string} id - ID của phim
 * @param {number} rating - Điểm đánh giá (1-5)
 * @returns {Promise} Response từ API
 */
export const rateMovie = async (id, rating) => {
  const response = await api.post(`/movies/${id}/rate`, { rating });
  return response.data;
};

/**
 * Like phim (cần authentication)
 * @param {string} id - ID của phim
 * @returns {Promise} Response từ API
 */
export const likeMovie = async (id) => {
  const response = await api.post(`/movies/${id}/like`);
  return response.data;
};

/**
 * Dislike phim (cần authentication)
 * @param {string} id - ID của phim
 * @returns {Promise} Response từ API
 */
export const dislikeMovie = async (id) => {
  const response = await api.post(`/movies/${id}/dislike`);
  return response.data;
};

/**
 * Lấy danh sách phim liên quan
 * @param {string} category - Thể loại phim
 * @param {string} excludeId - ID phim cần loại trừ
 * @param {number} limit - Số lượng phim tối đa
 * @returns {Promise} Response từ API
 */
export const getRelatedMovies = async (category, excludeId, limit = 10) => {
  const response = await api.get('/movies', { 
    params: { 
      category, 
      limit,
      exclude: excludeId 
    } 
  });
  return response;
};

/**
 * Lấy lịch sử chỉnh sửa phim (chỉ admin)
 * @param {string} id - ID của phim
 * @returns {Promise} Response từ API
 */
export const getMovieEditHistory = async (id) => {
  const response = await api.get(`/movies/${id}/edit-history`);
  return response;
}; 

/**
 * Lấy danh sách phim đã upload của user hiện tại
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng phim mỗi trang
 * @param {string} status - Trạng thái phim (all, active, pending, rejected)
 * @returns {Promise} Response từ API
 */
export const getMyUploads = async (page = 1, limit = 10, status = 'all') => {
  const response = await api.get(`/movies/my-uploads?page=${page}&limit=${limit}&status=${status}`);
  return response;
}; 

/**
 * Lấy danh sách phim đang chờ duyệt (chỉ admin/moderator)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng phim mỗi trang
 * @returns {Promise} Response từ API
 */
export const getPendingMovies = async (page = 1, limit = 10) => {
  const response = await api.get(`/movies/pending?page=${page}&limit=${limit}`);
  return response;
};

/**
 * Cập nhật trạng thái phim (chỉ admin/moderator)
 * @param {string} movieId - ID của phim
 * @param {string} status - Trạng thái mới (active, pending, rejected)
 * @param {string} reason - Lý do thay đổi trạng thái
 * @returns {Promise} Response từ API
 */
export const updateMovieStatus = async (movieId, status, reason = '') => {
  const response = await api.put(`/movies/${movieId}/status`, { status, reason });
  return response;
};

/**
 * Lấy tất cả phim cho admin (bao gồm cả phim private)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng phim mỗi trang
 * @param {Object} filters - Bộ lọc (category, search, status, etc.)
 * @returns {Promise} Response từ API
 */
export const getAllMoviesForAdmin = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  const response = await api.get(`/movies/admin/all?${params}`);
  return response;
};

/**
 * Lấy tất cả phim public (cho trang chính)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng phim mỗi trang
 * @param {Object} filters - Bộ lọc (category, search, status, etc.)
 * @returns {Promise} Response từ API
 */
export const getAllMoviesPublic = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  const response = await api.get(`/movies/public/all?${params}`);
  return response;
};

 