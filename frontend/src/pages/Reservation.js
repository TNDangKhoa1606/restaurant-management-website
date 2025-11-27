import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Reservation.css';
import reservationImg from '../assets/images/reservation-img.jpg'; // Đảm bảo bạn có ảnh này
import ReservationConfirmationPopup from '../components/reservation/ReservationConfirmationPopup';
import PreOrderPopup from '../components/reservation/PreOrderPopup';
import ReservationTableMap from '../components/reservation/ReservationTableMap';

const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

function Reservation() {

    const initialFormData = {
        date: '',
        time: '',
        guests: '1',
        name: '',
        phone: '',
        notes: ''
    };

    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [formData, setFormData] = useState(initialFormData);
    const [showPopup, setShowPopup] = useState(false);
    const [showPreOrderPopup, setShowPreOrderPopup] = useState(false);
    const [showTableMapModal, setShowTableMapModal] = useState(false);
    const [reservationType, setReservationType] = useState('simple'); // 'simple' hoặc 'pre-order'
    const [userId, setUserId] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [todayDate] = useState(getTodayDateString());
    const navigate = useNavigate();

    // Danh sách các khung giờ để chọn
    const timeSlots = TIME_SLOTS;

    function getFilteredTimeSlots() {
        if (!formData.date) {
            return timeSlots;
        }

        const today = new Date();
        const currentMinutes = today.getHours() * 60 + today.getMinutes();

        if (formData.date !== todayDate) {
            return timeSlots;
        }

        return timeSlots.filter((slot) => {
            const [hour, minute] = slot.split(':').map(Number);
            const slotMinutes = hour * 60 + minute;
            return slotMinutes >= currentMinutes;
        });
    }

    // Tự động điền thông tin nếu người dùng đã đăng nhập
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '' }));
                if (user && user.id) {
                    setUserId(user.id);
                }

            } catch (e) {
                console.error("Lỗi khi đọc thông tin người dùng từ localStorage", e);
            }
        }
    }, []); // Chạy một lần khi component được mount

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            date: prev.date || todayDate,
        }));
    }, [todayDate]);

    useEffect(() => {
        if (!formData.date) return;

        const today = new Date();
        const currentMinutes = today.getHours() * 60 + today.getMinutes();

        if (formData.date === todayDate) {
            const hasFutureSlot = timeSlots.some((slot) => {
                const [hour, minute] = slot.split(':').map(Number);
                const slotMinutes = hour * 60 + minute;
                return slotMinutes >= currentMinutes;
            });

            if (!hasFutureSlot) {
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const year = tomorrow.getFullYear();
                const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                const day = String(tomorrow.getDate()).padStart(2, '0');
                const tomorrowStr = `${year}-${month}-${day}`;

                setFormData((prev) => ({
                    ...prev,
                    date: tomorrowStr,
                    time: '',
                }));
            }
        }
    }, [formData.date, todayDate, timeSlots]);

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

        if (name === 'date' || name === 'time' || name === 'guests') {
            setSelectedTable(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTable || !selectedTable.table_id) {
            alert('Vui lòng chọn bàn trên sơ đồ trước khi xác nhận.');
            return;
        }

        if (reservationType === 'simple') {
            try {
                const { data } = await axios.post('/api/reservations/deposit', {
                    date: formData.date,
                    time: formData.time,
                    guests: formData.guests,
                    name: formData.name,
                    phone: formData.phone,
                    notes: formData.notes,
                    userId,
                    tableId: selectedTable.table_id,
                    reservationType: 'simple',
                });

                setSelectedTable(null);

                navigate('/reservation-payment', {
                    state: {
                        reservation: data,
                    },
                });
            } catch (error) {
                console.error('Error submitting reservation:', error);
                alert(error.response?.data?.message || 'Đặt bàn thất bại. Vui lòng thử lại.');
            }
        } else {
            // Trường hợp 2: Đặt bàn & gọi món -> Mở popup chọn món (đã có bàn được chọn)
            setShowPreOrderPopup(true);
        }
    };

    const handlePreOrderSubmit = async (items) => {
        if (!selectedTable || !selectedTable.table_id) {
            alert('Vui lòng chọn bàn trên sơ đồ trước khi xác nhận.');
            return;
        }

        try {
            const preOrderItems = items.map((item) => ({
                dishId: item.id,
                quantity: item.qty,
            }));

            const { data } = await axios.post('/api/reservations/deposit', {
                date: formData.date,
                time: formData.time,
                guests: formData.guests,
                name: formData.name,
                phone: formData.phone,
                notes: formData.notes,
                userId,
                tableId: selectedTable.table_id,
                reservationType: 'pre-order',
                items: preOrderItems,
            });

            setShowPreOrderPopup(false);
            setSelectedTable(null);

            navigate('/reservation-payment', {
                state: {
                    reservation: data,
                },
            });
        } catch (error) {
            console.error('Error submitting reservation with pre-order:', error);
            alert(error.response?.data?.message || 'Đặt bàn & gọi món trước thất bại. Vui lòng thử lại.');
        }
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
                                <input type="date" id="date" name="date" value={formData.date} min={todayDate} onChange={handleChange} required className="form-control" />

                            </div>
                            <div className="form-group">
                                <label htmlFor="guests">Số lượng khách</label>
                                <input
                                    type="number"
                                    id="guests"
                                    name="guests"
                                    min="1"
                                    max="12"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Chọn giờ</label>
                            <div className="time-slots-grid">
                                {getFilteredTimeSlots().map(slot => (
                                    <button key={slot} type="button" className={`time-slot-btn ${formData.time === slot ? 'active' : ''}`} onClick={() => handleChange({ target: { name: 'time', value: slot } })}>
                                        {slot}
                                    </button>
                                ))}

                            </div>
                        </div>

                        <div className="form-group">
                            <label>Sơ đồ bàn</label>
                            <button
                                type="button"
                                className="table-map-open-btn"
                                onClick={() => setShowTableMapModal(true)}
                            >
                                Mở sơ đồ bàn
                            </button>
                            <div className="selected-table-summary">
                                {selectedTable ? (
                                    <span>Đã chọn bàn: {selectedTable.table_name}</span>
                                ) : (
                                    <span>Chưa chọn bàn. Vui lòng mở sơ đồ để chọn bàn phù hợp.</span>
                                )}
                            </div>
                        </div>

                        {/* --- Lựa chọn loại hình đặt bàn --- */}
                        <div className="form-group">
                            <label>Loại hình đặt bàn</label>
                            <div className="reservation-type-toggle">
                                <button type="button" className={reservationType === 'simple' ? 'active' : ''} onClick={() => setReservationType('simple')}>
                                    Chỉ đặt bàn
                                </button>
                                <button type="button" className={reservationType === 'pre-order' ? 'active' : ''} onClick={() => setReservationType('pre-order')}>
                                    Đặt bàn & Gọi món trước
                                </button>
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
                {showPreOrderPopup && (
                    <PreOrderPopup
                        onClose={() => setShowPreOrderPopup(false)}
                        onSubmit={handlePreOrderSubmit}
                    />
                )}
                {showTableMapModal && (
                    <div className="table-map-modal-overlay">
                        <div className="table-map-modal">
                            <div className="table-map-modal-header">
                                <h3>Chọn bàn trên sơ đồ</h3>
                                <button
                                    type="button"
                                    className="table-map-close-btn"
                                    onClick={() => setShowTableMapModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                            <div className="table-map-modal-body">
                                <ReservationTableMap
                                    date={formData.date}
                                    time={formData.time}
                                    guests={formData.guests}
                                    selectedTableId={selectedTable?.table_id || null}
                                    onSelectTable={setSelectedTable}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reservation;