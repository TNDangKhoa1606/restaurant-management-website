const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    createPaymentSession,
    uploadTransferProof,
    verifyManualPayment,
    handleMomoReturn,
    handleMomoIpn,
    demoConfirmPayment,
    getPaymentInfo,
} = require('../modules/payments/paymentController');

// MoMo routes phải đặt trước /:id để tránh conflict
router.get('/momo/return', handleMomoReturn);
router.post('/momo/ipn', handleMomoIpn);

router.post('/session', protect, createPaymentSession);
router.get('/:id', protect, getPaymentInfo);
router.post('/:id/proof', protect, upload.single('proof'), uploadTransferProof);
router.post(
    '/:id/verify',
    protect,
    authorizeRoles('Admin', 'Receptionist'),
    verifyManualPayment
);

// Demo endpoint: cho phép giả lập thanh toán thành công cho một payment cụ thể
router.post('/:id/demo-confirm', protect, demoConfirmPayment);

module.exports = router;
