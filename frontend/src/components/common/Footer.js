import React from 'react';
import logo from '../../assets/images/logo.png'; // Import logo
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
                    <p className="text-lg text-gray-300">hoặc gọi cho chúng tôi <a href="tel:+84123456789" className="text-primary hover:text-primary-hover font-bold">+84 123 456 789</a></p>
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
                                <li><a href="/" className="hover:text-primary transition-colors">Trang Chủ</a></li>
                                <li><a href="/menu" className="hover:text-primary transition-colors">Thực Đơn</a></li>
                                <li><a href="/reservation" className="hover:text-primary transition-colors">Đặt Bàn</a></li>
                                <li><a href="/about" className="hover:text-primary transition-colors">Giới Thiệu</a></li>
                                <li><a href="/contact" className="hover:text-primary transition-colors">Liên Hệ</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Contact Info */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white uppercase tracking-wider">THÔNG TIN LIÊN HỆ</h4>
                            <div className="space-y-2">
                                <p className="flex items-center justify-center md:justify-start">
                                    <i className="icon-phone text-primary mr-3"></i>
                                    <a href="tel:+84123456789" className="hover:text-primary transition-colors">+84 123 456 789</a>
                                </p>
                                <p className="flex items-center justify-center md:justify-start">
                                    <i className="icon-envelope text-primary mr-3"></i>
                                    <a href="mailto:contact@mitinhte.vn" className="hover:text-primary transition-colors">contact@mitinhte.vn</a>
                                </p>
                            </div>
                        </div>

                        {/* Column 4: Location */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white uppercase tracking-wider">ĐỊA CHỈ</h4>
                            <p className="flex items-start justify-center md:justify-start">
                                <i className="icon-location-pin text-primary mr-3 mt-1"></i>
                                <span>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-black py-4">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-text-muted">
                        © Bản quyền {new Date().getFullYear()} Mì Tinh Tế. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;