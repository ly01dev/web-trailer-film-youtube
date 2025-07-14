import api from './api';

/**
 * AuthService - Service quản lý authentication
 * Bao gồm: đăng ký, đăng nhập, đăng xuất, refresh token, user management
 */
class AuthService {
  /**
   * Kiểm tra xem user đã đăng nhập chưa
   * Gọi API để kiểm tra trạng thái authentication
   * @returns {Promise<boolean>} True nếu đã đăng nhập, false nếu chưa
   */
  async isAuthenticated() {
    try {
      await api.auth.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Đăng ký user mới
   * @param {Object} userData - Thông tin đăng ký (username, email, password)
   * @returns {Promise} Response từ API
   */
  async register(userData) {
    const response = await api.auth.register(userData);
    // Token được lưu trong cookie tự động bởi backend
    return response;
  }

  /**
   * Đăng nhập user
   * @param {Object} credentials - Thông tin đăng nhập (username, password)
   * @returns {Promise} Response từ API với user info
   */
  async login(credentials) {
    const response = await api.auth.login(credentials);
    // Token được lưu trong cookie tự động bởi backend
    return response;
  }

  /**
   * Đăng xuất user
   * Xóa tokens trên server và clear cookies
   * @returns {Promise} Response từ API
   */
  async logout() {
    const response = await api.auth.logout();
    // Cookies được clear tự động bởi backend
    return response;
  }

  /**
   * Lấy thông tin user hiện tại
   * Sử dụng access token để xác thực
   * @returns {Promise} User data
   */
  async getCurrentUser() {
    try {
      const response = await api.auth.getCurrentUser();
      return response;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * Sử dụng refresh token để lấy access token mới
   * @returns {Promise} Response với new access token
   */
  async refreshToken() {
    try {
      const response = await api.auth.refreshToken();
      return response;
    } catch (error) {
      console.error('refreshToken error:', error);
      throw error;
    }
  }
}

/**
 * Lấy danh sách tất cả users (chỉ admin)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng users mỗi trang
 * @param {string} role - Lọc theo role (all, admin, moderator, user)
 * @returns {Promise} Response với user list và statistics
 */
export const getAllUsers = async (page = 1, limit = 10, role = 'all') => {
  try {
    const response = await api.get(`/auth/admin/users?page=${page}&limit=${limit}&role=${role}`);
    console.log('API response:', response);
    
    // Nếu response.data là array (backend trả về trực tiếp)
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        statistics: {
          totalUsers: response.data.length,
          totalModerators: response.data.filter(u => u.role === 'moderator').length,
          totalAdmins: response.data.filter(u => u.role === 'admin').length
        },
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.length,
          itemsPerPage: limit
        }
      };
    }
    
    // Nếu response.data có format đúng
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Cập nhật role của user (chỉ admin)
 * @param {string} userId - ID của user
 * @param {string} role - Role mới (admin, moderator, user)
 * @returns {Promise} Response từ API
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/auth/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};

/**
 * Xóa user (chỉ admin)
 * @param {string} userId - ID của user cần xóa
 * @returns {Promise} Response từ API
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/auth/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export default new AuthService(); 