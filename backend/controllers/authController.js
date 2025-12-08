const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // Sẽ tạo ở bước sau

const getFullAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) {
        return null;
    }
    if (typeof avatarUrl !== 'string') {
        return null;
    }
    if (avatarUrl.startsWith('http')) {
        return avatarUrl;
    }
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${backendUrl}${avatarUrl}`;
};

const register = async (req, res) => {
    const { name, email, password } = req.body; // Chỉ nhận các trường cần thiết

    // 1. Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, email và mật khẩu.' });
    }

    // Thêm ràng buộc dữ liệu chi tiết
    if (name.trim().length < 2) {
        return res.status(400).json({ message: 'Tên phải có ít nhất 2 ký tự.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Định dạng email không hợp lệ.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
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

        // 5. Tạo token xác thực
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        console.log('--- [REGISTER] ---');
        console.log('Hashed Token (sẽ được lưu vào DB):', hashedToken);

        // 6. Chuẩn bị dữ liệu người dùng mới
        const newUser = {
            name: name,
            email: email,
            password_hash: password_hash,
            role_id: customerRoleId, // Sử dụng role_id đã tìm được
            verification_token: hashedToken,
        };

        // 7. Lưu người dùng vào CSDL bằng cú pháp INSERT an toàn và rõ ràng hơn
        const sql = `
            INSERT INTO users (name, email, password_hash, role_id, verification_token)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [newUser.name, newUser.email, newUser.password_hash, newUser.role_id, newUser.verification_token];
        
        await db.query(sql, values);

        // 8. Gửi email xác thực
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const message = `
            <h1>Xác thực tài khoản của bạn</h1>
            <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào liên kết bên dưới để kích hoạt tài khoản của bạn:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        `;

        await sendEmail({
            to: newUser.email,
            subject: 'Xác thực tài khoản - Mì Tinh Tế',
            html: message
        });

        res.status(201).json({ message: 'Tạo tài khoản thành công. Vui lòng kiểm tra email để xác thực.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi đăng ký.' });
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

        // Thêm: Kiểm tra tài khoản đã được xác thực chưa
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email.' });
        }

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
            avatar: getFullAvatarUrl(user.avatar_url),
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

const verifyEmail = async (req, res) => {
    try {
        // 1. Lấy token từ URL và hash nó
        const { token } = req.params;
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        console.log('--- [VERIFY EMAIL] ---');
        console.log('Token nhận từ URL:', token);
        console.log('Token sau khi hash để tìm trong DB:', hashedToken);
        // 2. Tìm người dùng với token tương ứng
        const [users] = await db.query('SELECT * FROM users WHERE verification_token = ?', [hashedToken]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }

        const user = users[0];

        // 3. Cập nhật trạng thái người dùng
        await db.query(
            'UPDATE users SET is_verified = ?, verification_token = NULL WHERE user_id = ?',
            [true, user.user_id]
        );

        res.json({ message: 'Xác thực email thành công. Bây giờ bạn có thể đăng nhập.' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi xác thực email.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        // 1. Lấy email từ body và tìm người dùng
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ email.' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        // Để tránh lộ thông tin, kể cả khi không tìm thấy email, ta vẫn trả về thông báo thành công.
        if (users.length === 0) {
            return res.status(200).json({ message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một liên kết đặt lại mật khẩu.' });
        }
        const user = users[0];

        // 2. Tạo token và mã hóa nó
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Token hết hạn sau 10 phút

        // 3. Lưu token và thời gian hết hạn vào CSDL
        await db.query(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE user_id = ?',
            [passwordResetToken, passwordResetExpires, user.user_id]
        );

        // 4. Gửi email cho người dùng
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `
            <h1>Yêu cầu đặt lại mật khẩu</h1>
            <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết bên dưới để tiếp tục:</p>
            <a href="${resetUrl}" target="_blank">${resetUrl}</a>
            <p>Liên kết này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu - Mì Tinh Tế',
            html: message
        });

        res.status(200).json({ message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một liên kết đặt lại mật khẩu.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        // 1. Lấy token từ URL, mã hóa và tìm người dùng
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const [users] = await db.query('SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()', [hashedToken]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
        const user = users[0];

        // 2. Lấy mật khẩu mới, mã hóa và cập nhật
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = ?', [password_hash, user.user_id]);

        res.json({ message: 'Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};

const internalLogin = async (req, res) => {
    const { email, password } = req.body; // Bỏ 'role'

    // Cập nhật validation
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

        // 2. Chặn khách hàng sử dụng form này
        if (user.role_name.toLowerCase() === 'customer') {
            return res.status(403).json({ message: 'Khách hàng vui lòng đăng nhập tại trang dành cho khách hàng.' });
        }

        // 3. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        // 4. Tạo payload và token
        const userPayload = {
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role_name,
            avatar: getFullAvatarUrl(user.avatar_url),
        };

        if (!process.env.JWT_SECRET) {
            console.error('Lỗi nghiêm trọng: JWT_SECRET chưa được định nghĩa trong tệp .env.');
            return res.status(500).json({ message: 'Lỗi cấu hình máy chủ.' });
        }

        const token = jwt.sign({ id: user.user_id, role: user.role_name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Phản hồi bây giờ đã bao gồm vai trò của người dùng để frontend xử lý
        res.json({ token, user: userPayload });

    } catch (error) {
        console.error('Internal Login error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

const createStaffAccount = async (req, res) => {
    // Giả định rằng đã có middleware xác thực admin ở route
    const { name, email, password, phone, role } = req.body;

    // 1. Validation
    if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin: họ tên, email, mật khẩu, SĐT và vai trò.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }
    // Chặn việc tạo tài khoản khách hàng từ form này
    if (role.toLowerCase() === 'customer') {
        return res.status(400).json({ message: 'Không thể tạo tài khoản Khách hàng từ giao diện này.' });
    }

    try {
        // 2. Kiểm tra xem email đã tồn tại chưa
        const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        // 3. Tìm role_id cho vai trò được cung cấp
        const [roleRows] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [role]);
        if (roleRows.length === 0) {
            return res.status(400).json({ message: `Vai trò '${role}' không hợp lệ.` });
        }
        const roleId = roleRows[0].role_id;

        // 4. Mã hóa mật khẩu (Đây chính là bước bạn quan tâm)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 5. Chuẩn bị dữ liệu người dùng mới
        const newUser = {
            name,
            email,
            password_hash,
            phone,
            role_id: roleId,
            is_verified: true, // Tài khoản do admin tạo nên được xác thực luôn
        };

        // 6. Lưu người dùng vào CSDL
        const sql = `
            INSERT INTO users (name, email, password_hash, phone, role_id, is_verified)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [newUser.name, newUser.email, newUser.password_hash, newUser.phone, newUser.role_id, newUser.is_verified];
        
        await db.query(sql, values);

        // 7. Phản hồi thành công
        res.status(201).json({ message: `Tạo tài khoản cho nhân viên ${newUser.name} thành công.` });

    } catch (error) {
        console.error('Create staff account error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi tạo tài khoản.' });
    }
};

const getAllStaff = async (req, res) => {
    const { keyword, role } = req.query;

    try {
        let query = `
            SELECT 
                u.user_id, 
                u.name, 
                u.email, 
                u.phone, 
                u.is_verified, 
                r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE r.role_name != 'Customer'
        `;
        const params = [];

        if (keyword) {
            query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        if (role) {
            query += ` AND r.role_name = ?`;
            params.push(role);
        }

        query += ` ORDER BY u.created_at DESC`;

        const [staff] = await db.query(query, params);

        // Chuyển đổi is_verified thành status để tương thích với frontend
        const formattedStaff = staff.map(emp => ({
            id: emp.user_id,
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            role: emp.role_name,
            status: emp.is_verified ? 'active' : 'inactive'
        }));

        res.json(formattedStaff);
    } catch (error) {
        console.error('Get all staff error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách nhân viên.' });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Kiểm tra xem người dùng có tồn tại không
        const [users] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // 2. Xóa các bản ghi phụ thuộc
        await connection.query('DELETE FROM dishreviews WHERE user_id = ?', [userId]);
        await connection.query('DELETE FROM orderreviews WHERE user_id = ?', [userId]);
        await connection.query('DELETE FROM addresses WHERE user_id = ?', [userId]);
        // Xóa messages trước conversations
        const [conversations] = await connection.query('SELECT conversation_id FROM chatconversations WHERE user_id = ?', [userId]);
        if (conversations.length > 0) {
            const conversationIds = conversations.map(c => c.conversation_id);
            await connection.query('DELETE FROM chatmessages WHERE conversation_id IN (?)', [conversationIds]);
            await connection.query('DELETE FROM chatconversations WHERE user_id = ?', [userId]);
        }

        // 3. Cập nhật các bản ghi tham chiếu khác thành NULL (để giữ lại lịch sử)
        await connection.query('UPDATE orders SET user_id = NULL WHERE user_id = ?', [userId]);
        await connection.query('UPDATE reservations SET user_id = NULL WHERE user_id = ?', [userId]);

        // 4. Xóa người dùng
        await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);

        await connection.commit();
        res.json({ message: 'Người dùng đã được xóa thành công.' });
    } catch (error) {
        console.error('Delete user error:', error);
        if (connection) await connection.rollback();
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi xóa người dùng.' });
    } finally {
        if (connection) connection.release();
    }
};

const getAllCustomers = async (req, res) => {
    const { keyword, tag } = req.query;

    try {
        let baseQuery = `
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.phone,
                u.created_at AS joinDate,
                u.loyalty_points,
                u.is_vip,
                COALESCE(SUM(CASE WHEN o.status = 'completed' AND o.is_paid = 1 THEN o.total_amount ELSE 0 END), 0) AS totalSpent
            FROM
                users u
            JOIN
                roles r ON u.role_id = r.role_id
            LEFT JOIN
                orders o ON u.user_id = o.user_id
            WHERE
                r.role_name = 'Customer'
        `;
        const params = [];

        if (keyword) {
            baseQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        let havingClause = '';

        // Logic lọc theo tag
        if (tag) {
            if (tag === 'VIP') havingClause = ` HAVING totalSpent > 4000000`;
            else if (tag === 'Regular') havingClause = ` HAVING totalSpent > 1000000 AND totalSpent <= 4000000`;
            else if (tag === 'New') havingClause = ` HAVING totalSpent <= 1000000`;
        }

        baseQuery += ` GROUP BY u.user_id, u.name, u.email, u.phone, u.created_at, u.loyalty_points, u.is_vip` + havingClause;

        baseQuery += ` ORDER BY totalSpent DESC`;

        const [customers] = await db.query(baseQuery, params);

        const formattedCustomers = customers.map(c => ({
            id: c.user_id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            joinDate: c.joinDate,
            loyaltyPoints: c.loyalty_points,
            totalSpent: parseFloat(c.totalSpent),
            isVip: c.is_vip,
            tag: c.totalSpent > 4000000 ? 'VIP' : (c.totalSpent > 1000000 ? 'Regular' : 'New')
        }));

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Get all customers error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy danh sách khách hàng.' });
    }
};

const toggleVipStatus = async (req, res) => {
    const userId = req.params.id;

    try {
        // Lấy trạng thái hiện tại và đảo ngược nó
        const [users] = await db.query('SELECT is_vip FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
        }
        const newStatus = !users[0].is_vip;

        await db.query('UPDATE users SET is_vip = ? WHERE user_id = ?', [newStatus, userId]);
        res.json({ message: 'Cập nhật trạng thái VIP thành công.', isVip: newStatus });
    } catch (error) {
        console.error('Toggle VIP status error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật trạng thái VIP.' });
    }
};

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, phone, role, status } = req.body;

    // Validation
    if (!name || !phone || !role || !status) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: tên, SĐT, vai trò và trạng thái.' });
    }

    try {
        // 1. Tìm role_id cho vai trò được cung cấp
        const [roleRows] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [role]);
        if (roleRows.length === 0) {
            return res.status(400).json({ message: `Vai trò '${role}' không hợp lệ.` });
        }
        const roleId = roleRows[0].role_id;

        // 2. Chuyển đổi 'status' từ frontend ('active'/'inactive') thành 'is_verified' (1/0)
        const is_verified = status === 'active' ? 1 : 0;

        // 3. Cập nhật thông tin người dùng
        const sql = `
            UPDATE users
            SET name = ?, phone = ?, role_id = ?, is_verified = ?
            WHERE user_id = ?
        `;
        const [result] = await db.query(sql, [name, phone, roleId, is_verified, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }

        // 4. Lấy lại thông tin người dùng đã cập nhật để trả về cho frontend
        const [updatedUser] = await db.query(
            `SELECT u.user_id, u.name, u.email, u.phone, u.is_verified, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [userId]
        );

        const formattedUser = {
            id: updatedUser[0].user_id,
            name: updatedUser[0].name,
            email: updatedUser[0].email,
            phone: updatedUser[0].phone,
            role: updatedUser[0].role_name,
            status: updatedUser[0].is_verified ? 'active' : 'inactive'
        };

        res.json(formattedUser);

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật người dùng.' });
    }
};

const getCustomerDetails = async (req, res) => {
    const userId = req.params.id;

    try {
        const query = `
            SELECT 
                user_id, 
                name, 
                email, 
                phone, 
                created_at AS joinDate 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Customer'
        `;
        const [users] = await db.query(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng hoặc người dùng không phải là khách hàng.' });
        }

        res.json(users[0]);

    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy thông tin chi tiết khách hàng.' });
    }
};

const getCustomerHistory = async (req, res) => {
    const userId = req.params.id;

    try {
        // Lấy lịch sử đơn hàng
        const ordersQuery = `
            SELECT order_id, placed_at, order_type, total_amount, status
            FROM orders
            WHERE user_id = ?
            ORDER BY placed_at DESC
        `;
        const [orders] = await db.query(ordersQuery, [userId]);

        // Lấy lịch sử đặt bàn
        const reservationsQuery = `
            SELECT reservation_id, res_date, res_time, number_of_people, status
            FROM reservations
            WHERE user_id = ?
            ORDER BY res_date DESC, res_time DESC
        `;
        const [reservations] = await db.query(reservationsQuery, [userId]);

        res.json({
            orders,
            reservations
        });

    } catch (error) {
        console.error('Get customer history error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi lấy lịch sử khách hàng.' });
    }
};

const googleCallback = async (req, res) => {
    // Passport đã xác thực và gắn thông tin user vào req.user
    const user = req.user;

    // 1. Tạo payload cho JWT, bao gồm cả avatar nếu có
    const tokenPayload = {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role_name,
        avatar: getFullAvatarUrl(user.avatar_url),
    };

    if (!process.env.JWT_SECRET) {
        console.error('Lỗi nghiêm trọng: JWT_SECRET chưa được định nghĩa trong tệp .env.');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_config`);
    }

    // 2. Tạo token và chuyển hướng về frontend
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${process.env.FRONTEND_URL}/google-auth-handler?token=${token}`);
};

const updateCustomerProfile = async (req, res) => {
    const userId = req.user.user_id;
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, email và số điện thoại.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Định dạng email không hợp lệ.' });
    }

    try {
        const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ? AND user_id <> ?', [email, userId]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        const [existingPhones] = await db.query('SELECT user_id FROM users WHERE phone = ? AND user_id <> ?', [phone, userId]);
        if (existingPhones.length > 0) {
            return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng.' });
        }

        const updateSql = `
            UPDATE users
            SET name = ?, phone = ?, email = ?
            WHERE user_id = ?
        `;
        const [updateResult] = await db.query(updateSql, [name, phone, email, userId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }

        const [rows] = await db.query(
            `SELECT u.user_id, u.name, u.email, u.phone, u.avatar_url, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng sau khi cập nhật.' });
        }

        const updated = rows[0];
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fullAvatarUrl = updated.avatar_url && updated.avatar_url.startsWith('http') 
            ? updated.avatar_url 
            : (updated.avatar_url ? `${backendUrl}${updated.avatar_url}` : null);

        const userPayload = {
            id: updated.user_id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            role: updated.role_name,
            avatar: fullAvatarUrl,
        };

        res.json({ user: userPayload });
    } catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật thông tin cá nhân.' });
    }
};

const changePassword = async (req, res) => {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    try {
        const [users] = await db.query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newPasswordHash, userId]);
        res.json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi đổi mật khẩu.' });
    }
};

const uploadAvatar = async (req, res) => {
    const userId = req.user.user_id;

    if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn một file ảnh để tải lên.' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    try {
        // Update avatar_url in database
        const [updateResult] = await db.query('UPDATE users SET avatar_url = ? WHERE user_id = ?', [avatarPath, userId]);
        console.log('Update result:', updateResult);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật avatar.' });
        }

        // Fetch updated user info
        const [rows] = await db.query(
            `SELECT u.user_id, u.name, u.email, u.phone, u.avatar_url, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng sau khi cập nhật avatar.' });
        }

        const updated = rows[0];
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fullAvatarUrl = updated.avatar_url && updated.avatar_url.startsWith('http') 
            ? updated.avatar_url 
            : (updated.avatar_url ? `${backendUrl}${updated.avatar_url}` : null);

        const userPayload = {
            id: updated.user_id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            role: updated.role_name,
            avatar: fullAvatarUrl,
        };

        res.json({ user: userPayload });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật ảnh đại diện.' });
    }
};

module.exports = { 
    register, 
    login, 
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    internalLogin, 
    createStaffAccount, 
    getAllStaff, 
    deleteUser, 
    getAllCustomers,
    getCustomerDetails, // Thêm hàm mới
    getCustomerHistory,  // Thêm hàm mới
    toggleVipStatus,
    updateUser, // Thêm hàm updateUser vào export
    googleCallback, // Thêm hàm mới
    changePassword,
    updateCustomerProfile,
    uploadAvatar,
};