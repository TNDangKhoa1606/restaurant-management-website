-- ============================================
-- DEMO DATA: Cập nhật password và thêm users
-- Password chung: (hash bạn cung cấp)
-- ============================================

USE resv01_db;

-- ============================================
-- 0. RESET TẤT CẢ BÀN VỀ TRẠNG THÁI TRỐNG
-- ============================================
UPDATE restauranttables SET status = 'free';
UPDATE reservations SET status = 'cancelled' WHERE status IN ('booked', 'completed') AND is_checked_out = 0;

SELECT CONCAT('Đã reset ', ROW_COUNT(), ' bàn về trạng thái trống') AS result;

-- ============================================
-- 1. CẬP NHẬT PASSWORD CHO TẤT CẢ USERS
-- ============================================
UPDATE users SET password_hash = '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG';

SELECT CONCAT('Đã cập nhật password cho ', ROW_COUNT(), ' users') AS result;

-- ============================================
-- 2. THÊM NHÂN VIÊN MỚI
-- ============================================

-- Thêm thêm Admin
INSERT IGNORE INTO users (role_id, name, email, phone, password_hash, is_verified) VALUES
(2, 'Trần Quản Lý', 'manager@noodles.vn', '0901000010', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1);

-- Thêm Receptionist (Lễ tân) - role_id = 3
INSERT IGNORE INTO users (role_id, name, email, phone, password_hash, is_verified) VALUES
(3, 'Nguyễn Thị Hương', 'huong.nguyen@noodles.vn', '0903000010', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(3, 'Lê Văn Tùng', 'tung.le@noodles.vn', '0903000011', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(3, 'Phạm Thị Mai', 'mai.pham@noodles.vn', '0903000012', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1);

-- Thêm Waiter (Phục vụ) - role_id = 4
INSERT IGNORE INTO users (role_id, name, email, phone, password_hash, is_verified) VALUES
(4, 'Trần Văn Nam', 'nam.tran@noodles.vn', '0904000010', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(4, 'Nguyễn Thị Lan', 'lan.nguyen@noodles.vn', '0904000011', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(4, 'Võ Minh Tuấn', 'tuan.vo@noodles.vn', '0904000012', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(4, 'Lê Thị Hồng', 'hong.le@noodles.vn', '0904000013', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(4, 'Đặng Văn Phúc', 'phuc.dang@noodles.vn', '0904000014', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1);

-- Thêm Kitchen (Bếp) - role_id = 5
INSERT IGNORE INTO users (role_id, name, email, phone, password_hash, is_verified) VALUES
(5, 'Nguyễn Văn Bếp', 'bep.nguyen@noodles.vn', '0905000010', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(5, 'Trần Thị Nấu', 'nau.tran@noodles.vn', '0905000011', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(5, 'Lê Văn Chiên', 'chien.le@noodles.vn', '0905000012', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1),
(5, 'Phạm Minh Đầu Bếp', 'chef.pham@noodles.vn', '0905000013', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1);

-- ============================================
-- 3. THÊM KHÁCH HÀNG MỚI
-- ============================================
INSERT IGNORE INTO users (role_id, name, email, phone, password_hash, is_verified, loyalty_points, is_vip) VALUES
-- Khách VIP
(1, 'Nguyễn Hoàng Long', 'long.nguyen@gmail.com', '0911000020', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 5000, 1),
(1, 'Trần Thị Kim Anh', 'kimanh.tran@gmail.com', '0911000021', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 3500, 1),
(1, 'Lê Quốc Bảo', 'bao.le@gmail.com', '0911000022', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 4200, 1),

-- Khách thường
(1, 'Phạm Văn Đức', 'duc.pham@gmail.com', '0912000020', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 800, 0),
(1, 'Võ Thị Hạnh', 'hanh.vo@gmail.com', '0912000021', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 450, 0),
(1, 'Đỗ Minh Khang', 'khang.do@gmail.com', '0912000022', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 1200, 0),
(1, 'Hoàng Thị Linh', 'linh.hoang@gmail.com', '0912000023', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 600, 0),
(1, 'Nguyễn Văn Minh', 'minh.nguyen2@gmail.com', '0912000024', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 950, 0),
(1, 'Trần Thị Ngọc', 'ngoc.tran@gmail.com', '0912000025', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 300, 0),
(1, 'Lê Văn Phong', 'phong.le@gmail.com', '0912000026', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 1500, 0),
(1, 'Phạm Thị Quỳnh', 'quynh.pham@gmail.com', '0912000027', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 200, 0),
(1, 'Võ Văn Sơn', 'son.vo@gmail.com', '0912000028', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 750, 0),
(1, 'Đặng Thị Thảo', 'thao.dang@gmail.com', '0912000029', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 1100, 0),
(1, 'Hoàng Văn Uy', 'uy.hoang@gmail.com', '0912000030', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 400, 0),
(1, 'Nguyễn Thị Vân', 'van.nguyen@gmail.com', '0912000031', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 850, 0),
(1, 'Trần Văn Xuân', 'xuan.tran@gmail.com', '0912000032', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 550, 0),
(1, 'Lê Thị Yến', 'yen.le@gmail.com', '0912000033', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 1800, 0),
(1, 'Phạm Văn Zũng', 'zung.pham@gmail.com', '0912000034', '$2a$10$Xp2YZDpZXjCCSU8dJ8/ryO2f6uq2.dYxB4R/SqZ5tCGiyi7JnAxZG', 1, 650, 0);

-- ============================================
-- 4. THÊM ĐỊA CHỈ CHO KHÁCH HÀNG MỚI
-- ============================================
INSERT INTO addresses (user_id, label, address_line, city, is_default)
SELECT user_id, 'Nhà riêng', 
    CONCAT(FLOOR(RAND() * 500) + 1, ' Đường ', 
           ELT(FLOOR(RAND() * 10) + 1, 'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Điện Biên Phủ', 'Võ Văn Tần', 'Nam Kỳ Khởi Nghĩa', 'Pasteur', 'Cách Mạng Tháng 8', 'Nguyễn Thị Minh Khai'),
           ', Quận ', FLOOR(RAND() * 12) + 1),
    'TP. Hồ Chí Minh', 1
FROM users 
WHERE role_id = 1 AND user_id NOT IN (SELECT user_id FROM addresses);

-- ============================================
-- 5. THỐNG KÊ KẾT QUẢ
-- ============================================
SELECT 
    r.role_name,
    COUNT(u.user_id) AS so_luong
FROM users u
JOIN roles r ON u.role_id = r.role_id
GROUP BY r.role_id, r.role_name
ORDER BY r.role_id;

SELECT CONCAT('Tổng số users: ', COUNT(*)) AS tong_users FROM users;

-- ============================================
-- DANH SÁCH TÀI KHOẢN DEMO
-- ============================================
-- Password chung cho tất cả: (password bạn dùng để tạo hash)
--
-- ADMIN:
--   admin@example.com
--   manager@noodles.vn
--
-- RECEPTIONIST (Lễ tân):
--   receptionist.b@example.com
--   huong.nguyen@noodles.vn
--   tung.le@noodles.vn
--   mai.pham@noodles.vn
--
-- WAITER (Phục vụ):
--   waiter.a@example.com
--   nam.tran@noodles.vn
--   lan.nguyen@noodles.vn
--   tuan.vo@noodles.vn
--   hong.le@noodles.vn
--   phuc.dang@noodles.vn
--
-- KITCHEN (Bếp):
--   bep.nguyen@noodles.vn
--   nau.tran@noodles.vn
--   chien.le@noodles.vn
--   chef.pham@noodles.vn
--
-- CUSTOMER (Khách hàng): 20+ tài khoản
-- ============================================
