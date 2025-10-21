-- 1. Roles: user roles table
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 2. Users: accounts for admins, staff, customers
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    preferred_lang VARCHAR(5) DEFAULT 'vi',
    preferred_currency VARCHAR(5) DEFAULT 'VND',
    loyalty_points INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)addresses
) ENGINE=InnoDB;

-- 3. Addresses: delivery or pickup addresses for customers
CREATE TABLE Addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    label VARCHAR(50),
    address_line TEXT NOT NULL,
    city VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 4. RestaurantTables: restaurant dining tables
CREATE TABLE RestaurantTables (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(20) NOT NULL,   -- e.g., Table number or code
    capacity INT NOT NULL,
    status ENUM('free','reserved','occupied') DEFAULT 'free',
    location_x INT,
    location_y INT
) ENGINE=InnoDB;

-- 5. Reservations: table booking info
CREATE TABLE Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    user_id INT,
    res_date DATE NOT NULL,
    res_time TIME NOT NULL,
    number_of_people INT NOT NULL,
    status ENUM('booked','cancelled','completed') DEFAULT 'booked',
    guest_name VARCHAR(100),
    guest_phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES RestaurantTables(table_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 6. Categories: menu categories
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB;

-- 7. Dishes: menu items
CREATE TABLE Dishes (
    dish_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
) ENGINE=InnoDB;

-- 8. Ingredients: food ingredients
CREATE TABLE Ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    details TEXT
) ENGINE=InnoDB;

-- 9. DishIngredient: many-to-many relation between Dishes and Ingredients
CREATE TABLE DishIngredient (
    dish_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    PRIMARY KEY (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES Dishes(dish_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Orders: orders for food (dine-in or online)
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,            -- customer who placed the order (if any)
    table_id INT,           -- table for dine-in orders (if any)
    address_id INT,         -- delivery address (if delivery)
    order_type ENUM('dine-in','delivery','pickup') NOT NULL,
    status ENUM('new','preparing','completed','cancelled') DEFAULT 'new',
    is_paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),   -- e.g., 'cash','credit_card','e_wallet'
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (table_id) REFERENCES RestaurantTables(table_id),
    FOREIGN KEY (address_id) REFERENCES Addresses(address_id)
) ENGINE=InnoDB;

-- 11. OrderItems: details of dishes in each order
CREATE TABLE OrderItems (
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    note TEXT,
    status ENUM('new','preparing','done','cancelled') DEFAULT 'new',
    PRIMARY KEY (order_id, dish_id),   -- composite PK (each dish listed once per order_id)
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES Dishes(dish_id)
) ENGINE=InnoDB;

-- 12. WorkShifts: staff work schedule
CREATE TABLE WorkShifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,       -- staff user
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 13. ChatConversations: user-chatbot sessions
CREATE TABLE ChatConversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    outcome VARCHAR(50),    -- e.g., 'successful','unsuccessful'
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 14. ChatMessages: messages in a chatbot conversation
CREATE TABLE ChatMessages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type VARCHAR(10) NOT NULL,  -- 'user','bot','staff'
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ChatConversations(conversation_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Notifications: system notifications for users
CREATE TABLE Notifications (
    notif_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),         -- 'order_status','promotion','reward', etc.
    title VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 16. AuditLogs: audit trail of user actions
CREATE TABLE AuditLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 17. VerificationCodes: OTP codes for account verification and password reset
CREATE TABLE VerificationCodes (
    code_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,    -- 'activation','reset'
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 18. OrderReviews: service/overall order feedback
CREATE TABLE OrderReviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- 19. DishReviews: per-dish feedback
CREATE TABLE DishReviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    dish_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    order_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dish_id) REFERENCES Dishes(dish_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
) ENGINE=InnoDB;
