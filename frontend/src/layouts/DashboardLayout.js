import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext'; // Import useAuth
import { useNotification } from '../components/common/NotificationContext';
import './Admin.css'; // Tái sử dụng CSS chung

function DashboardLayout({ roleConfig }) {

    const { navLinks, pageTitles, avatarBgColor } = roleConfig;

    const location = useLocation();
    const navigate = useNavigate();
    
    // Sử dụng state xác thực tập trung
    const { user, logout } = useAuth(); 
    const { notify } = useNotification();

    const pageTitle = pageTitles[location.pathname] || (user?.role || roleConfig.roleName);

    // useEffect cục bộ để lấy user đã được xóa. AuthContext sẽ xử lý việc này.

    const handleLogout = () => {
        logout(); // Gọi hàm logout từ context
        notify('Đăng xuất thành công khỏi hệ thống nội bộ.', 'success');
        navigate('/internal/login', { replace: true }); // Chuyển hướng đến trang đăng nhập nội bộ chính xác
    };

    // Sử dụng đối tượng user từ context
    const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${avatarBgColor || '0D8ABC'}&color=fff`;

    const normalizedRole = (user?.role || roleConfig.roleName)?.toLowerCase();

    // Filter navLinks theo role của user - chỉ hiển thị menu phù hợp
    const filteredNavLinks = navLinks.filter((link) => {
        const allowedRoles = (link.allowedRoles || []).map((role) => role.toLowerCase());
        // Nếu không có allowedRoles hoặc role của user nằm trong danh sách cho phép
        return allowedRoles.length === 0 || allowedRoles.includes(normalizedRole);
    });

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">NOODLES</h1>
                    {(user?.role || roleConfig.roleName) && <span className="sidebar-role">{user?.role || roleConfig.roleName}</span>}
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {filteredNavLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink to={link.to} end={link.end !== false}>{link.text}</NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="admin-main-content">
                <header className="admin-header">
                    <div className="header-title">
                        <h2>{pageTitle}</h2>
                    </div>
                    {/* Việc kiểm tra user bây giờ dựa vào state tập trung */}
                    {user && (
                        <div className="header-user-info">
                            <span className="user-name">{user.name}</span>
                            <img src={userAvatar} alt="User Avatar" className="user-avatar" />
                            <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
                        </div>
                    )}
                </header>
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;