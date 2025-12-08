import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/AuthContext';

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    logout();
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