import { createContext } from 'react';

/**
 * AuthContext - React Context cho authentication
 * Được sử dụng để chia sẻ authentication state và functions
 * giữa các components trong ứng dụng
 * 
 * Context value bao gồm:
 * - user: Thông tin user hiện tại
 * - isAuthenticated: Boolean cho biết đã đăng nhập chưa
 * - loading: Boolean cho biết đang loading auth check
 * - login: Function đăng nhập
 * - logout: Function đăng xuất
 * - register: Function đăng ký
 */
export const AuthContext = createContext(); 