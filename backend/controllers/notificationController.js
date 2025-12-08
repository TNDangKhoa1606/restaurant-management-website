/**
 * Notification Controller
 * API endpoints cho quản lý thông báo
 */

const db = require('../config/db');
const { sendBulkPromotion } = require('../services/notificationService');

/**
 * GET /api/notifications
 * Lấy danh sách thông báo của user hiện tại
 */
const getNotifications = async (req, res) => {
    const userId = req.user?.user_id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [notifications] = await db.query(
            `SELECT notif_id, type, title, message, is_read, created_at 
             FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?`,
            [userId]
        );

        res.json({
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông báo.' });
    }
};

/**
 * GET /api/notifications/unread-count
 * Đếm số thông báo chưa đọc
 */
const getUnreadCount = async (req, res) => {
    const userId = req.user?.user_id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [[{ count }]] = await db.query(
            `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
            [userId]
        );

        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

/**
 * PUT /api/notifications/:id/read
 * Đánh dấu một thông báo đã đọc
 */
const markAsRead = async (req, res) => {
    const userId = req.user?.user_id;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [result] = await db.query(
            `UPDATE notifications SET is_read = 1 WHERE notif_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        res.json({ message: 'Đã đánh dấu đã đọc.' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

/**
 * PUT /api/notifications/read-all
 * Đánh dấu tất cả thông báo đã đọc
 */
const markAllAsRead = async (req, res) => {
    const userId = req.user?.user_id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        await db.query(
            `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
            [userId]
        );

        res.json({ message: 'Đã đánh dấu tất cả đã đọc.' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

/**
 * DELETE /api/notifications/:id
 * Xóa một thông báo
 */
const deleteNotification = async (req, res) => {
    const userId = req.user?.user_id;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [result] = await db.query(
            `DELETE FROM notifications WHERE notif_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        res.json({ message: 'Đã xóa thông báo.' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

/**
 * POST /api/notifications/send-promotion (Admin only)
 * Gửi khuyến mãi hàng loạt
 */
const sendPromotion = async (req, res) => {
    const { title, message, code, discountPercent, validUntil, sendEmail, filter } = req.body;

    if (!title || !message) {
        return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và nội dung.' });
    }

    try {
        const promotion = {
            title,
            message,
            code: code || null,
            discountPercent: discountPercent || null,
            validUntil: validUntil || null,
            sendEmail: sendEmail || false,
        };

        const userFilter = filter || {};

        const results = await sendBulkPromotion(promotion, userFilter);

        res.json({
            message: `Đã gửi khuyến mãi cho ${results.success}/${results.total} khách hàng.`,
            results,
        });
    } catch (error) {
        console.error('Send promotion error:', error);
        res.status(500).json({ message: 'Lỗi khi gửi khuyến mãi.' });
    }
};

/**
 * POST /api/notifications/send-to-user (Admin only)
 * Gửi thông báo đến 1 user cụ thể
 */
const sendToUser = async (req, res) => {
    const { userId, type, title, message } = req.body;

    if (!userId || !title || !message) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }

    try {
        // Lưu vào database
        const [result] = await db.query(
            `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
            [userId, type || 'promotion', title, message]
        );

        const notifId = result.insertId;

        // Emit realtime qua socket
        const { getIoInstance } = require('../socket');
        const io = getIoInstance();
        if (io) {
            io.to(`user_${userId}`).emit('new_notification', {
                notif_id: notifId,
                type: type || 'promotion',
                title,
                message,
                is_read: 0,
                created_at: new Date(),
            });
        }

        res.json({ message: 'Đã gửi thông báo thành công.', notifId });
    } catch (error) {
        console.error('Send to user error:', error);
        res.status(500).json({ message: 'Lỗi khi gửi thông báo.' });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendPromotion,
    sendToUser,
};
