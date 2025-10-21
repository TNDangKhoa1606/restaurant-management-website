const express = require('express');
const router = express.Router();
const { getMenu } = require('../controllers/menuController');

// @route   GET /api/menu
// @desc    Lấy tất cả các món trong thực đơn từ database
// @access  Public
router.get('/', getMenu);

module.exports = router;