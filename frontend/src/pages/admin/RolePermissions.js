import React, { useState } from 'react';

// --- Dữ liệu giả lập ---
const roles = [
    { id: 'admin', name: 'Quản lý (Admin)' },
    { id: 'staff', name: 'Nhân viên phục vụ (Staff)' },
    { id: 'kitchen', name: 'Bếp (Kitchen)' },
    { id: 'cashier', name: 'Thu ngân (Cashier)' },
];

const allPermissions = [
    { id: 'view_dashboard', label: 'Xem Dashboard' },
    { id: 'manage_employees', label: 'Quản lý nhân viên (Thêm, sửa, xóa)' },
    { id: 'manage_permissions', label: 'Quản lý phân quyền' },
    { id: 'manage_menu', label: 'Quản lý thực đơn' },
    { id: 'manage_tables', label: 'Quản lý bàn ăn' },
    { id: 'manage_inventory', label: 'Quản lý kho' },
    { id: 'view_reports', label: 'Xem thống kê, báo cáo' },
    { id: 'create_order', label: 'Tạo đơn hàng mới' },
    { id: 'process_payment', label: 'Thực hiện thanh toán' },
];

const initialRolePermissions = {
    admin: ['view_dashboard', 'manage_employees', 'manage_permissions', 'manage_menu', 'manage_tables', 'manage_inventory', 'view_reports'],
    staff: ['create_order', 'manage_tables'],
    kitchen: ['manage_inventory'],
    cashier: ['process_payment', 'view_reports'],
};
// --- Kết thúc dữ liệu giả lập ---

function RolePermissions() {
    const [selectedRole, setSelectedRole] = useState(roles[0].id);
    const [permissions, setPermissions] = useState(initialRolePermissions);

    const handlePermissionChange = (permissionId) => {
        const currentPermissions = permissions[selectedRole] || [];
        const newPermissions = currentPermissions.includes(permissionId)
            ? currentPermissions.filter(p => p !== permissionId)
            : [...currentPermissions, permissionId];

        setPermissions({
            ...permissions,
            [selectedRole]: newPermissions,
        });
    };

    const handleSaveChanges = () => {
        console.log('Saving changes:', permissions);
        // Logic gửi dữ liệu `permissions` lên backend sẽ ở đây
        alert('Đã lưu thay đổi (xem console để biết chi tiết)!');
    };

    return (
        <div className="role-permissions-container">
            <div className="role-permissions-grid">
                {/* Cột danh sách vai trò */}
                <div className="role-list">
                    <h4>Chọn vai trò</h4>
                    <ul>
                        {roles.map(role => (
                            <li key={role.id} className={selectedRole === role.id ? 'active' : ''} onClick={() => setSelectedRole(role.id)}>
                                {role.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cột danh sách quyền */}
                <div className="permission-list">
                    <h4>Các quyền của vai trò: {roles.find(r => r.id === selectedRole)?.name}</h4>
                    <div className="permission-items">
                        {allPermissions.map(permission => (
                            <div key={permission.id} className="permission-item">
                                <input type="checkbox" id={permission.id} checked={permissions[selectedRole]?.includes(permission.id) || false} onChange={() => handlePermissionChange(permission.id)} />
                                <label htmlFor={permission.id}>{permission.label}</label>
                            </div>
                        ))}
                    </div>
                    <div className="permission-actions">
                        <button onClick={handleSaveChanges} className="btn-admin btn-admin-primary">Lưu thay đổi</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RolePermissions;