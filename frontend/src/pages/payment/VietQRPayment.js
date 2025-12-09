import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useCurrency } from '../../components/common/CurrencyContext';
import { useNotification } from '../../components/common/NotificationContext';
import './VietQRPayment.css';

function VietQRPayment() {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const { formatPrice } = useCurrency();
    const { notify } = useNotification();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState('');

    // Redirect về login nếu chưa đăng nhập
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            notify('Vui lòng đăng nhập để xem thông tin thanh toán.', 'warning');
            navigate('/login', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate, notify]);

    useEffect(() => {
        const fetchPaymentData = async () => {
            // Đợi auth load xong
            if (authLoading) {
                return;
            }

            if (!token) {
                setError('Vui lòng đăng nhập để xem thông tin thanh toán.');
                setLoading(false);
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`/api/payments/${paymentId}`, config);
                setPaymentData(data);
                setLoading(false);
            } catch (err) {
                console.error('Fetch payment error:', err);
                setError('Không thể tải thông tin thanh toán.');
                setLoading(false);
            }
        };

        if (paymentId) {
            fetchPaymentData();
        }
    }, [paymentId, token, authLoading]);

    useEffect(() => {
        const handleKeyDown = async (e) => {
            if (e.key === 'Enter' && !processing && paymentData) {
                e.preventDefault();
                await handleConfirmPayment();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [processing, paymentData]);

    const handleConfirmPayment = async () => {
        setProcessing(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`/api/payments/${paymentId}/demo-confirm`, {}, config);
            notify('Thanh toán thành công', 'success');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Confirm payment error:', err);
            setError('Thanh toán thất bại. Vui lòng thử lại.');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="vietqr-payment-page">
                <div className="vietqr-loading">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error || !paymentData) {
        return (
            <div className="vietqr-payment-page">
                <div className="vietqr-error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Có lỗi xảy ra</h2>
                    <p>{error || 'Không tìm thấy thông tin thanh toán.'}</p>
                    <button onClick={() => navigate('/')} className="btn-back-home">
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="vietqr-payment-page">
            <div className="vietqr-payment-container">
                <div className="payment-header">
                    <div className="bank-logo">
                        <img src="https://img.vietqr.io/image/970415-0000000000-qr_only.png" alt="VietQR" />
                    </div>
                    <h1>Thanh toán VietQR</h1>
                    <p className="payment-subtitle">Quét mã QR để hoàn tất thanh toán</p>
                </div>

                <div className="payment-body">
                    <div className="qr-section">
                        <div className="qr-code-wrapper">
                            <img 
                                src={paymentData.qrImageUrl} 
                                alt="Mã QR thanh toán" 
                                className="qr-code-image"
                            />
                        </div>
                        <p className="qr-instruction">Sử dụng ứng dụng ngân hàng để quét mã</p>
                    </div>

                    <div className="payment-details">
                        <div className="detail-row">
                            <span className="detail-label">Số tiền</span>
                            <span className="detail-value amount">{formatPrice(paymentData.amount)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Nội dung</span>
                            <span className="detail-value">{paymentData.description}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Mã giao dịch</span>
                            <span className="detail-value code">#{paymentData.paymentId}</span>
                        </div>
                    </div>

                    {processing && (
                        <div className="processing-overlay">
                            <div className="processing-content">
                                <div className="spinner"></div>
                                <p>Đang xử lý thanh toán...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="payment-footer">
                    <div className="security-badge">
                        <span className="badge-icon">🔒</span>
                        <span>Giao dịch được bảo mật</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VietQRPayment;
