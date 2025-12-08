const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./config/db');

let ioInstance = null;

// Getter để notificationService có thể lấy io instance
const getIoInstance = () => ioInstance;

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

// Quản lý hold bàn tạm thời cho trang /reservation (theo date + time + tableId)
const tableHolds = new Map(); // key: `${date}|${time}|${tableId}` -> { userId, socketId, expiresAt }
const HOLD_TTL_SECONDS = parseInt(process.env.TABLE_HOLD_TTL_SECONDS || '60', 10);

const makeHoldKey = (date, time, tableId) => {
    if (!date || !time || !tableId) {
        return null;
    }
    return `${date}|${time}|${tableId}`;
};

const cleanupExpiredHolds = () => {
    const now = Date.now();
    for (const [key, hold] of tableHolds.entries()) {
        if (hold.expiresAt && hold.expiresAt <= now) {
            tableHolds.delete(key);
        }
    }
};

const getActiveHoldsForSlot = (date, time) => {
    const now = Date.now();
    const result = [];

    for (const [key, hold] of tableHolds.entries()) {
        const [hDate, hTime, hTableId] = key.split('|');
        if (hDate === date && hTime === time && (!hold.expiresAt || hold.expiresAt > now)) {
            const parsedId = Number(hTableId);
            result.push({
                tableId: Number.isNaN(parsedId) ? hTableId : parsedId,
                userId: hold.userId || null,
                socketId: hold.socketId || null,
            });
        }
    }

    return result;
};

const clearHoldsForSocket = (socketId) => {
    if (!socketId || !ioInstance) {
        return;
    }

    const now = Date.now();

    for (const [key, hold] of tableHolds.entries()) {
        const shouldRelease = hold.socketId === socketId || (hold.expiresAt && hold.expiresAt <= now);
        if (!shouldRelease) {
            continue;
        }

        tableHolds.delete(key);

        const [date, time, tableIdRaw] = key.split('|');
        const parsedId = Number(tableIdRaw);
        const tableId = Number.isNaN(parsedId) ? tableIdRaw : parsedId;
        const roomName = `layout:${date}:${time}`;

        ioInstance.to(roomName).emit('tables:hold-update', {
            date,
            time,
            tableId,
            isHeld: false,
            userId: hold.userId || null,
            socketId: hold.socketId || null,
        });
    }
};

const fetchReservationsForUser = async (userId) => {
    if (!userId) {
        return [];
    }

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
                t.table_name
             FROM reservations r
             LEFT JOIN restauranttables t ON r.table_id = t.table_id
             WHERE r.user_id = ?
             ORDER BY r.reservation_id DESC`,
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
            has_preorder: false,
            preorder_details: null,
            deposit_is_paid: depositInfo ? depositInfo.is_paid : false,
            deposit_payment_method: depositInfo ? depositInfo.payment_method : null,
            deposit_status: depositStatus,
        };
    });

    if (reservations.length === 0) {
        return reservations;
    }

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

    return reservations;
};

const initSocket = (server) => {
    if (ioInstance) {
        return ioInstance;
    }

    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

    ioInstance = new Server(server, {
        cors: {
            origin: frontendOrigin,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    ioInstance.use((socket, next) => {
        const auth = socket.handshake.auth || {};
        const token = auth.token;

        if (!token || token === 'null' || token === 'undefined') {
            return next(new Error('AUTH_FAILED'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            return next();
        } catch (err) {
            console.error('Socket auth error:', err);
            return next(new Error('AUTH_FAILED'));
        }
    });

    ioInstance.on('connection', (socket) => {
        if (!socket.userId) {
            socket.disconnect(true);
            return;
        }

        const roomName = `user:${socket.userId}`;
        socket.join(roomName);

        // Đăng ký room cho notification realtime
        const notifRoom = `user_${socket.userId}`;
        socket.join(notifRoom);

        socket.on('reservations:subscribe', async () => {
            console.log('[Socket] reservations:subscribe from userId:', socket.userId);
            try {
                const reservations = await fetchReservationsForUser(socket.userId);
                console.log('[Socket] Sending reservations:init with', reservations.length, 'items to userId:', socket.userId);
                socket.emit('reservations:init', reservations);
            } catch (error) {
                console.error('Socket reservations subscribe error:', error);
                socket.emit('reservations:error', 'Không thể tải lịch sử đặt bàn.');
            }
        });

        // Đăng ký xem sơ đồ bàn cho 1 khung giờ cụ thể (date + time)
        socket.on('tables:subscribe', (payload) => {
            const { date, time } = payload || {};
            if (!date || !time) {
                return;
            }

            cleanupExpiredHolds();

            const layoutRoom = `layout:${date}:${time}`;

            if (socket.currentLayoutRoom && socket.currentLayoutRoom !== layoutRoom) {
                socket.leave(socket.currentLayoutRoom);
            }

            socket.join(layoutRoom);
            socket.currentLayoutRoom = layoutRoom;

            const holds = getActiveHoldsForSlot(date, time);
            socket.emit('tables:init', { holds });
        });

        // Client giữ 1 bàn tạm thời trong khung giờ đang xem
        socket.on('tables:hold', (payload) => {
            const { date, time, tableId } = payload || {};
            if (!date || !time || !tableId) {
                return;
            }

            cleanupExpiredHolds();

            const key = makeHoldKey(date, time, tableId);
            if (!key) {
                return;
            }

            const existing = tableHolds.get(key);
            if (existing && existing.userId && existing.userId !== socket.userId && existing.socketId !== socket.id) {
                // Bàn đang được người khác giữ, bỏ qua yêu cầu mới
                return;
            }

            const expiresAt = Date.now() + HOLD_TTL_SECONDS * 1000;
            tableHolds.set(key, {
                userId: socket.userId,
                socketId: socket.id,
                expiresAt,
            });

            const layoutRoom = `layout:${date}:${time}`;
            ioInstance.to(layoutRoom).emit('tables:hold-update', {
                date,
                time,
                tableId,
                isHeld: true,
                userId: socket.userId,
                socketId: socket.id,
            });
        });

        // Client bỏ giữ 1 bàn (hoặc chọn bàn khác)
        socket.on('tables:release', (payload) => {
            const { date, time, tableId } = payload || {};
            if (!date || !time || !tableId) {
                return;
            }

            const key = makeHoldKey(date, time, tableId);
            if (!key) {
                return;
            }

            const existing = tableHolds.get(key);
            if (!existing) {
                return;
            }

            if (existing.socketId !== socket.id && existing.userId !== socket.userId) {
                return;
            }

            tableHolds.delete(key);

            const layoutRoom = `layout:${date}:${time}`;
            ioInstance.to(layoutRoom).emit('tables:hold-update', {
                date,
                time,
                tableId,
                isHeld: false,
                userId: socket.userId,
                socketId: socket.id,
            });
        });

        socket.on('disconnect', () => {
            clearHoldsForSocket(socket.id);
        });
    });

    return ioInstance;
};

const emitReservationsUpdateForUser = async (userId) => {
    if (!ioInstance || !userId) {
        return;
    }

    try {
        const reservations = await fetchReservationsForUser(userId);
        const roomName = `user:${userId}`;
        ioInstance.to(roomName).emit('reservations:update', reservations);
    } catch (error) {
        console.error('Emit reservations update error:', error);
    }
};

module.exports = {
    initSocket,
    emitReservationsUpdateForUser,
    getIoInstance,
};
