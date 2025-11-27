import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';

// Helper functions (có thể tách ra file riêng nếu muốn)
const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('vi-VN', options);
};

const getOrderStatusInfo = (status) => {
    switch (status) {
        case 'new': return { text: 'Mới', className: 'status-new' };
        case 'preparing': return { text: 'Đang chuẩn bị', className: 'status-pending' };
        case 'completed': return { text: 'Hoàn thành', className: 'status-completed' };
        case 'cancelled': return { text: 'Đã hủy', className: 'status-cancelled' };
        default: return { text: status, className: '' };
    }
};

const getReservationStatusInfo = (status) => {
    switch (status) {
        case 'booked': return { text: 'Đã đặt', className: 'status-confirmed' };
        case 'completed': return { text: 'Hoàn thành', className: 'status-completed' };
        case 'cancelled': return { text: 'Đã hủy', className: 'status-cancelled' };
        default: return { text: status, className: '' };
    }
};


function CustomerHistory() {
    const { id } = useParams();
    const { token, loading: authLoading } = useAuth();
    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState({ orders: [], reservations: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomerHistory = async () => {
            if (!token) {
                setError("Vui lòng đăng nhập để xem dữ liệu.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                
                // Gọi API để lấy thông tin chi tiết và lịch sử (sẽ tạo ở backend sau)
                const detailsPromise = axios.get(`/api/users/${id}/details`, config);
                const historyPromise = axios.get(`/api/users/${id}/history`, config);

                const [detailsRes, historyRes] = await Promise.all([detailsPromise, historyPromise]);

                setCustomer(detailsRes.data);
                setHistory(historyRes.data);

            } catch (err) {
                setError(err.response?.data?.message || `Không thể tải lịch sử cho khách hàng ID: ${id}.`);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchCustomerHistory();
        }
    }, [id, token, authLoading]);

    if (loading) {
        return <div className="admin-list-container">Đang tải lịch sử khách hàng...</div>;
    }

    if (error) {
        return <div className="admin-list-container alert alert-danger">{error}</div>;
    }

    if (!customer) {
        return <div className="admin-list-container">Không tìm thấy thông tin khách hàng.</div>;
    }

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Lịch sử khách hàng: {customer.name}</h2>
                <Link to="/admin/customers" className="btn-admin btn-admin-secondary">Quay lại danh sách</Link>
            </div>

            {/* Thông tin cơ bản */}
            <div className="customer-details-card">
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Số điện thoại:</strong> {customer.phone || 'Chưa cập nhật'}</p>
                <p><strong>Ngày tham gia:</strong> {formatDate(customer.joinDate)}</p>
            </div>

            {/* Lịch sử đơn hàng */}
            <div className="admin-table-container" style={{ marginTop: '30px' }}>
                <h3 className="admin-table-title">Lịch sử đơn hàng ({history.orders.length})</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã Đơn</th>
                            <th>Ngày Đặt</th>
                            <th>Loại</th>
                            <th>Tổng Tiền</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.orders.length > 0 ? history.orders.map(order => {
                            const statusInfo = getOrderStatusInfo(order.status);
                            return (
                                <tr key={`order-${order.order_id}`}>
                                    <td>{order.order_id}</td>
                                    <td>{formatDate(order.placed_at)}</td>
                                    <td>{order.order_type}</td>
                                    <td>{formatPrice(order.total_amount)}</td>
                                    <td><span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span></td>
                                </tr>
                            );
                        }) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có đơn hàng nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Lịch sử đặt bàn */}
            <div className="admin-table-container" style={{ marginTop: '30px' }}>
                <h3 className="admin-table-title">Lịch sử đặt bàn ({history.reservations.length})</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã Đặt Bàn</th>
                            <th>Ngày Đặt</th>
                            <th>Giờ</th>
                            <th>Số Người</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.reservations.length > 0 ? history.reservations.map(res => {
                            const statusInfo = getReservationStatusInfo(res.status);
                            return (
                                <tr key={`res-${res.reservation_id}`}>
                                    <td>{res.reservation_id}</td>
                                    <td>{formatDate(res.res_date).split(',')[0]}</td>
                                    <td>{res.res_time}</td>
                                    <td>{res.number_of_people}</td>
                                    <td><span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span></td>
                                </tr>
                            );
                        }) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có lịch sử đặt bàn nào.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CustomerHistory;