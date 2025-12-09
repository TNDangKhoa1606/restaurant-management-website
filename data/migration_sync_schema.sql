-- ============================================
-- Migration: Đồng bộ Schema với Code hiện tại
-- Mục đích: Đảm bảo DB khớp 100% với luồng order/reservation & inventory
-- ============================================

USE resv01_db;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. Bảng DISHES: Thêm cột status
--    Backend menuController.js dùng: WHERE d.status = 'available'
-- ============================================

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'dishes'
    AND COLUMN_NAME = 'status'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE dishes ADD COLUMN `status` ENUM(''available'', ''unavailable'', ''hidden'') NOT NULL DEFAULT ''available'' AFTER is_available',
  'SELECT ''Column dishes.status already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- avatar_url: lưu đường dẫn ảnh đại diện người dùng
SET @col_exists := (
	SELECT COUNT(*) FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = 'resv01_db'
	  AND TABLE_NAME = 'users'
	  AND COLUMN_NAME = 'avatar_url'
);

SET @sql := IF(@col_exists = 0,
	'ALTER TABLE users ADD COLUMN `avatar_url` VARCHAR(255) DEFAULT NULL AFTER phone',
	'SELECT ''Column users.avatar_url already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Đồng bộ dữ liệu từ is_available sang status
UPDATE dishes 
SET status = CASE WHEN is_available = 1 THEN 'available' ELSE 'unavailable' END;

-- ============================================
-- 2. Bảng INGREDIENTS: Thêm các cột quản lý kho
--    Backend inventoryController.js yêu cầu: stock_quantity, unit, warning_level
-- ============================================

-- stock_quantity
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'ingredients'
    AND COLUMN_NAME = 'stock_quantity'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE ingredients ADD COLUMN `stock_quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER name',
  'SELECT ''Column ingredients.stock_quantity already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- unit
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'ingredients'
    AND COLUMN_NAME = 'unit'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE ingredients ADD COLUMN `unit` VARCHAR(20) NOT NULL DEFAULT ''kg'' AFTER stock_quantity',
  'SELECT ''Column ingredients.unit already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- warning_level
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'ingredients'
    AND COLUMN_NAME = 'warning_level'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE ingredients ADD COLUMN `warning_level` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER unit',
  'SELECT ''Column ingredients.warning_level already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. Bảng ORDERITEMS: Thêm note và status
--    note dùng để lưu "Pre-order cho đặt bàn #<id>"
--    status để theo dõi trạng thái từng món: new/preparing/done/cancelled
-- ============================================

-- note
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'orderitems'
    AND COLUMN_NAME = 'note'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE orderitems ADD COLUMN `note` TEXT AFTER unit_price',
  'SELECT ''Column orderitems.note already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- status
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'orderitems'
    AND COLUMN_NAME = 'status'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE orderitems ADD COLUMN `status` ENUM(''new'',''preparing'',''done'',''cancelled'') DEFAULT ''new'' AFTER note',
  'SELECT ''Column orderitems.status already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. Bảng USERS: Thêm các cột OAuth và bảo mật
--    Phục vụ đăng nhập Google, xác thực email, 2FA, khách VIP...
-- ============================================

-- google_id
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'google_id'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `google_id` VARCHAR(255) DEFAULT NULL AFTER password_hash',
  'SELECT ''Column users.google_id already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- verification_token
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'verification_token'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `verification_token` VARCHAR(255) DEFAULT NULL AFTER google_id',
  'SELECT ''Column users.verification_token already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- password_reset_token
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'password_reset_token'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `password_reset_token` VARCHAR(255) DEFAULT NULL AFTER verification_token',
  'SELECT ''Column users.password_reset_token already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- password_reset_expires
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'password_reset_expires'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `password_reset_expires` DATETIME DEFAULT NULL AFTER password_reset_token',
  'SELECT ''Column users.password_reset_expires already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- is_verified
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_verified'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `is_verified` TINYINT(1) DEFAULT 0 AFTER password_reset_expires',
  'SELECT ''Column users.is_verified already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- two_factor_enabled
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'two_factor_enabled'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `two_factor_enabled` TINYINT(1) DEFAULT 0 AFTER is_verified',
  'SELECT ''Column users.two_factor_enabled already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- two_factor_secret
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'two_factor_secret'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `two_factor_secret` VARCHAR(100) DEFAULT NULL AFTER two_factor_enabled',
  'SELECT ''Column users.two_factor_secret already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- preferred_lang
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'preferred_lang'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `preferred_lang` VARCHAR(5) DEFAULT ''vi'' AFTER two_factor_secret',
  'SELECT ''Column users.preferred_lang already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- preferred_currency
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'preferred_currency'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `preferred_currency` VARCHAR(5) DEFAULT ''VND'' AFTER preferred_lang',
  'SELECT ''Column users.preferred_currency already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- loyalty_points
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'loyalty_points'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `loyalty_points` INT DEFAULT 0 AFTER preferred_currency',
  'SELECT ''Column users.loyalty_points already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- is_vip
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_vip'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `is_vip` TINYINT(1) DEFAULT 0 AFTER loyalty_points',
  'SELECT ''Column users.is_vip already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- created_at
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'created_at'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER is_vip',
  'SELECT ''Column users.created_at already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 5. Bảng PAYMENTS: Tạo bảng phục vụ thanh toán VietQR/MoMo
-- ============================================

SET @table_exists := (
  SELECT COUNT(*) FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'payments'
);

SET @sql := IF(@table_exists = 0,
  'CREATE TABLE payments (
      payment_id INT NOT NULL AUTO_INCREMENT,
      order_id INT NOT NULL,
      method ENUM(''cash'',''vietqr'',''momo'') NOT NULL,
      amount DECIMAL(10,2) NOT NULL DEFAULT ''0.00'',
      status ENUM(''pending'',''awaiting_proof'',''pending_verification'',''awaiting_gateway'',''succeeded'',''failed'') DEFAULT ''pending'',
      txn_ref VARCHAR(100) DEFAULT NULL,
      qr_image_url VARCHAR(255) DEFAULT NULL,
      qr_data TEXT,
      proof_url VARCHAR(255) DEFAULT NULL,
      gateway_response JSON DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (payment_id),
      UNIQUE KEY txn_ref_unique (txn_ref),
      KEY (order_id),
      CONSTRAINT payments_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci',
  'SELECT ''Table payments already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 6. Bảng RESTAURANTTABLES: Thêm cột nhóm bàn
--    Dùng cho chức năng ghép bàn
-- ============================================

-- group_name
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'restauranttables'
    AND COLUMN_NAME = 'group_name'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE restauranttables ADD COLUMN `group_name` VARCHAR(50) DEFAULT NULL AFTER pos_y',
  'SELECT ''Column restauranttables.group_name already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- is_group_master
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'restauranttables'
    AND COLUMN_NAME = 'is_group_master'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE restauranttables ADD COLUMN `is_group_master` TINYINT(1) DEFAULT 0 AFTER group_name',
  'SELECT ''Column restauranttables.is_group_master already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- ============================================
-- 7. Bảng RESERVATIONS: Thêm cột is_checked_out
--    Đánh dấu đặt bàn đã checkout (bàn đã được giải phóng)
-- ============================================

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'reservations'
    AND COLUMN_NAME = 'is_checked_out'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE reservations ADD COLUMN `is_checked_out` TINYINT(1) NOT NULL DEFAULT 0 AFTER status',
  'SELECT ''Column reservations.is_checked_out already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 8. Bảng RESERVATIONREVIEWS: Đánh giá dịch vụ đặt bàn
--    Khách đánh giá sau khi checkout
-- ============================================

SET @table_exists := (
  SELECT COUNT(*) FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = 'resv01_db'
    AND TABLE_NAME = 'reservationreviews'
);

SET @sql := IF(@table_exists = 0,
  'CREATE TABLE reservationreviews (
      review_id INT NOT NULL AUTO_INCREMENT,
      reservation_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (review_id),
      UNIQUE KEY unique_reservation_review (reservation_id),
      KEY (user_id),
      CONSTRAINT reservationreviews_ibfk_1 FOREIGN KEY (reservation_id) REFERENCES reservations (reservation_id) ON DELETE CASCADE,
      CONSTRAINT reservationreviews_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id),
      CONSTRAINT reservationreviews_chk_1 CHECK (rating BETWEEN 1 AND 5)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci',
  'SELECT ''Table reservationreviews already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- KẾT THÚC MIGRATION
-- ============================================

SELECT 'Migration hoàn tất! Database đã được đồng bộ.' AS status;
