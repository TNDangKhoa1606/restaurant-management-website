import React from 'react';
import sliderImage from '../../assets/images/slider-1.jpg'; // Đảm bảo bạn có ảnh này trong thư mục assets

function HeroSlider() {
    return (
        // Section container: Chiều cao 90% viewport, và ảnh nền
        <section
            className="relative h-[90vh] bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${sliderImage})` }}
        >
            {/* Lớp phủ màu tối để làm nổi bật chữ */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Container cho nội dung, được căn giữa */}
            <div className="relative z-10 text-center text-white px-4">
                {/* Phụ đề - Dùng font-serif, italic và màu vàng primary để tạo sự khác biệt */}
                <p
                    className="font-signature text-5xl md:text-6xl text-primary mb-4"
                    style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}
                >
                    Chào mừng đến với
                </p>

                {/* Tiêu đề chính - Lớn hơn, đậm hơn, có bóng đổ màu vàng để bắt mắt */}
                <h1
                    className="text-6xl md:text-8xl lg:text-9xl font-extrabold uppercase my-2 text-white animate-fadeInUp opacity-0 [text-shadow:2px_2px_0px_#cfa670,4px_4px_0px_rgba(0,0,0,0.2)]"
                    style={{ animationFillMode: 'forwards', animationDelay: '1s' }}
                >
                    NOODLES
                </h1>

                {/* Mô tả */}
                <p
                    className="text-base md:text-lg max-w-2xl mb-8 text-gray-200 animate-fadeInUp opacity-0"
                    style={{ animationFillMode: 'forwards', animationDelay: '1.5s' }}
                >
                    Trải nghiệm nghệ thuật làm mì, từ công thức truyền thống châu Á đến những biến tấu hiện đại của châu Âu. Mỗi bát mì là một câu chuyện.
                </p>

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="#menu"
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full uppercase tracking-wider transition-all duration-300 animate-fadeInUp opacity-0 hover:scale-105 transform"
                        style={{ animationFillMode: 'forwards', animationDelay: '2s' }}
                    >
                        Khám Phá Thực Đơn
                    </a>
                    <a
                        href="/reservation"
                        className="inline-block bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full uppercase tracking-wider transition-all duration-300 animate-fadeInUp opacity-0 hover:scale-105 transform"
                        style={{ animationFillMode: 'forwards', animationDelay: '2.2s' }}
                    >
                        Đặt Bàn Ngay
                    </a>
                </div>
            </div>
        </section>
    );
}

export default HeroSlider;
