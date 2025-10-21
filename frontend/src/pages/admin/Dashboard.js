import React from 'react';
import './Dashboard.css';

// --- Dữ liệu mẫu ---
const stats = [
    {
        value: '15.200.000đ',
        label: 'Doanh thu hôm nay',
        icon: 'fas fa-dollar-sign',
        color: 'blue'
    },
    {
        value: '12',
        label: 'Đơn hàng mới',
        icon: 'fas fa-receipt',
        color: 'green'
    },
    {
        value: '8 / 10',
        label: 'Bàn đang phục vụ',
        icon: 'fas fa-chair',
        color: 'orange'
    },
    {
        value: '5',
        label: 'Lượt đặt bàn hôm nay',
        icon: 'fas fa-calendar-check',
        color: 'purple'
    }
];

const recentActivities = [
    { id: 'DH-12350', type: 'delivery', user: 'Trần Thị Bình', time: '5 phút trước', status: 'Đang chuẩn bị' },
    { id: 'Bàn 5', type: 'reservation', user: 'Nguyễn Văn An', time: '10 phút trước', status: 'Đã xác nhận' },
    { id: 'DH-12349', type: 'dine-in', user: 'Khách tại bàn 2', time: '12 phút trước', status: 'Hoàn thành' },
];
// --- Kết thúc dữ liệu mẫu ---

const StatCard = ({ value, label, icon, color }) => (
    <div className={`stat-card ${color}`}>
        <div className="stat-icon">
            <i className={icon}></i>
        </div>
        <div className="stat-info">
            <p className="stat-value">{value}</p>
            <p className="stat-label">{label}</p>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            {/* Hàng chứa các thẻ thống kê */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Hàng chứa các biểu đồ và hoạt động gần đây */}
            <div className="dashboard-main-grid">
                {/* Biểu đồ doanh thu (placeholder) */}
                <div className="chart-container">
                    <h3>Biểu đồ doanh thu (7 ngày gần nhất)</h3>
                    <div className="chart-placeholder">
                        <p>Biểu đồ sẽ được hiển thị ở đây</p>
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                <div className="recent-activity-container">
                    <h3>Hoạt động gần đây</h3>
                    <ul className="activity-list">
                        {recentActivities.map((activity, index) => (
                            <li key={index} className="activity-item">
                                <div className={`activity-icon ${activity.type}`}>
                                    {activity.type === 'delivery' && <i className="fas fa-truck"></i>}
                                    {activity.type === 'reservation' && <i className="fas fa-calendar-alt"></i>}
                                    {activity.type === 'dine-in' && <i className="fas fa-utensils"></i>}
                                </div>
                                <div className="activity-details">
                                    <p><strong>{activity.id}</strong> - {activity.user}</p>
                                    <span>{activity.time} - <span className={`status-badge status-${activity.status.toLowerCase().replace(/ /g, '-')}`}>{activity.status}</span></span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;