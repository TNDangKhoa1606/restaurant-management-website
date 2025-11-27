import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function PaymentResult() {
    const query = useQuery();
    const status = query.get('status');
    const orderId = query.get('orderId');
    const message = query.get('message');

    const isSuccess = status === 'succeeded' || status === 'success';

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-form-section">
                    <h1 className="checkout-title">Kết quả thanh toán</h1>
                    {isSuccess ? (
                        <>
                            <p>Cảm ơn bạn! Thanh toán đã được ghi nhận thành công.</p>
                            {orderId && <p>Mã đơn hàng: #{orderId}</p>}
                        </>
                    ) : (
                        <>
                            <p>Thanh toán không thành công hoặc đã bị hủy.</p>
                            {message && <p>Chi tiết: {message}</p>}
                        </>
                    )}

                    <div style={{ marginTop: '20px' }}>
                        <Link to="/" className="btn-confirm-order">Về trang chủ</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentResult;
