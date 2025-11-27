import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

function SalesReport() {
    const { token, user } = useAuth();
    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';

    const [filters, setFilters] = useState({
        from: '',
        to: '',
    });

    const [summary, setSummary] = useState({ total_orders: 0, total_revenue: 0 });
    const [topDishes, setTopDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReport = useCallback(async () => {
        if (!token || !isAdmin) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    from: filters.from || undefined,
                    to: filters.to || undefined,
                },
            };
            const { data } = await axios.get('/api/reports/sales', config);
            setSummary(data.summary || { total_orders: 0, total_revenue: 0 });
            setTopDishes(data.top_dishes || []);
            setError('');
        } catch (err) {
            console.error('Không thể tải báo cáo doanh số:', err);
            setError(err.response?.data?.message || 'Không thể tải báo cáo doanh số.');
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin, filters]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilter = () => {
        fetchReport();
    };

    if (!isAdmin) {
        return (
            <div className="admin-list-container">
                <div className="admin-page-header">
                    <h2 className="admin-page-title">Thống kê doanh số</h2>
                </div>
                <p>Bạn không có quyền truy cập báo cáo này.</p>
            </div>
        );
    }

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Thống kê doanh số</h2>
                <div className="filters">
                    <input
                        type="date"
                        className="date-filter"
                        name="from"
                        value={filters.from}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="date"
                        className="date-filter"
                        name="to"
                        value={filters.to}
                        onChange={handleFilterChange}
                    />
                    <button onClick={handleApplyFilter} className="btn-admin btn-admin-primary">
                        Áp dụng
                    </button>
                </div>
            </div>

            {loading && <p>Đang tải báo cáo...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <>
                    {/* Tổng quan doanh thu */}
                    <div
                        className="chart-container"
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: 'var(--admin-shadow)',
                            marginBottom: '25px',
                        }}
                    >
                        <h3>Tổng quan</h3>
                        <p>Tổng số đơn hoàn thành: <strong>{summary.total_orders}</strong></p>
                        <p>Tổng doanh thu: <strong>{formatPrice(summary.total_revenue)}</strong></p>
                        <div className="chart-placeholder">[Line Chart - demo]
                            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                                (Biểu đồ sẽ thể hiện doanh thu theo ngày dựa trên dữ liệu thật từ DB.)
                            </p>
                        </div>
                    </div>

                    {/* Danh sách top món bán chạy */}
                    <div className="admin-table-container">
                        <h3>Top món bán chạy</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Món ăn</th>
                                    <th>Số lượng bán</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topDishes.length > 0 ? (
                                    topDishes.map((item) => (
                                        <tr key={item.dish_id}>
                                            <td>{item.dish_name}</td>
                                            <td>{item.total_quantity}</td>
                                            <td>{formatPrice(item.revenue)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>
                                            Chưa có dữ liệu đơn hàng hoàn thành trong khoảng thời gian đã chọn.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default SalesReport;