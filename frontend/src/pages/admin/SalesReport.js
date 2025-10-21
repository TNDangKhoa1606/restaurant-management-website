import React from 'react';

// --- Dữ liệu giả lập ---
const topSellingItems = [
    { id: 1, name: 'Phở Bò Tái', quantity: 150, revenue: 7500000 },
    { id: 2, name: 'Cơm Rang Dưa Bò', quantity: 120, revenue: 6600000 },
    { id: 3, name: 'Bún Chả Hà Nội', quantity: 95, revenue: 4275000 },
];

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function SalesReport() {

    const handleExport = (format) => {
        alert(`Xuất báo cáo dưới dạng ${format}...`);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Thống kê doanh số</h2>
                <div className="filters">
                    <input type="date" className="date-filter" />
                    <select className="role-filter">
                        <option value="">Chọn tháng</option>
                        {/* Thêm 12 tháng */}
                    </select>
                    <select className="role-filter">
                        <option value="">Chọn năm</option>
                        {/* Thêm các năm */}
                    </select>
                    <button onClick={() => handleExport('PDF')} className="btn-admin btn-admin-secondary">Xuất PDF</button>
                    <button onClick={() => handleExport('Excel')} className="btn-admin btn-admin-secondary">Xuất Excel</button>
                </div>
            </div>

            {/* Biểu đồ doanh thu */}
            <div className="chart-container" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: 'var(--admin-shadow)', marginBottom: '25px' }}>
                <h3>Biểu đồ doanh thu</h3>
                <div className="chart-placeholder">[Line Chart]</div>
            </div>

            {/* Danh sách top món bán chạy */}
            <div className="admin-table-container">
                <h3>Top món bán chạy</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên món</th>
                            <th>Số lượng bán</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topSellingItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{formatPrice(item.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SalesReport;