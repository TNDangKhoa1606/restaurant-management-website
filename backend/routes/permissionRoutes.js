const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getRoles,
    getPermissions,
    getRolePermissions,
    getAllRolePermissions,
    updateRolePermissions,
} = require('../controllers/permissionController');

// Tất cả routes đều yêu cầu đăng nhập và quyền Admin
router.use(protect);
router.use(authorizeRoles('Admin'));

// GET /api/permissions/roles - Lấy danh sách roles
router.get('/roles', getRoles);

// GET /api/permissions - Lấy danh sách permissions
router.get('/', getPermissions);

// GET /api/permissions/role-permissions - Lấy tất cả role-permissions mapping
router.get('/role-permissions', getAllRolePermissions);

// GET /api/permissions/roles/:roleId - Lấy permissions của một role
router.get('/roles/:roleId', getRolePermissions);

// PUT /api/permissions/roles/:roleId - Cập nhật permissions cho một role
router.put('/roles/:roleId', updateRolePermissions);

module.exports = router;
