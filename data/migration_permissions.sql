-- ============================================
-- Migration: Thêm bảng permissions và role_permissions
-- ============================================

USE resv01_db;

-- ============ PERMISSIONS ============
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT NOT NULL AUTO_INCREMENT,
    permission_key VARCHAR(50) NOT NULL UNIQUE,
    permission_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    category VARCHAR(50) DEFAULT 'general',
    PRIMARY KEY (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ ROLE_PERMISSIONS ============
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ INSERT PERMISSIONS ============
INSERT INTO permissions (permission_key, permission_name, description, category) VALUES
-- Dashboard & Báo cáo
('view_dashboard', 'Xem Dashboard', 'Xem tổng quan và thống kê', 'dashboard'),
('view_reports', 'Xem báo cáo chi tiết', 'Xem các báo cáo doanh thu, đơn hàng', 'dashboard'),

-- Quản lý nhân viên
('manage_employees', 'Quản lý nhân viên', 'Thêm, sửa, xóa nhân viên', 'employee'),
('create_account', 'Tạo tài khoản nhân viên', 'Tạo tài khoản cho nhân viên mới', 'employee'),

-- Phân quyền
('manage_permissions', 'Quản lý phân quyền', 'Cấu hình quyền cho các vai trò', 'system'),

-- Quản lý bàn
('view_tables', 'Xem sơ đồ bàn', 'Xem trạng thái các bàn', 'table'),
('manage_tables', 'Quản lý bàn ăn', 'Thêm, sửa, xóa bàn', 'table'),

-- Quản lý đặt bàn
('view_reservations', 'Xem đặt bàn', 'Xem danh sách đặt bàn', 'reservation'),
('manage_reservations', 'Quản lý đặt bàn', 'Xác nhận, hủy đặt bàn', 'reservation'),
('checkout_reservations', 'Checkout đặt bàn', 'Thanh toán và giải phóng bàn', 'reservation'),

-- Quản lý đơn hàng
('view_orders', 'Xem đơn hàng', 'Xem danh sách đơn hàng', 'order'),
('create_order', 'Tạo đơn hàng', 'Tạo đơn hàng mới cho khách', 'order'),
('manage_orders', 'Quản lý đơn hàng', 'Cập nhật, hủy đơn hàng', 'order'),

-- Bếp
('view_kitchen_orders', 'Xem món cần chế biến', 'Xem danh sách món cần làm', 'kitchen'),
('update_kitchen_status', 'Cập nhật trạng thái món', 'Đánh dấu món đã hoàn thành', 'kitchen'),

-- Kho
('view_inventory', 'Xem kho', 'Xem tồn kho nguyên liệu', 'inventory'),
('manage_inventory', 'Quản lý kho', 'Nhập, xuất kho', 'inventory'),
('manage_menu', 'Quản lý thực đơn', 'Thêm, sửa, xóa món ăn', 'inventory'),

-- Khách hàng
('view_customers', 'Xem khách hàng', 'Xem danh sách khách hàng', 'customer'),
('manage_customers', 'Quản lý khách hàng', 'Xem chi tiết, lịch sử khách hàng', 'customer'),
('send_promotion', 'Gửi khuyến mãi', 'Gửi email khuyến mãi cho khách', 'customer'),

-- Đánh giá
('view_reviews', 'Xem đánh giá', 'Xem đánh giá từ khách hàng', 'review'),
('manage_reviews', 'Quản lý đánh giá', 'Phản hồi, ẩn đánh giá', 'review')
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- ============ DEFAULT ROLE PERMISSIONS ============
-- Admin (role_id = 1) - Có tất cả quyền
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Receptionist (role_id = 2) - Quản lý đặt bàn
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions 
WHERE permission_key IN ('view_tables', 'view_reservations', 'manage_reservations', 'checkout_reservations', 'view_orders', 'create_order')
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Waiter (role_id = 3) - Phục vụ bàn
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions 
WHERE permission_key IN ('view_tables', 'view_reservations', 'view_orders', 'create_order', 'checkout_reservations')
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Kitchen (role_id = 4) - Bếp
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, permission_id FROM permissions 
WHERE permission_key IN ('view_kitchen_orders', 'update_kitchen_status', 'view_inventory')
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Customer (role_id = 5) - Khách hàng (không có quyền admin)
-- Không cần thêm gì

SELECT 'Migration completed successfully!' AS status;
