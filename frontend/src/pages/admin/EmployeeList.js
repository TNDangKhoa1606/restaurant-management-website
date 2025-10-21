import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập
const employees = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@example.com', phone: '0912345678', role: 'Staff', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'thib@example.com', phone: '0987654321', role: 'Kitchen', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'vanc@example.com', phone: '0905123456', role: 'Cashier', status: 'inactive' },
    { id: 4, name: 'Phạm Thị D', email: 'thid@example.com', phone: '0334567890', role: 'Staff', status: 'active' },
];

const getRoleText = (role) => {
    switch (role) {
        case 'Admin': return 'Quản lý';
        case 'Staff': return 'Phục vụ';
        case 'Kitchen': return 'Bếp';
        case 'Cashier': return 'Thu ngân';
        default: return role;
    }
};

function EmployeeList() {
    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Danh sách nhân viên</h2>
                <div className="filters">
                    <input type="text" placeholder="Tìm kiếm nhân viên..." className="search-input" />
                    <select className="role-filter">
                        <option value="">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="cashier">Cashier</option>
                    </select>
                    <Link to="/admin/create-account" className="btn-admin btn-admin-primary">
                        Thêm nhân viên
                    </Link>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>{emp.name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.phone}</td>
                                <td>{getRoleText(emp.role)}</td>
                                <td>
                                    <span className={`status-badge ${emp.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                        {emp.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="action-btn btn-edit">Chỉnh sửa</button>
                                    <button className="action-btn btn-delete">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EmployeeList;