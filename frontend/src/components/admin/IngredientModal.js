import React, { useState, useEffect } from 'react';
import '../../pages/profile/AddAddressModal.css'; // Trỏ đến file CSS đã hợp nhất

const IngredientModal = ({ isOpen, onClose, onSave, ingredient }) => {
    const [formData, setFormData] = useState({
        name: '',
        stock_quantity: 0,
        unit: '',
        warning_level: 0,
    });
    const [error, setError] = useState('');

    // Khi prop `ingredient` thay đổi (khi mở modal để sửa), cập nhật form
    useEffect(() => {
        if (ingredient) {
            setFormData({
                name: ingredient.name || '',
                stock_quantity: ingredient.stock_quantity || 0,
                unit: ingredient.unit || '',
                warning_level: ingredient.warning_level || 0,
            });
        } else {
            // Reset form khi mở modal để thêm mới
            setFormData({ name: '', stock_quantity: 0, unit: '', warning_level: 0 });
        }
        setError(''); // Xóa lỗi cũ khi mở modal
    }, [ingredient, isOpen]);

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
        // Validation đơn giản
        if (!formData.name.trim() || !formData.unit.trim()) {
            setError('Tên nguyên liệu và đơn vị không được để trống.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{ingredient ? 'Chỉnh sửa Nguyên liệu' : 'Thêm Nguyên liệu mới'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="name">Tên nguyên liệu</label>
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
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="lít">lít</option>
                            <option value="ml">ml</option>
                            <option value="cái">cái</option>
                            <option value="hộp">hộp</option>
                            <option value="chai">chai</option>
                            <option value="thùng">thùng</option>
                            <option value="bó">bó</option>
                            <option value="mớ">mớ</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="warning_level">Mức cảnh báo tồn kho</label>
                        <input
                            type="number"
                            id="warning_level"
                            name="warning_level"
                            value={formData.warning_level}
                            onChange={handleChange}
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

export default IngredientModal;
