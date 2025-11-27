import React from 'react';
import logo from '../../assets/images/logo.png'; // Import logo
import { Link } from 'react-router-dom'; // Thêm import Link
import sliderImage from '../../assets/images/reservation-img.jpg'; // Import background image

function Footer() {
    return (
        <footer className="bg-bg-dark-1 text-text-footer">
            {/* Top Bar */}
            <div 
                className="relative py-16 text-center bg-cover bg-center bg-fixed"
                style={{ backgroundImage: `url(${sliderImage})` }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>

                <div className="relative container mx-auto px-4">
                    <h3 className="font-signature text-5xl md:text-6xl text-primary mb-4">Đặt Bàn Trực Tuyến</h3>
                    <p className="text-lg text-gray-300">hoặc gọi cho chúng tôi <a href="tel:+654566743" className="text-primary hover:text-primary-hover font-bold">+65.4566743</a></p>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
                        {/* Column 1: About */}
                        <div className="space-y-4">
                            <img src={logo} alt="NOODLES Restaurant Logo" className="h-20 mx-auto md:mx-0" />
                            <p className="text-sm">
                                Dolor church-key veniam, fap Bushwick mumblecore irure Vice consectetur 3 wolf moon sapiente literally quinoa.
                            </p>
                            <div className="flex justify-center md:justify-start space-x-4">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-text-footer hover:text-primary transition-colors"><i className="icon-social-facebook text-xl"></i></a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-text-footer hover:text-primary transition-colors"><i className="icon-social-twitter text-xl"></i></a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-text-footer hover:text-primary transition-colors"><i className="icon-social-instagram text-xl"></i></a>
                            </div>
                        </div>

                        {/* Column 2: Overview */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white uppercase tracking-wider">TỔNG QUAN</h4>
                            <ul className="space-y-2">
                                <li><Link to="/" className="hover:text-primary transition-colors">Trang Chủ</Link></li>
                                <li><Link to="/menu" className="hover:text-primary transition-colors">Thực Đơn</Link></li>
                                <li><Link to="/services" className="hover:text-primary transition-colors">Dịch Vụ</Link></li>
                                <li><Link to="/shop" className="hover:text-primary transition-colors">Cửa Hàng</Link></li>
                                <li><Link to="/blog" className="hover:text-primary transition-colors">Bài Viết</Link></li>
                                <li><Link to="/contact" className="hover:text-primary transition-colors">Liên Hệ</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Contact Info */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white uppercase tracking-wider">THÔNG TIN LIÊN HỆ</h4>
                            <div className="space-y-2">
                                <p className="flex items-center justify-center md:justify-start">
                                    <i className="icon-phone text-primary mr-3"></i>
                                    <a href="tel:+654566743" className="hover:text-primary transition-colors">+65.4566743</a>
                                </p>
                                <p className="flex items-center justify-center md:justify-start">
                                    <i className="icon-envelope text-primary mr-3"></i>
                                    <a href="mailto:info@fwa.com" className="hover:text-primary transition-colors">info@fwa.com</a>
                                </p>
                            </div>
                        </div>

                        {/* Column 4: Location */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white uppercase tracking-wider">ĐỊA CHỈ</h4>
                            <p className="flex items-start justify-center md:justify-start">
                                <i className="icon-location-pin text-primary mr-3 mt-1"></i>
                                <span>732/21 Second Street, Manchester, King Street, Kingston United Kingdom</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-black py-4">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-text-muted">
                        © Bản quyền {new Date().getFullYear()} NOODLES Restaurant. Thiết kế bởi <a href="https://netsolutions.com" className="text-primary hover:underline" target="_blank" rel="noreferrer">Net Solutions</a>
                        <span className="mx-2 text-gray-600">|</span>
                        <Link to="/internal/login" className="hover:text-primary transition-colors">Đăng nhập nội bộ</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;