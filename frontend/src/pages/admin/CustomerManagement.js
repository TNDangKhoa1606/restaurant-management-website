import React from 'react';

// --- Dữ liệu giả lập ---
const customers = [
    { id: 1, name: 'Nguyễn Văn An', email: 'nguyen.an@example.com', phone: '0911111111', joinDate: '2023-01-15', totalSpent: 5250000, tag: 'VIP' },
    { id: 2, name: 'Trần Thị Bình', email: 'tran.binh@example.com', phone: '0922222222', joinDate: '2023-03-20', totalSpent: 3800000, tag: 'Regular' },
    { id: 3, name: 'Lê Hoàng Cường', email: 'le.cuong@example.com', phone: '0933333333', joinDate: '2023-05-10', totalSpent: 1500000, tag: 'Regular' },
    { id: 4, name: 'Phạm Thị Dung', email: 'pham.dung@example.com', phone: '0944444444', joinDate: '2023-08-01', totalSpent: 850000, tag: 'New' },
];

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

function CustomerManagement() {

    const handleAction = (action, customerId) => {
        alert(`Thực hiện: ${action} cho khách hàng ID ${customerId}`);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Khách hàng</h2>
                <div className="filters">
                    <input type="text" placeholder="Tìm theo tên, email, SĐT..." className="search-input" />
                    <select className="role-filter">
                        <option value="">Tất cả hạng</option>
                        <option value="vip">VIP</option>
                        <option value="regular">Thân thiết</option>
                        <option value="new">Mới</option>
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
                        {customers.map(customer => {
                            const tagInfo = getTagInfo(customer.tag);
                            return (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.joinDate}</td>
                                    <td>{formatPrice(customer.totalSpent)}</td>
                                    <td><span className={`status-badge ${tagInfo.className}`}>{tagInfo.text}</span></td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleAction('Xem lịch sử', customer.id)} className="action-btn btn-edit">Lịch sử</button>
                                        <button onClick={() => handleAction('Gửi ưu đãi', customer.id)} className="action-btn btn-confirm">Gửi ưu đãi</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CustomerManagement;