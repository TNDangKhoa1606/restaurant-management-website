import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './OrderDetail.css';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('vi-VN', options);
};

const getStatusInfo = (status) => {
    switch (status) {
        case 'new':
            return { text: 'Mới', className: 'status-new' };
        case 'preparing':
            return { text: 'Đang chuẩn bị', className: 'status-pending' };
        case 'completed':
            return { text: 'Hoàn thành', className: 'status-completed' };
        case 'cancelled':
            return { text: 'Đã hủy', className: 'status-cancelled' };
        default:
            return { text: status, className: '' };
    }
};

const getShippingText = (order) => {
    if (!order) return '';

    if (order.order_type === 'delivery') {
        return order.address_line || 'Địa chỉ giao hàng không khả dụng.';
    }

    if (order.order_type === 'pickup') {
        return 'Khách tự đến lấy tại nhà hàng.';
    }

    if (order.order_type === 'dine-in') {
        return 'Dùng bữa tại nhà hàng.';
    }

    return 'Không có thông tin địa chỉ.';
};

const getPaymentText = (order) => {
    if (!order) return '';

    if (order.payment_method === 'cash') {
        return 'Thanh toán khi nhận hàng / tại quầy (COD)';
    }

    return order.payment_method || 'Không có thông tin phương thức thanh toán.';
};

const OrderDetail = () => {
    const { orderId } = useParams();
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token || !isAuthenticated) {
                setError('Vui lòng đăng nhập để xem chi tiết đơn hàng.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`/api/orders/my/${orderId}`, config);
                setOrder(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && orderId) {
            fetchOrder();
        }
    }, [orderId, token, isAuthenticated, authLoading]);

    if (loading) {
        return (
            <div className="order-detail-section">
                <h2 className="content-title">Chi tiết đơn hàng</h2>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-section">
                <h2 className="content-title">Chi tiết đơn hàng</h2>
                <p className="error-text">{error}</p>
                <Link to="/profile/orders" className="btn-back-to-history">&larr; Quay lại Lịch sử đơn hàng</Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-section">
                <h2 className="content-title">Không tìm thấy đơn hàng</h2>
                <p>Mã đơn hàng không hợp lệ hoặc không tồn tại.</p>
                <Link to="/profile/orders" className="btn-back-to-history">&larr; Quay lại Lịch sử đơn hàng</Link>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="order-detail-section">
            <div className="order-detail-header">
                <div>
                    <h2 className="content-title">Chi tiết đơn hàng #{order.order_id}</h2>
                    <p className="content-subtitle">
                        Ngày đặt: {formatDate(order.placed_at)} |
                        {' '}
                        <span className={`order-status ${statusInfo.className}`}>{statusInfo.text}</span>
                    </p>
                </div>
                <Link to="/profile/orders" className="btn-back-to-history">&larr; Quay lại</Link>
            </div>

            <div className="order-detail-grid">
                {/* Thông tin giao hàng / phục vụ */}
                <div className="detail-card">
                    <h3>Hình thức phục vụ & Địa chỉ</h3>
                    <p>{getShippingText(order)}</p>
                </div>

                {/* Phương thức thanh toán */}
                <div className="detail-card">
                    <h3>Phương thức thanh toán</h3>
                    <p>{getPaymentText(order)}</p>
                    <p>Trạng thái thanh toán: {order.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="detail-card">
                <h3>Danh sách sản phẩm</h3>
                <div className="order-items-list">
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                            <div key={index} className="order-item-row">
                                <p>{item.quantity} x {item.dish_name}</p>
                                <span>{formatPrice(item.quantity * item.unit_price)}</span>
                            </div>
                        ))
                    ) : (
                        <p>Không có sản phẩm trong đơn hàng.</p>
                    )}
                </div>
                <div className="order-total-summary">
                    <strong>Tổng cộng:</strong>
                    <strong>{formatPrice(order.total_amount)}</strong>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;