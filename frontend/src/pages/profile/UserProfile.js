import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import './UserProfile.css';

const UserProfile = () => {
    // --- Dữ liệu mẫu ---
    const mockUser = {
        id: 4,
        name: 'Nguyễn Văn An',
        email: 'nguyen.an@example.com',
        phone: '0911111111',
        avatar: null // Sẽ dùng avatar mặc định
    };
    // --- Kết thúc dữ liệu mẫu ---

    const [user, setUser] = useState(mockUser);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/'); // Chuyển về trang chủ
    };

    return (
        <div className="user-profile-page">
            <div className="profile-container">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="sidebar-header">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=ffc107&color=1e1e1e`} alt="Avatar" className="sidebar-avatar" />
                        <h3 className="sidebar-username">{user.name}</h3>
                        <p className="sidebar-email">{user.email}</p>
                    </div>
                    <nav className="sidebar-nav">
                        <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                            <i className="fas fa-user-circle"></i> Hồ sơ của tôi
                        </Link>
                        <Link to="/profile/orders" className={`nav-item ${location.pathname.startsWith('/profile/orders') ? 'active' : ''}`}>
                            <i className="fas fa-receipt"></i> Lịch sử đơn hàng
                        </Link>
                        <Link to="/profile/addresses" className={`nav-item ${location.pathname.startsWith('/profile/addresses') ? 'active' : ''}`}>
                            <i className="fas fa-map-marker-alt"></i> Sổ địa chỉ
                        </Link>
                        <Link to="/profile/change-password" className={`nav-item ${location.pathname.startsWith('/profile/change-password') ? 'active' : ''}`}>
                            <i className="fas fa-key"></i> Đổi mật khẩu
                        </Link>
                        <a href="/logout" onClick={handleLogout} className="nav-item">
                            <i className="fas fa-sign-out-alt"></i> Đăng xuất
                        </a>
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
