import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllMoviesPublic } from '../services/movieService';
import { getCategoryLabel } from '../utils/categoryMapping';

/**
 * Component Movies - Trang hiển thị danh sách phim chính
 * Bao gồm: Tìm kiếm, lọc theo thể loại, infinite scroll, responsive grid
 */
const Movies = () => {
  // Lấy thông tin user và authentication từ context
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Kiểm tra quyền upload - chỉ admin mới được upload
  const canUpload = user?.role === 'admin';
  
  // State quản lý danh sách phim và pagination
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State quản lý bộ lọc tìm kiếm
  const [movieFilters, setMovieFilters] = useState({
    search: '',
    category: '',
    status: 'active'
  });

  // Số phim hiển thị mỗi trang - giống Facebook
  const ITEMS_PER_PAGE = 8;

  /**
   * Effect: Đọc URL parameters khi component mount
   * Cho phép bookmark và share URL với filter
   */
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    const searchFromURL = searchParams.get('search');
    
    if (categoryFromURL || searchFromURL) {
      setMovieFilters(prev => ({
        ...prev,
        category: categoryFromURL || '',
        search: searchFromURL || ''
      }));
    }
  }, [searchParams]);

  /**
   * Function: Load phim từ API với pagination
   * @param {number} page - Trang hiện tại
   * @param {boolean} append - Có thêm vào danh sách cũ không
   */
  const loadMovies = useCallback(async (page = 1, append = false) => {
    try {
      // Set loading state tương ứng
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Gọi API lấy danh sách phim
      const response = await getAllMoviesPublic(page, ITEMS_PER_PAGE, movieFilters);
      const newMovies = response.data || [];
      const totalPages = response.pagination?.totalPages || 1;
      
      // Cập nhật state movies
      if (append) {
        setMovies(prev => [...prev, ...newMovies]);
      } else {
        setMovies(newMovies);
      }
      
      // Cập nhật pagination state
      setHasMore(page < totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [movieFilters]);

  /**
   * Effect: Load phim ban đầu và tự động search khi filter thay đổi
   */
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setMovies([]);
    loadMovies(1, false);
  }, [movieFilters]);

  /**
   * Function: Load thêm phim khi scroll
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadMovies(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage, loadMovies]);

  /**
   * Effect: Infinite scroll handler
   * Tự động load thêm phim khi scroll gần cuối trang
   */
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  /**
   * Function: Xử lý tìm kiếm
   * Cập nhật URL parameters và reload danh sách phim
   */
  const handleSearch = () => {
    // Cập nhật URL parameters để có thể bookmark/share
    const newSearchParams = new URLSearchParams();
    if (movieFilters.search) newSearchParams.set('search', movieFilters.search);
    if (movieFilters.category) newSearchParams.set('category', movieFilters.category);
    setSearchParams(newSearchParams);
    
    // Reset pagination và reload
    setCurrentPage(1);
    setHasMore(true);
    setMovies([]);
    loadMovies(1, false);
  };

  /**
   * Function: Xử lý thay đổi filter thể loại
   * @param {string} category - Thể loại được chọn
   */
  const handleCategoryChange = (category) => {
    const newFilters = { ...movieFilters, category };
    setMovieFilters(newFilters);
    
    // Cập nhật URL parameters
    const newSearchParams = new URLSearchParams();
    if (newFilters.search) newSearchParams.set('search', newFilters.search);
    if (category) newSearchParams.set('category', category);
    setSearchParams(newSearchParams);
  };

  /**
   * Function: Format ngày tháng theo định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày tháng
   * @returns {string} Ngày tháng đã format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  /**
   * Function: Format số lượt xem (K, M)
   * @param {number} views - Số lượt xem
   * @returns {string} Số lượt xem đã format
   */
  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Loading state ban đầu
  if (loading && currentPage === 1) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải danh sách phim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <i className="bi bi-collection-play text-primary me-2"></i>
                Kho Phim Hay Nhất 2025
              </h1>
              <p className="text-muted mb-0">
                Khám phá {movies.length} bộ phim chất lượng cao
              </p>
            </div>
            {/* Upload button - chỉ hiển thị cho admin */}
            {isAuthenticated && canUpload && (
              <Link to="/upload" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Đăng tải Video
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            {/* Search input */}
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên..."
                value={movieFilters.search}
                onChange={(e) => setMovieFilters({...movieFilters, search: e.target.value})}
              />
            </div>
            {/* Category filter dropdown */}
            <div className="col-md-6">
              <select
                className="form-select border-0 bg-light"
                style={{ 
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}
                value={movieFilters.category}
                onChange={(e) => setMovieFilters({...movieFilters, category: e.target.value})}
              >
                <option value="" style={{ fontSize: '14px' }}>Tất cả thể loại</option>
                <option value="action" style={{ fontSize: '14px' }}>Action</option>
                <option value="comedy" style={{ fontSize: '14px' }}>Comedy</option>
                <option value="drama" style={{ fontSize: '14px' }}>Drama</option>
                <option value="horror" style={{ fontSize: '14px' }}>Horror</option>
                <option value="romance" style={{ fontSize: '14px' }}>Romance</option>
                <option value="sci-fi" style={{ fontSize: '14px' }}>Sci-Fi</option>
                <option value="thriller" style={{ fontSize: '14px' }}>Thriller</option>
                <option value="documentary" style={{ fontSize: '14px' }}>Documentary</option>
              </select>
            </div>
            {/* Search button */}
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={handleSearch}
              >
                <i className="bi bi-search me-1"></i>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tags section */}
      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          {/* Tất cả thể loại */}
          <button
            className={`btn btn-sm ${movieFilters.category === '' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('')}
          >
            <i className="bi bi-collection me-1"></i>
            Tất cả thể loại
          </button>
          
          {/* Action */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'action' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('action')}
          >
            <i className="bi bi-lightning me-1"></i>
            Hành động
          </button>
          
          {/* Comedy */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'comedy' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('comedy')}
          >
            <i className="bi bi-emoji-laughing me-1"></i>
            Hài hước
          </button>
          
          {/* Drama */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'drama' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('drama')}
          >
            <i className="bi bi-theater-masks me-1"></i>
            Tâm lý
          </button>
          
          {/* Horror */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'horror' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('horror')}
          >
            <i className="bi bi-ghost me-1"></i>
            Kinh dị
          </button>
          
          {/* Romance */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'romance' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('romance')}
          >
            <i className="bi bi-heart-fill me-1"></i>
            Tình cảm
          </button>
          
          {/* Sci-Fi */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'sci-fi' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('sci-fi')}
          >
            <i className="bi bi-rocket me-1"></i>
            Khoa học viễn tưởng
          </button>
          
          {/* Thriller */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'thriller' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('thriller')}
          >
            <i className="bi bi-exclamation-triangle me-1"></i>
            Giật gân
          </button>
          
          {/* Documentary */}
          <button
            className={`btn btn-sm ${movieFilters.category === 'documentary' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleCategoryChange('documentary')}
          >
            <i className="bi bi-camera-video me-1"></i>
            Tài liệu
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-3">
        <p className="text-muted">
          Hiển thị {movies.length} video
          {hasMore && (
            <span className="ms-2">
              <i className="bi bi-arrow-down-circle text-primary"></i>
              Kéo xuống để tải thêm
            </span>
          )}
        </p>
      </div>

      {/* Movies Grid */}
      {movies.length === 0 ? (
        // Empty state - không tìm thấy phim
        <div className="text-center py-5">
          <i className="bi bi-search text-muted fs-1 mb-3"></i>
          <h5 className="text-muted">Không tìm thấy video nào</h5>
          <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc thể loại</p>
        </div>
      ) : (
        // Grid hiển thị danh sách phim
        <div className="row g-4">
          {movies.map(movie => (
            <div key={movie._id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card h-100 shadow-sm hover-shadow">
                {/* Thumbnail section */}
                <div className="position-relative">
                  <img
                    src={movie.thumbnail || `https://img.youtube.com/vi/${movie.youtubeId}/maxresdefault.jpg`}
                    className="card-img-top"
                    alt={movie.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback thumbnail nếu ảnh chính lỗi
                      e.target.src = `https://img.youtube.com/vi/${movie.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                  {/* Play badge */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-dark bg-opacity-75">
                      <i className="bi bi-play-circle me-1"></i>
                      Xem
                    </span>
                  </div>
                  {/* Category badge */}
                  <div className="position-absolute bottom-0 start-0 m-2">
                    <span className="badge bg-primary">
                      {getCategoryLabel(movie.category)}
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="card-body d-flex flex-column">
                  {/* Title - giới hạn 2 dòng */}
                  <h6 className="card-title line-clamp-2" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {movie.title}
                  </h6>
                  
                  {/* Description - giới hạn 2 dòng */}
                  <p className="card-text text-muted small line-clamp-2" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {movie.description}
                  </p>

                  {/* Tags section */}
                  <div className="mb-2">
                    {movie.tags && movie.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="badge bg-light text-dark me-1 small">
                        #{tag}
                      </span>
                    ))}
                    {movie.tags && movie.tags.length > 3 && (
                      <span className="badge bg-light text-dark small">
                        +{movie.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats section - views, likes, date */}
                  <div className="d-flex justify-content-between align-items-center text-muted small mt-auto">
                    <div>
                      <i className="bi bi-eye me-1"></i>
                      {formatViews(movie.views)}
                    </div>
                    <div>
                      <i className="bi bi-heart me-1"></i>
                      {movie.likes}
                    </div>
                    <div>
                      <i className="bi bi-calendar me-1"></i>
                      {formatDate(movie.createdAt)}
                    </div>
                  </div>

                  {/* Uploader info */}
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="bi bi-person me-1"></i>
                      {movie.uploadedBy?.username || 'Admin'}
                    </small>
                  </div>
                </div>

                {/* Card footer - Watch button */}
                <div className="card-footer bg-transparent border-top-0">
                  <div className="d-grid">
                    <Link to={`/v/${movie.slug}`} className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-play-circle me-2"></i>
                      Xem Video
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Đang tải thêm video...</p>
        </div>
      )}

      {/* End of content indicator */}
      {!hasMore && movies.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">
            <i className="bi bi-check-circle text-success me-2"></i>
            Đã hiển thị tất cả video
          </p>
        </div>
      )}
    </div>
  );
};

export default Movies; 