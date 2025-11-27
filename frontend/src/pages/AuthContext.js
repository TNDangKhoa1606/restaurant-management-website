import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); // Thêm trạng thái loading

    // useEffect để tự động đăng nhập lại khi tải lại trang nếu có token
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        try {
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch (error) {
            console.error("Lỗi khi phân tích dữ liệu người dùng từ localStorage", error);
            // Xóa dữ liệu hỏng
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false); // Kết thúc loading
        }
    }, []);

    // Hàm để xử lý đăng nhập (ổn định bằng useCallback)
    const login = useCallback((userData, userToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        setUser(userData);
        setToken(userToken);
    }, []);

    // Hàm để xử lý đăng xuất (ổn định bằng useCallback)
    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    }, []);

    const authContextValue = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token, // true nếu có token, ngược lại là false
        loading, // Thêm loading vào context
        login,
        logout,
    }), [user, token, loading, login, logout]);

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
