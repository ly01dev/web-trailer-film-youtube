import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom Hook: useAuth
 * Cung cấp access đến authentication context
 * Sử dụng trong các components để lấy thông tin user và auth functions
 * 
 * @returns {Object} Auth context value bao gồm:
 * - user: Thông tin user hiện tại (null nếu chưa đăng nhập)
 * - isAuthenticated: Boolean cho biết đã đăng nhập chưa
 * - loading: Boolean cho biết đang loading auth check
 * - login: Function đăng nhập
 * - logout: Function đăng xuất
 * - register: Function đăng ký
 * 
 * @throws {Error} Nếu sử dụng ngoài AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 