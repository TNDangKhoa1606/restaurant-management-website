import React, { useEffect, useState } from 'react';
import { Link, useInRouterContext } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './OrderHistory.css'; 
import { useCurrency } from '../../components/common/CurrencyContext';

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

const buildItemsSummaryText = (order) => {
    if (!order) return 'Không có thông tin món ăn.';

    if (order.is_deposit_order) {
        return 'Đơn cọc đặt bàn (không có món ăn chi tiết).';
    }

    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
        return 'Không có thông tin món ăn.';
    }

    const maxPreview = 2;
    const previewItems = items.slice(0, maxPreview).map((item) => {
        const quantity = item.quantity || 0;
        const name = item.dish_name || '';
        return `${quantity} x ${name}`;
    });

    const remaining = items.length - previewItems.length;
    if (remaining > 0) {
        return `${previewItems.join(', ')}, +${remaining} món khác`;
    }

    return previewItems.join(', ');
};

const OrderHistory = () => {
    const { formatPrice } = useCurrency();
    const inRouter = useInRouterContext();
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token || !isAuthenticated) {
                setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/orders/my', config);
                setOrders(data || []);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchOrders();
        }
    }, [token, isAuthenticated, authLoading]);

    if (loading) {
        return (
            <div className="order-history-section">
                <h2 className="content-title">Lịch sử đơn hàng</h2>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-history-section">
                <h2 className="content-title">Lịch sử đơn hàng</h2>
                <p className="error-text">{error}</p>
            </div>
        );
    }

    return (
        <div className="order-history-section">
            <h2 className="content-title">Lịch sử đơn hàng</h2>
            <p className="content-subtitle">Theo dõi các đơn hàng đã đặt của bạn tại đây.</p>

            <div className="order-list">
                {orders.length === 0 && (
                    <p>Bạn chưa có đơn hàng nào.</p>
                )}
                {orders.map(order => {
                    const statusInfo = getStatusInfo(order.status);
                    const id = order.order_id;
                    const total = order.total_amount;
                    const detailLink = `/profile/orders/${id}`;
                    const itemsSummaryText = buildItemsSummaryText(order);

                    return (
                        <div key={id} className="order-card">
                            <div className="order-card-header">
                                <span className="order-id">Đơn hàng: {id}</span>
                                <span className={`order-status ${statusInfo.className}`}>{statusInfo.text}</span>
                            </div>
                            <div className="order-card-body">
                                <div className="order-items-summary">
                                    <span className="order-items-summary-label">Món:</span>
                                    <span className="order-items-summary-text">{itemsSummaryText}</span>
                                </div>
                            </div>
                            <div className="order-card-footer">
                                <span className="order-date">Ngày đặt: {formatDate(order.placed_at)}</span>
                                <span className="order-total">Tổng tiền: {formatPrice(total)}</span>
                                {inRouter ? (
                                    <Link to={detailLink} className="btn-view-detail">Xem chi tiết</Link>
                                ) : (
                                    <a href={detailLink} className="btn-view-detail">Xem chi tiết</a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderHistory;
