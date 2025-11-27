import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext'; // Import useAuth

const ProfileInfo = () => {
    const { user } = useAuth(); // Lấy thông tin người dùng từ context
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        // Cập nhật form khi có thông tin người dùng từ context
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '', // Xử lý trường hợp phone không có
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="content-section">
            <h2 className="content-title">Thông tin cá nhân</h2>
            <p className="content-subtitle">Quản lý thông tin cá nhân của bạn để bảo mật tài khoản.</p>

            <form className="profile-form">
                <div className="form-group">
                    <label htmlFor="name">Họ và Tên</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} disabled className="form-control" />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" />
                </div>
                <button type="submit" className="btn-save-profile">Lưu thay đổi</button>
            </form>
        </div>
    );
};

export default ProfileInfo;