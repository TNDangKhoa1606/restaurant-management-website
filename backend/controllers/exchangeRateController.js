const axios = require('axios');

let cachedRate = null;
let cachedFrom = null;
let cachedTo = null;
let cachedAt = 0;

const CACHE_TTL_MS = 60 * 60 * 1000;

const getExchangeRate = async (req, res) => {
    const from = (req.query.from || 'VND').toUpperCase();
    const to = (req.query.to || 'USD').toUpperCase();

    if (!from || !to || from === to) {
        return res.json({
            from,
            to,
            rate: 1,
            source: 'static',
        });
    }

    const now = Date.now();
    if (
        cachedRate &&
        cachedFrom === from &&
        cachedTo === to &&
        now - cachedAt < CACHE_TTL_MS
    ) {
        return res.json({
            from,
            to,
            rate: cachedRate,
            source: 'cache',
        });
    }

    try {
        const url = 'https://api.exchangerate.host/latest';
        const { data } = await axios.get(url, {
            params: {
                base: from,
                symbols: to,
            },
        });

        const rate = data && data.rates && data.rates[to];

        if (!rate || typeof rate !== 'number' || !isFinite(rate) || rate <= 0) {
            return res.status(502).json({
                message: 'Không lấy được tỉ giá từ dịch vụ bên ngoài.',
            });
        }

        cachedRate = rate;
        cachedFrom = from;
        cachedTo = to;
        cachedAt = now;

        return res.json({
            from,
            to,
            rate,
            source: 'live',
        });
    } catch (error) {
        console.error('Lỗi khi gọi API tỉ giá:', error.message || error);
        return res.status(502).json({
            message: 'Không thể kết nối tới dịch vụ tỉ giá.',
        });
    }
};

module.exports = { getExchangeRate };
