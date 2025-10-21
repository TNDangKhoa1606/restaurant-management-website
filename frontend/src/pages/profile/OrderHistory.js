import React from 'react';
import { Link, useInRouterContext } from 'react-router-dom';
import './OrderHistory.css'; // Sẽ tạo ở bước 2

const OrderHistory = () => {
    const inRouter = useInRouterContext();
    // Dữ liệu mẫu cho lịch sử đơn hàng
    const mockOrders = [
        {
            id: 'DH-12345',
            date: '26-10-2023',
            status: 'Hoàn thành',
            total: 250000,
            items: [
                { name: 'Phở Bò (Việt Nam)', qty: 2 },
                { name: 'Gỏi Cuốn (Việt Nam)', qty: 1 },
            ]
        },
        {
            id: 'DH-12344',
            date: '24-10-2023',
            status: 'Đã hủy',
            total: 150000,
            items: [
                { name: 'Spaghetti Carbonara (Ý)', qty: 1 },
            ]
        },
        {
            id: 'DH-12343',
            date: '22-10-2023',
            status: 'Hoàn thành',
            total: 450000,
            items: [
                { name: 'Ramen Tonkotsu (Nhật Bản)', qty: 2 },
                { name: 'Lasagna al Forno (Ý)', qty: 1 },
            ]
        },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="order-history-section">
            <h2 className="content-title">Lịch sử đơn hàng</h2>
            <p className="content-subtitle">Theo dõi các đơn hàng đã đặt của bạn tại đây.</p>

            <div className="order-list">
                {mockOrders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-card-header">
                            <span className="order-id">Đơn hàng: {order.id}</span>
                            <span className={`order-status status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                        </div>
                        <div className="order-card-footer">
                            <span className="order-date">Ngày đặt: {order.date}</span>
                            <span className="order-total">Tổng tiền: {formatPrice(order.total)}</span>
                            {inRouter ? (
                                <Link to={`/profile/orders/${order.id}`} className="btn-view-detail">Xem chi tiết</Link>
                            ) : (
                                <a href={`/profile/orders/${order.id}`} className="btn-view-detail">Xem chi tiết</a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
