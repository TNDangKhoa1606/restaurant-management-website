import React from 'react';

// --- Dữ liệu giả lập ---
const shifts = [
    {
        id: 1,
        name: 'Ca Sáng',
        startTime: '08:00',
        endTime: '16:00',
        employees: [
            { name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=a' },
            { name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=b' }
        ],
        notes: 'Kiểm tra kho đầu ca.'
    },
    {
        id: 2,
        name: 'Ca Tối',
        startTime: '16:00',
        endTime: '23:00',
        employees: [
            { name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=c' },
            { name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=d' }
        ],
        notes: 'Dọn dẹp cuối ngày.'
    },
];

function ShiftManagement() {

    const handleAddShift = () => {
        // Logic để mở modal sẽ được thêm ở đây
        alert('Mở modal thêm ca làm việc!');
    };

    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý ca làm việc</h2>
                <div className="filters">
                    {/* Bộ lọc theo ngày/tuần sẽ được thêm logic sau */}
                    <input type="date" className="date-filter" />
                    <button className="btn-admin btn-admin-secondary">Tuần này</button>
                    <button onClick={handleAddShift} className="btn-admin btn-admin-primary">
                        Thêm ca
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên ca</th>
                            <th>Giờ bắt đầu</th>
                            <th>Giờ kết thúc</th>
                            <th>Nhân viên</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map(shift => (
                            <tr key={shift.id}>
                                <td>{shift.name}</td>
                                <td>{shift.startTime}</td>
                                <td>{shift.endTime}</td>
                                <td className="employee-avatar-group">
                                    {shift.employees.map(emp => <img key={emp.name} src={emp.avatar} alt={emp.name} title={emp.name} />)}
                                </td>
                                <td>{shift.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ShiftManagement;