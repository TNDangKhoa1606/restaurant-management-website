import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.png';
import { Link, NavLink } from 'react-router-dom';
import { useCurrency } from './CurrencyContext';
import { useAuth } from '../../pages/AuthContext';

function Header() {
    const [isScrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { currency, changeCurrency } = useCurrency();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navLinkClasses = "block py-2 text-base text-text-light hover:text-primary transition-colors duration-300";
    const desktopNavLinkClasses = "text-text-light hover:text-primary transition-colors duration-300";

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
                    <div className="hidden lg:flex items-center justify-end flex-grow">
                        <nav className="relative">
                            {/* Top info bar */}
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
                            {/* Main menu */}
                            <ul className="flex items-center space-x-8 text-base pt-4 font-medium">
                                <li><NavLink to="/" className={desktopNavLinkClasses}>Trang Chủ</NavLink></li>
                                <li><NavLink to="/menu" className={desktopNavLinkClasses}>Thực Đơn</NavLink></li>
                                <li><NavLink to="/about" className={desktopNavLinkClasses}>Giới thiệu</NavLink></li>
                                <li><NavLink to="/contact" className={desktopNavLinkClasses}>Liên Hệ</NavLink></li>
                                <li>
                                    <select
                                        value={currency}
                                        onChange={(e) => changeCurrency(e.target.value)}
                                        className="bg-transparent border border-primary text-text-light text-sm px-2 py-1 rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="VND">VND</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </li>
                                {/* User section */}
                                {user ? (
                                    <li>
                                        <Link
                                            to="/profile"
                                            className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors duration-300"
                                        >
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffc107&color=1e1e1e&size=32`}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full border-2 border-primary"
                                            />
                                            <span className="font-medium">{user.name}</span>
                                        </Link>
                                    </li>
                                ) : (
                                    <li>
                                        <Link
                                            to="/login"
                                            className="text-text-light hover:text-primary transition-colors duration-300 flex items-center space-x-1"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Đăng nhập</span>
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <Link to="/reservation" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 whitespace-nowrap">
                                        Đặt Bàn
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center space-x-3">
                        {user && (
                            <Link to="/profile">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffc107&color=1e1e1e&size=32`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full border-2 border-primary"
                                />
                            </Link>
                        )}
                        <select
                            value={currency}
                            onChange={(e) => changeCurrency(e.target.value)}
                            className="bg-bg-dark-1 border border-primary text-text-light text-sm px-2 py-1 rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="VND">VND</option>
                            <option value="USD">USD</option>
                        </select>
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none" aria-label="Open main menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div id="mobile-menu" className={`fixed top-0 right-0 h-full w-64 bg-bg-dark-1 shadow-lg transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
                <div className="p-5">
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white float-right mb-5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <ul className="flex flex-col space-y-4 mt-10 text-center">
                        {user && (
                            <li className="pb-4 border-b border-gray-700">
                                <Link to="/profile" className="flex flex-col items-center space-y-2" onClick={() => setMobileMenuOpen(false)}>
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffc107&color=1e1e1e&size=48`}
                                        alt="Avatar"
                                        className="w-12 h-12 rounded-full border-2 border-primary"
                                    />
                                    <span className="text-primary font-medium">{user.name}</span>
                                </Link>
                            </li>
                        )}
                        <li><Link to="/" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link></li>
                        <li><Link to="/menu" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Thực Đơn</Link></li>
                        <li><Link to="/about" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Giới thiệu</Link></li>
                        <li><Link to="/contact" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Liên Hệ</Link></li>
                        {!user && (
                            <li><Link to="/login" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link></li>
                        )}
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

