const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const { emitReservationsUpdateForUser, emitTablesUpdate } = require('../socket');
const { sendReservationNotification } = require('../services/notificationService');

const PREORDER_NOTE_REGEX = /Pre-order cho đặt bàn\s*#(\d+)/i;

const parseReservationIdFromNote = (note) => {
    if (!note || typeof note !== 'string') {
        return null;
    }
    const match = note.match(PREORDER_NOTE_REGEX);
    if (!match) {
        return null;
    }
    const reservationId = parseInt(match[1], 10);
    return Number.isNaN(reservationId) ? null : reservationId;
};

const RESERVATION_HOLD_MINUTES = 5;

const autoExpireUnpaidReservations = async () => {
    const connection = await db.getConnection();
    let expiredReservations = [];

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT 
                r.reservation_id,
                r.table_id,
                r.deposit_order_id,
                r.user_id,
                r.res_date,
                r.res_time,
                r.number_of_people,
                COALESCE(r.guest_name, u.name) AS guest_name,
                COALESCE(r.guest_phone, u.phone) AS guest_phone,
                u.email,
                t.table_name
             FROM reservations r
             LEFT JOIN orders o ON r.deposit_order_id = o.order_id
             LEFT JOIN users u ON r.user_id = u.user_id
             LEFT JOIN restauranttables t ON r.table_id = t.table_id
             WHERE r.status = 'booked'
               AND r.deposit_order_id IS NOT NULL
               AND r.created_at <= DATE_SUB(NOW(), INTERVAL ? MINUTE)
               AND (o.is_paid IS NULL OR o.is_paid = 0)`,
            [RESERVATION_HOLD_MINUTES]
        );

        if (rows.length > 0) {
            const reservationIds = rows.map((row) => row.reservation_id);
            const tableIds = [...new Set(rows.map((row) => row.table_id))];
            const orderIds = [...new Set(rows.map((row) => row.deposit_order_id).filter(Boolean))];

            await connection.query(
                'UPDATE reservations SET status = "cancelled" WHERE reservation_id IN (?)',
                [reservationIds]
            );

            if (tableIds.length > 0) {
                await connection.query(
                    'UPDATE restauranttables SET status = "free" WHERE table_id IN (?)',
                    [tableIds]
                );
            }

            if (orderIds.length > 0) {
                await connection.query(
                    'UPDATE orders SET status = "cancelled" WHERE order_id IN (?)',
                    [orderIds]
                );
            }
        }

        expiredReservations = rows;

        // Gửi realtime lịch sử đặt bàn cho các user liên quan
        if (rows && rows.length > 0) {
            const userIds = [...new Set(rows.map((row) => row.user_id).filter((id) => id))];
            for (const userId of userIds) {
                try {
                    await emitReservationsUpdateForUser(userId);
                } catch (error) {
                    console.error('Emit reservations update error (autoExpireUnpaidReservations):', error);
                }
            }
        }

        await connection.commit();
    } catch (error) {
        console.error('Auto expire unpaid reservations error:', error);
        await connection.rollback();
    } finally {
        connection.release();
    }

    if (!expiredReservations || expiredReservations.length === 0) {
        return;
    }

    for (const reservation of expiredReservations) {
        if (!reservation.email) {
            continue;
        }

        const dateValue = reservation.res_date;
        const timeValue = reservation.res_time;
        let formattedDate = '';
        let formattedTime = '';

        if (dateValue instanceof Date) {
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getDate()).padStart(2, '0');
            formattedDate = `${day}/${month}/${year}`;
        } else if (typeof dateValue === 'string') {
            formattedDate = dateValue;
        }

        if (typeof timeValue === 'string') {
            formattedTime = timeValue.slice(0, 5);
        } else if (timeValue instanceof Date) {
            const hours = String(timeValue.getHours()).padStart(2, '0');
            const minutes = String(timeValue.getMinutes()).padStart(2, '0');
            formattedTime = `${hours}:${minutes}`;
        }

        const subject = 'Thông báo huỷ đặt bàn do quá thời gian giữ bàn';
        const html = `
            <h1>Đơn đặt bàn của bạn đã bị huỷ</h1>
            <p>Xin chào ${reservation.guest_name || ''},</p>
            <p>Đặt bàn của bạn tại Mì Tinh Tế đã bị huỷ vì sau ${RESERVATION_HOLD_MINUTES} phút hệ thống vẫn chưa ghi nhận thanh toán tiền cọc.</p>
            <p><strong>Thông tin đặt bàn:</strong></p>
            <ul>
                <li>Mã đặt bàn: #${reservation.reservation_id}</li>
                <li>Bàn: ${reservation.table_name || reservation.table_id}</li>
                <li>Ngày: ${formattedDate}</li>
                <li>Giờ: ${formattedTime}</li>
                <li>Số khách: ${reservation.number_of_people}</li>
            </ul>
            <p>Nếu bạn vẫn muốn sử dụng dịch vụ, vui lòng truy cập lại website để đặt bàn mới.</p>
        `;

        try {
            await sendEmail({
                to: reservation.email,
                subject,
                html,
            });
        } catch (error) {
            console.error('Send reservation expiry email error:', error);
        }
    }
};

const createReservation = async (req, res) => {
    const { date, time, guests, name, phone, notes, userId, tableId } = req.body;

    if (!date || !time || !guests || !name || !phone || !tableId) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ ngày, giờ, số khách, họ tên, số điện thoại và chọn bàn.' });
    }

    const numberOfPeople = parseInt(guests, 10);
    if (isNaN(numberOfPeople) || numberOfPeople <= 0) {
        return res.status(400).json({ message: 'Số lượng khách không hợp lệ.' });
    }

    if (numberOfPeople > 12) {
        return res.status(400).json({ message: 'Nhóm trên 12 người vui lòng liên hệ trực tiếp nhà hàng qua Hotline để được hỗ trợ.' });
    }

    const resTime = time.length === 5 ? `${time}:00` : time;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [tables] = await connection.query(
            'SELECT table_id, capacity, status FROM restauranttables WHERE table_id = ?',
            [tableId]
        );

        if (tables.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Bàn được chọn không tồn tại. Vui lòng tải lại trang và thử lại.' });
        }

        const table = tables[0];

        if (table.capacity < numberOfPeople) {
            await connection.rollback();
            return res.status(400).json({ message: 'Số lượng khách vượt quá sức chứa của bàn. Vui lòng chọn bàn khác.' });
        }

        const [existingReservations] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM reservations
             WHERE table_id = ?
               AND res_date = ?
               AND res_time = ?
               AND status IN ('booked','completed')
               AND is_checked_out = 0`,
            [tableId, date, resTime]
        );

        if (existingReservations[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Bàn này đã có người đặt trong khung giờ này, vui lòng chọn bàn khác.' });
        }

        const [result] = await connection.query(
            `INSERT INTO reservations (table_id, user_id, res_date, res_time, number_of_people, status, guest_name, guest_phone)
             VALUES (?, ?, ?, ?, ?, 'booked', ?, ?)`,
            [tableId, userId || null, date, resTime, numberOfPeople, name, phone]
        );

        await connection.query(
            'UPDATE restauranttables SET status = ? WHERE table_id = ?',
            ['reserved', tableId]
        );

        await connection.commit();

        if (userId) {
            try {
                await emitReservationsUpdateForUser(userId);
            } catch (error) {
                console.error('Emit reservations update error (createReservation):', error);
            }
        }

        res.status(201).json({
            reservation_id: result.insertId,
            message: 'Đặt bàn thành công.',
        });
    } catch (error) {
        console.error('Create reservation error:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo đặt bàn.' });
    } finally {
        connection.release();
    }
};

const markDepositCash = async (req, res) => {
    const { id } = req.params;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [reservations] = await connection.query(
            'SELECT deposit_order_id, user_id FROM reservations WHERE reservation_id = ?',
            [id]
        );

        if (reservations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đặt bàn.' });
        }

        const depositOrderId = reservations[0].deposit_order_id;

        if (!depositOrderId) {
            await connection.rollback();
            return res.status(400).json({ message: 'Đặt bàn này không có đơn cọc để ghi nhận tiền mặt.' });
        }

        const [orders] = await connection.query(
            'SELECT is_paid FROM orders WHERE order_id = ?',
            [depositOrderId]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn cọc tương ứng.' });
        }

        if (orders[0].is_paid) {
            await connection.rollback();
            return res.status(400).json({ message: 'Đơn cọc đã được thanh toán trước đó.' });
        }

        await connection.query(
            'UPDATE orders SET is_paid = 1, payment_method = ?, status = CASE WHEN status = "new" THEN "preparing" ELSE status END WHERE order_id = ?',
            ['cash', depositOrderId]
        );

        await connection.commit();

        const userId = reservations[0].user_id;
        if (userId) {
            try {
                await emitReservationsUpdateForUser(userId);
            } catch (error) {
                console.error('Emit reservations update error (markDepositCash):', error);
            }
        }

        return res.json({
            message: 'Đã ghi nhận khách đặt cọc tiền mặt.',
            deposit_order_id: depositOrderId,
        });
    } catch (error) {
        console.error('Mark deposit cash error:', error);
        await connection.rollback();
        return res.status(500).json({ message: 'Không thể ghi nhận đặt cọc tiền mặt.' });
    } finally {
        connection.release();
    }
};

const createReservationWithDeposit = async (req, res) => {
    const { date, time, guests, name, phone, notes, userId, tableId, reservationType, items } = req.body;

    if (!date || !time || !guests || !name || !phone || !tableId) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ ngày, giờ, số khách, họ tên, số điện thoại và chọn bàn.' });
    }

    const numberOfPeople = parseInt(guests, 10);
    if (isNaN(numberOfPeople) || numberOfPeople <= 0) {
        return res.status(400).json({ message: 'Số lượng khách không hợp lệ.' });
    }

    if (numberOfPeople > 12) {
        return res.status(400).json({ message: 'Nhóm trên 12 người vui lòng liên hệ trực tiếp nhà hàng qua Hotline để được hỗ trợ.' });
    }

    const finalType = reservationType === 'pre-order' ? 'pre-order' : 'simple';
    const resTime = time.length === 5 ? `${time}:00` : time;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [tables] = await connection.query(
            'SELECT table_id, table_name, capacity, status, price FROM restauranttables WHERE table_id = ?',
            [tableId]
        );

        if (tables.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Bàn được chọn không tồn tại. Vui lòng tải lại trang và thử lại.' });
        }

        const table = tables[0];

        if (table.capacity < numberOfPeople) {
            await connection.rollback();
            return res.status(400).json({ message: 'Số lượng khách vượt quá sức chứa của bàn. Vui lòng chọn bàn khác.' });
        }

        const [existingReservations] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM reservations
             WHERE table_id = ?
               AND res_date = ?
               AND res_time = ?
               AND status IN ('booked','completed')
               AND is_checked_out = 0`,
            [tableId, date, resTime]
        );

        if (existingReservations[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Bàn này đã có người đặt trong khung giờ này, vui lòng chọn bàn khác.' });
        }

        const tablePrice = table.price != null ? parseFloat(table.price) : 0;
        let dishesTotal = 0;
        let kitchenOrderId = null;

        const [reservationResult] = await connection.query(
            `INSERT INTO reservations (table_id, user_id, res_date, res_time, number_of_people, status, guest_name, guest_phone)
             VALUES (?, ?, ?, ?, ?, 'booked', ?, ?)`,
            [tableId, userId || null, date, resTime, numberOfPeople, name, phone]
        );

        const reservationId = reservationResult.insertId;

        await connection.query(
            'UPDATE restauranttables SET status = ? WHERE table_id = ?',
            ['reserved', tableId]
        );

        if (finalType === 'pre-order') {
            if (!Array.isArray(items) || items.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Danh sách món pre-order không được để trống.' });
            }

            const dishIds = items.map((i) => i.dishId).filter(Boolean);
            if (dishIds.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Danh sách món pre-order không hợp lệ.' });
            }

            const [dishRows] = await connection.query(
                'SELECT dish_id, price FROM dishes WHERE dish_id IN (?)',
                [dishIds]
            );

            const priceMap = {};
            dishRows.forEach((d) => {
                priceMap[d.dish_id] = parseFloat(d.price);
            });

            const orderItems = [];
            for (const item of items) {
                const unitPrice = priceMap[item.dishId];
                if (!unitPrice) {
                    await connection.rollback();
                    return res.status(400).json({ message: 'Một hoặc nhiều món ăn trong pre-order không tồn tại.' });
                }

                const quantity = parseInt(item.quantity || item.qty, 10);
                if (isNaN(quantity) || quantity <= 0) {
                    await connection.rollback();
                    return res.status(400).json({ message: 'Số lượng món trong pre-order không hợp lệ.' });
                }

                dishesTotal += quantity * unitPrice;
                orderItems.push({
                    dishId: item.dishId,
                    quantity,
                    unitPrice,
                });
            }

            const [kitchenOrderResult] = await connection.query(
                `INSERT INTO orders (user_id, table_id, address_id, order_type, status, is_paid, payment_method, total_amount)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId || null, tableId, null, 'dine-in', 'new', 0, 'cash', dishesTotal]
            );

            kitchenOrderId = kitchenOrderResult.insertId;
            const noteForItems = notes
                ? `${notes} (Pre-order cho đặt bàn #${reservationId})`
                : `Pre-order cho đặt bàn #${reservationId}`;

            for (const item of orderItems) {
                await connection.query(
                    'INSERT INTO orderitems (order_id, dish_id, quantity, unit_price, note) VALUES (?, ?, ?, ?, ?)',
                    [kitchenOrderId, item.dishId, item.quantity, item.unitPrice, noteForItems]
                );
            }
        }

        const fullAmount = tablePrice + dishesTotal;
        const depositAmount = fullAmount / 2;

        const [depositOrderResult] = await connection.query(
            `INSERT INTO orders (user_id, table_id, address_id, order_type, status, is_paid, payment_method, total_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId || null, tableId, null, 'dine-in', 'new', 0, null, depositAmount]
        );

        const depositOrderId = depositOrderResult.insertId;

        await connection.query(
            'UPDATE reservations SET deposit_order_id = ? WHERE reservation_id = ?',
            [depositOrderId, reservationId]
        );

        await connection.commit();

        if (userId) {
            try {
                await emitReservationsUpdateForUser(userId);
            } catch (error) {
                console.error('Emit reservations update error (createReservationWithDeposit):', error);
            }
        }

        return res.status(201).json({
            reservation_id: reservationId,
            deposit_order_id: depositOrderId,
            full_amount: fullAmount,
            deposit_amount: depositAmount,
            date,
            time: resTime,
            guests: numberOfPeople,
            name,
            phone,
            notes: notes || null,
            table: {
                table_id: table.table_id,
                table_name: table.table_name,
                capacity: table.capacity,
                price: tablePrice,
            },
            pre_order:
                finalType === 'pre-order'
                    ? {
                        order_id: kitchenOrderId,
                        items_total: dishesTotal,
                    }
                    : null,
        });
    } catch (error) {
        console.error('Create reservation with deposit error:', error);
        await connection.rollback();
        return res.status(500).json({ message: 'Lỗi máy chủ khi tạo đặt bàn kèm đặt cọc.' });
    } finally {
        connection.release();
    }
};

const getReservations = async (req, res) => {
    const { date, status } = req.query;

    try {
        let query = `
            SELECT 
                r.reservation_id,
                r.table_id,
                r.res_date,
                r.res_time,
                r.number_of_people,
                r.status,
                r.is_checked_out,
                r.deposit_order_id,
                COALESCE(r.guest_name, u.name, 'Khách vãng lai') AS guest_name,
                COALESCE(r.guest_phone, u.phone) AS guest_phone,
                t.table_name
            FROM reservations r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN restauranttables t ON r.table_id = t.table_id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND r.res_date = ?';
            params.push(date);
        }

        if (status) {
            query += ' AND r.status = ?';
            params.push(status);
        }

        // Sắp xếp đơn mới nhất lên đầu danh sách
        query += ' ORDER BY r.reservation_id DESC';

        const [rows] = await db.query(query, params);

        const depositOrderIds = rows
            .map((row) => row.deposit_order_id)
            .filter((id) => id);

        let depositMap = {};
        if (depositOrderIds.length > 0) {
            const [depositRows] = await db.query(
                'SELECT order_id, is_paid, payment_method FROM orders WHERE order_id IN (?)',
                [depositOrderIds]
            );

            depositRows.forEach((order) => {
                depositMap[order.order_id] = {
                    is_paid: !!order.is_paid,
                    payment_method: order.payment_method || null,
                };
            });
        }

        const reservations = rows.map((row) => {
            const depositInfo = row.deposit_order_id
                ? depositMap[row.deposit_order_id] || null
                : null;

            let depositStatus = 'Chưa cọc';
            if (row.deposit_order_id && depositInfo && depositInfo.is_paid) {
                if (depositInfo.payment_method === 'cash') {
                    depositStatus = 'Đã cọc tại quầy';
                } else {
                    depositStatus = 'Đã cọc online';
                }
            }

            return {
                ...row,
                has_preorder: false,
                preorder_details: null,
                deposit_is_paid: depositInfo ? depositInfo.is_paid : false,
                deposit_payment_method: depositInfo ? depositInfo.payment_method : null,
                deposit_status: depositStatus,
            };
        });

        if (reservations.length > 0) {
            const reservationIdSet = new Set(reservations.map((res) => res.reservation_id));
            const [preorderRows] = await db.query(`
                SELECT 
                    o.order_id,
                    o.status AS order_status,
                    o.placed_at,
                    oi.note,
                    oi.quantity,
                    oi.unit_price,
                    d.name AS dish_name
                FROM orderitems oi
                JOIN orders o ON oi.order_id = o.order_id
                LEFT JOIN dishes d ON oi.dish_id = d.dish_id
                WHERE o.order_type = 'dine-in'
                  AND oi.note LIKE 'Pre-order cho đặt bàn #%'
            `);

            const preorderMap = {};

            preorderRows.forEach((row) => {
                const reservationId = parseReservationIdFromNote(row.note);
                if (!reservationId || !reservationIdSet.has(reservationId)) {
                    return;
                }

                if (!preorderMap[reservationId]) {
                    preorderMap[reservationId] = {
                        order_id: row.order_id,
                        status: row.order_status,
                        placed_at: row.placed_at,
                        total_amount: 0,
                        items: [],
                    };
                }

                const unitPrice = parseFloat(row.unit_price) || 0;
                preorderMap[reservationId].items.push({
                    name: row.dish_name,
                    quantity: row.quantity,
                    unit_price: unitPrice,
                });
                preorderMap[reservationId].total_amount += unitPrice * row.quantity;
            });

            reservations.forEach((reservation) => {
                if (preorderMap[reservation.reservation_id]) {
                    reservation.has_preorder = true;
                    reservation.preorder_details = preorderMap[reservation.reservation_id];
                }
            });
        }

        res.json(reservations);
    } catch (error) {
        console.error('Get reservations error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đặt bàn.' });
    }
};

const getMyReservations = async (req, res) => {
    const userId = req.user && req.user.user_id;

    if (!userId) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                r.reservation_id,
                r.table_id,
                r.res_date,
                r.res_time,
                r.number_of_people,
                r.status,
                r.is_checked_out,
                r.deposit_order_id,
                t.table_name,
                CASE WHEN rr.review_id IS NOT NULL THEN 1 ELSE 0 END as has_review,
                rr.rating as review_rating,
                rr.comment as review_comment,
                rr.created_at as review_created_at
             FROM reservations r
             LEFT JOIN restauranttables t ON r.table_id = t.table_id
             LEFT JOIN reservationreviews rr ON r.reservation_id = rr.reservation_id
             WHERE r.user_id = ?
             ORDER BY r.res_date DESC, r.res_time DESC`,
            [userId]
        );

        const depositOrderIds = rows
            .map((row) => row.deposit_order_id)
            .filter((id) => id);

        let depositMap = {};
        if (depositOrderIds.length > 0) {
            const [depositRows] = await db.query(
                'SELECT order_id, is_paid, payment_method FROM orders WHERE order_id IN (?)',
                [depositOrderIds]
            );

            depositRows.forEach((order) => {
                depositMap[order.order_id] = {
                    is_paid: !!order.is_paid,
                    payment_method: order.payment_method || null,
                };
            });
        }

        const reservations = rows.map((row) => {
            const depositInfo = row.deposit_order_id
                ? depositMap[row.deposit_order_id] || null
                : null;

            let depositStatus = 'Chưa cọc';
            if (row.deposit_order_id && depositInfo && depositInfo.is_paid) {
                if (depositInfo.payment_method === 'cash') {
                    depositStatus = 'Đã cọc tại quầy';
                } else {
                    depositStatus = 'Đã cọc online';
                }
            }

            return {
                ...row,
                deposit_is_paid: depositInfo ? depositInfo.is_paid : false,
                deposit_payment_method: depositInfo ? depositInfo.payment_method : null,
                deposit_status: depositStatus,
            };
        });

        res.json(reservations);
    } catch (error) {
        console.error('Get my reservations error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy lịch sử đặt bàn.' });
    }
};

const getReservationLayout = async (req, res) => {
    const { date, time, guests } = req.query;

    if (!date || !time || !guests) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ ngày, giờ và số lượng khách.' });
    }

    const numberOfPeople = parseInt(guests, 10);
    if (isNaN(numberOfPeople) || numberOfPeople <= 0) {
        return res.status(400).json({ message: 'Số lượng khách không hợp lệ.' });
    }

    const resTime = time.length === 5 ? `${time}:00` : time;

    try {
        await autoExpireUnpaidReservations();

        const [floors] = await db.query('SELECT floor_id, name FROM floors ORDER BY floor_id');
        const [tables] = await db.query('SELECT table_id, floor_id, table_name, capacity, status, pos_x, pos_y FROM restauranttables');
        const [reservedRows] = await db.query(
            `SELECT DISTINCT table_id
             FROM reservations
             WHERE res_date = ?
               AND res_time = ?
               AND status IN ('booked','completed')
               AND is_checked_out = 0`,
            [date, resTime]
        );

        const reservedSet = new Set(reservedRows.map(r => r.table_id));

        const isSuitable = (capacity) => {
            if (numberOfPeople <= 2) {
                return capacity === 2;
            }
            if (numberOfPeople >= 3 && numberOfPeople <= 6) {
                // Nhóm nhỏ 3-6 người: ưu tiên bàn 4-6 người
                return capacity === 4 || capacity === 6;
            }
            if (numberOfPeople > 6 && numberOfPeople <= 12) {
                // Nhóm lớn 7-12 người: bàn dài (>= 8 chỗ)
                return capacity >= 8;
            }
            // Trường hợp khác: fallback cho các cấu hình tương lai
            return capacity >= numberOfPeople;
        };

        const layouts = floors.map((floor) => ({
            ...floor,
            elements: tables
                .filter((t) => t.floor_id === floor.floor_id)
                .map((t) => {
                    let status = t.status;
                    if (reservedSet.has(t.table_id)) {
                        status = 'reserved';
                    }
                    return {
                        ...t,
                        status,
                        type: 'table',
                        suitable: isSuitable(t.capacity),
                    };
                }),
        }));

        res.json(layouts);
    } catch (error) {
        console.error('Get reservation layout error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy sơ đồ bàn cho đặt chỗ.' });
    }
};

const updateReservationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['booked', 'cancelled', 'completed'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [reservations] = await connection.query(
            'SELECT table_id, user_id FROM reservations WHERE reservation_id = ?',
            [id]
        );

        if (reservations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đặt bàn.' });
        }

        const tableId = reservations[0].table_id;
        const userId = reservations[0].user_id;

        await connection.query(
            'UPDATE reservations SET status = ? WHERE reservation_id = ?',
            [status, id]
        );

        let tableStatus = null;
        if (status === 'booked') {
            tableStatus = 'reserved';
        } else if (status === 'cancelled') {
            tableStatus = 'free';
        } else if (status === 'completed') {
            // Khách đến → bàn chuyển sang "đang phục vụ", chờ thanh toán xong mới free
            tableStatus = 'occupied';
        }

        if (tableStatus) {
            await connection.query(
                'UPDATE restauranttables SET status = ? WHERE table_id = ?',
                [tableStatus, tableId]
            );
        }

        await connection.commit();

        // Gửi thông báo cho khách hàng
        if (userId) {
            sendReservationNotification(id, status).catch(err => {
                console.error('Send reservation notification error:', err);
            });

            try {
                await emitReservationsUpdateForUser(userId);
            } catch (error) {
                console.error('Emit reservations update error (updateReservationStatus):', error);
            }
        }

        // Emit tables update khi thay đổi trạng thái (khách đến, hủy, etc.)
        try {
            emitTablesUpdate(tableId);
        } catch (error) {
            console.error('Emit tables update error (updateReservationStatus):', error);
        }

        res.json({ message: 'Cập nhật trạng thái đặt bàn thành công.' });
    } catch (error) {
        console.error('Update reservation status error:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái đặt bàn.' });
    } finally {
        connection.release();
    }
};

/**
 * Checkout - Thanh toán phần còn lại và giải phóng bàn
 * Gọi khi khách ăn xong, thanh toán xong → bàn chuyển về free
 */
const checkoutReservation = async (req, res) => {
    const { id } = req.params;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [reservations] = await connection.query(
            'SELECT reservation_id, table_id, user_id, status, is_checked_out FROM reservations WHERE reservation_id = ?',
            [id]
        );

        if (reservations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đặt bàn.' });
        }

        const reservation = reservations[0];

        if (reservation.is_checked_out) {
            await connection.rollback();
            return res.status(400).json({ message: 'Đặt bàn này đã được checkout trước đó.' });
        }

        if (reservation.status !== 'completed') {
            await connection.rollback();
            return res.status(400).json({ message: 'Chỉ có thể checkout đặt bàn đang ở trạng thái "Hoàn thành" (đang phục vụ).' });
        }

        // Kiểm tra tất cả món trong order của bàn này đã hoàn thành chưa
        const [pendingItems] = await connection.query(
            `SELECT oi.dish_id, d.name, oi.status 
             FROM orders o
             JOIN orderitems oi ON o.order_id = oi.order_id
             JOIN dishes d ON oi.dish_id = d.dish_id
             WHERE o.table_id = ? 
               AND o.order_type = 'dine-in'
               AND o.status IN ('new', 'preparing')
               AND oi.status IN ('new', 'preparing')`,
            [reservation.table_id]
        );

        if (pendingItems.length > 0) {
            await connection.rollback();
            const pendingDishes = pendingItems.map(item => item.name).join(', ');
            return res.status(400).json({ 
                message: `Không thể checkout. Còn ${pendingItems.length} món chưa hoàn thành: ${pendingDishes}. Vui lòng chờ bếp hoàn thành tất cả món.`,
                pendingItems: pendingItems
            });
        }

        // Đánh dấu reservation đã checkout và giải phóng bàn
        await connection.query(
            'UPDATE reservations SET is_checked_out = 1 WHERE reservation_id = ?',
            [reservation.reservation_id]
        );

        await connection.query(
            'UPDATE restauranttables SET status = ? WHERE table_id = ?',
            ['free', reservation.table_id]
        );

        await connection.commit();

        // Emit realtime update cho user
        if (reservation.user_id) {
            try {
                await emitReservationsUpdateForUser(reservation.user_id);
            } catch (error) {
                console.error('Emit reservations update error (checkoutReservation):', error);
            }
        }

        // Emit tables update để sơ đồ bàn tự động refresh
        try {
            emitTablesUpdate(reservation.table_id);
        } catch (error) {
            console.error('Emit tables update error (checkoutReservation):', error);
        }

        return res.json({
            message: 'Checkout thành công. Bàn đã được giải phóng.',
            table_id: reservation.table_id,
        });
    } catch (error) {
        console.error('Checkout reservation error:', error);
        await connection.rollback();
        return res.status(500).json({ message: 'Lỗi máy chủ khi checkout.' });
    } finally {
        connection.release();
    }
};

module.exports = {
    createReservation,
    createReservationWithDeposit,
    getReservations,
    getMyReservations,
    updateReservationStatus,
    getReservationLayout,
    markDepositCash,
    autoExpireUnpaidReservations,
    checkoutReservation,
};
