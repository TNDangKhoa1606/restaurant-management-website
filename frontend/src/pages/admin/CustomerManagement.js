import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/AuthContext';
import { useNotification } from '../../components/common/NotificationContext';

const getTagInfo = (tag) => {
    switch (tag) {
        case 'VIP':
            return { text: 'VIP', className: 'status-confirmed' };
        case 'Regular':
            return { text: 'Thân thiết', className: 'status-active' };
        case 'New':
            return { text: 'Mới', className: 'status-pending' };
        default:
            return { text: tag, className: '' };
    }
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const { token, loading: authLoading } = useAuth();
    const { confirm } = useNotification();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const timerId = setTimeout(() => {
            const fetchCustomers = async () => {
                setLoading(true);
                try {
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    };
                    const { data } = await axios.get(`/api/users/customers?keyword=${searchTerm}&tag=${tagFilter}`, config);
                    setCustomers(data);
                } catch (err) {
                    setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng.');
                } finally {
                    setLoading(false);
                }
            };
            
            if (!authLoading && token) {
                fetchCustomers();
            } else if (!authLoading && !token) {
                setLoading(false);
                setError("Vui lòng đăng nhập để xem dữ liệu.");
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [token, searchTerm, tagFilter, authLoading]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, tagFilter]);

    const handleAction = (action, customerId) => {
        alert(`Thực hiện: ${action} cho khách hàng ID ${customerId}`);
    };

    const handleViewHistory = (customerId) => {
        navigate(`/admin/customer-history/${customerId}`);
    };

    const handleDelete = async (customerId) => {
        const confirmed = await confirm({
            title: 'Xóa khách hàng',
            message: 'Bạn có chắc chắn muốn xóa khách hàng này không? Tất cả đơn hàng và lịch sử liên quan cũng có thể bị ảnh hưởng. Hành động này không thể hoàn tác.',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            // Sử dụng API xóa người dùng đã có
            await axios.delete(`/api/users/${customerId}`, config);

            // Cập nhật lại danh sách trên UI
            setCustomers(customers.filter(c => c.id !== customerId));
            alert('Xóa khách hàng thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa khách hàng.');
        }
    };

    if (loading) {
        return <div className="admin-list-container">Đang tải danh sách khách hàng...</div>;
    }

    if (error) {
        return <div className="admin-list-container alert alert-danger">{error}</div>;
    }

    const totalItems = customers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedCustomers = customers.slice(startIndex, startIndex + pageSize);

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Khách hàng</h2>
                <div className="filters">
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, email, SĐT..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select className="role-filter" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                        <option value="">Tất cả hạng</option>
                        <option value="VIP">VIP</option>
                        <option value="Regular">Thân thiết</option>
                        <option value="New">Mới</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Ngày tham gia</th>
                            <th>Tổng chi tiêu</th>
                            <th>Hạng</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length > 0 ? paginatedCustomers.map(customer => {
                            const tagInfo = getTagInfo(customer.tag);
                            return (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{formatDate(customer.joinDate)}</td>
                                    <td>{formatPrice(customer.totalSpent)}</td>
                                    <td><span className={`status-badge ${tagInfo.className}`}>{tagInfo.text}</span></td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleViewHistory(customer.id)} className="action-btn btn-edit">Lịch sử</button>
                                        <button onClick={() => handleAction('Gửi ưu đãi', customer.id)} className="action-btn btn-confirm">Gửi ưu đãi</button>
                                        <button onClick={() => handleDelete(customer.id)} className="action-btn btn-delete">Xóa</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>Không có khách hàng nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {customers.length > 0 && (
                    <div className="admin-pagination">
                        <div className="admin-pagination-info">
                            Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} trên {totalItems} kết quả
                        </div>
                        <div className="admin-pagination-controls">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={safeCurrentPage === 1}
                            >
                                Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={safeCurrentPage === index + 1 ? 'active' : ''}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={safeCurrentPage === totalPages}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerManagement;