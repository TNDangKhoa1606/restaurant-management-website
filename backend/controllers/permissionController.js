const db = require('../config/db');

/**
 * Lấy danh sách tất cả roles
 */
const getRoles = async (req, res) => {
    try {
        const [roles] = await db.query(
            'SELECT role_id, role_name FROM roles ORDER BY role_id'
        );
        res.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách vai trò.' });
    }
};

/**
 * Lấy danh sách tất cả permissions
 */
const getPermissions = async (req, res) => {
    try {
        const [permissions] = await db.query(
            'SELECT permission_id, permission_key, permission_name, description, category FROM permissions ORDER BY category, permission_id'
        );
        res.json(permissions);
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách quyền.' });
    }
};

/**
 * Lấy permissions của một role cụ thể
 */
const getRolePermissions = async (req, res) => {
    const { roleId } = req.params;

    try {
        const [permissions] = await db.query(
            `SELECT p.permission_key 
             FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.permission_id
             WHERE rp.role_id = ?`,
            [roleId]
        );
        
        const permissionKeys = permissions.map(p => p.permission_key);
        res.json(permissionKeys);
    } catch (error) {
        console.error('Get role permissions error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy quyền của vai trò.' });
    }
};

/**
 * Lấy tất cả role-permissions mapping
 */
const getAllRolePermissions = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT rp.role_id, p.permission_key 
             FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.permission_id`
        );

        // Group by role_id
        const result = {};
        rows.forEach(row => {
            if (!result[row.role_id]) {
                result[row.role_id] = [];
            }
            result[row.role_id].push(row.permission_key);
        });

        res.json(result);
    } catch (error) {
        console.error('Get all role permissions error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy phân quyền.' });
    }
};

/**
 * Cập nhật permissions cho một role
 */
const updateRolePermissions = async (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body; // Array of permission_keys

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Danh sách quyền không hợp lệ.' });
    }

    // Không cho phép sửa quyền của Admin (role_id = 1)
    if (parseInt(roleId) === 1) {
        return res.status(403).json({ message: 'Không thể thay đổi quyền của Admin.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Xóa tất cả permissions hiện tại của role
        await connection.query(
            'DELETE FROM role_permissions WHERE role_id = ?',
            [roleId]
        );

        // Thêm permissions mới
        if (permissions.length > 0) {
            // Lấy permission_ids từ permission_keys
            const [permissionRows] = await connection.query(
                'SELECT permission_id, permission_key FROM permissions WHERE permission_key IN (?)',
                [permissions]
            );

            if (permissionRows.length > 0) {
                const values = permissionRows.map(p => [parseInt(roleId), p.permission_id]);
                await connection.query(
                    'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
                    [values]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Cập nhật quyền thành công.' });
    } catch (error) {
        await connection.rollback();
        console.error('Update role permissions error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật quyền.' });
    } finally {
        connection.release();
    }
};

module.exports = {
    getRoles,
    getPermissions,
    getRolePermissions,
    getAllRolePermissions,
    updateRolePermissions,
};
