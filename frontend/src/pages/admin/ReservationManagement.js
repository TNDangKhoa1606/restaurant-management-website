import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';

const getStatusInfo = (status) => {
    switch (status) {
        case 'pending':
        case 'booked':
            return { text: 'Chờ xác nhận', className: 'status-pending' };
        case 'confirmed':
            return { text: 'Đã xác nhận', className: 'status-confirmed' };
        case 'cancelled':
            return { text: 'Đã hủy', className: 'status-cancelled' };
        case 'completed':
            return { text: 'Hoàn thành', className: 'status-completed' };
        default:
            return { text: status, className: '' };
    }
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
    const [selectedPreorder, setSelectedPreorder] = useState(null);
    const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        date: new Date().toISOString().substring(0, 10),
        status: '',
    });
    const { token, user } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const role = user?.role?.toLowerCase();
    const canManageReservations = role === 'admin' || role === 'receptionist';

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
        setCurrentPage(1);
    };

    const handleStatusChange = async (reservationId, newStatus) => {
        if (!token || !canManageReservations) {
            if (!canManageReservations) {
                alert('Bạn không có quyền cập nhật trạng thái đặt bàn.');
            }
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/reservations/${reservationId}/status`, { status: newStatus }, config);
            fetchReservations();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đặt bàn.');
        }
    };

    const handleMarkDepositCash = async (reservationId) => {
        if (!token || !canManageReservations) {
            if (!canManageReservations) {
                alert('Bạn không có quyền ghi nhận tiền cọc.');
            }
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/reservations/${reservationId}/mark-deposit-cash`, {}, config);
            fetchReservations();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể ghi nhận tiền cọc tiền mặt.');
        }
    };

    const handleAction = (action, reservationId) => {
        if (action === 'Đặt bàn hộ khách') {
            alert('Chức năng Đặt bàn hộ khách sẽ được bổ sung sau.');
            return;
        }
        alert(`Thực hiện: ${action} cho đặt bàn ID ${reservationId}`);
    };

    const handleOpenPreorderModal = (reservation) => {
        if (!reservation?.preorder_details) return;
        setSelectedPreorder(reservation);
        setIsPreorderModalOpen(true);
    };

    const handleClosePreorderModal = () => {
        setIsPreorderModalOpen(false);
        setSelectedPreorder(null);
    };

    const totalItems = reservationList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedReservations = reservationList.slice(startIndex, startIndex + pageSize);

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
                        <option value="completed">Hoàn thành</option>
                    </select>

                    {canManageReservations && (
                        <button onClick={() => handleAction('Đặt bàn hộ khách')} className="btn-admin btn-admin-primary">
                            Đặt bàn hộ khách
                        </button>
                    )}
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
                                <th>Pre-order</th>
                                <th>Trạng thái cọc</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservationList.length > 0 ? paginatedReservations.map(res => {
                                const statusInfo = getStatusInfo(res.status);
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
                                            {res.has_preorder ? (
                                                <div className="preorder-cell">
                                                    <span className="preorder-badge">Pre-order</span>
                                                    <button
                                                        className="action-btn btn-view"
                                                        onClick={() => handleOpenPreorderModal(res)}
                                                    >
                                                        Xem
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="preorder-empty">—</span>
                                            )}
                                        </td>
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
                                            {canManageReservations && res.deposit_order_id && !res.deposit_is_paid && (
                                                <button
                                                    onClick={() => handleMarkDepositCash(res.reservation_id)}
                                                    className="action-btn btn-checkin"
                                                >
                                                    Đã nhận cọc (tiền mặt)
                                                </button>
                                            )}
                                            {canManageReservations && res.status === 'booked' && (
                                                <>
                                                    <button onClick={() => handleStatusChange(res.reservation_id, 'completed')} className="action-btn btn-checkin">Hoàn thành</button>
                                                    <button onClick={() => handleStatusChange(res.reservation_id, 'cancelled')} className="action-btn btn-delete">Hủy</button>
                                                </>
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
                    {reservationList.length > 0 && (
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
            )}

            {isPreorderModalOpen && selectedPreorder && (
                <div className="modal-overlay">
                    <div className="modal-content preorder-modal">
                        <h3>Pre-order bàn {selectedPreorder.table_name}</h3>
                        <p><strong>Khách:</strong> {selectedPreorder.guest_name} ({selectedPreorder.guest_phone || 'N/A'})</p>
                        <p>
                            <strong>Thời gian:</strong> {selectedPreorder.res_date} {selectedPreorder.res_time}
                        </p>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Món</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPreorder.preorder_details?.items?.map((item, idx) => (
                                        <tr key={`${item.name}-${idx}`}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unit_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="preorder-total">
                            Tổng cộng: {formatCurrency(selectedPreorder.preorder_details?.total_amount || 0)}
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleClosePreorderModal} className="cancel-btn">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReservationManagement;