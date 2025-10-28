import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // useEffect để tự động đăng nhập lại khi tải lại trang nếu có token
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu người dùng từ localStorage", error);
                // Xóa dữ liệu hỏng
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    // Hàm để xử lý đăng nhập
    const login = (userData, userToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        setUser(userData);
        setToken(userToken);
    };

    // Hàm để xử lý đăng xuất
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    const authContextValue = {
        user,
        token,
        isAuthenticated: !!token, // true nếu có token, ngược lại là false
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Tạo custom hook để sử dụng context dễ dàng hơn
export const useAuth = () => {
    return useContext(AuthContext);
};