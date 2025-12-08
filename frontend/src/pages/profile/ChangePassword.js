import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';

const ChangePassword = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token, isAuthenticated } = useAuth();
    const { notify } = useNotification();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated || !token) {
            notify('Vui lòng đăng nhập để đổi mật khẩu.', 'warning');
            return;
        }

        const { currentPassword, newPassword, confirmPassword } = passwords;

        if (!currentPassword || !newPassword || !confirmPassword) {
            notify('Vui lòng nhập đầy đủ thông tin mật khẩu.', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            notify('Mật khẩu mới không khớp!', 'error');
            return;
        }

        if (newPassword.length < 6) {
            notify('Mật khẩu mới phải có ít nhất 6 ký tự.', 'warning');
            return;
        }

        if (newPassword === currentPassword) {
            notify('Mật khẩu mới phải khác mật khẩu hiện tại.', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/auth/change-password', { currentPassword, newPassword }, config);
            notify('Đổi mật khẩu thành công.', 'success');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const message = error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
            notify(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
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
                <button type="submit" className="btn-save-profile" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;