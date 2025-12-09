import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';
import './ReviewManagement.css';

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

const ReviewManagement = () => {
    const { token } = useAuth();
    const { notify } = useNotification();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const fetchReviews = useCallback(async (page = 1) => {
        if (!token) return;

        setLoading(true);
        try {
            const { data } = await axios.get(`/api/reviews?page=${page}&limit=10`);
            setReviews(data.reviews || []);
            setAvgRating(data.avgRating || 0);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error('Fetch reviews error:', error);
            notify('Không thể tải danh sách đánh giá.', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, notify]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        fetchReviews(newPage);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Đánh giá dịch vụ</h2>
                <div className="review-summary">
                    <span className="avg-rating-badge">
                        ⭐ Trung bình: <strong>{avgRating}</strong>/5
                    </span>
                    <span className="total-reviews">
                        Tổng: <strong>{pagination.total}</strong> đánh giá
                    </span>
                </div>
            </div>

            {loading ? (
                <p>Đang tải danh sách đánh giá...</p>
            ) : reviews.length === 0 ? (
                <p>Chưa có đánh giá nào.</p>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Đặt bàn</th>
                                    <th>Bàn</th>
                                    <th>Ngày đặt</th>
                                    <th>Đánh giá</th>
                                    <th>Nhận xét</th>
                                    <th>Ngày gửi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review.review_id}>
                                        <td>{review.review_id}</td>
                                        <td>{review.user_name || 'Ẩn danh'}</td>
                                        <td>#{review.reservation_id}</td>
                                        <td>{review.table_name || 'N/A'}</td>
                                        <td>{review.res_date || 'N/A'}</td>
                                        <td>
                                            <span className={`rating-stars rating-${review.rating}`}>
                                                {renderStars(review.rating)}
                                            </span>
                                            <span className="rating-number">({review.rating}/5)</span>
                                        </td>
                                        <td className="comment-cell">
                                            {review.comment || <em className="no-comment">Không có nhận xét</em>}
                                        </td>
                                        <td>{formatDate(review.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                ← Trước
                            </button>
                            <span>
                                Trang {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewManagement;
