import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu liên hệ đã gửi:", formData);
        alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); // Reset form
    };

    return (
        <section className="contact-page-section">
            <div className="contact-container">
                {/* Cột trái: Thông tin liên hệ */}
                <div className="contact-info-column">
                    <div className="contact-info-inner">
                        <h3 className="contact-title">Liên Hệ</h3>
                        <p>Chúng tôi luôn trân trọng mọi ý kiến của quý khách, ý kiến từ quý khách sẽ giúp chúng tôi nâng cao về chất lượng phục vụ. Chính quý khách cũng góp phần vào sự thành công và phát triển thương hiệu của chúng tôi.</p>
                        <div className="contact-details">
                            <p><strong>Địa chỉ:</strong> 732/21 Đường Second, Manchester, Anh</p>
                            <p><strong>Email:</strong> contact@noodles.com</p>
                            <p><strong>SĐT:</strong> +65.4566743</p>
                            <p><strong>Website:</strong> www.noodles-restaurant.com</p>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Form liên hệ */}
                <div className="contact-form-column">
                    <div className="contact-form-inner">
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên của bạn..." required />
                            </div>
                            <div className="form-group">
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Địa chỉ email..." required />
                            </div>
                            <div className="form-group">
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại..." required />
                            </div>
                            <div className="form-group">
                                <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Mục đích liên hệ..." required />
                            </div>
                            <div className="form-group">
                                <textarea name="message" value={formData.message} rows="6" onChange={handleChange} placeholder="Nội dung chi tiết..." required></textarea>
                            </div>
                            <button type="submit" className="btn-submit-contact">Gửi liên hệ</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;