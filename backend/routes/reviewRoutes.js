const express = require('express');
const router = express.Router();
const { createReservationReview, getReservationReview, getAllReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/reviews/reservation
// @desc    Tạo đánh giá dịch vụ đặt bàn
// @access  Private
router.post('/reservation', protect, createReservationReview);

// @route   GET /api/reviews/reservation/:reservationId
// @desc    Lấy đánh giá của một đặt bàn
// @access  Private
router.get('/reservation/:reservationId', protect, getReservationReview);

// @route   GET /api/reviews
// @desc    Lấy tất cả đánh giá (cho admin)
// @access  Public (có thể thêm protect nếu cần)
router.get('/', getAllReviews);

module.exports = router;
