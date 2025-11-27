const express = require('express');
const router = express.Router();
const { getMenu, getMenuCategories } = require('../controllers/menuController');

// @route   GET /api/menu
// @desc    Lấy tất cả các món trong thực đơn từ database
// @access  Public
router.get('/', getMenu);

// @route   GET /api/menu/categories
// @desc    Lấy tất cả danh mục món ăn
// @access  Public (hoặc có thể cần xác thực tùy theo yêu cầu)
router.get('/categories', getMenuCategories);

module.exports = router;