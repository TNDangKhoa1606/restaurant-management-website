import React, { useState, useEffect } from 'react';
import '../../pages/profile/AddAddressModal.css'; // Reuse the CSS from another component

const EmployeeModal = ({ isOpen, onClose, onSave, employee }) => {
    const isEditMode = Boolean(employee);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: 'active',
    });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                phone: employee.phone || '',
                role: employee.role || '',
                status: employee.status || 'active',
            });
        } else {
            // Reset form for creation mode
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: '',
                status: 'active',
            });
        }
        setPassword(''); // Always reset password field
        setError('');
    }, [employee, isOpen, isEditMode]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password') {
            setPassword(value);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
            setError('Tên, email và vai trò không được để trống.');
            return;
        }
        if (!isEditMode && (!password || password.length < 6)) {
            setError('Khi tạo mới, mật khẩu là bắt buộc và phải có ít nhất 6 ký tự.');
            return;
        }

        const dataToSave = { ...formData };
        if (isEditMode) {
            dataToSave.id = employee.id;
        } else {
            dataToSave.password = password;
        }
        onSave(dataToSave);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditMode ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="name">Tên nhân viên</label>
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
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={isEditMode} // Only allow editing email on creation
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    {!isEditMode && (
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="role">Vai trò</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn vai trò</option>
                            <option value="Admin">Quản lý (Admin)</option>
                            <option value="Staff">Phục vụ (Staff)</option>
                            <option value="Kitchen">Bếp</option>
                            <option value="Receptionist">Lễ tân (Receptionist)</option>
                            <option value="Cashier">Thu ngân (Cashier)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Trạng thái</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm ngưng</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-admin btn-admin-primary">{isEditMode ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
                        <button type="button" onClick={onClose} className="btn-admin btn-admin-secondary">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;
