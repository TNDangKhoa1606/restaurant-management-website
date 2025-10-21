import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './OrderDetail.css';

// Dữ liệu mẫu này nên được chia sẻ hoặc lấy từ một nguồn chung sau này
const mockOrders = [
    {
        id: 'DH-12345', date: '26-10-2023', status: 'Hoàn thành', total: 250000,
        shippingAddress: '123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh',
        items: [
            { name: 'Phở Bò (Việt Nam)', qty: 2, price: 70000 },
            { name: 'Gỏi Cuốn (Việt Nam)', qty: 1, price: 50000 },
        ]
    },
    {
        id: 'DH-12344', date: '24-10-2023', status: 'Đã hủy', total: 150000,
        shippingAddress: '456 Đường XYZ, Phường 2, Quận 3, TP. Hồ Chí Minh',
        items: [
            { name: 'Spaghetti Carbonara (Ý)', qty: 1, price: 150000 },
        ]
    },
    {
        id: 'DH-12343', date: '22-10-2023', status: 'Hoàn thành', total: 450000,
        shippingAddress: '789 Đường LMN, Phường 3, Quận 5, TP. Hồ Chí Minh',
        items: [
            { name: 'Ramen Tonkotsu (Nhật Bản)', qty: 2, price: 120000 },
            { name: 'Lasagna al Forno (Ý)', qty: 1, price: 180000 },
        ]
    },
];

const OrderDetail = () => {
    const { orderId } = useParams();
    const order = mockOrders.find(o => o.id === orderId);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (!order) {
        return (
            <div className="order-detail-section">
                <h2 className="content-title">Không tìm thấy đơn hàng</h2>
                <p>Mã đơn hàng không hợp lệ hoặc không tồn tại.</p>
                <Link to="/profile/orders" className="btn-back-to-history">&larr; Quay lại Lịch sử đơn hàng</Link>
            </div>
        );
    }

    return (
        <div className="order-detail-section">
            <div className="order-detail-header">
                <div>
                    <h2 className="content-title">Chi tiết đơn hàng #{order.id}</h2>
                    <p className="content-subtitle">Ngày đặt: {order.date} | <span className={`order-status status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span></p>
                </div>
                <Link to="/profile/orders" className="btn-back-to-history">&larr; Quay lại</Link>
            </div>

            <div className="order-detail-grid">
                {/* Thông tin giao hàng */}
                <div className="detail-card">
                    <h3>Địa chỉ giao hàng</h3>
                    <p>{order.shippingAddress}</p>
                </div>

                {/* Phương thức thanh toán */}
                <div className="detail-card">
                    <h3>Phương thức thanh toán</h3>
                    <p>Thanh toán khi nhận hàng (COD)</p>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="detail-card">
                <h3>Danh sách sản phẩm</h3>
                <div className="order-items-list">
                    {order.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                            <p>{item.qty} x {item.name}</p>
                            <span>{formatPrice(item.price * item.qty)}</span>
                        </div>
                    ))}
                </div>
                <div className="order-total-summary">
                    <strong>Tổng cộng:</strong>
                    <strong>{formatPrice(order.total)}</strong>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;