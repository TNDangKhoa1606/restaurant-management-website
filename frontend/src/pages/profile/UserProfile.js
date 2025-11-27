import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import './UserProfile.css';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';

const UserProfile = () => {
    // --- Dữ liệu mẫu ---
    const { user, logout } = useAuth();
    const { notify } = useNotification();
    // --- Kết thúc dữ liệu mẫu ---

    const navigate = useNavigate();
    const location = useLocation();

    const displayUser = user || {
        name: 'Khách',
        email: '',
        avatar: null,
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
                        <img src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=ffc107&color=1e1e1e`} alt="Avatar" className="sidebar-avatar" />
                        <h3 className="sidebar-username">{displayUser.name}</h3>
                        <p className="sidebar-email">{displayUser.email}</p>
                    </div>
                    <nav className="sidebar-nav">
                        <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                            <i className="fas fa-user-circle"></i> Hồ sơ của tôi
                        </Link>
                        <Link to="/profile/orders" className={`nav-item ${location.pathname.startsWith('/profile/orders') ? 'active' : ''}`}>
                            <i className="fas fa-receipt"></i> Lịch sử đơn hàng
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
