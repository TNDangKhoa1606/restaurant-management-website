import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantInfoSection.css';

const RestaurantInfoSection = () => {
    return (
        <section className="restaurant-info-section">
            <div className="container mx-auto">
                <div className="flex flex-wrap -mx-4 items-start">

                    {/* Cột trái: Nội dung */}
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="col-inner">
                            <h3 className="text-2xl font-bold mb-4 text-text-dark">Không Gian Nhà Hàng</h3>
                            <p className="text-base mb-4">
                                Khi nói đến ẩm thực, không gian là một phần không thể thiếu. Tại <strong>Noodles</strong>, chúng tôi mang đến một không gian ấm cúng, hiện đại nhưng không kém phần sang trọng, là nơi lý tưởng cho những buổi gặp gỡ bạn bè, gia đình hay đối tác.
                            </p>
                            <p className="text-base mb-6">
                                Hãy lựa chọn địa điểm của chúng tôi và liên hệ đặt bàn ngay để có những trải nghiệm tuyệt vời nhất!
                            </p>
                            <Link to="/reservation" className="button-outline-dark">
                                <i className="icon-search"></i> <span>Đặt Bàn Ngay</span>
                            </Link>
                        </div>
                    </div>

                    {/* Cột phải: Lưới ảnh */}
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="flex flex-wrap -mx-2">
                            <div className="w-1/2 px-2">
                                <div className="img-wrapper">
                                    <img src="https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Không gian nhà hàng 1" />
                                </div>
                            </div>
                            <div className="w-1/2 px-2">
                                <div className="img-wrapper">
                                    <img src="https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Không gian nhà hàng 2" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default RestaurantInfoSection;