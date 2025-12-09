import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useCurrency } from '../../components/common/CurrencyContext';
import './Dashboard.css';

const StatCard = ({ value, label, emoji, color, loading }) => (
    <div className={`stat-card ${color}`}>
        <div className="stat-emoji">
            {emoji}
        </div>
        <div className="stat-info">
            <p className="stat-value">{loading ? '...' : value}</p>
            <p className="stat-label">{label}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { token, user } = useAuth();
    const { formatPrice } = useCurrency();
    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';

    const [filters, setFilters] = useState({ from: '', to: '' });
    const [summary, setSummary] = useState({ total_orders: 0, total_revenue: 0 });
    const [topDishes, setTopDishes] = useState([]);
    const [todayStats, setTodayStats] = useState({ orders: 0, revenue: 0, reservations: 0, tables: { occupied: 0, total: 0 } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch báo cáo theo filter
    const fetchReport = useCallback(async () => {
        if (!token || !isAdmin) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { from: filters.from || undefined, to: filters.to || undefined },
            };
            const { data } = await axios.get('/api/reports/sales', config);
            setSummary(data.summary || { total_orders: 0, total_revenue: 0 });
            setTopDishes(data.top_dishes || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải báo cáo.');
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin, filters]);

    // Fetch thống kê hôm nay
    const fetchTodayStats = useCallback(async () => {
        if (!token || !isAdmin) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const today = new Date().toLocaleDateString('sv-SE');

            // Gọi song song các API
            const [ordersRes, reservationsRes, tablesRes] = await Promise.all([
                axios.get('/api/reports/sales', { ...config, params: { from: today, to: today } }),
                axios.get('/api/reservations', { ...config, params: { date: today } }),
                axios.get('/api/tables/floors', config),
            ]);

            const orderData = ordersRes.data.summary || { total_orders: 0, total_revenue: 0 };
            const reservations = reservationsRes.data || [];
            const floors = tablesRes.data || [];

            // Đếm bàn
            let totalTables = 0;
            let occupiedTables = 0;
            floors.forEach(floor => {
                (floor.elements || []).forEach(table => {
                    totalTables++;
                    if (table.status === 'occupied') occupiedTables++;
                });
            });

            setTodayStats({
                orders: orderData.total_orders,
                revenue: orderData.total_revenue,
                reservations: reservations.length,
                tables: { occupied: occupiedTables, total: totalTables },
            });
        } catch (err) {
            console.error('Không thể tải thống kê hôm nay:', err);
        }
    }, [token, isAdmin]);

    useEffect(() => {
        fetchReport();
        fetchTodayStats();
    }, [fetchReport, fetchTodayStats]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilter = () => {
        fetchReport();
    };

    if (!isAdmin) {
        return (
            <div className="dashboard-container">
                <p>Bạn không có quyền truy cập trang này.</p>
            </div>
        );
    }

    const stats = [
        { value: formatPrice(todayStats.revenue), label: 'Doanh thu (hoàn thành)', emoji: '💰', color: 'blue' },
        { value: todayStats.orders.toString(), label: 'Đơn hoàn thành', emoji: '📦', color: 'green' },
        { value: `${todayStats.tables.occupied}/${todayStats.tables.total}`, label: 'Bàn phục vụ', emoji: '🍽️', color: 'orange' },
        { value: todayStats.reservations.toString(), label: 'Đặt bàn hôm nay', emoji: '📅', color: 'purple' },
    ];

    return (
        <div className="dashboard-container">
            {/* Thống kê hôm nay */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} loading={loading} />
                ))}
            </div>

            {/* Bộ lọc thời gian */}
            <div className="dashboard-filters">
                <h3>Báo cáo doanh số</h3>
                <div className="filter-controls">
                    <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className="date-filter" />
                    <span>đến</span>
                    <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className="date-filter" />
                    <button onClick={handleApplyFilter} className="btn-admin btn-admin-primary">Áp dụng</button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Tổng quan thu gọn */}
            <div className="summary-compact">
                <div className="summary-compact-item">
                    <i className="fas fa-shopping-bag"></i>
                    <span className="summary-compact-value">{loading ? '...' : summary.total_orders}</span>
                    <span className="summary-compact-label">đơn</span>
                </div>
                <div className="summary-compact-divider"></div>
                <div className="summary-compact-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <span className="summary-compact-value">{loading ? '...' : formatPrice(summary.total_revenue)}</span>
                    <span className="summary-compact-label">doanh thu</span>
                </div>
            </div>

            {/* Bảng Top món bán chạy - Thiết kế bắt mắt */}
            <div className="top-dishes-section">
                <div className="section-header">
                    <h3><i className="fas fa-trophy"></i> Bảng xếp hạng món bán chạy</h3>
                </div>
                {loading ? (
                    <p className="loading-text">Đang tải...</p>
                ) : topDishes.length > 0 ? (
                    <div className="top-dishes-grid">
                        {topDishes.map((dish, index) => (
                            <div key={dish.dish_id} className={`top-dish-card rank-${index + 1}`}>
                                <div className="rank-badge">
                                    {index === 0 && <i className="fas fa-crown"></i>}
                                    {index === 1 && <i className="fas fa-medal"></i>}
                                    {index === 2 && <i className="fas fa-award"></i>}
                                    {index > 2 && <span>#{index + 1}</span>}
                                </div>
                                <div className="dish-info">
                                    <h4 className="dish-name">{dish.dish_name}</h4>
                                    <div className="dish-stats">
                                        <span className="dish-quantity"><i className="fas fa-fire"></i> {dish.total_quantity} phần</span>
                                        <span className="dish-revenue"><i className="fas fa-coins"></i> {formatPrice(dish.revenue)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Chưa có dữ liệu đơn hàng hoàn thành</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;