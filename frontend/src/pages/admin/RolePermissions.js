import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNotification } from '../../components/common/NotificationContext';

// Group permissions theo category để hiển thị đẹp hơn
const categoryLabels = {
    dashboard: 'Dashboard & Báo cáo',
    employee: 'Quản lý Nhân viên',
    system: 'Hệ thống',
    table: 'Quản lý Bàn',
    reservation: 'Đặt bàn',
    order: 'Đơn hàng',
    kitchen: 'Bếp',
    inventory: 'Kho & Thực đơn',
    customer: 'Khách hàng',
    review: 'Đánh giá',
};

// Dịch tên role sang tiếng Việt
const roleNameVietnamese = {
    'Admin': 'Quản trị viên',
    'Receptionist': 'Lễ tân',
    'Waiter': 'Phục vụ',
    'Kitchen': 'Bếp',
    'Customer': 'Khách hàng',
};

function RolePermissions() {
    const [allRoles, setAllRoles] = useState([]);
    const [allPerms, setAllPerms] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { token } = useAuth();
    const { notify } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Gọi API lấy roles, permissions và role-permissions
                const [rolesRes, permsRes, rolePermsRes] = await Promise.all([
                    axios.get('/api/permissions/roles', config),
                    axios.get('/api/permissions', config),
                    axios.get('/api/permissions/role-permissions', config),
                ]);

                // Lọc bỏ Customer khỏi danh sách roles (chỉ quản lý nhân viên)
                const staffRoles = rolesRes.data.filter(r => r.role_name !== 'Customer');
                setAllRoles(staffRoles);
                setAllPerms(permsRes.data);
                setPermissions(rolePermsRes.data);

                // Chọn role đầu tiên (bỏ qua Admin vì không cho sửa)
                if (staffRoles.length > 1) {
                    setSelectedRole(staffRoles[1].role_id);
                } else if (staffRoles.length > 0) {
                    setSelectedRole(staffRoles[0].role_id);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                notify('Không thể tải dữ liệu phân quyền.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, notify]);

    const handlePermissionChange = (permissionKey) => {
        if (selectedRole === 1) {
            notify('Không thể thay đổi quyền của Admin.', 'warning');
            return;
        }

        const currentPermissions = permissions[selectedRole] || [];
        const newPermissions = currentPermissions.includes(permissionKey)
            ? currentPermissions.filter(p => p !== permissionKey)
            : [...currentPermissions, permissionKey];

        setPermissions({
            ...permissions,
            [selectedRole]: newPermissions,
        });
    };

    const handleSaveChanges = async () => {
        if (selectedRole === 1) {
            notify('Không thể thay đổi quyền của Admin.', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(
                `/api/permissions/roles/${selectedRole}`,
                { permissions: permissions[selectedRole] || [] },
                config
            );
            notify('Đã lưu thay đổi thành công!', 'success');
        } catch (error) {
            console.error("Lỗi khi lưu thay đổi:", error);
            notify(error.response?.data?.message || 'Có lỗi xảy ra, không thể lưu thay đổi.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Group permissions theo category
    const groupedPermissions = allPerms.reduce((acc, perm) => {
        const cat = perm.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(perm);
        return acc;
    }, {});

    if (isLoading) {
        return <div className="admin-list-container"><p>Đang tải dữ liệu phân quyền...</p></div>;
    }

    const selectedRoleData = allRoles.find(r => r.role_id === selectedRole);
    const isAdmin = selectedRole === 1;

    return (
        <div className="role-permissions-container">
            <div className="role-permissions-grid">
                {/* Cột danh sách vai trò */}
                <div className="role-list">
                    <h4>Danh sách vai trò</h4>
                    <ul>
                        {allRoles.map(role => (
                            <li 
                                key={role.role_id} 
                                className={`${selectedRole === role.role_id ? 'active' : ''} ${role.role_id === 1 ? 'admin-role' : ''}`}
                                onClick={() => setSelectedRole(role.role_id)}
                            >
                                {roleNameVietnamese[role.role_name] || role.role_name}
                                {role.role_id === 1 && <span className="admin-badge">🔒</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cột danh sách quyền */}
                <div className="permission-list">
                    <h4>
                        Các quyền của vai trò: {roleNameVietnamese[selectedRoleData?.role_name] || selectedRoleData?.role_name}
                        {isAdmin && <span className="admin-note"> (Không thể chỉnh sửa)</span>}
                    </h4>

                    <div className="permission-categories">
                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                            <div key={category} className="permission-category">
                                <h5>{categoryLabels[category] || category}</h5>
                                <div className="permission-items">
                                    {perms.map(permission => (
                                        <div key={permission.permission_key} className="permission-item">
                                            <input 
                                                type="checkbox" 
                                                id={permission.permission_key} 
                                                checked={permissions[selectedRole]?.includes(permission.permission_key) || false} 
                                                onChange={() => handlePermissionChange(permission.permission_key)}
                                                disabled={isAdmin}
                                            />
                                            <label htmlFor={permission.permission_key}>
                                                {permission.permission_name}
                                                {permission.description && (
                                                    <span className="permission-desc"> - {permission.description}</span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isAdmin && (
                        <div className="permission-actions">
                            <button 
                                onClick={handleSaveChanges} 
                                className="btn-admin btn-admin-primary" 
                                disabled={isSaving}
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RolePermissions;