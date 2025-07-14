import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Component LoginPopup - Popup thông báo đăng nhập
 * Hiển thị sau 10s lần đầu, 30s các lần sau nếu user chưa đăng nhập
 * Không hiển thị trên trang login/register
 */
const LoginPopup = () => {
  // Lấy trạng thái authentication từ context
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // State quản lý popup và timer
  const [showPopup, setShowPopup] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const timerRef = useRef(null);

  // Kiểm tra xem có đang ở trang login/register không
  const isOnAuthPage = location.pathname === '/login' || location.pathname === '/register';

  /**
   * Function: Bắt đầu timer để hiển thị popup
   * 10s lần đầu, 30s các lần sau
   */
  const startTimer = () => {
    // Clear timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const delay = isFirstTime ? 10000 : 30000; // 10s lần đầu, 30s các lần sau
    
    timerRef.current = setTimeout(() => {
      if (!isAuthenticated && !isOnAuthPage) {
        setShowPopup(true);
        if (isFirstTime) {
          setIsFirstTime(false);
        }
      }
    }, delay);
  };

  /**
   * Effect: Quản lý timer và popup dựa trên trạng thái authentication
   */
  useEffect(() => {
    // Nếu đã đăng nhập hoặc đang ở trang auth, không hiển thị popup và clear timer
    if (isAuthenticated || isOnAuthPage) {
      setShowPopup(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Bắt đầu timer
    startTimer();

    // Cleanup function - clear timer khi component unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, isFirstTime, isOnAuthPage]);

  /**
   * Function: Xử lý đóng popup
   * Đóng popup và bắt đầu timer mới
   */
  const handleClosePopup = () => {
    setShowPopup(false);
    // Bắt đầu timer mới sau khi đóng
    startTimer();
  };

  // Không hiển thị nếu đã đăng nhập, đang ở trang auth, hoặc popup chưa được trigger
  if (isAuthenticated || isOnAuthPage || !showPopup) {
    return null;
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
         style={{ 
           zIndex: 9999, 
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
           backdropFilter: 'blur(5px)'
         }}>
      {/* Popup card */}
      <div className="card border-0 shadow-lg" style={{
        maxWidth: '400px',
        width: '90%',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="card-body p-4 text-center">
          {/* Close button */}
          <button
            onClick={handleClosePopup}
            className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
            style={{ zIndex: 1 }}
            aria-label="Close"
          ></button>

          {/* Icon */}
          <div className="mb-4">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.8)' }}></i>
          </div>

          {/* Title */}
          <h4 className="fw-bold mb-3">Chào mừng bạn!</h4>

          {/* Message */}
          <p className="mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Đăng nhập để trải nghiệm đầy đủ tính năng của MovieTube. 
            Xem phim không giới hạn và quyền được bình luận phim của bạn!
          </p>

          {/* Benefits list */}
          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-check-circle-fill me-3" style={{ color: '#28a745' }}></i>
              <span>Xem phim chất lượng cao</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-check-circle-fill me-3" style={{ color: '#28a745' }}></i>
              <span>Bình luận phim yêu thích</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-3" style={{ color: '#28a745' }}></i>
              <span>Không quảng cáo</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-grid gap-3">
            {/* Login button */}
            <Link 
              to="/login" 
              className="btn btn-light btn-lg fw-bold"
              style={{ borderRadius: '12px' }}
              onClick={handleClosePopup}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Đăng nhập ngay
            </Link>
            
            {/* Register button */}
            <Link 
              to="/register" 
              className="btn btn-outline-light btn-lg"
              style={{ borderRadius: '12px' }}
              onClick={handleClosePopup}
            >
              <i className="bi bi-person-plus me-2"></i>
              Tạo tài khoản mới
            </Link>
          </div>

          {/* Skip button */}
          <button
            onClick={handleClosePopup}
            className="btn btn-link text-white text-decoration-none mt-3"
            style={{ fontSize: '0.9rem' }}
          >
            <i className="bi bi-clock me-1"></i>
            Để sau (30s nữa sẽ hiện lại)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup; 