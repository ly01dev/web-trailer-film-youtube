import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import authService from '../services/authService';

/**
 * AuthProvider - Context provider quản lý authentication
 * Cung cấp: user state, login/logout/register functions, loading state
 */
export const AuthProvider = ({ children }) => {
  // State quản lý user và loading
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Effect: Kiểm tra trạng thái đăng nhập khi app khởi động
   * Tự động refresh token nếu cần thiết
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking authentication status...');
        
        // Kiểm tra xem có user data trong localStorage không
        const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
        
        if (!hasLoggedInBefore) {
          // Chưa từng đăng nhập, không cần kiểm tra gì cả
          console.log('Chưa từng đăng nhập, bỏ qua auth check');
          setUser(null);
          setLoading(false);
          return;
        }

        // Đã đăng nhập trước đó, thử lấy thông tin user
        try {
          const userData = await authService.getCurrentUser();
          console.log('User data retrieved:', userData);
          setUser(userData);
        } catch (error) {
          // Phân tích lỗi chi tiết để xử lý phù hợp
          const errMsg = error?.message || error?.toString() || '';
          const statusCode = error?.status || error?.response?.status;
          
          console.log('Error details:', { errMsg, statusCode });
          
          if (statusCode === 401 || errMsg.includes('401') || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('hết hạn')) {
            // Token hết hạn hoặc không hợp lệ, thử refresh token
            console.warn('Access token hết hạn hoặc không hợp lệ, thử refresh token...');
            try {
              await authService.refreshToken();
              // Thử lại getCurrentUser sau khi refresh
              const userData = await authService.getCurrentUser();
              setUser(userData);
              console.log('User data retrieved after refresh:', userData);
            } catch (refreshError) {
              console.error('Refresh token failed:', refreshError);
              // Refresh token cũng hết hạn, xóa dấu hiệu đã đăng nhập
              localStorage.removeItem('hasLoggedInBefore');
              setUser(null);
            }
          } else if (statusCode === 404 || errMsg.includes('404') || errMsg.toLowerCase().includes('không tồn tại')) {
            // User không tồn tại trong database, xóa dấu hiệu đã đăng nhập
            console.error('User không tồn tại trong database:', error);
            localStorage.removeItem('hasLoggedInBefore');
            setUser(null);
          } else if (errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network error')) {
            // Lỗi kết nối mạng, giữ nguyên trạng thái
            console.error('Network error, backend might be down:', error);
            setUser(null);
          } else {
            // Các lỗi khác
            console.error('Other error:', error);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  /**
   * Function: Đăng nhập user
   * @param {Object} credentials - Thông tin đăng nhập (username, password)
   * @returns {Promise} Response từ API
   */
  const login = async (credentials) => {
    try {
      console.log('Login attempt with credentials:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      console.log('Setting user:', response.user);
      
      // Cập nhật user state và đánh dấu đã đăng nhập
      setUser(response.user);
      localStorage.setItem('hasLoggedInBefore', 'true');
      
      return response;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  /**
   * Function: Đăng xuất user
   * Xóa user state, localStorage và redirect về login
   */
  const logout = async () => {
    try {
      // Gọi API logout để xóa token trên server
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Luôn xóa user state và localStorage ngay cả khi API lỗi
      setUser(null);
      localStorage.removeItem('hasLoggedInBefore');
      navigate('/login');
    }
  };

  /**
   * Function: Đăng ký user mới
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise} Response từ API
   */
  const register = async (userData) => {
    const response = await authService.register(userData);
    // Không set user và localStorage, để user phải đăng nhập thủ công
    return response;
  };

  // Context value được cung cấp cho các component con
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user // Boolean: true nếu có user, false nếu không
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 