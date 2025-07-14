/**
 * AuthController - Xử lý tất cả logic authentication
 * Bao gồm: đăng ký, đăng nhập, đăng xuất, refresh token, user management
 */

const User = require('../models/User');
const Movie = require('../models/Movie');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Đăng ký người dùng mới
 * POST /api/auth/register
 * @param {Object} req.body - { username, email, password }
 * @returns {Object} Response với thông tin user đã tạo
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
    }

    // Tạo người dùng mới (password được mã hóa tự động bởi middleware)
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Không tạo token, chỉ trả về thông báo thành công
    res.status(201).json({
      message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Đăng nhập người dùng
 * POST /api/auth/login
 * @param {Object} req.body - { email, password }
 * @returns {Object} Response với user info và set cookies
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email (bao gồm password để so sánh)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Debug: Kiểm tra password có tồn tại không
    console.log('User found:', user.email);
    console.log('Password field exists:', !!user.password);
    console.log('Input password length:', password.length);
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    
    // Kiểm tra mật khẩu sử dụng method của User model
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo access token và refresh token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookies với cấu hình bảo mật
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // false cho development, true cho production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 phút
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // false cho development, true cho production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    console.log('Cookies set for user:', user.email);
    console.log('Access token:', accessToken.substring(0, 20) + '...');
    console.log('Refresh token:', refreshToken.substring(0, 20) + '...');

    const responseData = {
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
    
    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 * GET /api/auth/me
 * @returns {Object} Thông tin user hiện tại
 */
const getCurrentUser = async (req, res) => {
  try {
    console.log('getCurrentUser called with req.user:', req.user);
    console.log('req.user._id:', req.user?._id);
    
    // req.user đã là user object từ middleware auth, không cần tìm lại
    if (!req.user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Trả về format giống như login để đồng nhất
    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Đăng xuất - Clear cookies
 * POST /api/auth/logout
 * @returns {Object} Thông báo đăng xuất thành công
 */
const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 * @returns {Object} Thông báo refresh thành công
 */
const refreshToken = async (req, res) => {
  try {
    console.log('=== REFRESH TOKEN CALLED ===');
    console.log('Cookies received:', req.cookies);
    
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      console.log('No refresh token found in cookies');
      return res.status(401).json({ message: 'Refresh token không tồn tại' });
    }

    console.log('Refresh token found:', refreshToken.substring(0, 20) + '...');

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    console.log('Decoded refresh token:', decoded);
    
    // Tạo access token mới
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log('New access token created:', accessToken.substring(0, 20) + '...');

    // Set cookie mới
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // false cho development, true cho production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 phút
    });

    console.log('New access token set after refresh:', accessToken.substring(0, 20) + '...');
    console.log('=== REFRESH TOKEN COMPLETED ===');

    res.json({ message: 'Token đã được refresh thành công' });
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Refresh token không hợp lệ' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token đã hết hạn' });
    }
    
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Test password hashing (chỉ dùng trong development)
 * POST /api/auth/test-password
 * @param {Object} req.body - { password }
 * @returns {Object} Hash của password
 */
const testPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password là bắt buộc' });
    }
    
    // Hash password với bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Verify password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    
    res.json({
      originalPassword: password,
      hashedPassword: hashedPassword,
      isMatch: isMatch,
      saltRounds: saltRounds
    });
  } catch (error) {
    console.error('Lỗi test password:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách tất cả users (chỉ admin)
 * GET /api/auth/admin/users
 * @param {Object} req.query - { page, limit, role }
 * @returns {Object} Danh sách users và statistics
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    // Xây dựng filter query
    let filter = {};
    if (role !== 'all') {
      filter.role = role;
    }
    
    // Lấy danh sách users với pagination
    const users = await User.find(filter)
      .select('-password') // Không trả về password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số users
    const totalUsers = await User.countDocuments(filter);
    
    // Tính toán statistics
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalModerators = await User.countDocuments({ role: 'moderator' });
    const totalRegularUsers = await User.countDocuments({ role: 'user' });
    
    // Tính tổng số trang
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: totalUsers,
        itemsPerPage: parseInt(limit)
      },
      statistics: {
        totalUsers: totalUsers,
        totalAdmins: totalAdmins,
        totalModerators: totalModerators,
        totalRegularUsers: totalRegularUsers
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Cập nhật role của user (chỉ admin)
 * PUT /api/auth/admin/users/:userId/role
 * @param {string} req.params.userId - ID của user
 * @param {Object} req.body - { role }
 * @returns {Object} Thông tin user đã cập nhật
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Role không hợp lệ. Role phải là: user, moderator, hoặc admin' 
      });
    }
    
    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }
    
    // Không cho phép admin thay đổi role của chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể thay đổi role của chính mình' });
    }
    
    // Cập nhật role
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `Đã cập nhật role của ${user.username} thành ${role}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật role:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Xóa user (chỉ admin)
 * DELETE /api/auth/admin/users/:userId
 * @param {string} req.params.userId - ID của user cần xóa
 * @returns {Object} Thông báo xóa thành công
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }
    
    // Không cho phép admin xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }
    
    // Không cho phép xóa admin khác
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Không thể xóa admin khác' });
    }
    
    // Xóa tất cả phim của user này
    await Movie.deleteMany({ uploadedBy: userId });
    
    // Xóa user
    await User.findByIdAndDelete(userId);
    
    res.json({
      success: true,
      message: `Đã xóa user ${user.username} và tất cả phim của họ`
    });
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken,
  testPassword,
  getAllUsers,
  updateUserRole,
  deleteUser
}; 