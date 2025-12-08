import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';
import './SendPromotion.css';

const SendPromotion = () => {
    const { token } = useAuth();
    const { notify, confirm } = useNotification();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        code: '',
        discountPercent: '',
        validUntil: '',
        sendEmail: false,
        filterVip: false,
        minLoyaltyPoints: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            notify('Vui lòng nhập tiêu đề và nội dung.', 'warning');
            return;
        }

        const confirmed = await confirm({
            title: 'Xác nhận gửi khuyến mãi',
            message: `Bạn có chắc muốn gửi khuyến mãi "${formData.title}" cho tất cả khách hàng${formData.filterVip ? ' VIP' : ''}?`,
            confirmText: 'Gửi ngay',
            cancelText: 'Hủy',
            variant: 'default',
        });

        if (!confirmed) return;

        try {
            setLoading(true);
            setResult(null);

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                title: formData.title,
                message: formData.message,
                code: formData.code || null,
                discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : null,
                validUntil: formData.validUntil || null,
                sendEmail: formData.sendEmail,
                filter: {
                    isVip: formData.filterVip,
                    minLoyaltyPoints: formData.minLoyaltyPoints ? parseInt(formData.minLoyaltyPoints) : null,
                },
            };

            const { data } = await axios.post('/api/notifications/send-promotion', payload, config);

            setResult(data.results);
            notify(data.message, 'success');

            // Reset form
            setFormData({
                title: '',
                message: '',
                code: '',
                discountPercent: '',
                validUntil: '',
                sendEmail: false,
                filterVip: false,
                minLoyaltyPoints: '',
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi gửi khuyến mãi.';
            notify(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="send-promotion-page">
            <div className="promotion-header">
                <h2>Gửi Khuyến Mãi Hàng Loạt</h2>
                <p>Gửi thông báo khuyến mãi đến khách hàng qua web và email</p>
            </div>

            <form className="promotion-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>📢 Nội dung thông báo</h3>

                    <div className="form-group">
                        <label htmlFor="title">Tiêu đề <span className="required">*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="VD: Giảm 30% tất cả món ăn"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Nội dung chi tiết <span className="required">*</span></label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="VD: Nhân dịp khai trương chi nhánh mới, Mì Tinh Tế tri ân khách hàng với ưu đãi giảm 30% toàn bộ thực đơn..."
                            rows="4"
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>🎁 Thông tin khuyến mãi (tùy chọn)</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="code">Mã khuyến mãi</label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="VD: SALE30"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="discountPercent">% Giảm giá</label>
                            <input
                                type="number"
                                id="discountPercent"
                                name="discountPercent"
                                value={formData.discountPercent}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                placeholder="30"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="validUntil">Hạn sử dụng</label>
                            <input
                                type="date"
                                id="validUntil"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>🎯 Đối tượng nhận</h3>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="filterVip"
                                    checked={formData.filterVip}
                                    onChange={handleChange}
                                />
                                Chỉ khách hàng VIP
                            </label>
                        </div>

                        <div className="form-group">
                            <label htmlFor="minLoyaltyPoints">Điểm thưởng tối thiểu</label>
                            <input
                                type="number"
                                id="minLoyaltyPoints"
                                name="minLoyaltyPoints"
                                value={formData.minLoyaltyPoints}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>📧 Tùy chọn gửi</h3>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="sendEmail"
                                checked={formData.sendEmail}
                                onChange={handleChange}
                            />
                            Gửi email kèm theo (có thể mất thời gian nếu nhiều khách hàng)
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Đang gửi...' : '🚀 Gửi khuyến mãi'}
                    </button>
                </div>
            </form>

            {result && (
                <div className="result-box">
                    <h3>📊 Kết quả gửi</h3>
                    <div className="result-stats">
                        <div className="stat-item total">
                            <span className="stat-value">{result.total}</span>
                            <span className="stat-label">Tổng số khách</span>
                        </div>
                        <div className="stat-item success">
                            <span className="stat-value">{result.success}</span>
                            <span className="stat-label">Thành công</span>
                        </div>
                        <div className="stat-item failed">
                            <span className="stat-value">{result.failed}</span>
                            <span className="stat-label">Thất bại</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SendPromotion;
