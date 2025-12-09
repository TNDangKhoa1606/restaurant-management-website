import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { getSocket } from '../../socket';
import { useNotification } from '../../components/common/NotificationContext';
import { useCurrency } from '../../components/common/CurrencyContext';
import ReviewModal from '../../components/review/ReviewModal';
import './OrderHistory.css';
import './VietQRModal.css';

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

const getStatusInfo = (reservation) => {
    if (!reservation) {
        return { text: 'Không rõ', className: '' };
    }

    const { status, is_checked_out } = reservation;

    switch (status) {
        case 'booked':
            return { text: 'Đã đặt', className: 'status-pending' };
        case 'completed': {
            if (is_checked_out) {
                return { text: 'Đã checkout', className: 'status-completed' };
            }
            return { text: 'Đang phục vụ', className: 'status-completed' };
        }
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
    const { notify } = useNotification();
    const { formatPrice } = useCurrency();
    const [reviewModalReservation, setReviewModalReservation] = useState(null);

    const [depositPayment, setDepositPayment] = useState({
        reservationId: null,
        depositOrderId: null,
        paymentId: null,
        method: 'vietqr',
        qrInfo: null,
        loading: false,
        error: '',
    });

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!token || !isAuthenticated) {
            setError('Vui lòng đăng nhập để xem lịch sử đặt bàn.');
            setLoading(false);
            return;
        }

        setLoading(true);
        const socket = getSocket(token);

        const handleInit = (data) => {
            console.log('[ReservationHistory] reservations:init received:', data?.length, 'items');
            setReservations(data || []);
            setError('');
            setLoading(false);
        };

        const handleUpdate = (data) => {
            console.log('[ReservationHistory] reservations:update received:', data?.length, 'items');
            setReservations(data || []);
        };

        const handleError = (message) => {
            console.error('[ReservationHistory] reservations:error:', message);
            setError(message || 'Không thể tải lịch sử đặt bàn.');
            setLoading(false);
        };

        const handleConnectError = async (err) => {
            console.error('[ReservationHistory] socket connect_error:', err?.message || err);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/reservations/my', config);
                console.log('[ReservationHistory] HTTP fallback /api/reservations/my, items:', data?.length);
                setReservations(data || []);
                setError('');
            } catch (fetchErr) {
                console.error('[ReservationHistory] HTTP fallback error:', fetchErr);
                setError(fetchErr.response?.data?.message || 'Không thể tải lịch sử đặt bàn.');
            } finally {
                setLoading(false);
            }
        };

        socket.on('reservations:init', handleInit);
        socket.on('reservations:update', handleUpdate);
        socket.on('reservations:error', handleError);
        socket.on('connect_error', handleConnectError);

        // Đợi socket connect xong rồi mới emit subscribe
        if (socket.connected) {
            console.log('[ReservationHistory] Socket already connected, emitting subscribe');
            socket.emit('reservations:subscribe');
        } else {
            console.log('[ReservationHistory] Waiting for socket to connect...');
            socket.once('connect', () => {
                console.log('[ReservationHistory] Socket connected, emitting subscribe');
                socket.emit('reservations:subscribe');
            });
        }

        return () => {
            socket.off('reservations:init', handleInit);
            socket.off('reservations:update', handleUpdate);
            socket.off('reservations:error', handleError);
            socket.off('connect_error', handleConnectError);
        };
    }, [token, isAuthenticated, authLoading]);

    const handleStartDepositPayment = async (reservation) => {
        if (!reservation || !reservation.deposit_order_id) {
            notify('Không tìm thấy thông tin đơn cọc cho đặt bàn này.', 'warning');
            return;
        }

        if (!isAuthenticated || !token) {
            notify('Vui lòng đăng nhập để thanh toán tiền cọc.', 'warning');
            return;
        }

        if (reservation.status !== 'booked') {
            notify('Chỉ có thể thanh toán cọc cho các đặt bàn đang ở trạng thái Đã đặt.', 'warning');
            return;
        }

        setDepositPayment({
            reservationId: reservation.reservation_id,
            depositOrderId: reservation.deposit_order_id,
            paymentId: null,
            method: 'vietqr',
            qrInfo: null,
            loading: true,
            error: '',
        });

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const body = {
                orderId: reservation.deposit_order_id,
                method: 'vietqr',
            };

            const { data } = await axios.post('/api/payments/session', body, config);

            setDepositPayment({
                reservationId: reservation.reservation_id,
                depositOrderId: reservation.deposit_order_id,
                paymentId: data.paymentId || null,
                method: 'vietqr',
                qrInfo: {
                    imageUrl: data.qrImageUrl,
                    amount: data.amount,
                    description: data.description,
                },
                loading: false,
                error: '',
            });

            notify('Đang chuyển đến trang thanh toán...', 'info');
            window.location.href = `/payment/vietqr/${data.paymentId}`;
        } catch (err) {
            console.error('[ReservationHistory] create deposit payment session error:', err);
            const message = err.response?.data?.message || 'Không thể tạo phiên thanh toán tiền cọc.';
            setDepositPayment((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
            notify(message + ' Vui lòng thử lại hoặc thanh toán tại quầy.', 'error');
        }
    };

    const handleDemoConfirmDeposit = async () => {
        if (!depositPayment || !depositPayment.paymentId) {
            notify('Không tìm thấy thông tin phiếu thanh toán để xác nhận demo. Vui lòng tạo lại QR.', 'error');
            return;
        }

        if (!isAuthenticated || !token) {
            notify('Vui lòng đăng nhập để xác nhận thanh toán.', 'warning');
            return;
        }

        setDepositPayment((prev) => ({
            ...prev,
            loading: true,
        }));

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/payments/${depositPayment.paymentId}/demo-confirm`, {}, config);

            notify('Thanh toán tiền cọc (demo) đã được xác nhận. Hẹn gặp bạn tại nhà hàng!', 'success');

            setDepositPayment({
                reservationId: null,
                depositOrderId: null,
                paymentId: null,
                method: 'vietqr',
                qrInfo: null,
                loading: false,
                error: '',
            });
        } catch (err) {
            console.error('[ReservationHistory] demo confirm deposit error:', err);
            const message = err.response?.data?.message || 'Không thể xác nhận thanh toán demo.';
            setDepositPayment((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
            notify(message + ' Vui lòng thử lại hoặc để nhân viên hỗ trợ.', 'error');
        }
    };

    // Đóng popup QR
    const closeQRModal = useCallback(() => {
        setDepositPayment({
            reservationId: null,
            depositOrderId: null,
            paymentId: null,
            method: 'vietqr',
            qrInfo: null,
            loading: false,
            error: '',
        });
    }, []);

    // Lắng nghe phím Enter để xác nhận thanh toán
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && depositPayment.qrInfo && depositPayment.paymentId && !depositPayment.loading) {
                e.preventDefault();
                handleDemoConfirmDeposit();
            }
            if (e.key === 'Escape' && depositPayment.qrInfo) {
                e.preventDefault();
                closeQRModal();
            }
        };

        if (depositPayment.qrInfo) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [depositPayment, closeQRModal]);

    const PAGE_SIZE = 2;
    const totalPages = Math.max(1, Math.ceil(reservations.length / PAGE_SIZE) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const paginatedReservations = reservations.slice(startIndex, startIndex + PAGE_SIZE);

    const handleChangePage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        handleChangePage(safeCurrentPage - 1);
    };

    const handleNextPage = () => {
        handleChangePage(safeCurrentPage + 1);
    };

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
                {paginatedReservations.map((res) => {
                    const statusInfo = getStatusInfo(res);
                    const datetime = formatDateTime(res.res_date, res.res_time);
                    const depositText = getDepositText(res);
                    const preorder = res.preorder_details;
                    const canPayDeposit =
                        res.status === 'booked' &&
                        res.deposit_order_id &&
                        !res.deposit_is_paid;

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
                                {canPayDeposit && (
                                    <button
                                        type="button"
                                        className="btn-view-detail"
                                        onClick={() => handleStartDepositPayment(res)}
                                        disabled={
                                            depositPayment.loading &&
                                            depositPayment.reservationId === res.reservation_id
                                        }
                                    >
                                        {depositPayment.loading && depositPayment.reservationId === res.reservation_id
                                            ? 'Đang tạo mã cọc...'
                                            : 'Thanh toán tiền cọc'}
                                    </button>
                                )}
                                {res.is_checked_out === 1 && (
                                    <button
                                        type="button"
                                        className={`btn-review ${Number(res.has_review) === 1 ? 'btn-review-update' : ''}`}
                                        onClick={() => setReviewModalReservation(res)}
                                    >
                                        {Number(res.has_review) === 1 ? '✏️ Cập nhật đánh giá' : '⭐ Đánh giá dịch vụ'}
                                    </button>
                                )}
                            </div>
                            {Number(res.has_review) === 1 && res.review_rating && (
                                <div className="order-card-review">
                                    <div className="review-header">
                                        <span className="review-label">Đánh giá của bạn:</span>
                                        <span className="review-stars">
                                            {'★'.repeat(res.review_rating)}{'☆'.repeat(5 - res.review_rating)}
                                        </span>
                                        <span className="review-rating-text">({res.review_rating}/5)</span>
                                    </div>
                                    {res.review_comment && (
                                        <p className="review-comment-text">"{res.review_comment}"</p>
                                    )}
                                </div>
                            )}
                            {preorder && preorder.items && preorder.items.length > 0 && (
                                <div className="order-card-preorder">
                                    <div className="order-preorder-title">Đặt món trước:</div>
                                    <ul className="order-preorder-items">
                                        {preorder.items.map((item, index) => (
                                            <li key={`${res.reservation_id}-${index}`} className="order-preorder-item">
                                                <span className="preorder-item-name">{item.name || 'Món đã xóa'}</span>
                                                <span className="preorder-item-qty">x{item.quantity}</span>
                                                <span className="preorder-item-price">{formatPrice(item.unit_price)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="order-preorder-total">
                                        Tổng món pre-order: {formatPrice(preorder.total_amount)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {reservations.length > PAGE_SIZE && (
                <div className="history-pagination">
                    <button
                        type="button"
                        className="history-page-btn"
                        onClick={() => handleChangePage(1)}
                        disabled={safeCurrentPage === 1}
                    >
                        Trang 1
                    </button>
                    <button
                        type="button"
                        className="history-page-btn"
                        onClick={handlePrevPage}
                        disabled={safeCurrentPage === 1}
                    >
                        Trang trước
                    </button>
                    <span className="history-page-info">
                        Trang {safeCurrentPage}/{totalPages}
                    </span>
                    <button
                        type="button"
                        className="history-page-btn"
                        onClick={handleNextPage}
                        disabled={safeCurrentPage === totalPages}
                    >
                        Trang sau
                    </button>
                </div>
            )}

            {reviewModalReservation && (
                <ReviewModal
                    reservation={reviewModalReservation}
                    onClose={() => setReviewModalReservation(null)}
                    onSuccess={(newRating, newComment) => {
                        // Cập nhật đánh giá trong state local
                        setReservations(prev => prev.map(r => 
                            r.reservation_id === reviewModalReservation.reservation_id
                                ? { 
                                    ...r, 
                                    has_review: true,
                                    review_rating: newRating || reviewModalReservation.review_rating,
                                    review_comment: newComment !== undefined ? newComment : reviewModalReservation.review_comment
                                }
                                : r
                        ));
                    }}
                />
            )}

            {/* VietQR Payment Modal */}
            {depositPayment.qrInfo && (
                <div className="vietqr-modal-overlay" onClick={closeQRModal}>
                    <div className="vietqr-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vietqr-modal-header">
                            <h3>💳 Thanh toán tiền cọc</h3>
                            <button type="button" className="vietqr-modal-close" onClick={closeQRModal}>
                                ✕
                            </button>
                        </div>
                        <div className="vietqr-modal-body">
                            <div className="vietqr-qr-wrapper">
                                <img
                                    src={depositPayment.qrInfo.imageUrl}
                                    alt="Mã VietQR tiền cọc"
                                    className="vietqr-qr-image"
                                />
                            </div>
                            <div className="vietqr-info-section">
                                <div className="vietqr-amount">
                                    <span className="vietqr-label">Số tiền:</span>
                                    <span className="vietqr-value">{formatPrice(depositPayment.qrInfo.amount)}</span>
                                </div>
                                <div className="vietqr-description">
                                    <span className="vietqr-label">Nội dung CK:</span>
                                    <span className="vietqr-value">{depositPayment.qrInfo.description}</span>
                                </div>
                            </div>
                            {depositPayment.error && (
                                <p className="vietqr-error">{depositPayment.error}</p>
                            )}
                            <div className="vietqr-instructions">
                                <p>📱 Quét mã QR bằng app ngân hàng để chuyển khoản</p>
                                <p className="vietqr-hint">Nhấn <kbd>Enter</kbd> để xác nhận sau khi chuyển khoản</p>
                                <p className="vietqr-hint">Nhấn <kbd>Esc</kbd> để đóng</p>
                            </div>
                        </div>
                        <div className="vietqr-modal-footer">
                            <button
                                type="button"
                                className="vietqr-confirm-btn"
                                onClick={handleDemoConfirmDeposit}
                                disabled={depositPayment.loading}
                            >
                                {depositPayment.loading ? '⏳ Đang xác nhận...' : '✅ Tôi đã chuyển khoản xong'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationHistory;
