import React, { useState } from 'react';

const ChangePassword = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }
        console.log("Đổi mật khẩu với dữ liệu:", passwords);
        alert("Đã gửi yêu cầu đổi mật khẩu!");
    };

    return (
        <div className="content-section">
            <h2 className="content-title">Đổi mật khẩu</h2>
            <p className="content-subtitle">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>

            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="currentPassword">Mật khẩu cũ</label>
                    <input type="password" id="currentPassword" name="currentPassword" value={passwords.currentPassword} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <input type="password" id="newPassword" name="newPassword" value={passwords.newPassword} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={passwords.confirmPassword} onChange={handleInputChange} className="form-control" required />
                </div>
                <button type="submit" className="btn-save-profile">Cập nhật mật khẩu</button>
            </form>
        </div>
    );
};

export default ChangePassword;