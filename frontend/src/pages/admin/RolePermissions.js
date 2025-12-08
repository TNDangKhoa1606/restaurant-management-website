import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/common/NotificationContext';

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
    const [allRoles, setAllRoles] = useState([]);
    const [allPerms, setAllPerms] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { notify } = useNotification();

    useEffect(() => {
        // Giả lập việc gọi API để lấy dữ liệu
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Trong thực tế, bạn sẽ gọi API ở đây, ví dụ:
                // const rolesRes = await fetch('/api/roles');
                // const rolesData = await rolesRes.json();
                // const permsRes = await fetch('/api/permissions');
                // const permsData = await permsRes.json();
                
                // Giả lập dữ liệu trả về từ API
                setAllRoles(roles);
                setAllPerms(allPermissions);
                setPermissions(initialRolePermissions);
                if (roles.length > 0) {
                    setSelectedRole(roles[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const handleSaveChanges = async () => {
        setIsSaving(true);
        console.log('Đang lưu các quyền sau:', { role: selectedRole, permissions: permissions[selectedRole] });
        try {
            // Giả lập gọi API để lưu
            // await fetch(`/api/roles/${selectedRole}/permissions`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ permissions: permissions[selectedRole] }),
            // });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ mạng
            notify('Đã lưu thay đổi thành công!', 'success');
        } catch (error) {
            console.error("Lỗi khi lưu thay đổi:", error);
            notify('Có lỗi xảy ra, không thể lưu thay đổi.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div>Đang tải dữ liệu phân quyền...</div>;
    }

    return (
        <div className="role-permissions-container">
            <div className="role-permissions-grid">
                {/* Cột danh sách vai trò */}
                <div className="role-list">
                    <h4>Danh sách vai trò</h4>
                    <ul>
                        {allRoles.map(role => (
                            <li key={role.id} className={selectedRole === role.id ? 'active' : ''} onClick={() => setSelectedRole(role.id)}>
                                {role.name}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Cột danh sách quyền */}
                <div className="permission-list">
                    <h4>Các quyền của vai trò: {allRoles.find(r => r.id === selectedRole)?.name}</h4>
                    <div className="permission-items">
                        {allPerms.map(permission => (
                            <div key={permission.id} className="permission-item">
                                <input type="checkbox" id={permission.id} checked={permissions[selectedRole]?.includes(permission.id) || false} onChange={() => handlePermissionChange(permission.id)} />
                                <label htmlFor={permission.id}>{permission.label}</label>
                            </div>
                        ))}
                    </div>
                    <div className="permission-actions">
                        <button onClick={handleSaveChanges} className="btn-admin btn-admin-primary" disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RolePermissions;