import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './Checkout.css';
import PreOrderPopup from '../components/reservation/PreOrderPopup';
import { useNotification } from '../components/common/NotificationContext';
import { useCurrency } from '../components/common/CurrencyContext';

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [customerNote, setCustomerNote] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [orderType, setOrderType] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [qrInfo, setQrInfo] = useState(null);
    const [paymentError, setPaymentError] = useState('');
    const [showPreOrderPopup, setShowPreOrderPopup] = useState(false);

    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
    const { confirm, notify } = useNotification();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const localData = localStorage.getItem('cartItems');
        if (localData) {
            try {
                setCartItems(JSON.parse(localData));
            } catch (e) {
                console.error('Lỗi parse cartItems từ localStorage', e);
            }
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setName(user.name || '');
                setPhone(user.phone || '');
            } catch (error) {
                console.error('Lỗi khi đọc user từ localStorage', error);
            }
        }
    }, []);

    const itemsPrice = cartItems.reduce((a, c) => a + c.qty * c.price, 0);

    const handleConfirmOrder = async () => {
        if (cartItems.length === 0) {
            notify('Giỏ hàng đang trống.', 'warning');
            return;
        }

        if (!name || !phone) {
            notify('Vui lòng điền đầy đủ Họ tên và Số điện thoại.', 'warning');
            return;
        }

        if (orderType === 'delivery' && !address) {
            notify('Vui lòng nhập Địa chỉ giao hàng khi chọn hình thức Giao tận nơi.', 'warning');
            return;
        }

        if ((paymentMethod === 'vietqr' || paymentMethod === 'momo') && (!isAuthenticated || !token)) {
            notify('Vui lòng đăng nhập trước khi sử dụng thanh toán online.', 'warning');
            return;
        }

        setIsSubmitting(true);
        setPaymentError('');
        setPaymentId(null);
        setQrInfo(null);

        try {
            const storedUser = localStorage.getItem('user');
            let userId = null;
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    if (user && user.id) {
                        userId = user.id;
                    }
                } catch (e) {
                    console.error('Lỗi parse user khi tạo order', e);
                }
            }

            const items = cartItems.map((item) => ({
                dishId: item.id,
                quantity: item.qty,
            }));

            const payload = {
                items,
                customer: {
                    name,
                    phone,
                    address: orderType === 'delivery' ? address : '',
                },
                note: customerNote,
                orderType,
                paymentMethod,
                userId,
            };

            const { data: orderRes } = await axios.post('/api/orders', payload);
            const createdOrderId = orderRes && orderRes.order_id;
            setOrderId(createdOrderId || null);
            localStorage.removeItem('cartItems');
            setCartItems([]);

            if (paymentMethod === 'vietqr' && createdOrderId) {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.post(
                        '/api/payments/session',
                        { orderId: createdOrderId, method: 'vietqr' },
                        config
                    );
                    setPaymentId(data.paymentId || null);
                    setQrInfo({
                        imageUrl: data.qrImageUrl,
                        amount: data.amount,
                        description: data.description,
                    });
                    notify('Đơn hàng đã được tạo. Vui lòng quét mã VietQR để thanh toán.', 'success');
                } catch (error) {
                    console.error('Error creating VietQR payment:', error);
                    const errorMsg = error.response?.data?.message ||
                        'Không thể tạo phiên thanh toán VietQR. Đơn hàng của bạn vẫn được ghi nhận với phương thức thanh toán tại quầy.';
                    setPaymentError(errorMsg);
                    notify('Đơn hàng đã được tạo nhưng không thể tạo mã VietQR. Bạn có thể thanh toán khi nhận hàng hoặc tại quầy.', 'error');
                }
                setIsSubmitting(false);
                return;
            }

            if (paymentMethod === 'momo' && createdOrderId) {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.post(
                        '/api/payments/session',
                        { orderId: createdOrderId, method: 'momo' },
                        config
                    );

                    if (data && data.payUrl) {
                        window.location.href = data.payUrl;
                    } else {
                        notify('Không nhận được đường dẫn thanh toán MoMo. Vui lòng chọn phương thức khác.', 'error');
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error creating MoMo payment:', error);
                    notify(
                        error.response?.data?.message ||
                            'Không thể tạo phiên thanh toán MoMo. Vui lòng chọn phương thức khác.', 'error'
                    );
                    navigate('/');
                } finally {
                    setIsSubmitting(false);
                }
                return;
            }

            notify('Đặt món thành công!', 'success');
            navigate('/');
        } catch (error) {
            console.error('Error creating order:', error);
            notify(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoConfirm = async () => {
        if (!paymentId) {
            notify('Không tìm thấy thông tin phiếu thanh toán để xác nhận demo. Vui lòng tạo lại mã VietQR.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/payments/${paymentId}/demo-confirm`, {}, config);
            notify('Thanh toán đơn hàng (demo) đã được xác nhận. Cảm ơn bạn đã đặt món!', 'success');
            navigate('/');
        } catch (error) {
            console.error('Demo confirm payment error:', error);
            const errorMsg = error.response?.data?.message || 'Không thể xác nhận thanh toán demo.';
            setPaymentError(errorMsg);
            notify(errorMsg + ' Vui lòng thử lại hoặc để nhân viên hỗ trợ.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenPreOrderPopup = () => {
        if (!cartItems.length) {
            notify('Giỏ hàng đang trống, hãy chọn món trước khi chỉnh sửa.', 'warning');
            return;
        }
        setShowPreOrderPopup(true);
    };

    const handlePreOrderSubmit = (items) => {
        if (!items || !items.length) {
            setCartItems([]);
            localStorage.removeItem('cartItems');
            setShowPreOrderPopup(false);
            return;
        }

        const newCart = items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
        }));

        setCartItems(newCart);
        try {
            localStorage.setItem('cartItems', JSON.stringify(newCart));
        } catch (e) {
            console.error('Không thể lưu cartItems sau khi chỉnh trong PreOrderPopup', e);
        }
        setShowPreOrderPopup(false);
    };

    const handleCancelOrder = async () => {
        if (!cartItems.length) {
            navigate('/menu');
            return;
        }

        const shouldCancel = await confirm({
            title: 'Hủy đặt món',
            message: 'Bạn có chắc chắn muốn hủy đơn và xóa giỏ hàng?',
            confirmText: 'Hủy đơn',
            cancelText: 'Giữ lại',
            variant: 'danger',
        });

        if (!shouldCancel) {
            return;
        }

        localStorage.removeItem('cartItems');
        setCartItems([]);
        setOrderId(null);
        setPaymentId(null);
        setQrInfo(null);
        setPaymentError('');
        navigate('/menu');
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-form-section">
                    <h1 className="checkout-title">Thông tin thanh toán</h1>

                    <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label htmlFor="name">Họ và Tên</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Nhập họ và tên của bạn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="Nhập số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Hình thức phục vụ</label>
                            <div className="order-type-options">
                                <label>
                                    <input
                                        type="radio"
                                        name="orderType"
                                        value="delivery"
                                        checked={orderType === 'delivery'}
                                        onChange={(e) => setOrderType(e.target.value)}
                                    />
                                    <span>Giao tận nơi</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="orderType"
                                        value="pickup"
                                        checked={orderType === 'pickup'}
                                        onChange={(e) => setOrderType(e.target.value)}
                                    />
                                    <span>Tự đến lấy (Pickup)</span>
                                </label>
                            </div>
                        </div>
                        {orderType === 'delivery' && (
                            <div className="form-group">
                                <label htmlFor="address">Địa chỉ giao hàng</label>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="Nhập địa chỉ nhận hàng"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="customer-note">Ghi chú cho nhà hàng</label>
                            <textarea
                                id="customer-note"
                                rows="4"
                                placeholder="Ví dụ: không cay, thêm hành, giao vào giờ hành chính..."
                                value={customerNote}
                                onChange={(e) => setCustomerNote(e.target.value)}
                            ></textarea>
                        </div>
                    </form>

                    <div className="payment-method-section">
                        <h2>Phương thức thanh toán</h2>
                        <p>Tất cả các giao dịch đều an toàn và được mã hóa.</p>
                        <div className="payment-options">
                            <div
                                className={`payment-option ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('vietqr')}
                            >
                                <img
                                    src="https://img.vietqr.io/image/970415-0000000000-qr_only.png"
                                    alt="VietQR"
                                />
                                <span>Chuyển khoản VietQR</span>
                            </div>
                            <div
                                className={`payment-option ${paymentMethod === 'momo' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('momo')}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/MoMo_Logo.png/220px-MoMo_Logo.png"
                                    alt="MoMo Logo"
                                />
                                <span>MoMo</span>
                            </div>
                            <div
                                className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                <i className="fas fa-money-bill-wave"></i>
                                <span>Thanh toán tại quầy / khi nhận hàng</span>
                            </div>
                        </div>

                        {qrInfo && (
                            <div className="vietqr-info">
                                <h3>Thông tin thanh toán VietQR</h3>
                                {orderId && <p>Đơn hàng #{orderId}</p>}
                                <p>Số tiền: {formatPrice(qrInfo.amount || itemsPrice)}</p>
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

                        {paymentError && <p className="payment-error-text">{paymentError}</p>}
                    </div>
                </div>

                <div className="order-summary-section">
                    <h2>Tóm tắt đơn hàng</h2>
                    <div className="summary-items">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div className="summary-item" key={item.id}>
                                    <span className="summary-item-qty">{item.qty}x</span>
                                    <p className="summary-item-name">{item.name}</p>
                                    <span className="summary-item-price">
                                        {formatPrice(item.price * item.qty)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="summary-empty">
                                <p>Giỏ hàng của bạn đang trống.</p>
                                <Link to="/menu" className="btn-back-to-menu">
                                    Chọn món ngay
                                </Link>
                            </div>
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <>
                            <div className="summary-total">
                                <div className="summary-total-row">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(itemsPrice)}</span>
                                </div>
                                <div className="summary-total-row">
                                    <span>Phí vận chuyển</span>
                                    <span>Miễn phí</span>
                                </div>
                                <div className="summary-total-row grand-total">
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice(itemsPrice)}</span>
                                </div>
                            </div>
                            <div className="summary-actions">
                                <button
                                    type="button"
                                    className="btn-edit-preorder"
                                    onClick={handleOpenPreOrderPopup}
                                    aria-label="Chỉnh danh sách món bằng giao diện đặt món"
                                    title="Chỉnh danh sách món bằng giao diện đặt món"
                                >
                                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                                        <path
                                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.79c.39-.39.39-1.02 0-1.41l-2.54-2.54a1 1 0 0 0-1.41 0L15 4.63l3.75 3.75 1.96-1.92z"
                                            fill="currentColor"
                                        />
                                        <path d="M0 0h24v24H0z" fill="none" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="btn-confirm-order"
                                    onClick={handleConfirmOrder}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt món'}
                                </button>
                            </div>
                            <button
                                type="button"
                                className="btn-cancel-order"
                                onClick={handleCancelOrder}
                                disabled={isSubmitting}
                            >
                                Hủy đặt món
                            </button>
                        </>
                    )}
                </div>

                {showPreOrderPopup && (
                    <PreOrderPopup
                        onClose={() => setShowPreOrderPopup(false)}
                        onSubmit={handlePreOrderSubmit}
                        initialItems={cartItems}
                    />
                )}
            </div>
        </div>
    );
}

export default Checkout;
