import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './Checkout.css';

function ReservationPayment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();

    const reservationState = location.state && location.state.reservation
        ? location.state.reservation
        : null;

    const [paymentMethod, setPaymentMethod] = useState('vietqr');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [qrInfo, setQrInfo] = useState(null);
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        if (!reservationState) {
            alert('Không có thông tin đặt bàn để thanh toán tiền cọc. Vui lòng đặt bàn lại.');
            navigate('/reservation', { replace: true });
        }
    }, [reservationState, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const depositAmount = reservationState ? reservationState.deposit_amount || 0 : 0;
    const fullAmount = reservationState ? reservationState.full_amount || 0 : 0;

    const handleConfirmDeposit = async () => {
        if (!reservationState || !reservationState.deposit_order_id) {
            alert('Thiếu thông tin đơn hàng đặt cọc. Vui lòng quay lại đặt bàn.');
            return;
        }

        if (paymentMethod === 'vietqr') {
            if (!isAuthenticated || !token) {
                alert('Vui lòng đăng nhập trước khi sử dụng thanh toán VietQR.');
                navigate('/login');
                return;
            }
        }

        setIsSubmitting(true);
        setPaymentError('');

        try {
            if (paymentMethod === 'vietqr') {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const body = {
                    orderId: reservationState.deposit_order_id,
                    method: 'vietqr',
                    amount: depositAmount,
                };

                const { data } = await axios.post('/api/payments/session', body, config);
                setOrderId(reservationState.deposit_order_id);
                setPaymentId(data.paymentId || null);
                setQrInfo({
                    imageUrl: data.qrImageUrl,
                    amount: data.amount,
                    description: data.description,
                });
                alert('Đặt bàn đã được tạo. Vui lòng quét mã VietQR để thanh toán tiền cọc.');
                return;
            }

            alert('Đặt bàn đã được ghi nhận. Vui lòng thanh toán tiền cọc tại quầy trước giờ dùng bữa.');
            navigate('/');
        } catch (error) {
            console.error('Error creating reservation deposit payment:', error);
            setPaymentError(error.response?.data?.message || 'Không thể tạo phiên thanh toán tiền cọc.');
            alert('Không thể tạo phiên thanh toán tiền cọc. Vui lòng thử lại hoặc thanh toán tại quầy.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoConfirm = async () => {
        if (!paymentId) {
            alert('Không tìm thấy thông tin phiếu thanh toán để xác nhận demo. Vui lòng tạo lại QR.');
            return;
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/payments/${paymentId}/demo-confirm`, {}, config);
            alert('Thanh toán tiền cọc (demo) đã được xác nhận. Hẹn gặp bạn tại nhà hàng!');
            navigate('/');
        } catch (error) {
            console.error('Demo confirm payment error:', error);
            setPaymentError(error.response?.data?.message || 'Không thể xác nhận thanh toán demo.');
            alert('Không thể xác nhận thanh toán demo. Vui lòng thử lại hoặc để nhân viên xác nhận giúp bạn.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!reservationState) {
        return null;
    }

    const reservation = reservationState;

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-form-section">
                    <h1 className="checkout-title">Thanh toán tiền cọc đặt bàn</h1>

                    <div className="reservation-info-block">
                        <h2>Thông tin đặt bàn</h2>
                        <p><strong>Tên khách:</strong> {reservation.name}</p>
                        <p><strong>Số điện thoại:</strong> {reservation.phone}</p>
                        <p>
                            <strong>Thời gian:</strong> {reservation.date} lúc {reservation.time}
                        </p>
                        <p>
                            <strong>Bàn:</strong> {reservation.table?.table_name} ({reservation.guests} khách)
                        </p>
                        {reservation.notes && (
                            <p><strong>Ghi chú:</strong> {reservation.notes}</p>
                        )}
                        <p>
                            <strong>Tổng giá trị (bàn{reservation.pre_order ? ' + món pre-order' : ''}):</strong>{' '}
                            {formatPrice(fullAmount)}
                        </p>
                    </div>

                    <div className="payment-method-section">
                        <h2>Phương thức thanh toán</h2>
                        <p>Chọn cách bạn muốn thanh toán tiền cọc.</p>
                        <div className="payment-options">
                            <div
                                className={`payment-option ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('vietqr')}
                            >
                                <img
                                    src="https://img.vietqr.io/image/970415-0000000000-qr_only.png"
                                    alt="VietQR"
                                />
                                <span>Chuyển khoản VietQR (khuyến khích)</span>
                            </div>
                            <div className="payment-option coming-soon">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/MoMo_Logo.png/220px-MoMo_Logo.png" alt="MoMo Logo" />
                                <span>MoMo (Sắp có)</span>
                            </div>
                            <div
                                className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                <i className="fas fa-money-bill-wave"></i>
                                <span>Thanh toán tiền cọc tại quầy</span>
                            </div>
                        </div>

                        {qrInfo && (
                            <div className="vietqr-info">
                                <h3>Thông tin thanh toán VietQR</h3>
                                {orderId && <p>Đơn hàng #{orderId}</p>}
                                <p>Số tiền: {formatPrice(qrInfo.amount || depositAmount)}</p>
                                <p>Nội dung chuyển khoản: {qrInfo.description}</p>
                                <img src={qrInfo.imageUrl} alt="Mã VietQR" className="vietqr-image" />
                                {paymentId && (
                                    <button
                                        type="button"
                                        className="btn-confirm-order demo-confirm-btn"
                                        onClick={handleDemoConfirm}
                                        disabled={isSubmitting}
                                    >
                                        Tôi đã chuyển khoản xong (Demo)
                                    </button>
                                )}
                            </div>
                        )}

                        {paymentError && (
                            <p className="payment-error-text">{paymentError}</p>
                        )}
                    </div>
                </div>

                <div className="order-summary-section">
                    <h2>Tóm tắt tiền cọc</h2>
                    <div className="summary-items">
                        <div className="summary-item">
                            <p className="summary-item-name">
                                Bàn {reservation.table?.table_name} - {reservation.guests} khách
                            </p>
                            <span className="summary-item-price">
                                Tổng (bàn{reservation.pre_order ? ' + món pre-order' : ''}): {formatPrice(fullAmount)}
                            </span>
                        </div>
                    </div>
                    <div className="summary-total">
                        <div className="summary-total-row grand-total">
                            <span>Số tiền cần cọc (50%)</span>
                            <span>{formatPrice(depositAmount)}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn-confirm-order"
                        onClick={handleConfirmDeposit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thanh toán tiền cọc'}
                    </button>

                    <div className="summary-footer-note">
                        <p>
                            Sau khi thanh toán tiền cọc, vui lòng giữ lại minh chứng thanh toán (nếu có) để xuất trình
                            khi đến nhà hàng.
                        </p>
                        <p>
                            Nếu có sai sót trong thông tin đặt bàn, bạn có thể{' '}
                            <Link to="/reservation">quay lại trang đặt bàn</Link> để chỉnh sửa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReservationPayment;
