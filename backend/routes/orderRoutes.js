const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, updateOrderStatus, createOrder, getKitchenOrders, getMyOrders, getMyOrderById } = require('../controllers/orderController');
const { protect, isAdmin, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, isAdmin, getAllOrders)
    .post(createOrder);

router
    .route('/kitchen')
    .get(protect, authorizeRoles('Admin', 'Kitchen'), getKitchenOrders);

router
    .route('/my')
    .get(protect, getMyOrders);

router
    .route('/my/:id')
    .get(protect, getMyOrderById);

router
    .route('/:id')
    .get(protect, isAdmin, getOrderById);

router
    .route('/:id/status')
    .put(protect, authorizeRoles('Admin', 'Kitchen'), updateOrderStatus);

module.exports = router;