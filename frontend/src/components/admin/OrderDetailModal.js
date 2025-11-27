import React from 'react';

const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const OrderDetailModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <h2>Chi tiết Đơn hàng: #{order.order_id}</h2>
                
                <div className="customer-details-card" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                    <h4>Thông tin khách hàng</h4>
                    <p><strong>Tên:</strong> {order.customer_name || 'Khách vãng lai'}</p>
                    <p><strong>Email:</strong> {order.customer_email || 'N/A'}</p>
                    <p><strong>SĐT:</strong> {order.customer_phone || 'N/A'}</p>
                    {order.order_type === 'delivery' && (
                        <p><strong>Địa chỉ giao hàng:</strong> {order.address_line || 'N/A'}</p>
                    )}
                </div>

                <div className="admin-table-container">
                    <h4>Các món đã đặt</h4>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên món</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items && order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.dish_name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatPrice(item.unit_price)}</td>
                                    <td>{formatPrice(item.quantity * item.unit_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2em' }}>
                    Tổng cộng: {formatPrice(order.total_amount)}
                </div>

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <button onClick={onClose} className="cancel-btn">Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;