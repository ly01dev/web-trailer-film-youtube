/**
 * API Service - Quản lý tất cả HTTP requests đến backend
 * Bao gồm: Base URL configuration, HTTP methods, error handling, authentication
 */

/**
 * Function: Tự động detect base URL dựa trên environment
 * Development: localhost:5000/api
 * Production: /api (cùng domain)
 * @returns {string} Base URL cho API
 */
const getBaseURL = () => {
  const currentPort = window.location.port;
  const isDev = currentPort === '5173' || currentPort === '3000' || currentPort === '5174';
  
  if (isDev) {
    // Development: sử dụng localhost:5000
    return 'http://localhost:5000/api';
  }
  
  // Production: sử dụng cùng domain
  return '/api';
};

const API_BASE_URL = getBaseURL();

/**
 * Function: Tạo headers cho HTTP requests
 * @returns {Object} Headers object
 */
const createHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Function: Xử lý response từ server
 * Tự động parse JSON và throw error nếu có lỗi
 * @param {Response} response - Response object từ fetch
 * @returns {Promise} Parsed data hoặc throw error
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'Có lỗi xảy ra');
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }
  
  return data;
};

/**
 * Generic HTTP methods object
 * Tất cả requests đều include credentials để gửi cookies
 */
const api = {
  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {Object} config - Additional config
   * @returns {Promise} Response data
   */
  get: async (url, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: createHeaders(),
      credentials: 'include', // Gửi cookies
      ...config
    });
    return handleResponse(response);
  },

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @param {Object} config - Additional config
   * @returns {Promise} Response data
   */
  post: async (url, data = {}, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: createHeaders(),
      credentials: 'include', // Gửi cookies
      body: JSON.stringify(data),
      ...config
    });
    return handleResponse(response);
  },

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @param {Object} config - Additional config
   * @returns {Promise} Response data
   */
  put: async (url, data = {}, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: createHeaders(),
      credentials: 'include', // Gửi cookies
      body: JSON.stringify(data),
      ...config
    });
    return handleResponse(response);
  },

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {Object} config - Additional config
   * @returns {Promise} Response data
   */
  delete: async (url, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: createHeaders(),
      credentials: 'include', // Gửi cookies
      ...config
    });
    return handleResponse(response);
  },

  /**
   * Authentication APIs
   * Quản lý đăng ký, đăng nhập, đăng xuất, refresh token
   */
  auth: {
    /**
     * Đăng ký user mới
     * @param {Object} userData - Thông tin đăng ký (username, email, password)
     * @returns {Promise} Response data
     */
    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    },

    /**
     * Đăng nhập user
     * @param {Object} credentials - Thông tin đăng nhập (username, password)
     * @returns {Promise} Response data với user info và tokens
     */
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      return handleResponse(response);
    },

    /**
     * Đăng xuất user
     * Xóa tokens trên server
     * @returns {Promise} Response data
     */
    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    },

    /**
     * Refresh access token
     * Sử dụng refresh token để lấy access token mới
     * @returns {Promise} Response data với new access token
     */
    refreshToken: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    },

    /**
     * Lấy thông tin user hiện tại
     * Sử dụng access token để xác thực
     * @returns {Promise} User data
     */
    getCurrentUser: async () => {
      console.log('Calling getCurrentUser with URL:', `${API_BASE_URL}/auth/me`);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: createHeaders(),
        credentials: 'include'
      });
      console.log('getCurrentUser response status:', response.status);
      return handleResponse(response);
    }
  },

  /**
   * Movie APIs - Đã được tách ra thành movieService riêng
   * Giữ lại để tương thích ngược nếu cần
   */
  movies: {
    // TODO: Có thể thêm các API movies nếu cần
  }
};

export default api; 