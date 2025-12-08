import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import './UserProfile.css';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';

const UserProfile = () => {
    // --- Dữ liệu mẫu ---
    const { user, logout, token, login } = useAuth();
    const { notify } = useNotification();
    // --- Kết thúc dữ liệu mẫu ---

    const navigate = useNavigate();
    const location = useLocation();
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const displayUser = user || {
        name: 'Khách',
        email: '',
        avatar: null,
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            notify('Vui lòng chọn tệp hình ảnh hợp lệ.', 'warning');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            notify('Ảnh đại diện tối đa 2MB.', 'warning');
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const formData = new FormData();
            formData.append('avatar', file);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post('/api/auth/avatar', formData, config);
            const updatedUser = response.data && response.data.user;
            if (updatedUser) {
                login(updatedUser, token);
                notify('Cập nhật ảnh đại diện thành công.', 'success');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.';
            notify(message, 'error');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        notify('Đăng xuất thành công.', 'success');
        navigate('/'); // Chuyển về trang chủ
    };

    return (
        <div className="user-profile-page">
            <div className="profile-container">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="sidebar-header">
                        <div className="avatar-container">
                            <img src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=ffc107&color=1e1e1e`} alt="Avatar" className="sidebar-avatar" />
                            <label htmlFor="avatar-upload-input" className="avatar-upload-icon" title="Cập nhật ảnh đại diện">
                                📷
                            </label>
                            <input
                                id="avatar-upload-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={isUploadingAvatar}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <h3 className="sidebar-username">{displayUser.name}</h3>
                        <p className="sidebar-email">{displayUser.email}</p>
                    </div>
                    <nav className="sidebar-nav">
                        <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                            <i className="fas fa-user-circle"></i> Hồ sơ của tôi
                        </Link>
                        <Link to="/profile/reservations" className={`nav-item ${location.pathname.startsWith('/profile/reservations') ? 'active' : ''}`}>
                            <i className="fas fa-chair"></i> Lịch sử đặt bàn
                        </Link>
                        <Link to="/profile/addresses" className={`nav-item ${location.pathname.startsWith('/profile/addresses') ? 'active' : ''}`}>
                            <i className="fas fa-map-marker-alt"></i> Sổ địa chỉ
                        </Link>
                        <Link to="/profile/change-password" className={`nav-item ${location.pathname.startsWith('/profile/change-password') ? 'active' : ''}`}>
                            <i className="fas fa-key"></i> Đổi mật khẩu
                        </Link>
                        <button type="button" onClick={handleLogout} className="nav-item">
                            <i className="fas fa-sign-out-alt"></i> Đăng xuất
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="profile-content">
                    <Outlet /> {/* Đây là nơi các component con sẽ được render */}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
