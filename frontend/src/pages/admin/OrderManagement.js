import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import { useNotification } from '../../components/common/NotificationContext';
import { useCurrency } from '../../components/common/CurrencyContext';

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

const getTypeInfo = (type) => {
    switch (type) {
        case 'dine-in':
            return 'Tại bàn';
        case 'delivery':
            return 'Giao hàng';
        case 'pickup':
            return 'Lấy tại quán';
        default:
            return type;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('vi-VN', options);
};

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        keyword: '',
        status: '',
        type: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { token, loading: authLoading, user } = useAuth();
    const { confirm, notify } = useNotification();
    const { formatPrice } = useCurrency();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';

    const fetchOrders = useCallback(async () => {
        if (!token || !isAdmin) return;
        setLoading(true);
        try {
            const config = {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    keyword: filters.keyword,
                    status: filters.status,
                    type: filters.type
                }
            };
            const { data } = await axios.get('/api/orders', config);
            setOrders(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    }, [token, filters, isAdmin]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (!authLoading) {
                fetchOrders();
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [authLoading, fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleViewDetails = async (orderId) => {
        if (!isAdmin) {
            notify('Bạn không có quyền xem chi tiết đơn hàng.', 'warning');
            return;
        }
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const { data } = await axios.get(`/api/orders/${orderId}`, config);
            setSelectedOrder(data);
            setIsModalOpen(true);
        } catch (err) {
            notify(`Không thể tải chi tiết đơn hàng: ${err.response?.data?.message || err.message}`, 'error');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!isAdmin) {
            notify('Bạn không có quyền hủy đơn hàng.', 'warning');
            return;
        }

        const confirmed = await confirm({
            title: 'Hủy đơn hàng',
            message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            confirmText: 'Hủy đơn',
            cancelText: 'Không',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put(`/api/orders/${orderId}/status`, { status: 'cancelled' }, config);
            notify('Hủy đơn hàng thành công.', 'success');
            fetchOrders();
        } catch (err) {
            notify(`Lỗi khi hủy đơn hàng: ${err.response?.data?.message || err.message}`, 'error');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const totalItems = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

    const renderTable = () => {
        if (loading) {
            return <p>Đang tải danh sách đơn hàng...</p>;
        }

        if (error) {
            return <div className="alert alert-danger">{error}</div>;
        }

        return null;
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Đơn hàng</h2>
                {isAdmin ? (
                    <div className="filters">
                        <input
                            type="text"
                            name="keyword"
                            placeholder="Tìm theo mã đơn, tên khách..."
                            className="search-input"
                            value={filters.keyword}
                            onChange={handleFilterChange}
                        />
                        <select
                            name="status"
                            className="role-filter"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="new">Mới</option>
                            <option value="preparing">Đang chuẩn bị</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                        <select
                            name="type"
                            className="role-filter"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <option value="">Loại đơn hàng</option>
                            <option value="dine-in">Tại bàn</option>
                            <option value="delivery">Giao hàng</option>
                            <option value="pickup">Lấy tại quán</option>
                        </select>
                    </div>
                ) : (
                    <div className="permission-message">
                        <p>Bạn không có quyền truy cập trang này.</p>
                    </div>
                )}
            </div>

            {isAdmin && renderTable()}

            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
            />
{
    !loading && !error && (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Mã đơn hàng</th>
                        <th>Tên khách hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Loại đơn</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? paginatedOrders.map(order => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{order.customer_name || 'Khách vãng lai'}</td>
                                <td>{formatDate(order.placed_at)}</td>
                                <td>{formatPrice(order.total_amount)}</td>
                                <td>{getTypeInfo(order.order_type)}</td>
                                <td>
                                    <span className={`status-badge ${statusInfo.className}`}>
                                        {statusInfo.text}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button onClick={() => handleViewDetails(order.order_id)} className="action-btn btn-edit">Chi tiết</button>
                                    {order.status === 'preparing' && (
                                        <button onClick={() => handleCancelOrder(order.order_id)} className="action-btn btn-delete">Hủy</button>
                                    )}
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>Không có đơn hàng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {orders.length > 0 && (
                <div className="admin-pagination">
                    <div className="admin-pagination-info">
                        Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} trên {totalItems} kết quả
                    </div>
                    <div className="admin-pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={safeCurrentPage === 1}
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={safeCurrentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={safeCurrentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

<OrderDetailModal
    isOpen={isModalOpen}
    onClose={handleCloseModal}
    order={selectedOrder}
/>
        </div >
    );
}

export default OrderManagement;