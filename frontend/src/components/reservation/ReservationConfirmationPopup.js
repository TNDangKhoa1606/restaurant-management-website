import React from 'react';
import { Link } from 'react-router-dom';
import './ReservationConfirmationPopup.css';

function ReservationConfirmationPopup({ onClose }) {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2>Yêu cầu đã được gửi!</h2>
                <p>Cảm ơn bạn đã đặt bàn. Chúng tôi sẽ sớm liên hệ với bạn qua điện thoại để xác nhận.</p>
                <div className="popup-actions">
                    <Link to="/" className="btn btn-primary-popup">Về trang chủ</Link>
                    <button onClick={onClose} className="btn btn-secondary-popup">Đóng</button>
                </div>
            </div>
        </div>
    );
}

export default ReservationConfirmationPopup;