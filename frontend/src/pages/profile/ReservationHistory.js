import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './OrderHistory.css';

const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return 'N/A';
    try {
        const isoString = `${dateString}T${timeString}`;
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(isoString).toLocaleString('vi-VN', options);
    } catch (error) {
        return `${dateString} ${timeString}`;
    }
};

const getStatusInfo = (status) => {
    switch (status) {
        case 'booked':
            return { text: 'Đã đặt', className: 'status-pending' };
        case 'completed':
            return { text: 'Hoàn thành', className: 'status-completed' };
        case 'cancelled':
            return { text: 'Đã hủy', className: 'status-cancelled' };
        default:
            return { text: status || 'Không rõ', className: '' };
    }
};

const getDepositText = (reservation) => {
    if (!reservation) return 'Chưa cọc';
    if (!reservation.deposit_order_id) return 'Chưa cọc';

    if (reservation.deposit_is_paid) {
        if (reservation.deposit_payment_method === 'cash') {
            return 'Đã cọc tại quầy';
        }
        return 'Đã cọc online';
    }

    return 'Chưa cọc';
};

const ReservationHistory = () => {
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservations = async () => {
            if (!token || !isAuthenticated) {
                setError('Vui lòng đăng nhập để xem lịch sử đặt bàn.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/reservations/my', config);
                setReservations(data || []);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải lịch sử đặt bàn.');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchReservations();
        }
    }, [token, isAuthenticated, authLoading]);

    if (loading) {
        return (
            <div className="order-history-section">
                <h2 className="content-title">Lịch sử đặt bàn</h2>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-history-section">
                <h2 className="content-title">Lịch sử đặt bàn</h2>
                <p className="error-text">{error}</p>
            </div>
        );
    }

    return (
        <div className="order-history-section">
            <h2 className="content-title">Lịch sử đặt bàn</h2>
            <p className="content-subtitle">Theo dõi các lần đặt bàn và trạng thái cọc của bạn tại đây.</p>

            <div className="order-list">
                {reservations.length === 0 && (
                    <p>Bạn chưa có lịch sử đặt bàn nào.</p>
                )}
                {reservations.map((res) => {
                    const statusInfo = getStatusInfo(res.status);
                    const datetime = formatDateTime(res.res_date, res.res_time);
                    const depositText = getDepositText(res);

                    return (
                        <div key={res.reservation_id} className="order-card">
                            <div className="order-card-header">
                                <span className="order-id">Đặt bàn: #{res.reservation_id}</span>
                                <span className={`order-status ${statusInfo.className}`}>{statusInfo.text}</span>
                            </div>
                            <div className="order-card-footer">
                                <span className="order-date">Thời gian: {datetime}</span>
                                <span className="order-total">Bàn: {res.table_name || 'Chưa xác định'} - {res.number_of_people} khách</span>
                                <span className="order-total">Trạng thái cọc: {depositText}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReservationHistory;
