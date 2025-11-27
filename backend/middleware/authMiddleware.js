const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Thêm bước kiểm tra: Đảm bảo token không rỗng hoặc undefined
            if (!token || token === 'null' || token === 'undefined') {
                // Nếu token không hợp lệ, trả về lỗi 401 mà không cần verify
                return res.status(401).json({ message: 'Xác thực thất bại, token không hợp lệ.' });
            }

            // 2. Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Lấy thông tin người dùng từ DB (không bao gồm mật khẩu) và gắn vào request
            // Điều này đảm bảo thông tin người dùng luôn mới nhất
            const query = `
                SELECT u.user_id, u.name, u.email, r.role_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.role_id 
                WHERE u.user_id = ?
            `;
            const [users] = await db.query(query, [decoded.id]);

            if (users.length === 0) {
                return res.status(401).json({ message: 'Người dùng không tồn tại.' });
            }

            req.user = users[0]; // Gắn object user vào request
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Xác thực thất bại, token không hợp lệ.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Xác thực thất bại, không tìm thấy token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role_name === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập. Yêu cầu quyền Admin.' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (req.user && allowedRoles.includes(req.user.role_name)) {
            return next();
        }
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
    };
};

module.exports = { protect, isAdmin, authorizeRoles };