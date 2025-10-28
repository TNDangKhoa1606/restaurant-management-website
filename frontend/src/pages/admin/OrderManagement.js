import React from 'react';

// --- Dữ liệu giả lập ---
const orders = [
    { id: 'DH-12350', customerName: 'Trần Thị Bình', orderDate: '2023-11-22', totalAmount: 250000, status: 'preparing', type: 'delivery' },
    { id: 'DH-12349', customerName: 'Khách tại bàn 2', orderDate: '2023-11-22', totalAmount: 150000, status: 'completed', type: 'dine-in' },
    { id: 'DH-12348', customerName: 'Nguyễn Văn An', orderDate: '2023-11-21', totalAmount: 300000, status: 'completed', type: 'pickup' },
    { id: 'DH-12347', customerName: 'Lê Hoàng Cường', orderDate: '2023-11-21', totalAmount: 55000, status: 'cancelled', type: 'delivery' },
    { id: 'DH-12346', customerName: 'Phạm Thị Dung', orderDate: '2023-11-20', totalAmount: 450000, status: 'completed', type: 'dine-in' },
];

const getStatusInfo = (status) => {
    switch (status) {
        case 'preparing':
            return { text: 'Đang chuẩn bị', className: 'status-pending' };
        case 'completed':
            return { text: 'Hoàn thành', className: 'status-completed' };
        case 'cancelled':
            return { text: 'Đã hủy', className: 'status-cancelled' };
        default:
            return { text: status, className: '' };
    }
};

const getTypeInfo = (type) => {
    switch (type) {
        case 'dine-in':
            return 'Tại bàn';
        case 'delivery':
            return 'Giao hàng';
        case 'pickup':
            return 'Lấy tại quán';
        default:
            return type;
    }
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function OrderManagement() {

    const handleAction = (action, orderId) => {
        alert(`Thực hiện: ${action} cho đơn hàng ${orderId}`);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Đơn hàng</h2>
                <div className="filters">
                    <input type="text" placeholder="Tìm theo mã đơn, tên khách..." className="search-input" />
                    <select className="role-filter">
                        <option value="">Tất cả trạng thái</option>
                        <option value="preparing">Đang chuẩn bị</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <select className="role-filter">
                        <option value="">Loại đơn hàng</option>
                        <option value="dine-in">Tại bàn</option>
                        <option value="delivery">Giao hàng</option>
                        <option value="pickup">Lấy tại quán</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Tên khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Loại đơn</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.orderDate}</td>
                                    <td>{formatPrice(order.totalAmount)}</td>
                                    <td>{getTypeInfo(order.type)}</td>
                                    <td>
                                        <span className={`status-badge ${statusInfo.className}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleAction('Xem chi tiết', order.id)} className="action-btn btn-edit">Chi tiết</button>
                                        {order.status === 'preparing' && (
                                            <button onClick={() => handleAction('Hủy đơn', order.id)} className="action-btn btn-delete">Hủy</button>
                                        )}
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

export default OrderManagement;