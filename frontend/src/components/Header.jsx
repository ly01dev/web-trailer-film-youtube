import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllMoviesPublic } from '../services/movieService';


/**
 * Component Header - Navigation bar chính của ứng dụng
 * Bao gồm: Logo, menu navigation, dropdown categories, user menu
 */
const Header = () => {
  // Lấy thông tin user và authentication từ context
  const { user, isAuthenticated, logout } = useAuth();
  
  // State quản lý categories và loading
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Danh sách categories cố định với icon và màu sắc
   * Được sử dụng khi API không hoạt động
   */
  const fallbackCategoryList = [
    { name: 'action', label: 'Hành động', icon: 'bi-lightning', color: '#dc3545' },
    { name: 'comedy', label: 'Hài hước', icon: 'bi-emoji-laughing', color: '#ffc107' },
    { name: 'drama', label: 'Tâm lý', icon: 'bi-theater-masks', color: '#6f42c1' },
    { name: 'horror', label: 'Kinh dị', icon: 'bi-ghost', color: '#212529' },
    { name: 'romance', label: 'Tình cảm', icon: 'bi-heart', color: '#e83e8c' },
    { name: 'sci-fi', label: 'Khoa học viễn tưởng', icon: 'bi-rocket', color: '#17a2b8' },
    { name: 'animation', label: 'Hoạt hình', icon: 'bi-palette', color: '#fd7e14' },
    { name: 'documentary', label: 'Tài liệu', icon: 'bi-camera-video', color: '#28a745' },
    { name: 'other', label: 'Khác', icon: 'bi-three-dots', color: '#6c757d' }
  ];
  
  /**
   * Effect: Lấy số lượng phim cho mỗi category từ API
   * Chạy một lần khi component mount
   */
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      setIsLoading(true);
      try {
        // Gọi API cho từng category để đếm số phim
        const categoryCounts = await Promise.all(
          fallbackCategoryList.map(async (category) => {
            try {
              const response = await getAllMoviesPublic(1, 1, { category: category.name });
              return {
                ...category,
                count: response.data?.pagination?.total || 0,
                slug: category.name.toLowerCase().replace(/\s+/g, '-')
              };
            } catch {
              // Fallback nếu API lỗi
              return {
                ...category,
                count: 0,
                slug: category.name.toLowerCase().replace(/\s+/g, '-')
              };
            }
          })
        );
        
        // Sắp xếp categories theo số lượng phim giảm dần
        const sortedCategories = categoryCounts.sort((a, b) => b.count - a.count);
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching category counts:', error);
        // Fallback: sử dụng danh sách cố định nếu có lỗi
        setCategories(fallbackCategoryList.map(cat => ({
          ...cat,
          count: 0,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-')
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []); // Chỉ chạy một lần khi component mount
  
  /**
   * Xử lý đăng xuất và redirect về trang movies
   */
  const handleLogout = () => {
    logout();
    window.location.href = '/movies';
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1030
    }}>
      <div className="container">
        {/* Logo - Link về trang chính */}
        <Link className="navbar-brand fw-bold text-white" to="/" style={{
          transition: 'all 0.3s ease',
          textDecoration: 'none'
        }} onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
        }} onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.textShadow = 'none';
        }}>
          <i className="bi bi-film me-2"></i>
          Film8X
        </Link>

        {/* Mobile menu toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Link Phim */}
            <li className="nav-item">
              <Link 
                className="nav-link text-white" 
                to="/"
                style={{
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  margin: '0 5px',
                  padding: '8px 12px'
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) { // Chỉ hover trên desktop
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.textShadow = '0 0 8px rgba(255,255,255,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.textShadow = 'none';
                  }
                }}
              >
                <i className="bi bi-collection-play me-1"></i>
                Phim
              </Link>
            </li>
            
            {/* Dropdown Thể loại */}
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle text-white" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={{
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  margin: '0 5px',
                  padding: '8px 12px'
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.textShadow = '0 0 8px rgba(255,255,255,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.textShadow = 'none';
                  }
                }}
              >
                <i className="bi bi-tags me-1"></i>
                Thể loại
                {isLoading && <span className="spinner-border spinner-border-sm ms-1" role="status"></span>}
              </a>
              
              {/* Dropdown menu */}
              <ul className="dropdown-menu" style={{
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(15px)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                minWidth: '180px',
                padding: '8px 4px'
              }}>
                {/* Loading state */}
                {isLoading ? (
                  <li>
                    <div className="dropdown-item-text text-center text-muted py-2">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Đang tải...
                    </div>
                  </li>
                ) : categories.length > 0 ? (
                  // Danh sách categories đơn giản
                  categories.map((category) => (
                    <li key={category.name}>
                      <Link 
                        className="dropdown-item" 
                        to={`/movies?category=${category.slug}`}
                        style={{
                          padding: '10px 16px',
                          transition: 'all 0.2s ease',
                          borderRadius: '6px',
                          margin: '2px 4px',
                          border: 'none',
                          fontSize: '14px',
                          color: '#333',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {category.label || category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  // Fallback: hiển thị danh sách cố định nếu không load được
                  fallbackCategoryList.map((category) => (
                    <li key={category.name}>
                      <Link 
                        className="dropdown-item" 
                        to={`/movies?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                        style={{
                          padding: '10px 16px',
                          transition: 'all 0.2s ease',
                          borderRadius: '6px',
                          margin: '2px 4px',
                          border: 'none',
                          fontSize: '14px',
                          color: '#333',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {category.label || category.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </li>
          </ul>

          {/* User menu - bên phải */}
          <ul className="navbar-nav">
            {isAuthenticated ? (
              // Menu khi đã đăng nhập
              <>
                {/* Admin link - chỉ hiển thị cho admin */}
                {user?.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      <i className="bi bi-gear me-1"></i>
                      Admin
                    </Link>
                  </li>
                )}
                
                {/* Upload link - cho admin và moderator */}
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/upload">
                      <i className="bi bi-plus-circle me-1"></i>
                      Upload
                    </Link>
                  </li>
                )}
                
                {/* My uploads link - cho admin và moderator */}
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-uploads">
                      <i className="bi bi-collection me-1"></i>
                      Uploads của tôi
                    </Link>
                  </li>
                )}
                
                {/* User info */}
                <li className="nav-item">
                  <span className="nav-link text-white d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    <span className="d-none d-md-inline">Chào bạn {user?.username}!</span>
                    <span className="d-md-none">Chào {user?.username}!</span>
                  </span>
                </li>
                
                {/* Logout button */}
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-2"
                    onClick={handleLogout}
                    style={{
                      borderRadius: '20px',
                      border: '2px solid white',
                      color: 'white',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255,255,255,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    <span className="d-none d-sm-inline">Đăng xuất</span>
                    <span className="d-sm-none">Thoát</span>
                  </button>
                </li>
              </>
            ) : (
              // Menu khi chưa đăng nhập
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link text-white" 
                    to="/login"
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '8px',
                      margin: '0 5px',
                      padding: '8px 12px'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.textShadow = '0 0 8px rgba(255,255,255,0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.textShadow = 'none';
                      }
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link text-white" 
                    to="/register"
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '8px',
                      margin: '0 5px',
                      padding: '8px 12px'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.textShadow = '0 0 8px rgba(255,255,255,0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.textShadow = 'none';
                      }
                    }}
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Đăng ký
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 