import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { useNotification } from '../../../components/common/NotificationContext';

const getStatusInfo = (reservation) => {
    if (!reservation) {
        return { text: 'Không rõ', className: '' };
    }

    const { status, is_checked_out } = reservation;

    switch (status) {
        case 'pending':
        case 'booked':
            return { text: 'Chờ xác nhận', className: 'status-pending' };
        case 'confirmed':
            return { text: 'Đã xác nhận', className: 'status-confirmed' };
        case 'cancelled':
            return { text: 'Đã hủy', className: 'status-cancelled' };
        case 'completed': {
            if (is_checked_out) {
                return { text: 'Đã checkout', className: 'status-completed' };
            }
            // completed bây giờ nghĩa là khách đang ngồi ăn
            return { text: 'Đang phục vụ', className: 'status-completed' };
        }
        default:
            return { text: status, className: '' };
    }
};

const getDepositStatusInfo = (reservation) => {
    if (!reservation || !reservation.deposit_order_id) {
        return { text: 'Chưa cọc', className: 'status-pending' };
    }

    if (reservation.deposit_is_paid) {
        if (reservation.deposit_payment_method === 'cash') {
            return { text: 'Đã cọc tại quầy', className: 'status-confirmed' };
        }
        return { text: 'Đã cọc online', className: 'status-confirmed' };
    }

    return { text: 'Chưa cọc', className: 'status-pending' };
};

function ReservationManagement() {
    const [reservationList, setReservationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        date: new Date().toLocaleDateString('sv-SE'),
        status: '',
    });
    const { token } = useAuth();
    const { notify } = useNotification();

    const fetchReservations = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    date: filters.date,
                    status: filters.status || undefined,
                },
            };
            const { data } = await axios.get('/api/reservations', config);
            setReservationList(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách đặt bàn.');
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (reservationId, newStatus) => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/reservations/${reservationId}/status`, { status: newStatus }, config);
            fetchReservations();
        } catch (err) {
            notify(err.response?.data?.message || 'Không thể cập nhật trạng thái đặt bàn.', 'error');
        }
    };

    const handleMarkDepositCash = async (reservationId) => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/reservations/${reservationId}/mark-deposit-cash`, {}, config);
            fetchReservations();
        } catch (err) {
            notify(err.response?.data?.message || 'Không thể ghi nhận tiền cọc tiền mặt.', 'error');
        }
    };

    const handleCheckout = async (reservationId) => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/reservations/${reservationId}/checkout`, {}, config);
            notify('Checkout thành công. Bàn đã được giải phóng.', 'success');
            fetchReservations();
        } catch (err) {
            notify(err.response?.data?.message || 'Không thể checkout.', 'error');
        }
    };

    const handleAction = (action, reservationId) => {
        if (action === 'Đặt bàn hộ khách') {
            notify('Chức năng Đặt bàn hộ khách sẽ được bổ sung sau.', 'info');
            return;
        }
        notify(`Thực hiện: ${action} cho đặt bàn ID ${reservationId}`, 'info');
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Đặt bàn</h2>
                <div className="filters">
                    <input
                        type="date"
                        className="date-filter"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                    />
                    <select
                        className="role-filter"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="booked">Chờ xác nhận</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="completed">Đang phục vụ</option>
                    </select>

                    <button onClick={() => handleAction('Đặt bàn hộ khách')} className="btn-admin btn-admin-primary">
                        Đặt bàn hộ khách
                    </button>
                </div>
            </div>

            {loading && <p>Đang tải danh sách đặt bàn...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên khách</th>
                                <th>SĐT</th>
                                <th>Ngày</th>
                                <th>Giờ</th>
                                <th>Số người</th>
                                <th>Bàn</th>
                                <th>Trạng thái cọc</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservationList.length > 0 ? reservationList.map(res => {
                                const statusInfo = getStatusInfo(res);
                                const depositInfo = getDepositStatusInfo(res);
                                return (
                                    <tr key={res.reservation_id}>
                                        <td>{res.guest_name}</td>
                                        <td>{res.guest_phone}</td>
                                        <td>{res.res_date}</td>
                                        <td>{res.res_time}</td>
                                        <td>{res.number_of_people}</td>
                                        <td>{res.table_name}</td>
                                        <td>
                                            <span className={`status-badge ${depositInfo.className}`}>
                                                {depositInfo.text}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${statusInfo.className}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {res.deposit_order_id && !res.deposit_is_paid && (
                                                <button
                                                    onClick={() => handleMarkDepositCash(res.reservation_id)}
                                                    className="action-btn btn-checkin"
                                                >
                                                    Đã nhận cọc (tiền mặt)
                                                </button>
                                            )}
                                            {res.status === 'booked' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(res.reservation_id, 'completed')}
                                                        className="action-btn btn-checkin"
                                                    >
                                                        Khách đến
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(res.reservation_id, 'cancelled')}
                                                        className="action-btn btn-delete"
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            )}
                                            {res.status === 'completed' && !res.is_checked_out && (
                                                <button
                                                    onClick={() => handleCheckout(res.reservation_id)}
                                                    className="action-btn btn-checkin"
                                                >
                                                    Checkout (Giải phóng bàn)
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center' }}>Không có đặt bàn nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReservationManagement;