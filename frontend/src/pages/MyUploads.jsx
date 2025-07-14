import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyUploads } from '../services/movieService';

const MyUploads = () => {
  const { user, isAuthenticated } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'moderator' && user?.role !== 'admin')) {
      return;
    }
    loadUploads();
  }, [isAuthenticated, user, currentPage, statusFilter]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const response = await getMyUploads(currentPage, 10, statusFilter);
      console.log('MyUploads response:', response);
      
      if (response && response.success) {
        setUploads(response.data || []);
        setStatistics(response.statistics || {});
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        console.error('Invalid response format:', response);
        setUploads([]);
        setStatistics({});
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Load uploads error:', error);
      setUploads([]);
      setStatistics({});
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Vui lòng đăng nhập để xem uploads của bạn.
        </div>
      </div>
    );
  }

  if (user?.role !== 'moderator' && user?.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Bạn không có quyền truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="bi bi-collection me-2"></i>
            Uploads của tôi
          </h2>

          {/* Thống kê đơn giản */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h3 className="card-title">{statistics.totalUploads || 0}</h3>
                  <p className="card-text">Tổng số upload</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h3 className="card-title">{statistics.pendingUploads || 0}</h3>
                  <p className="card-text">Chờ duyệt</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h3 className="card-title">{statistics.approvedUploads || 0}</h3>
                  <p className="card-text">Đã duyệt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bộ lọc */}
          <div className="row mb-3">
            <div className="col-md-6">
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="active">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>

          {/* Danh sách uploads */}
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : uploads.length === 0 ? (
            <div className="alert alert-info">
              Bạn chưa có upload nào.
            </div>
          ) : (
            <>
              <div className="row">
                {uploads.map((movie) => (
                  <div key={movie._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <img 
                        src={movie.thumbnail} 
                        className="card-img-top" 
                        alt={movie.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{movie.title}</h5>
                        <p className="card-text text-muted small">
                          {movie.description.substring(0, 100)}...
                        </p>
                        
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-secondary">{movie.category}</span>
                          <span className={`badge ${
                            movie.status === 'active' ? 'bg-success' : 
                            movie.status === 'pending' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {movie.status === 'active' ? 'Đã duyệt' : 
                             movie.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between text-muted small mb-3">
                          <span>
                            <i className="bi bi-eye me-1"></i>
                            {formatViews(movie.views)} lượt xem
                          </span>
                          <span>
                            <i className="bi bi-hand-thumbs-up me-1"></i>
                            {movie.likes || 0} thích
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <Link 
                            to={`/v/${movie.slug}`} 
                            className="btn btn-primary btn-sm flex-fill"
                          >
                            <i className="bi bi-play me-1"></i>
                            Xem
                          </Link>
                          <Link 
                            to={`/edit/${movie._id}`} 
                            className="btn btn-outline-secondary btn-sm"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        </div>
                      </div>
                      <div className="card-footer text-muted small">
                        Upload: {formatDate(movie.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <nav aria-label="Uploads pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyUploads; 