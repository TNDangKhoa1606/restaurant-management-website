import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.png'; // Import logo
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/AuthContext'; // Sử dụng AuthContext
 
function Header() {
    const [isScrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth(); // Lấy trạng thái từ context
    const navigate = useNavigate();
 
    useEffect(() => {
        const handleScroll = () => {
            // Đặt trạng thái `scrolled` thành true nếu cuộn trang hơn 50px
            if (window.pageYOffset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
 
        window.addEventListener('scroll', handleScroll);
 
        // Hàm dọn dẹp để xóa event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        logout(); // Gọi hàm logout từ context
        setMobileMenuOpen(false); // Đóng menu mobile nếu đang mở
        if (isAdmin) {
            navigate('/admin/login'); // Chuyển hướng admin về trang đăng nhập admin
        } else {
            navigate('/login'); // Chuyển hướng người dùng khác về trang đăng nhập
        }
    };
 
    // Helper cho các class của NavLink để tránh lặp lại code
    const navLinkClasses = "block py-2 text-base text-text-light hover:text-primary transition-colors duration-300";
    const desktopNavLinkClasses = "text-text-light hover:text-primary transition-colors duration-300"; // Giữ nguyên hoặc dùng NavLink với activeClassName
 
    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-bg-dark-1 shadow-lg py-4' : 'bg-transparent py-8'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* LOGO */}
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <img className="h-16 w-auto" src={logo} alt="NOODLES Restaurant" />
                        </Link>
                    </div>
 
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-end flex-grow">
                        <nav className="relative">
                            {/* Top info bar - Positioned absolutely above the main menu */}
                            <div className="absolute bottom-full right-0 mb-2 flex items-center space-x-6 text-sm text-text-muted whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <i className="icon-location-pin text-primary"></i>
                                    <span>732/21 Đường Second, Manchester, Anh</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <i className="icon-phone text-primary"></i>
                                    <span>+65.4566743</span>
                                </div>
                            </div>
                            {/* Main menu - This will now be vertically centered with the logo */}
                            <ul className="flex items-center space-x-8 text-base pt-4 font-medium">
                                <li><NavLink to="/" className={desktopNavLinkClasses}>Trang Chủ</NavLink></li>
                                <li><NavLink to="/menu" className={desktopNavLinkClasses}>Thực Đơn</NavLink></li>
                                <li><NavLink to="/about" className={desktopNavLinkClasses}>Giới thiệu</NavLink></li>
                                <li><NavLink to="/shop" className={desktopNavLinkClasses}>Cửa Hàng</NavLink></li>
                                <li><NavLink to="/blog" className={desktopNavLinkClasses}>Bài Viết</NavLink></li>
                                <li><NavLink to="/contact" className={desktopNavLinkClasses}>Liên Hệ</NavLink></li>
                                <li>
                                    {isAuthenticated ? (
                                        <div className="flex items-center space-x-4">
                                            <NavLink to="/profile" className={desktopNavLinkClasses}>Xin chào, {user?.name}</NavLink>
                                            <button onClick={handleLogout} className="text-text-light hover:text-primary transition-colors duration-300">Đăng xuất</button>
                                        </div>
                                    ) : (
                                        <NavLink to="/login" className={desktopNavLinkClasses}>Đăng nhập</NavLink>
                                    )}
                                </li>
                                <li>
                                    <Link to="/reservation" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-5 rounded-full transition-colors duration-300">
                                        Đặt Bàn
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
 
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none" aria-label="Open main menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
 
            {/* Mobile Menu - Slides in from the right */}
            <div id="mobile-menu" className={`fixed top-0 right-0 h-full w-64 bg-bg-dark-1 shadow-lg transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="p-5">
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white float-right mb-5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <ul className="flex flex-col space-y-4 mt-10 text-center">
                        <li><Link to="/" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link></li>
                        <li><Link to="/menu" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Thực Đơn</Link></li>
                        <li><Link to="/about" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Giới thiệu</Link></li>
                        <li><Link to="/shop" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Cửa Hàng</Link></li>
                        <li><Link to="/blog" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Bài Viết</Link></li>
                        <li><Link to="/contact" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Liên Hệ</Link></li>
                        <li className="pt-4">
                            {isAuthenticated ? (
                                <div className="flex flex-col items-center space-y-4">
                                     <Link to="/profile" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Hồ sơ: {user?.name}</Link>
                                     <button onClick={handleLogout} className={navLinkClasses}>Đăng xuất</button>
                                </div>
                            ) : (
                                <Link to="/login" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                            )}
                        </li>
                        <li className="pt-4">
                            <Link to="/reservation" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-base" onClick={() => setMobileMenuOpen(false)}>
                                Đặt Bàn
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
 
export default Header;
