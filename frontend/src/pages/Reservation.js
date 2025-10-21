import React, { useState, useEffect } from 'react';
import './Reservation.css';
import reservationImg from '../assets/images/reservation-img.jpg'; // Đảm bảo bạn có ảnh này
import ReservationConfirmationPopup from '../components/ReservationConfirmationPopup';

function Reservation() {
    const initialFormData = {
        date: '',
        time: '',
        guests: '1',
        name: '',
        phone: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [showPopup, setShowPopup] = useState(false);

    // Danh sách các khung giờ để chọn
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
    ];

    // Tự động điền thông tin nếu người dùng đã đăng nhập
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '' }));
            } catch (e) {
                console.error("Lỗi khi đọc thông tin người dùng từ localStorage", e);
            }
        }
    }, []); // Chạy một lần khi component được mount

    const handleClosePopup = () => {
        setShowPopup(false);
        setFormData(initialFormData); // Reset form sau khi đóng popup
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic để xử lý gửi form sẽ được thêm sau
        console.log('Reservation data:', formData);
        setShowPopup(true); // Hiển thị popup thay vì alert
    };

    return (
        <div className="reservation-page">
            <div className="reservation-container">
                <div className="reservation-form-wrapper">
                    <div className="reservation-icon-wrapper">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <p className="reservation-subtitle mb-8">
                        Để đảm bảo bạn có một vị trí, vui lòng điền thông tin và đặt bàn trước.
                    </p>

                    {/* Phần gợi ý đặt bàn */}
                    <div className="booking-suggestions">
                        <h4 className="suggestion-title">Gợi ý đặt bàn:</h4>
                        <ul>
                            <li>Đi 1 người: đặt bàn đơn</li>
                            <li>Đi 2 người: đặt bàn đôi</li>
                            <li>Đi nhóm 4-6 người: đặt bàn 6 người.</li>
                            <li>Đi nhóm 6-12 người: đặt bàn dài</li>
                            <li>Đi nhóm &gt;12 người: gọi trực tiếp Hotline: <strong>0972.939.830</strong></li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="reservation-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">Ngày</label>
                                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="form-control" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="guests">Số lượng khách</label>
                                <input type="number" id="guests" name="guests" min="1" value={formData.guests} onChange={handleChange} required className="form-control" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Chọn giờ</label>
                            <div className="time-slots-grid">
                                {timeSlots.map(slot => (
                                    <button key={slot} type="button" className={`time-slot-btn ${formData.time === slot ? 'active' : ''}`} onClick={() => handleChange({ target: { name: 'time', value: slot } })}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Họ và Tên</label>
                            <input type="text" id="name" name="name" placeholder="Nhập họ và tên của bạn" value={formData.name} onChange={handleChange} required className="form-control" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input type="tel" id="phone" name="phone" placeholder="Nhập số điện thoại" value={formData.phone} onChange={handleChange} required className="form-control" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Ghi chú</label>
                            <textarea id="notes" name="notes" rows="4" placeholder="Yêu cầu đặc biệt (ví dụ: ghế trẻ em, gần cửa sổ...)" value={formData.notes} onChange={handleChange} className="form-control"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105">Xác nhận đặt bàn</button>
                    </form>
                </div>
                <div className="reservation-image-wrapper">
                    <img src={reservationImg} alt="Không gian nhà hàng sang trọng" />
                </div>
                {showPopup && <ReservationConfirmationPopup onClose={handleClosePopup} />}
            </div>
        </div>
    );
}

export default Reservation;