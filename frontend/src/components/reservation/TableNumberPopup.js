import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../common/NotificationContext';
import './TableNumberPopup.css';

function TableNumberPopup({ onClose }) {
    const [tableNumber, setTableNumber] = useState('');
    const navigate = useNavigate();
    const { notify } = useNotification();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kiểm tra xem số bàn có phải là một số dương hợp lệ không
        if (tableNumber && !isNaN(tableNumber) && Number(tableNumber) > 0) {
            navigate(`/table/${tableNumber}`);
            onClose(); // Đóng popup sau khi chuyển hướng
        } else {
            notify('Vui lòng nhập một số bàn hợp lệ.', 'warning');
        }
    };

    // Ngăn chặn việc đóng popup khi nhấp vào nội dung bên trong
    const handlePopupContentClick = (e) => e.stopPropagation();

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content table-number-popup" onClick={handlePopupContentClick}>
                <h2>Nhập số bàn của bạn</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        placeholder="Ví dụ: 5"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        autoFocus
                        required
                    />
                    <button type="submit">Xác nhận</button>
                </form>
            </div>
        </div>
    );
}

export default TableNumberPopup;