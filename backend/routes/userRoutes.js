const express = require('express');
const router = express.Router();
const { createStaffAccount, getAllStaff, deleteUser, getAllCustomers, updateUser, getCustomerDetails, getCustomerHistory, toggleVipStatus } = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/users/create-staff
// @desc    Admin tạo tài khoản cho nhân viên
// @access  Private/Admin
router.post('/create-staff', protect, isAdmin, createStaffAccount);

// @route   GET /api/users/staff
// @desc    Admin lấy danh sách tất cả nhân viên
// @access  Private/Admin
router.get('/staff', protect, isAdmin, getAllStaff);

// @route   PUT /api/users/:id
// @desc    Admin cập nhật thông tin người dùng
// @access  Private/Admin
router.put('/:id', protect, isAdmin, updateUser);

// @route   DELETE /api/users/:id
// @desc    Admin xóa một người dùng
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, deleteUser);

// @route   GET /api/users/customers
// @desc    Admin lấy danh sách tất cả khách hàng
// @access  Private/Admin
router.get('/customers', protect, isAdmin, getAllCustomers);

// @desc    Lấy thông tin chi tiết của một khách hàng
// @route   GET /api/users/:id/details
// @access  Private/Admin
router.get('/:id/details', protect, isAdmin, getCustomerDetails);

// @desc    Lấy lịch sử của một khách hàng
// @route   GET /api/users/:id/history
// @access  Private/Admin
router.get('/:id/history', protect, isAdmin, getCustomerHistory);

// @desc    Bật/tắt trạng thái VIP cho khách hàng
// @route   PUT /api/users/:id/toggle-vip
// @access  Private/Admin
router.put('/:id/toggle-vip', protect, isAdmin, toggleVipStatus);

module.exports = router;