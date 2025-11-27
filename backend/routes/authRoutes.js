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
} = require('../controllers/authController');

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