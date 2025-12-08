import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNotification } from '../components/common/NotificationContext';
import { useCurrency } from '../components/common/CurrencyContext';

import './Reservation.css';
import './Checkout.css';
import reservationImg from '../assets/images/reservation-img.jpg';

import ReservationConfirmationPopup from '../components/reservation/ReservationConfirmationPopup';
import PreOrderPopup from '../components/reservation/PreOrderPopup';
import ReservationTableMap from '../components/reservation/ReservationTableMap';

const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

function Reservation() {
    const initialFormData = {
        date: '',
        time: '',
        guests: '1',
        name: '',
        phone: '',
        notes: ''
    };

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState(initialFormData);
    const [showPopup, setShowPopup] = useState(false);
    const [showPreOrderPopup, setShowPreOrderPopup] = useState(false);
    const [showTableMapModal, setShowTableMapModal] = useState(false);
    const [reservationType, setReservationType] = useState('simple');
    const [userId, setUserId] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [todayDate] = useState(getTodayDateString());
    const navigate = useNavigate();
    const { token, isAuthenticated, user } = useAuth();
    const { notify } = useNotification();
    const [reservationForPayment, setReservationForPayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('vietqr');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [paymentId, setPaymentId] = useState(null);
    const [qrInfo, setQrInfo] = useState(null);
    const [paymentError, setPaymentError] = useState('');
    const [holdSecondsLeft, setHoldSecondsLeft] = useState(null);
    const [isReservationHoldExpired, setIsReservationHoldExpired] = useState(false);
    const [showContinuePaymentButton, setShowContinuePaymentButton] = useState(false);
    const depositAmount = reservationForPayment ? reservationForPayment.deposit_amount || 0 : 0;
    const fullAmount = reservationForPayment ? reservationForPayment.full_amount || 0 : 0;

    const timeSlots = TIME_SLOTS;
    const { formatPrice } = useCurrency();

    const formatCountdown = (totalSeconds) => {
        if (typeof totalSeconds !== 'number' || totalSeconds < 0) return '0:00';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const getFilteredTimeSlots = () => {
        if (!formData.date) return timeSlots;
        const today = new Date();
        const currentMinutes = today.getHours() * 60 + today.getMinutes();
        if (formData.date === todayDate) {
            return timeSlots.filter((slot) => {
                const [hour, minute] = slot.split(':').map(Number);
                return hour * 60 + minute >= currentMinutes;
            });
        }
        return timeSlots;
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) return;
        try {
            const user = JSON.parse(storedUser);
            setFormData((prev) => ({ ...prev, name: user.name || '', phone: user.phone || '' }));
            if (user?.id) setUserId(user.id);
        } catch (e) {
            console.error('Lỗi khi đọc thông tin người dùng từ localStorage', e);
        }
    }, []);

    useEffect(() => {
        if (user && user.id) {
            setUserId(user.id);
        }
    }, [user]);

    useEffect(() => {
        const storedReservation = localStorage.getItem('reservationForPayment');
        if (!storedReservation) return;
        try {
            const parsed = JSON.parse(storedReservation);
            if (parsed?.deposit_order_id) setReservationForPayment(parsed);
        } catch (e) {
            console.error('Lỗi đọc reservationForPayment từ localStorage', e);
        }
    }, []);

    useEffect(() => {
        if (reservationForPayment?.deposit_order_id) {
            localStorage.setItem('reservationForPayment', JSON.stringify(reservationForPayment));
        } else {
            localStorage.removeItem('reservationForPayment');
        }
    }, [reservationForPayment]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, date: prev.date || todayDate }));
    }, [todayDate]);

    useEffect(() => {
        if (!formData.date) return;
        const today = new Date();
        const currentMinutes = today.getHours() * 60 + today.getMinutes();
        if (formData.date === todayDate) {
            const hasFutureSlot = timeSlots.some((slot) => {
                const [hour, minute] = slot.split(':').map(Number);
                return hour * 60 + minute >= currentMinutes;
            });
            if (!hasFutureSlot) {
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const year = tomorrow.getFullYear();
                const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                const day = String(tomorrow.getDate()).padStart(2, '0');
                const tomorrowStr = `${year}-${month}-${day}`;
                setFormData((prev) => ({ ...prev, date: tomorrowStr, time: '' }));
            }
        }
    }, [formData.date, timeSlots, todayDate]);

    useEffect(() => {
        if (!reservationForPayment?.reservation_id) {
            setHoldSecondsLeft(null);
            setIsReservationHoldExpired(false);
            return;
        }
        setHoldSecondsLeft(5 * 60);
        setIsReservationHoldExpired(false);
        const intervalId = setInterval(() => {
            setHoldSecondsLeft((prev) => {
                if (prev === null) return prev;
                if (prev <= 1) {
                    clearInterval(intervalId);
                    setIsReservationHoldExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [reservationForPayment]);

    useEffect(() => {
        if (isReservationHoldExpired && reservationForPayment) {
            notify('Thời gian giữ bàn (5 phút) đã hết. Bàn đã được trả lại, vui lòng đặt bàn lại nếu bạn vẫn muốn sử dụng dịch vụ.', 'warning');
            setShowContinuePaymentButton(false);
        }
    }, [isReservationHoldExpired, reservationForPayment, notify]);

    const handleClosePopup = () => {
        setShowPopup(false);
        setFormData(initialFormData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (['date', 'time', 'guests'].includes(name)) setSelectedTable(null);
    };

    const handleSelectTable = (table) => {
        setSelectedTable((prev) => (prev && prev.table_id === table.table_id ? null : table));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTable?.table_id) {
            notify('Vui lòng chọn bàn trên sơ đồ trước khi xác nhận.', 'warning');
            return;
        }
        setIsSubmitting(true);
        if (reservationType === 'simple') {
            try {
                const { data } = await axios.post('/api/reservations/deposit', {
                    date: formData.date,
                    time: formData.time,
                    guests: formData.guests,
                    name: formData.name,
                    phone: formData.phone,
                    notes: formData.notes,
                    userId,
                    tableId: selectedTable.table_id,
                    reservationType: 'simple',
                });
                setSelectedTable(null);
                setReservationForPayment(data);
                setShowContinuePaymentButton(true);
                setShowPaymentModal(true);
                setPaymentMethod('vietqr');
                setPaymentError('');
                setQrInfo(null);
                setPaymentId(null);
            } catch (error) {
                console.error('Error submitting reservation:', error);
                notify(error.response?.data?.message || 'Đặt bàn thất bại. Vui lòng thử lại.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setShowPreOrderPopup(true);
            setIsSubmitting(false);
        }
    };

    const handlePreOrderSubmit = async (items) => {
        if (!selectedTable?.table_id) {
            notify('Vui lòng chọn bàn trên sơ đồ trước khi xác nhận.', 'warning');
            return;
        }
        setIsSubmitting(true);
        try {
            const preOrderItems = items.map((item) => ({
                dishId: item.id,
                quantity: item.qty,
            }));

            const { data } = await axios.post('/api/reservations/deposit', {
                date: formData.date,
                time: formData.time,
                guests: formData.guests,
                name: formData.name,
                phone: formData.phone,
                notes: formData.notes,
                userId,
                tableId: selectedTable.table_id,
                reservationType: 'pre-order',
                items: preOrderItems,
            });
            setShowPreOrderPopup(false);
            setSelectedTable(null);
            setReservationForPayment(data);
            setShowContinuePaymentButton(true);
            setShowPaymentModal(true);
            setPaymentMethod('vietqr');
            setPaymentError('');
            setQrInfo(null);
            setPaymentId(null);
        } catch (error) {
            console.error('Error submitting reservation with pre-order:', error);
            notify(error.response?.data?.message || 'Đặt bàn & gọi món trước thất bại. Vui lòng thử lại.', 'error');
            return;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDeposit = async () => {
        if (!reservationForPayment?.deposit_order_id) {
            notify('Thiếu thông tin đơn hàng đặt cọc. Vui lòng đặt bàn lại.', 'error');
            return;
        }
        if (isReservationHoldExpired) {
            notify('Thời gian giữ bàn đã hết. Vui lòng đặt bàn lại để thanh toán tiền cọc.', 'warning');
            return;
        }
        if (paymentMethod === 'vietqr') {
            if (!isAuthenticated || !token) {
                notify('Vui lòng đăng nhập trước khi sử dụng thanh toán VietQR.', 'warning');
                navigate('/login');
                return;
            }
        }
        setIsSubmittingPayment(true);
        setPaymentError('');
        try {
            if (paymentMethod === 'vietqr') {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const body = {
                    orderId: reservationForPayment.deposit_order_id,
                    method: 'vietqr',
                    amount: depositAmount,
                };
                const { data } = await axios.post('/api/payments/session', body, config);
                setPaymentId(data.paymentId || null);
                setQrInfo({
                    imageUrl: data.qrImageUrl,
                    amount: data.amount,
                    description: data.description,
                });
                notify('Đặt bàn đã được tạo. Vui lòng quét mã VietQR để thanh toán tiền cọc.', 'success');
                return;
            }
            notify('Đặt bàn đã được ghi nhận. Vui lòng thanh toán tiền cọc tại quầy trước giờ dùng bữa.', 'success');
            navigate('/');
        } catch (error) {
            console.error('Error creating reservation deposit payment:', error);
            const errorMsg = error.response?.data?.message || 'Không thể tạo phiên thanh toán tiền cọc.';
            setPaymentError(errorMsg);
            notify(errorMsg + ' Vui lòng thử lại hoặc thanh toán tại quầy.', 'error');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const handleDemoConfirm = async () => {
        if (isReservationHoldExpired) {
            notify('Thời gian giữ bàn đã hết. Vui lòng đặt bàn lại để tạo lại mã thanh toán.', 'warning');
            return;
        }
        if (!paymentId) {
            notify('Không tìm thấy thông tin phiếu thanh toán để xác nhận demo. Vui lòng tạo lại QR.', 'error');
            return;
        }
        setIsSubmittingPayment(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/payments/${paymentId}/demo-confirm`, {}, config);
            notify('Thanh toán tiền cọc (demo) đã được xác nhận. Hẹn gặp bạn tại nhà hàng!', 'success');
            navigate('/');
        } catch (error) {
            console.error('Demo confirm payment error:', error);
            const errorMsg = error.response?.data?.message || 'Không thể xác nhận thanh toán demo.';
            setPaymentError(errorMsg);
            notify(errorMsg + ' Vui lòng thử lại hoặc để nhân viên xác nhận giúp bạn.', 'error');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    return (
        <div className="reservation-page">
            <div className="reservation-container">
                <div className="reservation-form-wrapper">
                    <div className="reservation-icon-wrapper">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <p className="reservation-subtitle mb-8">
                        Để đảm bảo bạn có một vị trí, vui lòng điền thông tin và đặt bàn trước.
                    </p>

                    <div className="booking-suggestions">
                        <h4 className="suggestion-title">Gợi ý đặt bàn:</h4>
                        <ul>
                            <li>Đi 1 người: đặt bàn đơn</li>
                            <li>Đi 2 người: đặt bàn đôi</li>
                            <li>Đi nhóm 4-6 người: đặt bàn 6 người.</li>
                            <li>Đi nhóm 6-12 người: đặt bàn dài</li>
                            <li>Đi nhóm &gt;12 người: gọi trực tiếp Hotline: <strong>0972.939.830</strong></li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="reservation-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">Ngày</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    min={todayDate}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="guests">Số lượng khách</label>
                                <input
                                    type="number"
                                    id="guests"
                                    name="guests"
                                    min="1"
                                    max="12"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Chọn giờ</label>
                            <div className="time-slots-grid">
                                {getFilteredTimeSlots().map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        className={`time-slot-btn ${formData.time === slot ? 'active' : ''}`}
                                        onClick={() => handleChange({ target: { name: 'time', value: slot } })}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Sơ đồ bàn</label>
                            <button
                                type="button"
                                className="table-map-open-btn"
                                onClick={() => setShowTableMapModal(true)}
                            >
                                Mở sơ đồ bàn
                            </button>
                            <div className="selected-table-summary">
                                {selectedTable ? (
                                    <span>Đã chọn bàn: {selectedTable.table_name}</span>
                                ) : (
                                    <span>Chưa chọn bàn. Vui lòng mở sơ đồ để chọn bàn phù hợp.</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Loại hình đặt bàn</label>
                            <div className="reservation-type-toggle">
                                <button
                                    type="button"
                                    className={reservationType === 'simple' ? 'active' : ''}
                                    onClick={() => setReservationType('simple')}
                                >
                                    Chỉ đặt bàn
                                </button>
                                <button
                                    type="button"
                                    className={reservationType === 'pre-order' ? 'active' : ''}
                                    onClick={() => setReservationType('pre-order')}
                                >
                                    Đặt bàn & Gọi món trước
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Họ và Tên</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Nhập họ và tên của bạn"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="Nhập số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Ghi chú</label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows="4"
                                placeholder="Yêu cầu đặc biệt (ví dụ: ghế trẻ em, gần cửa sổ...)"
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="reservation-right-column">
                    <div className="reservation-image-wrapper">
                        <img src={reservationImg} alt="Không gian nhà hàng sang trọng" />
                    </div>
                    <div className="reservation-actions">
                        <button
                            type="button"
                            className="reservation-action-button bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            Xác nhận đặt bàn
                        </button>

                        {reservationForPayment && showContinuePaymentButton && !isReservationHoldExpired && !showPaymentModal && (
                            <button
                                type="button"
                                className="reservation-action-button bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                                onClick={() => setShowPaymentModal(true)}
                            >
                                Tiếp tục thanh toán tiền cọc
                            </button>
                        )}
                    </div>
                </div>

                {reservationForPayment && showPaymentModal && (
                    <div className="payment-modal-overlay">
                        <div className="payment-modal">
                            <div className="payment-modal-header">
                                <h3>Thanh toán tiền cọc đặt bàn</h3>
                                <button
                                    type="button"
                                    className="payment-modal-close-btn"
                                    onClick={() => setShowPaymentModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                            <div className="payment-modal-body">
                                <div className="checkout-container">
                                    <div className="checkout-form-section">
                                        <h1 className="checkout-title">Thanh toán tiền cọc đặt bàn</h1>

                                        <div className="reservation-info-block">
                                            <h2>Thông tin đặt bàn</h2>
                                            <p>
                                                <strong>Tên khách:</strong> {reservationForPayment.name}
                                            </p>
                                            <p>
                                                <strong>Số điện thoại:</strong> {reservationForPayment.phone}
                                            </p>
                                            <p>
                                                <strong>Thời gian:</strong> {reservationForPayment.date} lúc {reservationForPayment.time}
                                            </p>
                                            <p>
                                                <strong>Bàn:</strong> {reservationForPayment.table?.table_name} ({reservationForPayment.guests} khách)
                                            </p>
                                            {reservationForPayment.notes && (
                                                <p>
                                                    <strong>Ghi chú:</strong> {reservationForPayment.notes}
                                                </p>
                                            )}
                                            <p>
                                                <strong>
                                                    Tổng giá trị (bàn{reservationForPayment.pre_order ? ' + món pre-order' : ''}):
                                                </strong>{' '}
                                                {formatPrice(fullAmount)}
                                            </p>
                                            {holdSecondsLeft !== null && !isReservationHoldExpired && (
                                                <p className="reservation-hold-timer">
                                                    Thời gian giữ bàn còn lại: {formatCountdown(holdSecondsLeft)}
                                                </p>
                                            )}
                                            {isReservationHoldExpired && (
                                                <p className="reservation-hold-expired-text">
                                                    Thời gian giữ bàn đã hết. Bàn đã được trả lại. Vui lòng đặt bàn lại nếu bạn vẫn muốn sử dụng dịch vụ.
                                                </p>
                                            )}
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
                                                    <img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/MoMo_Logo.png/220px-MoMo_Logo.png"
                                                        alt="MoMo Logo"
                                                    />
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
                                                    {reservationForPayment.deposit_order_id && (
                                                        <p>Đơn hàng #{reservationForPayment.deposit_order_id}</p>
                                                    )}
                                                    <p>Số tiền: {formatPrice(qrInfo.amount || depositAmount)}</p>
                                                    <p>Nội dung chuyển khoản: {qrInfo.description}</p>
                                                    <img src={qrInfo.imageUrl} alt="Mã VietQR" className="vietqr-image" />
                                                    {paymentId && (
                                                        <button
                                                            type="button"
                                                            className="btn-confirm-order demo-confirm-btn"
                                                            onClick={handleDemoConfirm}
                                                            disabled={isSubmittingPayment || isReservationHoldExpired}
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
                                                    Bàn {reservationForPayment.table?.table_name} - {reservationForPayment.guests} khách
                                                </p>
                                                <span className="summary-item-price">
                                                    Tổng (bàn{reservationForPayment.pre_order ? ' + món pre-order' : ''}):{' '}
                                                    {formatPrice(fullAmount)}
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
                                            disabled={isSubmittingPayment || isReservationHoldExpired}
                                        >
                                            {isSubmittingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán tiền cọc'}
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
                        </div>
                    </div>
                )}

                {showPopup && <ReservationConfirmationPopup onClose={handleClosePopup} />}

                {showPreOrderPopup && (
                    <PreOrderPopup
                        onClose={() => setShowPreOrderPopup(false)}
                        onSubmit={handlePreOrderSubmit}
                    />
                )}

                {showTableMapModal && (
                    <div className="table-map-modal-overlay">
                        <div className="table-map-modal">
                            <div className="table-map-modal-header">
                                <h3>Chọn bàn trên sơ đồ</h3>
                                <button
                                    type="button"
                                    className="table-map-close-btn"
                                    onClick={() => setShowTableMapModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                            <div className="table-map-modal-body">
                                <ReservationTableMap
                                    date={formData.date}
                                    time={formData.time}
                                    guests={formData.guests}
                                    selectedTableId={selectedTable?.table_id || null}
                                    onSelectTable={handleSelectTable}
                                    onClearSelection={() => setSelectedTable(null)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reservation;