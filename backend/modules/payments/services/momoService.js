const axios = require('axios');
const crypto = require('crypto');

const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

const buildSignature = (rawData, secretKey) =>
    crypto.createHmac('sha256', secretKey).update(rawData).digest('hex');

const createPayment = async ({ orderId, amount }) => {
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:5000/api/payments/momo/return';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo/ipn';
    const extraData = process.env.MOMO_EXTRA_DATA || '';
    const requestType = 'captureWallet';
    const requestId = `${partnerCode}-${Date.now()}`;
    const momoOrderId = `${orderId}-${Date.now()}`;
    const orderInfo = `Thanh toan don hang #${orderId}`;

    const rawSignature =
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${ipnUrl}` +
        `&orderId=${momoOrderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${partnerCode}` +
        `&redirectUrl=${redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

    const signature = buildSignature(rawSignature, secretKey);

    const payload = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId: momoOrderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'vi',
    };

    const { data } = await axios.post(MOMO_ENDPOINT, payload, { timeout: 10000 });

    if (data.resultCode !== 0) {
        const error = new Error(data.message || 'Không thể tạo giao dịch MoMo.');
        error.details = data;
        throw error;
    }

    return {
        payUrl: data.payUrl,
        deeplink: data.deeplink || data.payUrl,
        qrPayUrl: data.qrCodeUrl,
        requestId,
        orderId: momoOrderId,
        raw: data,
    };
};

const buildCallbackSignature = (params = {}) => {
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    return (
        `accessKey=${accessKey}` +
        `&amount=${params.amount}` +
        `&extraData=${params.extraData || ''}` +
        `&message=${params.message || ''}` +
        `&orderId=${params.orderId}` +
        `&orderInfo=${params.orderInfo || ''}` +
        `&orderType=${params.orderType || ''}` +
        `&partnerCode=${params.partnerCode}` +
        `&payType=${params.payType || ''}` +
        `&requestId=${params.requestId}` +
        `&responseTime=${params.responseTime}` +
        `&resultCode=${params.resultCode}` +
        `&transId=${params.transId}`
    );
};

const verifyCallback = (params = {}) => {
    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const rawSignature = buildCallbackSignature(params);
    const expected = buildSignature(rawSignature, secretKey);
    return expected === params.signature;
};

module.exports = {
    createPayment,
    verifyCallback,
};
