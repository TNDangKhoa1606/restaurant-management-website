const db = require('../config/db');

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
             WHERE table_id = ? AND res_date = ? AND res_time = ? AND status IN ('booked','completed')`,
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
            'SELECT deposit_order_id FROM reservations WHERE reservation_id = ?',
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
             WHERE table_id = ? AND res_date = ? AND res_time = ? AND status IN ('booked','completed')`,
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

        query += ' ORDER BY r.res_date, r.res_time';

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
                r.deposit_order_id,
                t.table_name
             FROM reservations r
             LEFT JOIN restauranttables t ON r.table_id = t.table_id
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
        const [floors] = await db.query('SELECT floor_id, name FROM floors ORDER BY floor_id');
        const [tables] = await db.query('SELECT table_id, floor_id, table_name, capacity, status, pos_x, pos_y FROM restauranttables');
        const [reservedRows] = await db.query(
            `SELECT DISTINCT table_id
             FROM reservations
             WHERE res_date = ? AND res_time = ? AND status IN ('booked','completed')`,
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
            'SELECT table_id FROM reservations WHERE reservation_id = ?',
            [id]
        );

        if (reservations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đặt bàn.' });
        }

        const tableId = reservations[0].table_id;

        await connection.query(
            'UPDATE reservations SET status = ? WHERE reservation_id = ?',
            [status, id]
        );

        let tableStatus = null;
        if (status === 'booked') {
            tableStatus = 'reserved';
        } else if (status === 'cancelled' || status === 'completed') {
            tableStatus = 'free';
        }

        if (tableStatus) {
            await connection.query(
                'UPDATE restauranttables SET status = ? WHERE table_id = ?',
                [tableStatus, tableId]
            );
        }

        await connection.commit();

        res.json({ message: 'Cập nhật trạng thái đặt bàn thành công.' });
    } catch (error) {
        console.error('Update reservation status error:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái đặt bàn.' });
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
};
