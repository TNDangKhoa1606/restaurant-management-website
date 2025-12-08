const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    internalLogin,
    googleCallback, // Import hàm xử lý callback
    updateCustomerProfile,
    changePassword,
    uploadAvatar,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// === Các route xác thực thông thường ===

router.post('/register', register);

// @route   POST api/auth/login
router.post('/login', login);

// @route   POST api/auth/internal-login
router.post('/internal-login', internalLogin);

// @route   GET api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// @route   POST api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   PATCH api/auth/reset-password/:token
router.patch('/reset-password/:token', resetPassword);

// @route   POST api/auth/change-password
// @desc    Khách hàng đổi mật khẩu khi đã đăng nhập
// @access  Private
router.post('/change-password', protect, changePassword);

// @route   POST api/auth/avatar
// @desc    Cập nhật ảnh đại diện người dùng
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// @route   PUT api/auth/me
// @desc    Khách hàng cập nhật thông tin cá nhân (name, phone)
// @access  Private
router.put('/me', protect, updateCustomerProfile);

// === Các route xác thực qua Google ===

// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleCallback // Sử dụng hàm callback từ controller
);

module.exports = router;