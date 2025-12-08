import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';
import { io } from 'socket.io-client';
import './NotificationPage.css';

const NotificationPage = () => {
    const { token } = useAuth();
    const { notify } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const fetchNotifications = useCallback(async (page = 1) => {
        if (!token) return;

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/api/notifications?page=${page}&limit=20`, config);
            setNotifications(data.notifications || []);
            setPagination(data.pagination || { page: 1, totalPages: 1 });
        } catch (error) {
            console.error('Fetch notifications error:', error);
            notify('Không thể tải thông báo.', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, notify]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket real-time
    useEffect(() => {
        if (!token) return;

        const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
        });

        socket.on('new_notification', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            notify(notification.title, 'info');
        });

        return () => {
            socket.disconnect();
        };
    }, [token, notify]);

    const handleMarkAsRead = async (notifId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/notifications/${notifId}/read`, {}, config);
            setNotifications((prev) =>
                prev.map((n) => (n.notif_id === notifId ? { ...n, is_read: 1 } : n))
            );
        } catch (error) {
            notify('Không thể đánh dấu đã đọc.', 'error');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put('/api/notifications/read-all', {}, config);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
            notify('Đã đánh dấu tất cả đã đọc.', 'success');
        } catch (error) {
            notify('Không thể đánh dấu tất cả đã đọc.', 'error');
        }
    };

    const handleDelete = async (notifId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/notifications/${notifId}`, config);
            setNotifications((prev) => prev.filter((n) => n.notif_id !== notifId));
            notify('Đã xóa thông báo.', 'success');
        } catch (error) {
            notify('Không thể xóa thông báo.', 'error');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_status':
                return '🛒';
            case 'reservation':
                return '🍽️';
            case 'promotion':
                return '🎉';
            case 'loyalty':
                return '⭐';
            default:
                return '🔔';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    if (loading) {
        return (
            <div className="notification-page">
                <div className="notification-loading">Đang tải thông báo...</div>
            </div>
        );
    }

    return (
        <div className="notification-page">
            <div className="notification-header">
                <h2>Thông báo</h2>
                {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                        Đánh dấu tất cả đã đọc ({unreadCount})
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="notification-empty">
                    <span className="empty-icon">🔔</span>
                    <p>Bạn chưa có thông báo nào.</p>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map((notif) => (
                        <div
                            key={notif.notif_id}
                            className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notif.type)}
                            </div>
                            <div className="notification-content">
                                <h4 className="notification-title">{notif.title}</h4>
                                <p className="notification-message">{notif.message}</p>
                                <span className="notification-time">
                                    {formatDate(notif.created_at)}
                                </span>
                            </div>
                            <div className="notification-actions">
                                {!notif.is_read && (
                                    <button
                                        className="action-btn read-btn"
                                        onClick={() => handleMarkAsRead(notif.notif_id)}
                                        title="Đánh dấu đã đọc"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(notif.notif_id)}
                                    title="Xóa"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="notification-pagination">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => fetchNotifications(pagination.page - 1)}
                    >
                        ← Trước
                    </button>
                    <span>
                        Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchNotifications(pagination.page + 1)}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
