import React from 'react';
import './Cart.css';
import { Link } from 'react-router-dom';
import { useCurrency } from '../common/CurrencyContext';

function Cart({ cartItems, onAdd, onRemove, onClose, isOpen }) {
    const { formatPrice } = useCurrency();

    const itemsPrice = cartItems.reduce((a, c) => a + c.qty * c.price, 0);

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'is-open' : ''}`} onClick={onClose}></div>
            <div className={`cart-panel ${isOpen ? 'is-open' : ''}`}>
                <div className="cart-header">
                    <h2>Giỏ hàng của bạn</h2>
                    <button onClick={onClose} className="cart-close-btn">&times;</button>
                </div>

                <div className="cart-body">
                    {cartItems.length === 0 && <div className="cart-empty">Giỏ hàng đang trống.</div>}
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image || 'https://via.placeholder.com/80x80.png?text=Mon+An'} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-details">
                                <div className="cart-item-name">{item.name}</div>
                                <div className="cart-item-price">{formatPrice(item.price)}</div>
                            </div>
                            <div className="cart-item-actions">
                                <button onClick={() => onRemove(item)} className="btn-qty">-</button>
                                <span className="item-qty">{item.qty}</span>
                                <button onClick={() => onAdd(item)} className="btn-qty">+</button>
                            </div>
                            <div className="cart-item-total">
                                {formatPrice(item.qty * item.price)}
                            </div>
                        </div>
                    ))}
                </div>

                {cartItems.length !== 0 && (
                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Tạm tính</span>
                                <span>{formatPrice(itemsPrice)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(itemsPrice)}</span>
                            </div>
                        </div>
                        <Link to="/reservation" className="btn-checkout" onClick={onClose}>
                            Tiến hành đặt bàn
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

export default Cart;