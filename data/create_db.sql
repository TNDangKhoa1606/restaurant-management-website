-- ============================================
-- Resv01 Restaurant Management Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS resv01_db;
USE resv01_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============ ROLES ============
CREATE TABLE IF NOT EXISTS roles (
  role_id INT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT,
  role_id INT NOT NULL,
  name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) DEFAULT NULL, -- Cho phép đăng nhập bằng Google
  -- Thêm các cột còn thiếu để khớp với data.sql
  verification_token VARCHAR(255) DEFAULT NULL,
  password_reset_token VARCHAR(255) DEFAULT NULL,
  password_reset_expires DATETIME DEFAULT NULL,
  is_verified TINYINT(1) DEFAULT '0',
  two_factor_enabled TINYINT(1) DEFAULT '0',
  two_factor_secret VARCHAR(100) DEFAULT NULL,
  preferred_lang VARCHAR(5) DEFAULT 'vi',
  preferred_currency VARCHAR(5) DEFAULT 'VND',
  loyalty_points INT DEFAULT '0',
  is_vip TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id), 
  UNIQUE KEY (email),
  UNIQUE KEY (phone),
  KEY (role_id),
  CONSTRAINT users_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ ADDRESSES ============
CREATE TABLE IF NOT EXISTS addresses (
  address_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  label VARCHAR(50) DEFAULT NULL,
  address_line TEXT NOT NULL,
  city VARCHAR(50) DEFAULT NULL,
  is_default TINYINT(1) DEFAULT '0',
  PRIMARY KEY (address_id),
  KEY (user_id),
  CONSTRAINT addresses_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ FLOORS ============
CREATE TABLE IF NOT EXISTS floors (
  floor_id INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  PRIMARY KEY (floor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ RESTAURANT TABLES ============
CREATE TABLE IF NOT EXISTS restauranttables (
  table_id INT NOT NULL AUTO_INCREMENT,
  floor_id INT NOT NULL,
  table_name VARCHAR(20) NOT NULL,
  capacity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  status ENUM('free','reserved','occupied') DEFAULT 'free',
  pos_x INT DEFAULT NULL,
  pos_y INT DEFAULT NULL,
  group_name VARCHAR(50) DEFAULT NULL,
  is_group_master TINYINT(1) DEFAULT 0,
  PRIMARY KEY (table_id),
  KEY (floor_id),
  CONSTRAINT tables_ibfk_1 FOREIGN KEY (floor_id) REFERENCES floors (floor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  order_id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  table_id INT DEFAULT NULL,
  address_id INT DEFAULT NULL,
  order_type ENUM('dine-in','delivery','pickup') NOT NULL,
  status ENUM('new','preparing','completed','cancelled') DEFAULT 'new',
  is_paid TINYINT(1) DEFAULT '0',
  payment_method VARCHAR(50) DEFAULT NULL,
  total_amount DECIMAL(10,2) DEFAULT '0.00',
  placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  KEY (user_id),
  KEY (table_id),
  KEY (address_id),
  CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT orders_ibfk_2 FOREIGN KEY (table_id) REFERENCES restauranttables (table_id),
  CONSTRAINT orders_ibfk_3 FOREIGN KEY (address_id) REFERENCES addresses (address_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  method ENUM('cash','vietqr','momo') NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  status ENUM('pending','awaiting_proof','pending_verification','awaiting_gateway','succeeded','failed') DEFAULT 'pending',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  category_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  PRIMARY KEY (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ DISHES ============
CREATE TABLE IF NOT EXISTS dishes (
  dish_id INT NOT NULL AUTO_INCREMENT,
  category_id INT DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  is_featured TINYINT(1) DEFAULT '0',
  is_available TINYINT(1) DEFAULT '1', -- Cột này có thể sẽ được thay thế bởi `status`
  `status` ENUM('available', 'unavailable', 'hidden') NOT NULL DEFAULT 'available',
  PRIMARY KEY (dish_id),
  KEY (category_id),
  CONSTRAINT dishes_ibfk_1 FOREIGN KEY (category_id) REFERENCES categories (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ INGREDIENTS ============
CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  stock_quantity DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  unit VARCHAR(20) NOT NULL,
  warning_level DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  details TEXT, -- Giữ lại cột details nếu cần cho mô tả thêm
  PRIMARY KEY (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ DISH INGREDIENT (N-N) ============
CREATE TABLE IF NOT EXISTS dishingredient (
  dish_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  PRIMARY KEY (dish_id, ingredient_id),
  KEY (ingredient_id),
  CONSTRAINT dishingredient_ibfk_1 FOREIGN KEY (dish_id) REFERENCES dishes (dish_id) ON DELETE CASCADE,
  CONSTRAINT dishingredient_ibfk_2 FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ SUPPLIES ============
CREATE TABLE IF NOT EXISTS `supplies` (
  `supply_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  PRIMARY KEY (`supply_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ RESERVATIONS ============
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id INT NOT NULL AUTO_INCREMENT,
  table_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  deposit_order_id INT DEFAULT NULL,
  res_date DATE NOT NULL,
  res_time TIME NOT NULL,
  number_of_people INT NOT NULL,
  status ENUM('booked','cancelled','completed') DEFAULT 'booked',
  guest_name VARCHAR(100) DEFAULT NULL,
  guest_phone VARCHAR(20) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reservation_id),
  KEY (table_id),
  KEY (user_id),
  KEY (deposit_order_id),
  CONSTRAINT reservations_ibfk_1 FOREIGN KEY (table_id) REFERENCES restauranttables (table_id),
  CONSTRAINT reservations_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT reservations_ibfk_3 FOREIGN KEY (deposit_order_id) REFERENCES orders (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS orderitems (
  order_id INT NOT NULL,
  dish_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  note TEXT,
  status ENUM('new','preparing','done','cancelled') DEFAULT 'new',
  PRIMARY KEY (order_id, dish_id),
  KEY (dish_id),
  CONSTRAINT orderitems_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT orderitems_ibfk_2 FOREIGN KEY (dish_id) REFERENCES dishes (dish_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ ORDER REVIEWS ============
CREATE TABLE IF NOT EXISTS orderreviews (
  review_id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT DEFAULT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  KEY (order_id),
  KEY (user_id),
  CONSTRAINT orderreviews_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT orderreviews_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT orderreviews_chk_1 CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ DISH REVIEWS ============
CREATE TABLE IF NOT EXISTS dishreviews (
  review_id INT NOT NULL AUTO_INCREMENT,
  dish_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT DEFAULT NULL,
  comment TEXT,
  order_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  KEY (dish_id),
  KEY (user_id),
  KEY (order_id),
  CONSTRAINT dishreviews_ibfk_1 FOREIGN KEY (dish_id) REFERENCES dishes (dish_id),
  CONSTRAINT dishreviews_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT dishreviews_ibfk_3 FOREIGN KEY (order_id) REFERENCES orders (order_id),
  CONSTRAINT dishreviews_chk_1 CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  notif_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) DEFAULT NULL,
  title VARCHAR(100) DEFAULT NULL,
  message TEXT,
  is_read TINYINT(1) DEFAULT '0',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notif_id),
  KEY (user_id),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ AUDIT LOGS ============
CREATE TABLE IF NOT EXISTS auditlogs (
  log_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY (user_id),
  CONSTRAINT auditlogs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ CHAT CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS chatconversations (
  conversation_id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME DEFAULT NULL,
  outcome VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (conversation_id),
  KEY (user_id),
  CONSTRAINT chatconversations_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ CHAT MESSAGES ============
CREATE TABLE IF NOT EXISTS chatmessages (
  message_id INT NOT NULL AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_type VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id),
  KEY (conversation_id),
  CONSTRAINT chatmessages_ibfk_1 FOREIGN KEY (conversation_id) REFERENCES chatconversations (conversation_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ VERIFICATION CODES ============
CREATE TABLE IF NOT EXISTS verificationcodes (
  code_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used TINYINT(1) DEFAULT '0',
  PRIMARY KEY (code_id),
  KEY (user_id),
  CONSTRAINT verificationcodes_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============ WORK SHIFTS ============
CREATE TABLE IF NOT EXISTS workshifts (
  shift_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  PRIMARY KEY (shift_id),
  KEY (user_id),
  CONSTRAINT workshifts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- LƯU Ý: Nếu database đã tồn tại và cần đồng bộ schema
-- Hãy chạy file migration_sync_schema.sql để cập nhật
-- các cột còn thiếu mà không mất dữ liệu.
-- ============================================