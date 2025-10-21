import React from 'react';
import { Link } from 'react-router-dom';
import './MenuHighlightSection.css';

const MenuHighlightSection = () => {
    return (
        <section className="menu-highlight-section">
            <div className="container mx-auto">
                <div className="flex flex-wrap -mx-4 items-center">

                    {/* Cột trái: Lưới ảnh */}
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="flex flex-wrap -mx-2">
                            {/* Cột ảnh 1 */}
                            <div className="w-1/2 px-2">
                                <div className="img-container mb-4">
                                    <img src="https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Mì Ý" />
                                </div>
                                <div className="img-container">
                                    <img src="https://images.pexels.com/photos/5907913/pexels-photo-5907913.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Mì Ramen" />
                                </div>
                            </div>
                            {/* Cột ảnh 2 */}
                            <div className="w-1/2 px-2">
                                <div className="img-container mb-4">
                                    <img src="https://images.pexels.com/photos/1907097/pexels-photo-1907097.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Mì Phở" />
                                </div>
                                <div className="img-container">
                                    <img src="https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Mì Pad Thái" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Nội dung */}
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="col-inner text-white">
                            <h3 className="text-2xl font-bold mb-4" style={{ color: '#c0c0c0' }}>Thực Đơn</h3>
                            <p className="text-base mb-6">
                                Hơn 50 món mì được chắt lọc từ tinh hoa ẩm thực thế giới với mức giá chỉ từ 70.000đ cùng nhiều combo và set bộ hấp dẫn. Thưởng thức những món ăn đặc trưng và nổi tiếng do chính tay đầu bếp quốc tế chế biến.
                            </p>
                            <Link to="/menu" className="button-outline">
                                <i className="icon-shopping-bag"></i> <span>Xem Thực Đơn</span>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MenuHighlightSection;