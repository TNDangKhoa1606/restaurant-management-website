import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi component được tải và khi người dùng điều hướng
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi khi đọc thông tin người dùng từ localStorage", e);
        // Xóa dữ liệu hỏng nếu có
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Hiển thị nút khi người dùng cuộn xuống
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/'); // Chuyển về trang chủ sau khi đăng xuất
  };

  return (
    <>
      {/* Container chính cho các nút, với hiệu ứng trượt vào */}
      <div className={`fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-[200%]'}`}>
        {/* Nhóm các nút chức năng */}
        <div className="flex flex-col gap-3">
          {/* Nút tài khoản */}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              title={`Đăng xuất (${user.full_name})`}
              className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center"
            >
              <i className="icon-logout icons text-xl"></i>
            </button>
          ) : (
            <Link to="/login" title="Đăng nhập" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
              <i className="icon-user icons text-xl"></i>
            </Link>
          )}
        </div>
        {/* Nút trở về đầu trang */}
        <button onClick={scrollToTop} aria-label="Trở về đầu trang" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
          <i className="icon-arrow-up text-xl"></i>
        </button>
      </div>
    </>
  );
}

export default BackToTop;