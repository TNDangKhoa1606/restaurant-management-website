import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';
import { useNotification } from '../common/NotificationContext';
import './ReviewModal.css';

const ReviewModal = ({ reservation, onClose, onSuccess }) => {
    const { token } = useAuth();
    const { notify } = useNotification();
    const [rating, setRating] = useState(reservation.review_rating || 5);
    const [comment, setComment] = useState(reservation.review_comment || '');
    const [submitting, setSubmitting] = useState(false);
    const isUpdate = !!reservation.has_review;

    const handleSubmit = async () => {
        if (!token) {
            notify('Vui lòng đăng nhập để đánh giá.', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/reviews/reservation', {
                reservationId: reservation.reservation_id,
                rating,
                comment: comment || null,
            }, config);

            notify(data.message || 'Cảm ơn bạn đã đánh giá dịch vụ!', 'success');
            onSuccess?.(rating, comment);
            onClose();
        } catch (error) {
            console.error('Review submit error:', error);
            notify(error.response?.data?.message || 'Không thể lưu đánh giá.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal">
                <div className="review-modal-header">
                    <h3>{isUpdate ? 'Cập nhật đánh giá' : 'Đánh giá dịch vụ'} - Đặt bàn #{reservation.reservation_id}</h3>
                    <button className="review-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="review-modal-body">
                    <div className="review-item">
                        <div className="review-item-name">
                            Bàn: {reservation.table_name || 'N/A'} - {reservation.number_of_people} khách
                        </div>

                        <div className="review-rating">
                            <label>Đánh giá dịch vụ:</label>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        className={`star ${rating >= star ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        type="button"
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <span className="rating-value">{rating}/5</span>
                        </div>

                        <div className="review-comment">
                            <label>Nhận xét:</label>
                            <textarea
                                placeholder="Chia sẻ cảm nhận của bạn về dịch vụ nhà hàng..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="4"
                            />
                        </div>
                    </div>
                </div>

                <div className="review-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Hủy</button>
                    <button
                        className="btn-submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang lưu...' : (isUpdate ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
