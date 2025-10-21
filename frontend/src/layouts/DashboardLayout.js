import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Admin.css'; // Tái sử dụng CSS chung

function DashboardLayout({ roleConfig }) {
    const { roleName, navLinks, pageTitles, avatarBgColor } = roleConfig;

    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const pageTitle = pageTitles[location.pathname] || roleName;

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Lỗi khi đọc thông tin người dùng từ localStorage", e);
                handleLogout();
            }
        } else {
            // Nếu không có user, chuyển về trang đăng nhập
            // navigate('/login'); 
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${avatarBgColor || '0D8ABC'}&color=fff`;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">NOODLES</h1>
                    {roleName && <span className="sidebar-role">{roleName}</span>}
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {navLinks.map((link, index) => (
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