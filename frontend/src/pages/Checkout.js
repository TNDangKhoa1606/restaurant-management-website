import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Checkout.css';

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [customerNote, setCustomerNote] = useState('');

    useEffect(() => {
        // Tải giỏ hàng từ localStorage khi component được render
        const localData = localStorage.getItem('cartItems');
        if (localData) {
            setCartItems(JSON.parse(localData));
        }
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const itemsPrice = cartItems.reduce((a, c) => a + c.qty * c.price, 0);

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Cột trái: Form thông tin */}
                <div className="checkout-form-section">
                    <h1 className="checkout-title">Thông tin thanh toán</h1>

                    <form className="checkout-form">
                        <div className="form-group">
                            <label htmlFor="name">Họ và Tên</label>
                            <input type="text" id="name" placeholder="Nhập họ và tên của bạn" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input type="tel" id="phone" placeholder="Nhập số điện thoại" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ giao hàng</label>
                            <input type="text" id="address" placeholder="Nhập địa chỉ nhận hàng" required />
                        </div>
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

                    {/* Phần phương thức thanh toán */}
                    <div className="payment-method-section">
                        <h2>Phương thức thanh toán</h2>
                        <p>Tất cả các giao dịch đều an toàn và được mã hóa.</p>
                        <div className="payment-options">
                            <div className="payment-option coming-soon">
                                <img src="https://vnpay.vn/s1/statics.vnpay.vn/vnpay.vn/images/logo-vnpay-new.png" alt="VNPay Logo" />
                                <span>VNPay (Sắp có)</span>
                            </div>
                            <div className="payment-option coming-soon">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/MoMo_Logo.png/220px-MoMo_Logo.png" alt="MoMo Logo" />
                                <span>MoMo (Sắp có)</span>
                            </div>
                            <div className="payment-option active">
                                <i className="fas fa-money-bill-wave"></i>
                                <span>Thanh toán tại quầy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="order-summary-section">
                    <h2>Tóm tắt đơn hàng</h2>
                    <div className="summary-items">
                        {cartItems.length > 0 ? cartItems.map(item => (
                            <div className="summary-item" key={item.id}>
                                <span className="summary-item-qty">{item.qty}x</span>
                                <p className="summary-item-name">{item.name}</p>
                                <span className="summary-item-price">
                                    {formatPrice(item.price * item.qty)}
                                </span>
                            </div>
                        )) : (
                            <div className="summary-empty">
                                <p>Giỏ hàng của bạn đang trống.</p>
                                <Link to="/menu" className="btn-back-to-menu">Chọn món ngay</Link>
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
                            <button className="btn-confirm-order">Xác nhận đặt món</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Checkout;