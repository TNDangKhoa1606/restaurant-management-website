import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../pages/AuthContext';

const AdminRoute = () => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        // Hiển thị một spinner hoặc thông báo tải trong khi đang kiểm tra xác thực
        return <div>Đang kiểm tra quyền truy cập...</div>;
    }

    // Nếu đã xác thực và có vai trò nội bộ (Admin, Receptionist, Waiter, Kitchen), cho phép truy cập
    // Chuyển user.role về chữ thường để so sánh cho chắc chắn
    const allowedRoles = ['admin', 'receptionist', 'waiter', 'kitchen'];
    const userRole = user?.role?.toLowerCase();

    return isAuthenticated && userRole && allowedRoles.includes(userRole)
        ? <Outlet />
        : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;