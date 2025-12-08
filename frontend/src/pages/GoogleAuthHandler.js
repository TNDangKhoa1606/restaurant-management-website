import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

function GoogleAuthHandler() {
    const [status, setStatus] = useState('Đang xử lý đăng nhập...');
    const [loginComplete, setLoginComplete] = useState(false); // State để điều khiển điều hướng
    const location = useLocation();
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        // Nếu đã đăng nhập thì về trang chủ, không xử lý nữa
        if (user) {
            setLoginComplete(true); // Đã đăng nhập, sẵn sàng điều hướng
            return;
        }

        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            try {
                // Giải mã token để lấy thông tin người dùng
                const decodedPayload = jwtDecode(token);

                // Tạo một đối tượng user hoàn chỉnh từ payload của token
                const userObject = {
                    id: decodedPayload.id,
                    name: decodedPayload.name,
                    email: decodedPayload.email,
                    phone: decodedPayload.phone,
                    role: decodedPayload.role,
                    avatar: decodedPayload.avatar || null,
                };

                // Gọi hàm login từ AuthContext để cập nhật trạng thái toàn cục
                login(userObject, token);
                setStatus('Đăng nhập thành công! Đang chuyển hướng...');
                setLoginComplete(true); // Đánh dấu đăng nhập hoàn tất

            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                setStatus('Đăng nhập thất bại. Token không hợp lệ.');
                setTimeout(() => navigate('/login'), 2000);
            }
        } else {
            setStatus('Không tìm thấy thông tin xác thực. Đang chuyển về trang đăng nhập...');
            setTimeout(() => navigate('/login'), 2000);
        }
    // Chỉ chạy một lần khi component mount, chỉ phụ thuộc vào các hàm ổn định
    }, [login, user, navigate, location.search]);

    // Khi loginComplete là true, render component Navigate để chuyển hướng an toàn
    if (loginComplete) {
        return <Navigate to="/" replace />;
    }

    // Trong khi xử lý, hiển thị trạng thái cho người dùng
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>{status}</h2>
        </div>
    );
}

export default GoogleAuthHandler;
