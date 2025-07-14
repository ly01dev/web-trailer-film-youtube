const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getAllUsers, 
  updateUserRole, 
  deleteUser 
} = require('../controllers/authController');

// ===== ADMIN ROUTES =====
router.get('/', protect, getAllUsers);                    // Lấy danh sách user (admin)
router.put('/:id/role', protect, updateUserRole);         // Thay đổi role user (admin)
router.delete('/:id', protect, deleteUser);               // Xóa user (admin)

module.exports = router; 