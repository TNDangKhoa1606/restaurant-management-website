import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...');
    const effectRan = useRef(false); // Thêm ref để kiểm soát useEffect

    useEffect(() => {
        // Chỉ chạy logic khi component được mount lần đầu hoặc trong lần chạy thứ 2 của StrictMode
        if (effectRan.current === false) {
            const verifyToken = async () => {
                if (!token) {
                    setStatus('error');
                    setMessage('Token xác thực không tồn tại.');
                    return;
                }

                try {
                    const url = `${process.env.REACT_APP_API_URL}/auth/verify-email/${token}`;
                    const res = await axios.get(url);
                    
                    setStatus('success');
                    setMessage(res.data?.message || 'Xác thực email thành công! Bây giờ bạn có thể đăng nhập.');

                } catch (err) {
                    setStatus('error');
                    setMessage(err?.response?.data?.message || 'Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn.');
                }
            };

            verifyToken();
        }

        // Đánh dấu là effect đã chạy và dọn dẹp khi component unmount
        return () => { effectRan.current = true; };
    }, [token]); // Chỉ phụ thuộc vào token

    return (
        <div className="verify-email-container">
            <div className="verify-email-box">
                {status === 'verifying' && <div className="spinner"></div>}
                <h1 className={`status-title ${status}`}>
                    {status === 'success' ? 'Thành công!' : status === 'error' ? 'Thất bại!' : 'Đang xử lý...'}
                </h1>
                <p className="status-message">{message}</p>
                {status === 'success' && (
                    <Link to="/login" className="btn-login-verify">
                        Đi đến trang đăng nhập
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
