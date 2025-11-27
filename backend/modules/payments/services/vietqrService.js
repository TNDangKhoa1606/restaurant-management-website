const querystring = require('querystring');

const buildQrPayload = ({ amount, orderId }) => {
    const bankBin = process.env.VIETQR_BANK_BIN || '970415';
    const accountNo = process.env.VIETQR_ACCOUNT_NO || '0000000000';
    const accountName = process.env.VIETQR_ACCOUNT_NAME || 'NOODLES RESTAURANT';
    const template = process.env.VIETQR_TEMPLATE || 'qr_only';

    const description = `ORDER ${orderId}`;
    const baseUrl = 'https://img.vietqr.io/image';
    const qs = querystring.stringify({
        amount: amount ? Math.round(amount) : undefined,
        accountName,
        addInfo: description,
    });

    return {
        description,
        amount,
        bankBin,
        accountNo,
        accountName,
        qrImageUrl: `${baseUrl}/${bankBin}-${accountNo}-${template}.png?${qs}`,
        qrData: {
            description,
            amount,
            bankBin,
            accountNo,
            accountName,
        },
    };
};

module.exports = {
    buildQrPayload,
};
