/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendPromotion,
    sendToUser,
} = require('../controllers/notificationController');

// User routes (cần đăng nhập)
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin routes (cần quyền admin)
router.post('/send-promotion', protect, authorizeRoles('Admin'), sendPromotion);
router.post('/send-to-user', protect, authorizeRoles('Admin'), sendToUser);

module.exports = router;

