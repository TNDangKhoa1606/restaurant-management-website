import React from 'react';
import { Link } from 'react-router-dom';
import './IntroductionSection.css'; // Sẽ tạo ở bước 2

const IntroductionSection = () => {
    return (
        <section className="intro-section">
            <div className="container mx-auto">
                <div className="flex flex-wrap -mx-4">

                    {/* Cột 1: Nội dung giới thiệu */}
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="col-inner">
                            <h3 className="text-2xl font-bold mb-4" style={{ color: '#000000' }}>
                                Thế Giới Mì Trong Tầm Tay
                            </h3>
                            <p className="text-base mb-4">
                                <strong>Noodles</strong> sẽ đưa bạn vào một hành trình ẩm thực vòng quanh thế giới, từ Phở bò đậm đà của Việt Nam, Ramen trứ danh của Nhật Bản, đến Spaghetti cổ điển của Ý. Nếu đã một lần thưởng thức, bạn sẽ không thể quên được hương vị “ngất ngây” của những sợi mì hòa quyện trong các loại nước sốt đặc trưng.
                            </p>
                            <p className="text-base">
                                Bí quyết của chúng tôi nằm ở những công thức được chắt lọc từ khắp nơi trên thế giới, do Bếp Trưởng <strong>Nguyễn Văn A</strong> hơn 20 năm kinh nghiệm nghiên cứu và sáng tạo. Nhà hàng có 2 dạng thực đơn để Quý Khách lựa chọn là: <strong>Chọn Combo</strong> và <strong>Gọi Món.</strong>
                            </p>
                        </div>
                    </div>

                    {/* Cột 2: Banner "Chọn Combo" */}
                    <div className="w-full lg:w-1/4 px-4">
                        <div className="col-inner">
                            <div className="intro-banner banner-combo">
                                <Link to="/menu#combos" className="banner-link-overlay">
                                    <div className="banner-text-box">
                                        <span className="button secondary is-xlarge">
                                            <i className="icon-star"></i> <span>Chọn Combo</span>
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Cột 3: Banner "Gọi Món" */}
                    <div className="w-full lg:w-1/4 px-4">
                        <div className="col-inner">
                            <div className="intro-banner banner-goi-mon">
                                <Link to="/menu" className="banner-link-overlay">
                                    <div className="banner-text-box">
                                        <span className="button secondary is-xlarge">
                                            <i className="icon-heart"></i> <span>Gọi Món</span>
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default IntroductionSection;