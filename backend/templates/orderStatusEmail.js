/**
 * Email template cho thông báo trạng thái đơn hàng
 */

const orderStatusLabels = {
    new: 'Mới tạo',
    preparing: 'Đang chuẩn bị',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const orderStatusColors = {
    new: '#3498db',
    preparing: '#f39c12',
    completed: '#27ae60',
    cancelled: '#e74c3c',
};

const generateOrderStatusEmail = (order, newStatus) => {
    const statusLabel = orderStatusLabels[newStatus] || newStatus;
    const statusColor = orderStatusColors[newStatus] || '#333';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e1e1e 0%, #333333 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffc107; margin: 0; font-size: 24px;">🍜 Mì Tinh Tế</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Cập nhật đơn hàng #${order.order_id}</h2>
            
            <div style="background-color: ${statusColor}; color: white; padding: 15px 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 18px; font-weight: bold;">Trạng thái: ${statusLabel}</span>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Chi tiết đơn hàng</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Mã đơn hàng:</td>
                        <td style="padding: 8px 0; color: #333; font-weight: bold;">#${order.order_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Loại đơn:</td>
                        <td style="padding: 8px 0; color: #333;">${order.order_type === 'dine-in' ? 'Tại bàn' : order.order_type === 'delivery' ? 'Giao hàng' : 'Tự lấy'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Tổng tiền:</td>
                        <td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${new Intl.NumberFormat('vi-VN').format(order.total_amount || 0)}đ</td>
                    </tr>
                </table>
            </div>

            <p style="color: #666; line-height: 1.6;">
                Cảm ơn bạn đã đặt hàng tại Mì Tinh Tế. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 14px;">
                © 2024 Mì Tinh Tế. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

module.exports = { generateOrderStatusEmail, orderStatusLabels };
