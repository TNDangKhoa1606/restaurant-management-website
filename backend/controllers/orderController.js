const db = require('../config/db');

const getAllOrders = async (req, res) => {
    const { keyword, status, type } = req.query;

    try {
        let query = `
            SELECT 
                o.order_id,
                COALESCE(u.name, 'Khách vãng lai') AS customer_name,
                o.placed_at,
                o.total_amount,
                o.order_type,
                o.status
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (keyword) {
            query += ` AND (o.order_id LIKE ? OR u.name LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (status) {
            query += ` AND o.status = ?`;
            params.push(status);
        }

        if (type) {
            query += ` AND o.order_type = ?`;
            params.push(type);
        }

        query += ` ORDER BY o.placed_at DESC`;

        const [orders] = await db.query(query, params);

        // Chuyển đổi total_amount sang kiểu số để đảm bảo tính nhất quán
        const formattedOrders = orders.map(order => ({
            ...order,
            total_amount: parseFloat(order.total_amount)
        }));

        res.json(formattedOrders);

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách đơn hàng.' });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        // Lấy thông tin chính của đơn hàng
        const orderQuery = `
            SELECT 
                o.order_id, o.placed_at, o.status, o.order_type, o.total_amount,
                o.payment_method, o.is_paid,
                u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
                a.address_line
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN addresses a ON o.address_id = a.address_id
            WHERE o.order_id = ?
        `;
        const [orders] = await db.query(orderQuery, [id]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        // Lấy danh sách các món trong đơn hàng
        const itemsQuery = `
            SELECT oi.quantity, oi.unit_price, d.name AS dish_name
            FROM orderitems oi
            JOIN dishes d ON oi.dish_id = d.dish_id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsQuery, [id]);

        const orderDetails = {
            ...orders[0],
            total_amount: parseFloat(orders[0].total_amount),
            items: items.map(item => ({...item, unit_price: parseFloat(item.unit_price)}))
        };

        res.json(orderDetails);

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy chi tiết đơn hàng.' });
    }
};

const getMyOrders = async (req, res) => {
    const userId = req.user && req.user.user_id;

    if (!userId) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    try {
        const [orders] = await db.query(
            `SELECT order_id, placed_at, order_type, total_amount, status, is_paid, payment_method
             FROM orders
             WHERE user_id = ? AND is_paid = 1
             ORDER BY placed_at DESC`,
            [userId]
        );

        if (!orders || orders.length === 0) {
            return res.json([]);
        }

        const orderIds = orders.map((order) => order.order_id);

        const [itemRows] = await db.query(
            `SELECT 
                oi.order_id,
                oi.quantity,
                oi.unit_price,
                d.name AS dish_name
             FROM orderitems oi
             JOIN dishes d ON oi.dish_id = d.dish_id
             WHERE oi.order_id IN (?)`,
            [orderIds]
        );

        const itemsMap = {};
        itemRows.forEach((row) => {
            if (!itemsMap[row.order_id]) {
                itemsMap[row.order_id] = [];
            }
            itemsMap[row.order_id].push({
                quantity: row.quantity,
                unit_price: row.unit_price,
                dish_name: row.dish_name,
            });
        });

        const [depositRows] = await db.query(
            `SELECT deposit_order_id
             FROM reservations
             WHERE deposit_order_id IN (?)`,
            [orderIds]
        );

        const depositSet = new Set();
        depositRows.forEach((row) => {
            if (row.deposit_order_id) {
                depositSet.add(row.deposit_order_id);
            }
        });

        const formattedOrders = orders.map((order) => {
            const rawItems = itemsMap[order.order_id] || [];
            const items = rawItems.map((item) => ({
                ...item,
                unit_price:
                    item.unit_price !== null && item.unit_price !== undefined
                        ? parseFloat(item.unit_price)
                        : 0,
            }));

            return {
                ...order,
                total_amount:
                    order.total_amount !== null && order.total_amount !== undefined
                        ? parseFloat(order.total_amount)
                        : 0,
                items,
                is_deposit_order: depositSet.has(order.order_id),
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách đơn hàng.' });
    }
};

const getMyOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user && req.user.user_id;

    if (!userId) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    try {
        const orderQuery = `
            SELECT 
                o.order_id, o.placed_at, o.status, o.order_type, o.total_amount,
                o.payment_method, o.is_paid,
                u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
                a.address_line
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN addresses a ON o.address_id = a.address_id
            WHERE o.order_id = ? AND o.user_id = ?
        `;
        const [orders] = await db.query(orderQuery, [id, userId]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        const itemsQuery = `
            SELECT oi.quantity, oi.unit_price, d.name AS dish_name
            FROM orderitems oi
            JOIN dishes d ON oi.dish_id = d.dish_id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsQuery, [id]);

        const orderDetails = {
            ...orders[0],
            total_amount: parseFloat(orders[0].total_amount),
            items: items.map(item => ({ ...item, unit_price: parseFloat(item.unit_price) }))
        };

        res.json(orderDetails);
    } catch (error) {
        console.error('Get my order by ID error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy chi tiết đơn hàng.' });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['new', 'preparing', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(
            'SELECT order_type, table_id FROM orders WHERE order_id = ? FOR UPDATE',
            [id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        const order = orders[0];

        await connection.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, id]);

        if (order.order_type === 'dine-in' && order.table_id) {
            if (status === 'new' || status === 'preparing') {
                // Đảm bảo bàn đang có khách khi đơn dine-in đang hoạt động
                await connection.query(
                    'UPDATE restauranttables SET status = ? WHERE table_id = ?',
                    ['occupied', order.table_id]
                );
            } else if (status === 'completed' || status === 'cancelled') {
                // Chỉ trả bàn về trạng thái trống nếu không còn đơn dine-in nào đang hoạt động
                const [activeOrders] = await connection.query(
                    `SELECT COUNT(*) AS activeCount
                     FROM orders
                     WHERE table_id = ? AND order_type = 'dine-in' AND status IN ('new','preparing')`,
                    [order.table_id]
                );

                if (activeOrders[0].activeCount === 0) {
                    await connection.query(
                        'UPDATE restauranttables SET status = ? WHERE table_id = ?',
                        ['free', order.table_id]
                    );
                }
            }
        }

        await connection.commit();

        res.json({ message: 'Cập nhật trạng thái đơn hàng thành công.' });
    } catch (error) {
        console.error('Update order status error:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật trạng thái.' });
    } finally {
        connection.release();
    }
};

const createOrder = async (req, res) => {
    const { items, customer, note, orderType, paymentMethod, userId, tableId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Danh sách món ăn không được để trống.' });
    }

    if (!customer || !customer.name || !customer.phone) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên và số điện thoại khách hàng.' });
    }

    const allowedTypes = ['dine-in', 'delivery', 'pickup'];
    const finalOrderType = orderType && allowedTypes.includes(orderType) ? orderType : 'delivery';
    const finalPaymentMethod = paymentMethod || 'cash';
    let finalTableId = null;

    if (finalOrderType === 'dine-in') {
        if (!tableId) {
            return res.status(400).json({ message: 'Thiếu thông tin bàn cho đơn hàng tại chỗ (dine-in).' });
        }
        finalTableId = tableId;
    }

    const dishIds = items.map(i => i.dishId).filter(Boolean);
    if (dishIds.length === 0) {
        return res.status(400).json({ message: 'Danh sách món ăn không hợp lệ.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [dishRows] = await connection.query(
            'SELECT dish_id, price FROM dishes WHERE dish_id IN (?)',
            [dishIds]
        );

        const priceMap = {};
        dishRows.forEach(d => {
            priceMap[d.dish_id] = parseFloat(d.price);
        });

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const price = priceMap[item.dishId];
            if (!price) {
                await connection.rollback();
                return res.status(400).json({ message: 'Một hoặc nhiều món ăn không tồn tại.' });
            }

            const quantity = parseInt(item.quantity, 10);
            if (isNaN(quantity) || quantity <= 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Số lượng món không hợp lệ.' });
            }

            totalAmount += quantity * price;
            orderItems.push({
                dishId: item.dishId,
                quantity,
                unitPrice: price,
            });
        }

        let addressId = null;
        if (userId && customer.address) {
            const [addrResult] = await connection.query(
                'INSERT INTO addresses (user_id, label, address_line, city, is_default) VALUES (?, ?, ?, ?, ?)',
                [userId, 'Đơn hàng', customer.address, null, 0]
            );
            addressId = addrResult.insertId;
        }

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, table_id, address_id, order_type, status, is_paid, payment_method, total_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId || null, finalTableId, addressId, finalOrderType, 'new', 0, finalPaymentMethod, totalAmount]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await connection.query(
                'INSERT INTO orderitems (order_id, dish_id, quantity, unit_price, note) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.dishId, item.quantity, item.unitPrice, note || null]
            );
        }

        // Nếu là đơn tại bàn (dine-in), đánh dấu bàn đang có khách
        if (finalOrderType === 'dine-in' && finalTableId) {
            await connection.query(
                'UPDATE restauranttables SET status = ? WHERE table_id = ?',
                ['occupied', finalTableId]
            );
        }

        await connection.commit();

        res.status(201).json({
            order_id: orderId,
            total_amount: totalAmount,
            status: 'new',
            order_type: finalOrderType,
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi tạo đơn hàng.' });
    } finally {
        connection.release();
    }
};

const getKitchenOrders = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                o.order_id,
                o.table_id,
                t.table_name,
                o.placed_at,
                o.status,
                oi.quantity,
                oi.unit_price,
                oi.note,
                d.name AS dish_name
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN dishes d ON oi.dish_id = d.dish_id
            LEFT JOIN restauranttables t ON o.table_id = t.table_id
            WHERE o.order_type = 'dine-in'
              AND o.status IN ('new','preparing')
            ORDER BY o.placed_at ASC, o.order_id ASC
        `);

        const ordersMap = {};

        rows.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    table_id: row.table_id,
                    table_name: row.table_name,
                    placed_at: row.placed_at,
                    status: row.status,
                    note: row.note || null,
                    items: [],
                };
            }

            const current = ordersMap[row.order_id];

            if (!current.note && row.note) {
                current.note = row.note;
            }

            current.items.push({
                name: row.dish_name,
                qty: row.quantity,
            });
        });

        const ordersArray = Object.values(ordersMap);

        const reservationIdSet = new Set();

        ordersArray.forEach(order => {
            const note = order.note || '';
            if (note.includes('Pre-order cho đặt bàn')) {
                order.is_preorder = true;
                const match = note.match(/#(\d+)/);
                if (match) {
                    const resId = parseInt(match[1], 10);
                    if (!Number.isNaN(resId)) {
                        order.reservation_id = resId;
                        reservationIdSet.add(resId);
                    }
                }
            } else {
                order.is_preorder = false;
            }
        });

        let reservationInfoMap = {};
        if (reservationIdSet.size > 0) {
            const reservationIds = Array.from(reservationIdSet);
            const [reservationRows] = await db.query(
                'SELECT reservation_id, res_date, res_time FROM reservations WHERE reservation_id IN (?)',
                [reservationIds]
            );

            reservationInfoMap = reservationRows.reduce((acc, row) => {
                acc[row.reservation_id] = row;
                return acc;
            }, {});
        }

        ordersArray.forEach(order => {
            const info = order.reservation_id ? reservationInfoMap[order.reservation_id] : null;
            if (info) {
                order.arrival_date = info.res_date;
                order.arrival_time = info.res_time;
            } else {
                order.arrival_date = null;
                order.arrival_time = null;
            }

            let boardStatus = 'new';
            if (order.status === 'preparing') {
                boardStatus = 'in-progress';
            } else if (order.status === 'completed') {
                boardStatus = 'done';
            }
            order.board_status = boardStatus;
        });

        ordersArray.sort((a, b) => new Date(a.placed_at) - new Date(b.placed_at));

        res.json(ordersArray);
    } catch (error) {
        console.error('Get kitchen orders error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách món cần chế biến.' });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    getMyOrders,
    getMyOrderById,
    updateOrderStatus,
    createOrder,
    getKitchenOrders,
};