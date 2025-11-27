const bcrypt = require('bcryptjs');

// Lấy mật khẩu từ dòng lệnh, nếu không có thì mặc định là 'password123'
const password = process.argv[2] || 'password123';

if (!password) {
    console.error('Vui lòng cung cấp mật khẩu cần hash.');
    console.log('Cách dùng: node scripts/hashPassword.js YOUR_PASSWORD_HERE');
    process.exit(1);
}

const saltRounds = 10;

console.log(`Đang mã hóa mật khẩu: "${password}"...`);

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Lỗi khi hash mật khẩu:', err);
        return;
    }
    console.log('Mật khẩu đã mã hóa (hash):');
    console.log(hash);
});