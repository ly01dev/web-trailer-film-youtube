import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, updateUserRole, deleteUser } from '../services/authService';
import { getPendingMovies, updateMovieStatus, getAllMoviesForAdmin, deleteMovie } from '../services/movieService';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // User management state
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Movie management state
  const [pendingMovies, setPendingMovies] = useState([]);
  const [movieLoading, setMovieLoading] = useState(false);

  // All movies management state
  const [allMovies, setAllMovies] = useState([]);
  const [allMoviesLoading, setAllMoviesLoading] = useState(false);
  const [allMoviesStats, setAllMoviesStats] = useState({});
  const [movieFilters, setMovieFilters] = useState({
    search: '',
    category: '',
    status: '',
    uploadedBy: ''
  });

  useEffect(() => {
    console.log('AdminDashboard useEffect:', { isAuthenticated, userRole: user?.role, activeTab });
    
    if (!isAuthenticated || user?.role !== 'admin') {
      console.log('Not authenticated or not admin');
      return;
    }
    
    // Load all data when component mounts
    console.log('Loading all admin data...');
    loadUsers();
    loadPendingMovies();
    loadAllMovies();
  }, [isAuthenticated, user]);

  // Separate useEffect for tab-specific data updates
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'movies') {
      loadPendingMovies();
    } else if (activeTab === 'all-movies') {
      loadAllMovies();
    }
  }, [activeTab, userRoleFilter, movieFilters]);

  const loadUsers = async () => {
    try {
      setUserLoading(true);
      // Load tất cả users, không phân trang
      const response = await getAllUsers(1, 1000, userRoleFilter);
      console.log('Load users response:', response);
      
      if (response && response.success) {
        setUsers(response.data || []);
        setUserStats(response.statistics || {});
        
        // Debug logs
        console.log('Users loaded:', {
          usersCount: response.data?.length || 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 'All',
          totalItems: response.statistics?.totalItems || 0,
          statistics: response.statistics
        });
      } else {
        console.error('Invalid response format:', response);
        setUsers([]);
        setUserStats({});
      }
    } catch (error) {
      console.error('Load users error:', error);
      setUsers([]);
      setUserStats({});
    } finally {
      setUserLoading(false);
    }
  };

  const loadPendingMovies = async () => {
    try {
      setMovieLoading(true);
      // Load tất cả pending movies, không phân trang
      const response = await getPendingMovies(1, 1000);
      setPendingMovies(response.data);
    } catch {
      console.error('Load pending movies error');
    } finally {
      setMovieLoading(false);
    }
  };

  const loadAllMovies = async () => {
    try {
      setAllMoviesLoading(true);
      // Load tất cả movies, không phân trang
      const response = await getAllMoviesForAdmin(1, 1000, movieFilters);
      
      if (response && response.success) {
        setAllMovies(response.data || []);
        setAllMoviesStats(response.statistics || {});
      } else {
        console.error('Invalid response format:', response);
        setAllMovies([]);
        setAllMoviesStats({});
      }
    } catch (error) {
      console.error('Load all movies error:', error);
      setAllMovies([]);
      setAllMoviesStats({});
    } finally {
      setAllMoviesLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      alert('Đã cập nhật role thành công!');
      loadUsers();
    } catch {
      alert('Có lỗi xảy ra khi cập nhật role');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Bạn có chắc muốn xóa user "${username}"?`)) {
      return;
    }
    
    try {
      await deleteUser(userId);
      alert('Đã xóa user thành công!');
      loadUsers();
    } catch {
      alert('Có lỗi xảy ra khi xóa user');
    }
  };

  const handleApproveMovie = async (movieId) => {
    try {
      await updateMovieStatus(movieId, 'active');
      alert('Đã duyệt clip thành công!');
      loadPendingMovies();
      loadAllMovies(); // Reload cả all movies để cập nhật statistics
    } catch {
      alert('Có lỗi xảy ra khi duyệt clip');
    }
  };

  const handleRejectMovie = async (movieId) => {
    const reason = prompt('Lý do từ chối:');
    if (!reason) return;
    
    try {
      await updateMovieStatus(movieId, 'rejected', reason);
      alert('Đã từ chối clip!');
      loadPendingMovies();
      loadAllMovies(); // Reload cả all movies để cập nhật statistics
    } catch {
      alert('Có lỗi xảy ra khi từ chối clip');
    }
  };

  const handleDeleteMovie = async (movieId, title) => {
    if (!confirm(`Bạn có chắc muốn xóa clip "${title}"?`)) {
      return;
    }
    
    try {
      await deleteMovie(movieId);
      alert('Đã xóa clip thành công!');
      if (activeTab === 'all-movies') {
        loadAllMovies();
      } else if (activeTab === 'movies') {
        loadPendingMovies();
      }
    } catch {
      alert('Có lỗi xảy ra khi xóa clip');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Vui lòng đăng nhập để truy cập Admin Dashboard.
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Bạn không có quyền truy cập Admin Dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="bi bi-gear me-2"></i>
            Admin Dashboard
          </h2>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-1"></i>
                Quản lý User ({userStats.totalUsers || 0})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`}
                onClick={() => setActiveTab('movies')}
              >
                <i className="bi bi-film me-1"></i>
                Clip chờ duyệt ({pendingMovies.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'all-movies' ? 'active' : ''}`}
                onClick={() => setActiveTab('all-movies')}
              >
                <i className="bi bi-collection me-1"></i>
                Quản lý clips ({allMoviesStats.total || 0})
              </button>
            </li>
          </ul>

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div>
              {/* User Statistics */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{userStats.totalUsers || 0}</h3>
                      <p className="card-text">Tổng User</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{userStats.totalModerators || 0}</h3>
                      <p className="card-text">Moderator</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{userStats.totalAdmins || 0}</h3>
                      <p className="card-text">Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Filter */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <select 
                    className="form-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">Tất cả role</option>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Users List */}
              {userLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="alert alert-info">
                  Không có user nào.
                </div>
              ) : (
                <>
                  {/* User Count Info */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted">
                      Hiển thị tất cả {users.length} users
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userItem) => (
                          <tr key={userItem._id}>
                            <td>{userItem.username}</td>
                            <td>{userItem.email}</td>
                            <td>
                              <span className={`badge ${
                                userItem.role === 'admin' ? 'bg-danger' :
                                userItem.role === 'moderator' ? 'bg-warning' : 'bg-secondary'
                              }`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td>{formatDate(userItem.createdAt)}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <select 
                                  className="form-select form-select-sm"
                                  value={userItem.role}
                                  onChange={(e) => handleUpdateUserRole(userItem._id, e.target.value)}
                                  disabled={userItem._id === user?._id}
                                >
                                  <option value="user">User</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteUser(userItem._id, userItem.username)}
                                  disabled={userItem._id === user?._id}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* User Pagination */}
              {/* Removed pagination as per edit hint */}
              
             
            </div>
          )}

          {/* Movie Management Tab */}
          {activeTab === 'movies' && (
            <div>
              {movieLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : pendingMovies.length === 0 ? (
                <div className="alert alert-info">
                  Không có clip nào chờ duyệt.
                </div>
              ) : (
                <>
                  {/* Pending Movies Count Info */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted">
                      Hiển thị tất cả {pendingMovies.length} clips chờ duyệt
                    </div>
                  </div>

                  <div className="row">
                    {pendingMovies.map((movie) => (
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
                              <span className="badge bg-warning">Chờ duyệt</span>
                            </div>

                            <div className="text-muted small mb-3">
                              <div>Upload bởi: {movie.uploadedBy?.username}</div>
                              <div>Ngày upload: {formatDate(movie.createdAt)}</div>
                            </div>

                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-success btn-sm flex-fill"
                                onClick={() => handleApproveMovie(movie._id)}
                              >
                                <i className="bi bi-check me-1"></i>
                                Duyệt
                              </button>
                              <button 
                                className="btn btn-warning btn-sm flex-fill"
                                onClick={() => handleRejectMovie(movie._id)}
                              >
                                <i className="bi bi-x me-1"></i>
                                Từ chối
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteMovie(movie._id, movie.title)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* All Movies Management Tab */}
          {activeTab === 'all-movies' && (
            <div>
              {/* Movie Statistics */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{allMoviesStats.total || 0}</h3>
                      <p className="card-text">Tổng clips</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{allMoviesStats.totalActive || 0}</h3>
                      <p className="card-text">Đã duyệt</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{allMoviesStats.totalPending || 0}</h3>
                      <p className="card-text">Chờ duyệt</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-danger text-white">
                    <div className="card-body text-center">
                      <h3 className="card-title">{allMoviesStats.totalRejected || 0}</h3>
                      <p className="card-text">Đã từ chối</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm theo tên..."
                        value={movieFilters.search}
                        onChange={(e) => setMovieFilters({...movieFilters, search: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={movieFilters.category}
                        onChange={(e) => setMovieFilters({...movieFilters, category: e.target.value})}
                      >
                        <option value="">Tất cả thể loại</option>
                        <option value="action">Action</option>
                        <option value="comedy">Comedy</option>
                        <option value="drama">Drama</option>
                        <option value="horror">Horror</option>
                        <option value="romance">Romance</option>
                        <option value="sci-fi">Sci-Fi</option>
                        <option value="thriller">Thriller</option>
                        <option value="documentary">Documentary</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={movieFilters.status}
                        onChange={(e) => setMovieFilters({...movieFilters, status: e.target.value})}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đã duyệt</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm theo user..."
                        value={movieFilters.uploadedBy}
                        onChange={(e) => setMovieFilters({...movieFilters, uploadedBy: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => {
                          loadAllMovies();
                        }}
                      >
                        <i className="bi bi-search me-1"></i>
                        Tìm kiếm
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Movies List */}
              {allMoviesLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : allMovies.length === 0 ? (
                <div className="alert alert-info">
                  Không tìm thấy clip nào.
                </div>
              ) : (
                <>
                  {/* All Movies Count Info */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted">
                      Hiển thị tất cả {allMovies.length} clips
                    </div>
                    <div className="text-muted">
                      Tổng cộng: {allMoviesStats.total || 0} clips
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Thumbnail</th>
                          <th>Tiêu đề</th>
                          <th>Thể loại</th>
                          <th>Trạng thái</th>
                          <th>Upload bởi</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMovies.map((movie) => (
                          <tr key={movie._id}>
                            <td>
                              <img 
                                src={movie.thumbnail} 
                                alt={movie.title}
                                style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                              />
                            </td>
                            <td>
                              <div>
                                <strong>{movie.title}</strong>
                                <br />
                                <small className="text-muted">{movie.slug}</small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{movie.category}</span>
                            </td>
                            <td>
                              <span className={`badge ${
                                movie.status === 'active' ? 'bg-success' :
                                movie.status === 'pending' ? 'bg-warning' : 'bg-danger'
                              }`}>
                                {movie.status === 'active' ? 'Đã duyệt' :
                                 movie.status === 'pending' ? 'Chờ duyệt' : 'Đã từ chối'}
                              </span>
                            </td>
                            <td>
                              <div>
                                <strong>{movie.uploadedBy?.username}</strong>
                                <br />
                                <small className="text-muted">{movie.uploadedBy?.role}</small>
                              </div>
                            </td>
                            <td>{formatDate(movie.createdAt)}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => window.open(`/v/${movie.slug}`, '_blank')}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteMovie(movie._id, movie.title)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {/* Removed pagination as per edit hint */}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 