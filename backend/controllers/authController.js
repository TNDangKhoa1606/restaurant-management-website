const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password } = req.body; // Chỉ nhận các trường cần thiết

    // 1. Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, email và mật khẩu.' });
    }

    try {
        // 2. Kiểm tra xem email đã tồn tại chưa
        const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        // 3. Tìm role_id cho vai trò 'customer'
        const [roleRows] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['Customer']);
        if (roleRows.length === 0) {
            console.error("Lỗi cấu hình: Vai trò 'Customer' không tồn tại trong bảng 'roles'.");
            return res.status(500).json({ message: 'Lỗi cấu hình máy chủ: không tìm thấy vai trò mặc định.' });
        }
        const customerRoleId = roleRows[0].role_id;

        // 4. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 5. Chuẩn bị dữ liệu người dùng mới
        const newUser = {
            name: name,
            email: email,
            password_hash: password_hash,
            role_id: customerRoleId // Sử dụng role_id đã tìm được
        };

        await db.query('INSERT INTO users SET ?', newUser);

        res.status(201).json({ message: 'Tạo tài khoản thành công.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    try {
        // 1. Tìm người dùng và JOIN với bảng roles để lấy role_name
        const query = `
            SELECT u.*, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE u.email = ?
        `;
        const [users] = await db.query(query, [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = users[0];

        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        // 3. Tạo payload và token
        const userPayload = {
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone, // Thêm số điện thoại vào payload
            role: user.role_name, // Sử dụng role_name từ kết quả JOIN
        };

        // Thêm kiểm tra để đảm bảo JWT_SECRET đã được định nghĩa
        if (!process.env.JWT_SECRET) {
            console.error('Lỗi nghiêm trọng: JWT_SECRET chưa được định nghĩa trong tệp .env.');
            return res.status(500).json({ message: 'Lỗi cấu hình máy chủ.' });
        }

        const token = jwt.sign({ id: user.user_id, role: user.role_name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: userPayload });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = { register, login };