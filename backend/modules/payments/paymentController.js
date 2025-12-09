const db = require('../../config/db');
const paymentRepository = require('./paymentRepository');
const { buildQrPayload } = require('./services/vietqrService');
const momoService = require('./services/momoService');
const { emitReservationsUpdateForUser } = require('../../socket');

const ADMIN_ROLES = ['Admin', 'Receptionist'];

const getOrderForPayment = async (orderId) => {
    const [rows] = await db.query(
        `SELECT order_id, user_id, status, total_amount, is_paid, payment_method
         FROM orders WHERE order_id = ?`,
        [orderId]
    );
    if (!rows.length) return null;
    const order = rows[0];
    return {
        ...order,
        total_amount: order.total_amount !== null ? parseFloat(order.total_amount) : 0,
    };
};

const canAccessOrder = (order, user) => {
    if (!user || !order) return false;
    if (order.user_id && order.user_id === user.user_id) {
        return true;
    }
    if (ADMIN_ROLES.includes(user.role_name) || ['Waiter', 'Kitchen'].includes(user.role_name)) {
        return true;
    }
    return false;
};

const markOrderAsPaid = async (orderId, method) => {
    await db.query(
        'UPDATE orders SET is_paid = 1, payment_method = ?, status = CASE WHEN status = "new" THEN "preparing" ELSE status END WHERE order_id = ?',
        [method, orderId]
    );
};

const createPaymentSession = async (req, res) => {
    const { orderId, method, amount } = req.body;

    if (!orderId || !method) {
        return res.status(400).json({ message: 'Thiếu orderId hoặc phương thức thanh toán.' });
    }

    const order = await getOrderForPayment(orderId);
    if (!order) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Nếu đơn hàng hiện chưa gắn với user nào (guest order) và đây là khách hàng đăng nhập,
    // tự động gắn đơn hàng + các đặt bàn liên quan với user hiện tại để họ có thể thanh toán và xem lịch sử.
    if (!order.user_id && req.user && req.user.role_name === 'Customer') {
        try {
            await db.query('UPDATE orders SET user_id = ? WHERE order_id = ?', [req.user.user_id, orderId]);
            order.user_id = req.user.user_id;

            // Gắn luôn reservation.user_id cho các đặt bàn đang trỏ tới đơn cọc này nhưng chưa có user
            await db.query(
                'UPDATE reservations SET user_id = ? WHERE deposit_order_id = ? AND (user_id IS NULL OR user_id = 0)',
                [req.user.user_id, orderId]
            );
        } catch (attachError) {
            console.error('Error attaching current user to order/reservation before payment:', attachError.message);
        }
    }

    if (!canAccessOrder(order, req.user)) {
        return res.status(403).json({ message: 'Bạn không có quyền thao tác với đơn hàng này.' });
    }

    if (order.status === 'cancelled') {
        return res.status(400).json({ message: 'Đơn hàng này đã bị huỷ. Vui lòng tạo đơn mới trước khi thanh toán.' });
    }

    if (order.is_paid) {
        return res.status(400).json({ message: 'Đơn hàng đã được thanh toán.' });
    }

    const totalAmount = order.total_amount;
    let paymentAmount = totalAmount;
    if (typeof amount === 'number') {
        if (Number.isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Số tiền thanh toán không hợp lệ.' });
        }
        if (amount > totalAmount) {
            return res.status(400).json({ message: 'Số tiền thanh toán không được vượt quá tổng giá trị đơn hàng.' });
        }
        paymentAmount = amount;
    }

    const normalizedMethod = method.toLowerCase();

    try {
        if (normalizedMethod === 'vietqr') {
            const qrPayload = buildQrPayload({ amount: paymentAmount, orderId });
            const payment = await paymentRepository.createPayment({
                orderId,
                method: 'vietqr',
                amount: paymentAmount,
                status: 'awaiting_proof',
                qrImageUrl: qrPayload.qrImageUrl,
                qrData: JSON.stringify(qrPayload.qrData),
            });

            return res.status(201).json({
                paymentId: payment.payment_id,
                method: payment.method,
                qrImageUrl: qrPayload.qrImageUrl,
                description: qrPayload.description,
                amount: paymentAmount,
            });
        }

        if (normalizedMethod === 'momo') {
            const momoPayload = await momoService.createPayment({ orderId, amount: paymentAmount });
            const payment = await paymentRepository.createPayment({
                orderId,
                method: 'momo',
                amount: paymentAmount,
                status: 'awaiting_gateway',
                txnRef: momoPayload.orderId,
                gatewayResponse: momoPayload.raw,
            });

            return res.status(201).json({
                paymentId: payment.payment_id,
                method: payment.method,
                payUrl: momoPayload.payUrl,
                deeplink: momoPayload.deeplink,
                qrPayUrl: momoPayload.qrPayUrl,
                requestId: momoPayload.requestId,
            });
        }

        return res.status(400).json({ message: 'Phương thức thanh toán không được hỗ trợ.' });
    } catch (error) {
        console.error('Create payment session error:', error.message);
        return res.status(500).json({ message: error.message || 'Không thể tạo phiên thanh toán.' });
    }
};

const uploadTransferProof = async (req, res) => {
    const { id } = req.params;

    const payment = await paymentRepository.findById(id);
    if (!payment) {
        return res.status(404).json({ message: 'Không tìm thấy phiếu thanh toán.' });
    }

    const order = await getOrderForPayment(payment.order_id);
    if (!canAccessOrder(order, req.user)) {
        return res.status(403).json({ message: 'Bạn không có quyền thao tác với đơn hàng này.' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên ảnh minh chứng chuyển khoản.' });
    }

    const proofUrl = `/uploads/${req.file.filename}`;
    const updated = await paymentRepository.updatePayment(payment.payment_id, {
        proof_url: proofUrl,
        status: 'pending_verification',
    });

    res.json({
        message: 'Đã gửi minh chứng thanh toán. Vui lòng đợi nhân viên xác minh.',
        payment: updated,
    });
};

const verifyManualPayment = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    if (!ADMIN_ROLES.includes(req.user.role_name)) {
        return res.status(403).json({ message: 'Bạn không có quyền xác minh thanh toán.' });
    }

    const payment = await paymentRepository.findById(id);
    if (!payment) {
        return res.status(404).json({ message: 'Không tìm thấy phiếu thanh toán.' });
    }

    const order = await getOrderForPayment(payment.order_id);
    if (!order) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (action === 'approve') {
        await paymentRepository.updatePayment(payment.payment_id, { status: 'succeeded' });
        await markOrderAsPaid(payment.order_id, payment.method);

        // Nếu đây là đơn cọc cho đặt bàn, phát realtime cho chủ đặt bàn
        try {
            const [rows] = await db.query(
                'SELECT user_id FROM reservations WHERE deposit_order_id = ? AND user_id IS NOT NULL',
                [payment.order_id]
            );
            if (rows && rows.length > 0 && rows[0].user_id) {
                await emitReservationsUpdateForUser(rows[0].user_id);
            }
        } catch (error) {
            console.error('Emit reservations update error (verifyManualPayment):', error);
        }

        return res.json({ message: 'Đã xác nhận thanh toán thành công.' });
    }

    if (action === 'reject') {
        await paymentRepository.updatePayment(payment.payment_id, { status: 'failed' });
        return res.json({ message: 'Đã từ chối thanh toán. Vui lòng liên hệ khách hàng.' });
    }

    return res.status(400).json({ message: 'Hành động không hợp lệ. Chỉ hỗ trợ approve/reject.' });
};

const buildResultRedirectUrl = (status, orderId, message) => {
    const base = process.env.PAYMENT_RESULT_URL || 'http://localhost:3000/payment/result';
    const url = new URL(base);
    url.searchParams.set('status', status);
    if (orderId) url.searchParams.set('orderId', orderId);
    if (message) url.searchParams.set('message', message);
    return url.toString();
};

const handleMomoReturn = async (req, res) => {
    try {
        const params = req.query;
        const payment = await paymentRepository.findByTxnRef(params.orderId);
        if (!payment) {
            return res.redirect(buildResultRedirectUrl('failed', null, 'Không tìm thấy giao dịch.'));
        }

        const isValid = momoService.verifyCallback(params);
        if (isValid && Number(params.resultCode) === 0) {
            await paymentRepository.updatePayment(payment.payment_id, {
                status: 'succeeded',
                gateway_response: params,
            });
            await markOrderAsPaid(payment.order_id, payment.method);

            try {
                const [rows] = await db.query(
                    'SELECT user_id FROM reservations WHERE deposit_order_id = ? AND user_id IS NOT NULL',
                    [payment.order_id]
                );
                if (rows && rows.length > 0 && rows[0].user_id) {
                    await emitReservationsUpdateForUser(rows[0].user_id);
                }
            } catch (error) {
                console.error('Emit reservations update error (handleMomoReturn):', error);
            }

            return res.redirect(buildResultRedirectUrl('succeeded', payment.order_id));
        }

        await paymentRepository.updatePayment(payment.payment_id, {
            status: 'failed',
            gateway_response: params,
        });
        return res.redirect(buildResultRedirectUrl('failed', payment.order_id, params.message));
    } catch (error) {
        console.error('Handle MoMo return error:', error);
        return res.redirect(buildResultRedirectUrl('failed', null, 'Có lỗi xảy ra.'));
    }
};

const handleMomoIpn = async (req, res) => {
    try {
        const params = req.body;
        const payment = await paymentRepository.findByTxnRef(params.orderId);
        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch.' });
        }

        const isValid = momoService.verifyCallback(params);
        if (!isValid) {
            return res.status(400).json({ message: 'Chữ ký không hợp lệ.' });
        }

        if (Number(params.resultCode) === 0) {
            await paymentRepository.updatePayment(payment.payment_id, {
                status: 'succeeded',
                gateway_response: params,
            });
            await markOrderAsPaid(payment.order_id, payment.method);

            try {
                const [rows] = await db.query(
                    'SELECT user_id FROM reservations WHERE deposit_order_id = ? AND user_id IS NOT NULL',
                    [payment.order_id]
                );
                if (rows && rows.length > 0 && rows[0].user_id) {
                    await emitReservationsUpdateForUser(rows[0].user_id);
                }
            } catch (error) {
                console.error('Emit reservations update error (handleMomoIpn):', error);
            }

            return res.json({ message: 'Đã ghi nhận thanh toán thành công.' });
        }

        await paymentRepository.updatePayment(payment.payment_id, {
            status: 'failed',
            gateway_response: params,
        });
        return res.json({ message: 'Thanh toán thất bại.', code: params.resultCode });
    } catch (error) {
        console.error('Handle MoMo IPN error:', error);
        return res.status(500).json({ message: 'Không thể xử lý callback MoMo.' });
    }
};
const demoConfirmPayment = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await paymentRepository.findById(id);
        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu thanh toán.' });
        }

        const order = await getOrderForPayment(payment.order_id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        // Chỉ cho phép chủ đơn hoặc nhân viên nội bộ xác nhận demo
        if (!canAccessOrder(order, req.user)) {
            return res.status(403).json({ message: 'Bạn không có quyền xác nhận thanh toán cho đơn hàng này.' });
        }

        await paymentRepository.updatePayment(payment.payment_id, { status: 'succeeded' });
        await markOrderAsPaid(payment.order_id, payment.method);

        try {
            const [rows] = await db.query(
                'SELECT user_id FROM reservations WHERE deposit_order_id = ? AND user_id IS NOT NULL',
                [payment.order_id]
            );
            if (rows && rows.length > 0 && rows[0].user_id) {
                await emitReservationsUpdateForUser(rows[0].user_id);
            }
        } catch (error) {
            console.error('Emit reservations update error (demoConfirmPayment):', error);
        }

        return res.json({
            message: 'Đã giả lập thanh toán thành công (demo).',
            orderId: payment.order_id,
        });
    } catch (error) {
        console.error('Demo confirm payment error:', error);
        return res.status(500).json({ message: 'Không thể xác nhận thanh toán demo.' });
    }
};

const getPaymentInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.user_id || req.user?.id;

        console.log('[getPaymentInfo] Request for payment:', id, 'by user:', userId);
        console.log('[getPaymentInfo] req.user:', req.user);

        if (!userId) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
        }

        const payment = await paymentRepository.findById(id);
        if (!payment) {
            console.log('[getPaymentInfo] Payment not found:', id);
            return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán.' });
        }

        console.log('[getPaymentInfo] Payment found:', payment.payment_id, 'order:', payment.order_id);

        // Kiểm tra quyền: chỉ user tạo payment mới xem được
        const [orderRows] = await db.query('SELECT user_id FROM orders WHERE order_id = ?', [payment.order_id]);
        if (!orderRows.length) {
            console.log('[getPaymentInfo] Order not found:', payment.order_id);
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        if (orderRows[0].user_id !== userId) {
            console.log('[getPaymentInfo] Permission denied. Order user:', orderRows[0].user_id, 'Request user:', userId);
            return res.status(403).json({ message: 'Bạn không có quyền xem thông tin này.' });
        }

        // Parse gateway response để lấy QR URL
        let qrImageUrl = null;
        let description = `Thanh toan don hang #${payment.order_id}`;
        
        if (payment.gateway_response) {
            try {
                const gatewayData = typeof payment.gateway_response === 'string' 
                    ? JSON.parse(payment.gateway_response) 
                    : payment.gateway_response;
                qrImageUrl = gatewayData.qrCodeUrl || gatewayData.qrDataURL || gatewayData.qrImageUrl;
                console.log('[getPaymentInfo] QR URL found:', qrImageUrl ? 'Yes' : 'No');
            } catch (e) {
                console.error('[getPaymentInfo] Parse gateway response error:', e);
            }
        } else {
            console.log('[getPaymentInfo] No gateway_response data');
        }

        // Fallback: Tạo QR URL mới nếu không có
        if (!qrImageUrl) {
            console.log('[getPaymentInfo] Generating fallback QR URL');
            const { buildQrPayload } = require('./services/vietqrService');
            const qrPayload = buildQrPayload({ amount: payment.amount, orderId: payment.order_id });
            qrImageUrl = qrPayload.qrImageUrl;
            description = qrPayload.description;
        }

        res.json({
            paymentId: payment.payment_id,
            amount: payment.amount,
            description,
            qrImageUrl,
            status: payment.status,
        });
    } catch (error) {
        console.error('[getPaymentInfo] Error:', error);
        res.status(500).json({ message: 'Không thể lấy thông tin thanh toán.' });
    }
};

module.exports = {
    createPaymentSession,
    uploadTransferProof,
    verifyManualPayment,
    handleMomoReturn,
    handleMomoIpn,
    demoConfirmPayment,
    getPaymentInfo,
};
