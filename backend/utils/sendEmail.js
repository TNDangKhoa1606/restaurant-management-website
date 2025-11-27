const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Tạo transporter object sử dụng SMTP của dịch vụ email
    // Ví dụ cấu hình cho Gmail. Bạn có thể thay đổi sang SendGrid, Mailgun, v.v.
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // Ví dụ: 'smtp.gmail.com'
        port: process.env.EMAIL_PORT, // Ví dụ: 587 (TLS) hoặc 465 (SSL)
        secure: process.env.EMAIL_SECURE === 'true', // true cho 465, false cho các cổng khác (như 587)
        auth: {
            user: process.env.EMAIL_USERNAME, // Tài khoản email của bạn (ví dụ: your_email@gmail.com)
            pass: process.env.EMAIL_PASSWORD, // Mật khẩu email hoặc App Password của bạn
        },
        // Tùy chọn thêm nếu gặp lỗi tự ký chứng chỉ (chỉ dùng trong dev, không khuyến khích cho prod)
        // tls: {
        //     rejectUnauthorized: false
        // }
    });

    // 2. Định nghĩa thông tin email
    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`, // Người gửi hiển thị
        to: options.to,       // Người nhận
        subject: options.subject, // Tiêu đề email
        html: options.html,   // Nội dung HTML của email
    };

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;