import React, { useState } from 'react';
import './AddAddressModal.css'; // Sử dụng file CSS cục bộ đã có

const AddAddressModal = ({ onClose, onAddAddress }) => {
    const [formData, setFormData] = useState({
        label: 'Nhà riêng',
        name: '',
        phone: '',
        address: '',
        isDefault: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Trong thực tế, bạn sẽ gọi API ở đây
        console.log("Địa chỉ mới:", formData);
        onAddAddress(formData); // Gửi dữ liệu về component cha
        onClose(); // Đóng modal
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Thêm địa chỉ mới</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="label">Loại địa chỉ</label>
                        <select id="label" name="label" value={formData.label} onChange={handleInputChange} className="form-control">
                            <option value="Nhà riêng">Nhà riêng</option>
                            <option value="Công ty">Công ty</option>
                        </select>
                    </div>
                    {/* Các trường input khác tương tự như trong ProfileInfo.js */}
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ chi tiết</label>
                        <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleInputChange} className="form-control" required></textarea>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                        <button type="submit" className="btn-confirm">Lưu địa chỉ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAddressModal;