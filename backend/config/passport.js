const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = function(passport) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
        console.warn('Google OAuth credentials are missing. Google login is disabled.');
    } else {
        passport.use(new GoogleStrategy({
            clientID,
            clientSecret,
            callbackURL: '/api/auth/google/callback'
        },
    async (accessToken, refreshToken, profile, done) => {
        const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
        const newUser = {
            google_id: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            is_verified: true, // Tài khoản Google mặc định là đã xác thực
            avatar_url: avatarUrl,
        };

        try {
            const selectUserQuery = `
                SELECT u.*, r.role_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.role_id 
                WHERE u.google_id = ?
            `;
            const selectUserByEmailQuery = `
                SELECT u.*, r.role_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.role_id 
                WHERE u.email = ?
            `;
            const selectUserByIdQuery = `
                SELECT u.*, r.role_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.role_id 
                WHERE u.user_id = ?
            `;

            // 1. Tìm xem người dùng đã tồn tại với google_id chưa
            let [users] = await db.query(selectUserQuery, [profile.id]);
            let user = users[0];

            if (user) {
                // Nếu đã có, cập nhật avatar_url nếu trước đó chưa có và Google cung cấp
                if (!user.avatar_url && newUser.avatar_url) {
                    await db.query('UPDATE users SET avatar_url = ? WHERE user_id = ?', [newUser.avatar_url, user.user_id]);
                    const [updatedUsers] = await db.query(selectUserByIdQuery, [user.user_id]);
                    return done(null, updatedUsers[0]);
                }
                return done(null, user);
            } else {
                // 2. Nếu chưa, tìm xem có tài khoản nào trùng email không
                [users] = await db.query(selectUserByEmailQuery, [newUser.email]);
                user = users[0];

                if (user) {
                    // Nếu có, cập nhật google_id, và chỉ set avatar_url nếu hiện chưa có
                    if (!user.avatar_url && newUser.avatar_url) {
                        await db.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE user_id = ?', [newUser.google_id, newUser.avatar_url, user.user_id]);
                    } else {
                        await db.query('UPDATE users SET google_id = ? WHERE user_id = ?', [newUser.google_id, user.user_id]);
                    }
                    const [updatedUsers] = await db.query(selectUserByIdQuery, [user.user_id]);
                    return done(null, updatedUsers[0]);
                } else {
                    // 3. Nếu không, tạo người dùng mới hoàn toàn
                    const [roleRows] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['Customer']);
                    const customerRoleId = roleRows[0].role_id;

                    // Do cột password_hash NOT NULL, cần tạo mật khẩu ngẫu nhiên chỉ để thỏa ràng buộc.
                    // Người dùng Google sẽ không sử dụng mật khẩu này để đăng nhập.
                    const randomPassword = crypto.randomBytes(32).toString('hex');
                    const salt = await bcrypt.genSalt(10);
                    const passwordHash = await bcrypt.hash(randomPassword, salt);

                    const insertSql = `
                        INSERT INTO users (google_id, name, email, password_hash, role_id, is_verified, avatar_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?);
                    `;
                    const [result] = await db.query(insertSql, [newUser.google_id, newUser.name, newUser.email, passwordHash, customerRoleId, newUser.is_verified, newUser.avatar_url]);

                    // Lấy lại thông tin người dùng vừa tạo để trả về
                    const [createdUsers] = await db.query(selectUserByIdQuery, [result.insertId]);
                    const createdUser = createdUsers[0];
                    
                    return done(null, createdUser);
                }
            }
        } catch (err) {
            console.error('Lỗi trong Google Strategy:', err); // Log lỗi để debug
            return done(err, false);
        }
        }));
    }

    // Lưu user_id vào session
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    // Lấy thông tin người dùng từ user_id trong session
    passport.deserializeUser(async (id, done) => {
        const query = `
            SELECT u.*, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE u.user_id = ?
        `;
        const [users] = await db.query(query, [id]);
        done(null, users[0]);
    });
};