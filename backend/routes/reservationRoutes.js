const express = require('express');
const router = express.Router();
const { createReservation, createReservationWithDeposit, getReservations, getMyReservations, updateReservationStatus, getReservationLayout, markDepositCash, checkoutReservation } = require('../controllers/reservationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Khách hàng tạo đặt bàn, bắt buộc chọn bàn cụ thể
router.post('/', createReservation);

// Khách hàng tạo đặt bàn kèm đặt cọc (50% giá bàn hoặc bàn + món pre-order)
router.post('/deposit', createReservationWithDeposit);

// Lấy sơ đồ bàn theo ngày/giờ/số khách để hiển thị cho khách chọn bàn
router.get('/layout', getReservationLayout);

// Khách hàng xem lịch sử đặt bàn của chính mình
router.get('/my', protect, getMyReservations);

// Admin / Lễ tân / Phục vụ xem danh sách đặt bàn (để nhận biết pre-order)
router.get('/', protect, authorizeRoles('Admin', 'Receptionist', 'Waiter'), getReservations);

// Admin / Lễ tân cập nhật trạng thái đặt bàn
router.put('/:id/status', protect, authorizeRoles('Admin', 'Receptionist'), updateReservationStatus);

// Admin / Lễ tân ghi nhận khách đã đặt cọc tiền mặt
router.post('/:id/mark-deposit-cash', protect, authorizeRoles('Admin', 'Receptionist'), markDepositCash);

// Admin / Lễ tân / Phục vụ checkout - thanh toán xong, giải phóng bàn
router.post('/:id/checkout', protect, authorizeRoles('Admin', 'Receptionist', 'Waiter'), checkoutReservation);

module.exports = router;
