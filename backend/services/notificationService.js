/**
 * Notification Service
 * Xử lý logic gửi thông báo qua web và email
 */

const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const { generateOrderStatusEmail, orderStatusLabels } = require('../templates/orderStatusEmail');
const { generatePromotionEmail } = require('../templates/promotionEmail');

// Lazy load để tránh circular dependency
const getIoInstance = () => {
    const { getIoInstance: getIo } = require('../socket');
    return getIo();
};

/**
 * Tạo notification trong database
 */
const createNotification = async (userId, type, title, message) => {
    try {
        const [result] = await db.query(
            `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
            [userId, type, title, message]
        );
        return result.insertId;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};

/**
 * Gửi notification realtime qua socket
 */
const emitNotificationToUser = (userId, notification) => {
    const io = getIoInstance();
    if (!io) return;

    // Emit tới room của user
    io.to(`user_${userId}`).emit('new_notification', notification);
};

/**
 * Gửi thông báo trạng thái đơn hàng
 */
const sendOrderStatusNotification = async (orderId, newStatus) => {
    try {
        // Lấy thông tin order và user
        const [orders] = await db.query(
            `SELECT o.*, u.email, u.name as user_name 
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.user_id 
             WHERE o.order_id = ?`,
            [orderId]
        );

        if (orders.length === 0) return;

        const order = orders[0];
        if (!order.user_id) return; // Skip nếu là đơn hàng của khách vãng lai

        const statusLabel = orderStatusLabels[newStatus] || newStatus;
        const title = `Đơn hàng #${orderId} - ${statusLabel}`;
        const message = `Đơn hàng #${orderId} của bạn đã được cập nhật sang trạng thái: ${statusLabel}`;

        // 1. Lưu vào database
        const notifId = await createNotification(order.user_id, 'order_status', title, message);

        // 2. Emit realtime
        emitNotificationToUser(order.user_id, {
            notif_id: notifId,
            type: 'order_status',
            title,
            message,
            is_read: 0,
            created_at: new Date(),
        });

        // 3. Gửi email
        if (order.email) {
            try {
                await sendEmail({
                    to: order.email,
                    subject: title,
                    html: generateOrderStatusEmail(order, newStatus),
                });
            } catch (emailError) {
                console.error('Send order status email error:', emailError);
                // Không throw, chỉ log lỗi email
            }
        }

        return notifId;
    } catch (error) {
        console.error('Send order status notification error:', error);
        throw error;
    }
};

/**
 * Gửi thông báo đặt bàn
 */
const sendReservationNotification = async (reservationId, status, customMessage = null) => {
    try {
        const [reservations] = await db.query(
            `SELECT r.*, u.email, u.name as user_name, t.table_name
             FROM reservations r
             LEFT JOIN users u ON r.user_id = u.user_id
             LEFT JOIN restauranttables t ON r.table_id = t.table_id
             WHERE r.reservation_id = ?`,
            [reservationId]
        );

        if (reservations.length === 0) return;

        const reservation = reservations[0];
        if (!reservation.user_id) return;

        const statusLabels = {
            booked: 'Đã xác nhận',
            cancelled: 'Đã hủy',
            completed: 'Hoàn thành',
        };

        const statusLabel = statusLabels[status] || status;
        const title = `Đặt bàn #${reservationId} - ${statusLabel}`;
        const message = customMessage || `Đặt bàn #${reservationId} của bạn đã được ${statusLabel.toLowerCase()}.`;

        // 1. Lưu vào database
        const notifId = await createNotification(reservation.user_id, 'reservation', title, message);

        // 2. Emit realtime
        emitNotificationToUser(reservation.user_id, {
            notif_id: notifId,
            type: 'reservation',
            title,
            message,
            is_read: 0,
            created_at: new Date(),
        });

        return notifId;
    } catch (error) {
        console.error('Send reservation notification error:', error);
        throw error;
    }
};

/**
 * Gửi thông báo điểm thưởng
 */
const sendLoyaltyPointsNotification = async (userId, points, reason) => {
    try {
        const action = points > 0 ? 'được cộng' : 'bị trừ';
        const title = `Điểm thưởng ${action} ${Math.abs(points)} điểm`;
        const message = `Bạn ${action} ${Math.abs(points)} điểm thưởng. Lý do: ${reason}`;

        // 1. Lưu vào database
        const notifId = await createNotification(userId, 'loyalty', title, message);

        // 2. Emit realtime
        emitNotificationToUser(userId, {
            notif_id: notifId,
            type: 'loyalty',
            title,
            message,
            is_read: 0,
            created_at: new Date(),
        });

        return notifId;
    } catch (error) {
        console.error('Send loyalty points notification error:', error);
        throw error;
    }
};

/**
 * Gửi khuyến mãi hàng loạt
 */
const sendBulkPromotion = async (promotion, userFilter = {}) => {
    try {
        // Build query để lấy danh sách users
        let query = `SELECT user_id, email, name FROM users WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'customer')`;
        const params = [];

        if (userFilter.isVip) {
            query += ` AND is_vip = 1`;
        }

        if (userFilter.minLoyaltyPoints) {
            query += ` AND loyalty_points >= ?`;
            params.push(userFilter.minLoyaltyPoints);
        }

        const [users] = await db.query(query, params);

        const results = {
            total: users.length,
            success: 0,
            failed: 0,
        };

        // Gửi cho từng user
        for (const user of users) {
            try {
                // 1. Lưu notification
                const notifId = await createNotification(
                    user.user_id,
                    'promotion',
                    promotion.title,
                    promotion.message
                );

                // 2. Emit realtime
                emitNotificationToUser(user.user_id, {
                    notif_id: notifId,
                    type: 'promotion',
                    title: promotion.title,
                    message: promotion.message,
                    is_read: 0,
                    created_at: new Date(),
                });

                // 3. Gửi email nếu có
                if (user.email && promotion.sendEmail) {
                    await sendEmail({
                        to: user.email,
                        subject: `🎉 ${promotion.title}`,
                        html: generatePromotionEmail(promotion),
                    });
                }

                results.success++;
            } catch (err) {
                console.error(`Failed to send promotion to user ${user.user_id}:`, err);
                results.failed++;
            }
        }

        return results;
    } catch (error) {
        console.error('Send bulk promotion error:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    emitNotificationToUser,
    sendOrderStatusNotification,
    sendReservationNotification,
    sendLoyaltyPointsNotification,
    sendBulkPromotion,
};
