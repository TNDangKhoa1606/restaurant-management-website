import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesPage.css'; // Sửa lại đường dẫn import CSS

const AboutPage = () => { // Đổi tên component
    return (
        <section className="about-page-section">
            <div className="about-page-container">
                {/* Cột 1: Alacarte */}
                <div className="about-column">
                    <div className="about-column-inner">
                        <h3 className="about-title">TRẢI NGHIỆM GỌI MÓN (À LA CARTE)</h3>
                        <div className="about-image-wrapper">
                            <img src="https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Một tô mì Ramen hấp dẫn" />
                        </div>
                        <p>Tại <b>NOODLES Restaurant</b>, mô hình gọi món cho phép bạn tự do khám phá từng hương vị mì đặc trưng từ khắp nơi trên thế giới. Mỗi tô mì là một câu chuyện văn hóa, được chế biến từ những nguyên liệu tươi ngon nhất.</p>
                        <p>Từ Phở bò Việt Nam đậm đà đến Ramen Tonkotsu béo ngậy, hãy chọn cho mình một hành trình ẩm thực riêng, hoàn hảo cho những buổi gặp gỡ thân mật hoặc khi bạn muốn tự mình thưởng thức.</p>
                        <Link to="/menu" className="about-button">
                            <i className="fas fa-search"></i>
                            <span>Khám phá Menu</span>
                        </Link>
                    </div>
                </div>

                {/* Cột 2: Buffet */}
                <div className="about-column">
                    <div className="about-column-inner">
                        <h3 className="about-title">COMBO & SET ĂN TIỆN LỢI</h3>
                        <div className="about-image-wrapper">
                            <img src="https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Bàn ăn với nhiều món mì Ý" />
                        </div>
                        <p><strong>NOODLES Restaurant</strong> mang đến các combo và set ăn được thiết kế đặc biệt, kết hợp các món mì đặc sắc cùng món ăn kèm và đồ uống hấp dẫn. Đây là lựa chọn hoàn hảo để tiết kiệm thời gian mà vẫn đảm bảo một bữa ăn trọn vẹn hương vị.</p>
                        <p>Các set ăn của chúng tôi đặc biệt thích hợp cho các bữa trưa văn phòng, bữa tối gia đình hay những buổi tụ họp bạn bè cần sự nhanh chóng và tiện lợi.</p>
                        <Link to="/menu" className="about-button">
                            <i className="fas fa-heart"></i>
                            <span>Xem các Combo</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutPage;