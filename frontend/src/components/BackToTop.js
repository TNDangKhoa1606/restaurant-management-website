import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TableNumberPopup from './TableNumberPopup';

function BackToTop({ cartItems = [], onCartOpen }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

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

  const handleCartClick = (e) => {
    e.preventDefault();
    onCartOpen();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/'); // Chuyển về trang chủ sau khi đăng xuất
  };

  const handleTableOrderClick = (e) => {
    e.preventDefault();
    setShowTablePopup(true);
  };

  return (
    <>
      {/* Container chính cho các nút, với hiệu ứng trượt vào */}
      <div className={`fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-[200%]'}`}>
        {/* Nhóm các nút chức năng */}
        <div className="flex flex-col gap-3">
          {/* Nút tài khoản */}
          {user ? (
            <a href="#" onClick={handleLogout} title={`Đăng xuất (${user.full_name})`} className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
              <i className="icon-logout icons text-xl"></i>
            </a>
          ) : (
            <Link to="/login" title="Đăng nhập" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
              <i className="icon-user icons text-xl"></i>
            </Link>
          )}

          {/* Nút gọi món tại bàn */}
          <a href="#" onClick={handleTableOrderClick} title="Gọi món tại bàn" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
            <i className="icon-book-open icons text-xl"></i>
          </a>

          {/* Nút giỏ hàng */}
          <a href="#cart" onClick={handleCartClick} className="relative w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
            <i className="icon-bag icons text-xl"></i>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-bg-dark-1">{totalItems}</span>
            )}
          </a>
        </div>
        {/* Nút trở về đầu trang */}
        <button onClick={scrollToTop} aria-label="Trở về đầu trang" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center">
          <i className="icon-arrow-up text-xl"></i>
        </button>
      </div>
      {showTablePopup && <TableNumberPopup onClose={() => setShowTablePopup(false)} />}
    </>
  );
}

export default BackToTop;