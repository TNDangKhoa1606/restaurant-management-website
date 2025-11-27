const path = require('path');
const db = require(path.join(__dirname, '../../config/db'));

const safeJsonParse = (value) => {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch (err) {
        return value;
    }
};

const mapRow = (row) => {
    if (!row) return null;
    return {
        ...row,
        amount: row.amount !== null && row.amount !== undefined ? parseFloat(row.amount) : null,
        qr_data: row.qr_data ? safeJsonParse(row.qr_data) : null,
        gateway_response: row.gateway_response ? safeJsonParse(row.gateway_response) : null,
    };
};

const createPayment = async ({
    orderId,
    method,
    amount,
    status,
    txnRef,
    qrImageUrl,
    qrData,
    proofUrl,
    gatewayResponse,
}) => {
    const [result] = await db.query(
        `INSERT INTO payments (order_id, method, amount, status, txn_ref, qr_image_url, qr_data, proof_url, gateway_response)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [
            orderId,
            method,
            amount,
            status,
            txnRef || null,
            qrImageUrl || null,
            qrData && typeof qrData !== 'string' ? JSON.stringify(qrData) : (qrData || null),
            proofUrl || null,
            gatewayResponse && typeof gatewayResponse !== 'string'
                ? JSON.stringify(gatewayResponse)
                : (gatewayResponse || null),
        ]
    );

    return findById(result.insertId);
};

const updatePayment = async (paymentId, data = {}) => {
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) return;
        if (key === 'gateway_response' && value && typeof value !== 'string') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(value));
            return;
        }
        fields.push(`${key} = ?`);
        values.push(value);
    });

    if (!fields.length) {
        return findById(paymentId);
    }

    values.push(paymentId);
    await db.query(`UPDATE payments SET ${fields.join(', ')} WHERE payment_id = ?`, values);
    return findById(paymentId);
};

const findById = async (paymentId) => {
    const [rows] = await db.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    return mapRow(rows[0]);
};

const findByTxnRef = async (txnRef) => {
    const [rows] = await db.query('SELECT * FROM payments WHERE txn_ref = ?', [txnRef]);
    return mapRow(rows[0]);
};

const findLatestByOrder = async (orderId) => {
    const [rows] = await db.query(
        'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
        [orderId]
    );
    return mapRow(rows[0]);
};

module.exports = {
    createPayment,
    updatePayment,
    findById,
    findByTxnRef,
    findLatestByOrder,
};
