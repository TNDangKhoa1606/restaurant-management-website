/**
 * Email template cho thông báo khuyến mãi
 */

const generatePromotionEmail = (promotion) => {
    const validUntil = promotion.validUntil
        ? new Date(promotion.validUntil).toLocaleDateString('vi-VN')
        : 'Không giới hạn';

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
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">🎉 ƯU ĐÃI ĐẶC BIỆT!</h1>
        </div>

        <!-- Hero Image/Banner -->
        <div style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); padding: 40px; text-align: center;">
            <h2 style="color: #1e1e1e; margin: 0; font-size: 32px; text-transform: uppercase;">
                ${promotion.title}
            </h2>
            ${promotion.discountPercent ? `
            <div style="background-color: #e74c3c; color: white; display: inline-block; padding: 10px 30px; border-radius: 50px; margin-top: 15px; font-size: 24px; font-weight: bold;">
                GIẢM ${promotion.discountPercent}%
            </div>
            ` : ''}
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
                ${promotion.message}
            </p>

            ${promotion.code ? `
            <div style="background-color: #f8f9fa; border: 2px dashed #ffc107; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #666; margin: 0 0 10px 0;">Mã khuyến mãi của bạn:</p>
                <span style="background-color: #1e1e1e; color: #ffc107; padding: 10px 30px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 4px; display: inline-block;">
                    ${promotion.code}
                </span>
            </div>
            ` : ''}

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0;">
                    ⏰ <strong>Thời hạn:</strong> ${validUntil}
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu" 
                   style="background-color: #ffc107; color: #1e1e1e; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">
                    ĐẶT NGAY
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1e1e1e; padding: 20px; text-align: center;">
            <h3 style="color: #ffc107; margin: 0 0 10px 0;">🍜 Mì Tinh Tế</h3>
            <p style="color: #999; margin: 0; font-size: 14px;">
                © 2024 Mì Tinh Tế. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

module.exports = { generatePromotionEmail };
