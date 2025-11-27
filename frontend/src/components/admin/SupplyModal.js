import React, { useState, useEffect } from 'react';
import '../../pages/profile/AddAddressModal.css'; // Reuse the CSS

const SupplyModal = ({ isOpen, onClose, onSave, supply }) => {
    const [formData, setFormData] = useState({
        name: '',
        stock_quantity: 0,
        unit: '',
        type: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (supply) {
            setFormData({
                name: supply.name || '',
                stock_quantity: supply.stock_quantity || 0,
                unit: supply.unit || '',
                type: supply.type || '',
            });
        } else {
            setFormData({ name: '', stock_quantity: 0, unit: '', type: '' });
        }
        setError('');
    }, [supply, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name.trim() || !formData.unit.trim() || !formData.type.trim()) {
            setError('Tên, đơn vị và loại vật tư không được để trống.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{supply ? 'Chỉnh sửa Vật tư' : 'Thêm Vật tư mới'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="name">Tên vật tư</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stock_quantity">Số lượng tồn</label>
                        <input
                            type="number"
                            id="stock_quantity"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="unit">Đơn vị</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn đơn vị</option>
                            <option value="cái">Cái</option>
                            <option value="bộ">Bộ</option>
                            <option value="hộp">Hộp</option>
                            <option value="thùng">Thùng</option>
                            <option value="cuộn">Cuộn</option>
                            <option value="chai">Chai</option>
                            <option value="túi">Túi</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Loại vật tư</label>
                        <input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            placeholder="VD: Đồ dùng vệ sinh, văn phòng phẩm..."
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-admin btn-admin-primary">Lưu</button>
                        <button type="button" onClick={onClose} className="btn-admin btn-admin-secondary">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplyModal;
