const db = require('../config/db');

/**
 * Tạo đánh giá dịch vụ đặt bàn
 */
const createReservationReview = async (req, res) => {
    const { reservationId, rating, comment } = req.body;
    const userId = req.user?.user_id;

    if (!reservationId || !userId || !rating) {
        return res.status(400).json({ message: 'Thiếu thông tin: reservationId, rating' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating phải từ 1-5 sao.' });
    }

    try {
        // Kiểm tra đặt bàn tồn tại, thuộc user này, và đã checkout
        const [reservations] = await db.query(
            `SELECT reservation_id FROM reservations 
             WHERE reservation_id = ? AND user_id = ? AND is_checked_out = 1`,
            [reservationId, userId]
        );

        if (reservations.length === 0) {
            return res.status(404).json({ 
                message: 'Không tìm thấy đặt bàn hoặc đặt bàn chưa checkout.' 
            });
        }

        // Kiểm tra đã đánh giá chưa
        const [existingReview] = await db.query(
            'SELECT review_id FROM reservationreviews WHERE reservation_id = ?',
            [reservationId]
        );

        if (existingReview.length > 0) {
            // Cập nhật đánh giá
            await db.query(
                `UPDATE reservationreviews 
                 SET rating = ?, comment = ?, created_at = NOW()
                 WHERE reservation_id = ?`,
                [rating, comment || null, reservationId]
            );
            res.json({ message: 'Đã cập nhật đánh giá của bạn!' });
        } else {
            // Tạo đánh giá mới
            await db.query(
                `INSERT INTO reservationreviews (reservation_id, user_id, rating, comment, created_at)
                 VALUES (?, ?, ?, ?, NOW())`,
                [reservationId, userId, rating, comment || null]
            );
            res.json({ message: 'Cảm ơn bạn đã đánh giá dịch vụ!' });
        }
    } catch (error) {
        console.error('Create reservation review error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lưu đánh giá.' });
    }
};

/**
 * Lấy đánh giá của một đặt bàn
 */
const getReservationReview = async (req, res) => {
    const { reservationId } = req.params;
    const userId = req.user?.user_id;

    try {
        const [reviews] = await db.query(
            `SELECT * FROM reservationreviews WHERE reservation_id = ? AND user_id = ?`,
            [reservationId, userId]
        );

        res.json({ review: reviews[0] || null });
    } catch (error) {
        console.error('Get reservation review error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy đánh giá.' });
    }
};

/**
 * Lấy tất cả đánh giá dịch vụ (cho admin)
 */
const getAllReviews = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    try {
        const offset = (page - 1) * limit;

        const [reviews] = await db.query(
            `SELECT rr.*, u.name as user_name, r.res_date, r.table_id, t.table_name
             FROM reservationreviews rr
             LEFT JOIN users u ON rr.user_id = u.user_id
             LEFT JOIN reservations r ON rr.reservation_id = r.reservation_id
             LEFT JOIN restauranttables t ON r.table_id = t.table_id
             ORDER BY rr.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );

        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM reservationreviews'
        );

        const total = countResult[0]?.total || 0;

        // Tính rating trung bình
        const [avgResult] = await db.query(
            'SELECT AVG(rating) as avgRating FROM reservationreviews'
        );
        const avgRating = avgResult[0]?.avgRating 
            ? parseFloat(avgResult[0].avgRating).toFixed(1) 
            : 0;

        res.json({
            reviews,
            avgRating,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy đánh giá.' });
    }
};

module.exports = {
    createReservationReview,
    getReservationReview,
    getAllReviews,
};
