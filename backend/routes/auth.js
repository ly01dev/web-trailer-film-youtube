const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.post('/logout', authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);



// Lấy thông tin người dùng hiện tại (cần đăng nhập)
router.get('/me', protect, authController.getCurrentUser);

// Test route (chỉ dùng trong development)
router.post('/test-password', authController.testPassword);

// ===== ADMIN ROUTES =====
router.get('/admin/users', protect, authController.getAllUsers);                    // Lấy danh sách user (admin)
router.put('/admin/users/:id/role', protect, authController.updateUserRole);         // Thay đổi role user (admin)
router.delete('/admin/users/:id', protect, authController.deleteUser);               // Xóa user (admin)

module.exports = router; 