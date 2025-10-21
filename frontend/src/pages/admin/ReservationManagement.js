import React from 'react';

// --- Dữ liệu giả lập ---
const reservations = [
    { id: 1, guestName: 'Nguyễn Văn An', guestPhone: '0911111111', resDate: '2023-11-20', resTime: '19:00', people: 4, status: 'pending', table: 'Chưa xếp' },
    { id: 2, guestName: 'Trần Thị Bình', guestPhone: '0922222222', resDate: '2023-11-20', resTime: '19:30', people: 2, status: 'confirmed', table: 'Bàn 2' },
    { id: 3, guestName: 'Lê Hoàng Cường', guestPhone: '0933333333', resDate: '2023-11-21', resTime: '12:00', people: 5, status: 'pending', table: 'Chưa xếp' },
    { id: 4, guestName: 'Phạm Thị Dung', guestPhone: '0944444444', resDate: '2023-11-21', resTime: '20:00', people: 3, status: 'cancelled', table: '-' },
    { id: 5, guestName: 'Võ Minh Hải', guestPhone: '0955555555', resDate: '2023-11-22', resTime: '18:00', people: 6, status: 'completed', table: 'Bàn 5' },
];

const getStatusInfo = (status) => {
    switch (status) {
        case 'pending':
            return { text: 'Chờ xác nhận', className: 'status-pending' };
        case 'confirmed':
            return { text: 'Đã xác nhận', className: 'status-confirmed' };
        case 'cancelled':
            return { text: 'Đã hủy', className: 'status-cancelled' };
        case 'completed':
            return { text: 'Hoàn thành', className: 'status-completed' };
        default:
            return { text: status, className: '' };
    }
};

function ReservationManagement() {

    const handleAction = (action, reservationId) => {
        alert(`Thực hiện: ${action} cho đặt bàn ID ${reservationId}`);
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Đặt bàn</h2>
                <div className="filters">
                    <input type="date" className="date-filter" defaultValue={new Date().toISOString().substring(0, 10)} />
                    <select className="role-filter">
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <button onClick={() => handleAction('Đặt bàn hộ khách')} className="btn-admin btn-admin-primary">
                        Đặt bàn hộ khách
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên khách</th>
                            <th>SĐT</th>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Số người</th>
                            <th>Bàn</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(res => {
                            const statusInfo = getStatusInfo(res.status);
                            return (
                                <tr key={res.id}>
                                    <td>{res.guestName}</td>
                                    <td>{res.guestPhone}</td>
                                    <td>{res.resDate}</td>
                                    <td>{res.resTime}</td>
                                    <td>{res.people}</td>
                                    <td>{res.table}</td>
                                    <td>
                                        <span className={`status-badge ${statusInfo.className}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {res.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAction('Xác nhận', res.id)} className="action-btn btn-confirm">Xác nhận</button>
                                                <button onClick={() => handleAction('Hủy', res.id)} className="action-btn btn-delete">Hủy</button>
                                            </>
                                        )}
                                        {res.status === 'confirmed' && (
                                            <button onClick={() => handleAction('Check-in', res.id)} className="action-btn btn-checkin">Check-in</button>
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

export default ReservationManagement;