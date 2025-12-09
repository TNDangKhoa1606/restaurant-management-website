import React, { useState, useEffect } from 'react';

const TableModal = ({ isOpen, onClose, onSave, onDelete, table, floors, currentFloorId }) => {
    const [formData, setFormData] = useState({
        table_name: '',
        capacity: 2,
        floor_id: '',
        pos_x: 50,
        pos_y: 50,
        price: 0,
    });

    useEffect(() => {
        if (table) {
            setFormData({
                table_name: table.table_name || '',
                capacity: table.capacity || 2,
                floor_id: table.floor_id,
                pos_x: table.pos_x,
                pos_y: table.pos_y,
                price: table.price != null ? table.price : 0,
                table_id: table.table_id,
            });
        } else {
            setFormData({
                table_name: '',
                capacity: 2,
                floor_id: currentFloorId || (floors.length > 0 ? floors[0].floor_id : ''),
                pos_x: 50,
                pos_y: 50,
                price: 0,
            });
        }
    }, [table, isOpen, floors, currentFloorId]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{table ? 'Chỉnh sửa Bàn' : 'Thêm Bàn mới'}</h2>
                <div className="form-group">
                    <label>Tên bàn</label>
                    <input type="text" name="table_name" value={formData.table_name} onChange={handleChange} placeholder="Ví dụ: Bàn 1, A1" />
                </div>
                <div className="form-group">
                    <label>Số ghế</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" />
                </div>
                <div className="form-group">
                    <label>Giá bàn (VND)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="1000"
                        placeholder="Ví dụ: 200000"
                    />
                </div>
                <div className="form-group">
                    <label>Tầng</label>
                    <select name="floor_id" value={formData.floor_id} onChange={handleChange}>
                        {floors.map(floor => (
                            <option key={floor.floor_id} value={floor.floor_id}>{floor.name}</option>
                        ))}
                    </select>
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-admin btn-admin-secondary">Hủy</button>
                    {table && (
                        <button type="button" onClick={() => onDelete(table.table_id)} className="btn-admin btn-admin-danger">Xóa bàn</button>
                    )}
                    <button type="button" onClick={handleSave} className="btn-admin btn-admin-primary">Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default TableModal;