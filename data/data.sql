-- Sử dụng database `resv01_db`
USE resv01_db;

-- Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại file

-- --------------------------------------------------------
-- XÓA DỮ LIỆU CŨ
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE roles;
TRUNCATE TABLE floors;
TRUNCATE TABLE users;
TRUNCATE TABLE restauranttables;
TRUNCATE TABLE categories;
TRUNCATE TABLE dishes;
TRUNCATE TABLE reservations;
TRUNCATE TABLE orders;
TRUNCATE TABLE orderitems;
TRUNCATE TABLE orderreviews;
TRUNCATE TABLE dishreviews;
TRUNCATE TABLE ingredients;
TRUNCATE TABLE supplies;
TRUNCATE TABLE chatconversations;
TRUNCATE TABLE chatmessages;
TRUNCATE TABLE addresses;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- 1. Thêm dữ liệu cho bảng `roles`
-- --------------------------------------------------------
INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Customer'),
(2, 'Admin'),
(3, 'Receptionist'),
(4, 'Waiter'),
(5, 'Kitchen');

-- --------------------------------------------------------
-- 2. Thêm dữ liệu cho bảng `users`
-- Mật khẩu được hash bằng bcrypt, ví dụ: 'password123'
-- --------------------------------------------------------
INSERT INTO `users` (`user_id`, `role_id`, `name`, `email`, `phone`, `password_hash`, `is_verified`, `verification_token`, `password_reset_token`, `password_reset_expires`) VALUES
-- Admin (role_id = 2)
(1, 2, 'Admin Manager', 'admin@example.com', '0901000001', '$2a$10$agUmVuCjn83I/56c0KSS5.ktQMmzLaFcmz6LfVePTwrnXbrROJ7du', 1, NULL, NULL, NULL),
-- Staff: Waiter (role_id = 4), Receptionist (role_id = 3)
(2, 4, 'Nhân viên Phục vụ A', 'waiter.a@example.com', '0902000002', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(3, 3, 'Nhân viên Lễ tân B', 'receptionist.b@example.com', '0903000003', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
-- Customers (role_id = 1)
(4, 1, 'Nguyễn Văn An', 'nguyen.an@example.com', '0911111111', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(5, 1, 'Trần Thị Bình', 'tran.binh@example.com', '0922222222', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(6, 1, 'Lê Hoàng Cường', 'le.cuong@example.com', '0933333333', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(7, 1, 'Phạm Thị Dung', 'pham.dung@example.com', '0944444444', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(8, 1, 'Võ Minh Hải', 'vo.hai@example.com', '0955555555', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(9, 1, 'Đỗ Gia Hân', 'do.han@example.com', '0966666666', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL),
(10, 1, 'Hoàng Văn Kiên', 'hoang.kien@example.com', '0977777777', '$2a$10$3l.L8f2ZlH.uL3qD/j5Xf.LzL2gJ/a5H/g5g6h7i8j9k0l1m2n3o', 1, NULL, NULL, NULL);

-- --------------------------------------------------------
-- 3. Thêm dữ liệu cho bảng `addresses`
-- --------------------------------------------------------
INSERT INTO `addresses` (`address_id`, `user_id`, `label`, `address_line`, `city`, `is_default`) VALUES
(1, 4, 'Nhà riêng', '123 Đường ABC, Phường 1, Quận 1', 'TP. Hồ Chí Minh', 1),
(2, 5, 'Công ty', '456 Đường XYZ, Phường 2, Quận 3', 'TP. Hồ Chí Minh', 1);

-- --------------------------------------------------------
-- 4. Thêm dữ liệu cho bảng `floors`
-- --------------------------------------------------------
INSERT INTO `floors` (`floor_id`, `name`, `description`) VALUES
(1, 'Tầng 1', 'Khu vực chung, gần cửa ra vào.'),
(2, 'Tầng 2 - VIP', 'Khu vực riêng tư, yên tĩnh hơn.');

-- --------------------------------------------------------
-- 5. Thêm dữ liệu cho bảng `categories`
-- --------------------------------------------------------
INSERT INTO `categories` (`category_id`, `name`, `description`) VALUES
(1, 'Khai vị', 'Các món ăn nhẹ để bắt đầu bữa ăn'),
(2, 'Món chính', 'Các món ăn chính, đa dạng và hấp dẫn'),
(3, 'Tráng miệng', 'Các món ngọt sau bữa ăn'),
(4, 'Đồ uống', 'Các loại nước giải khát và đồ uống khác'),
(5, 'Món Ăn Kèm', 'Các món ăn kèm theo món chính');

-- --------------------------------------------------------
-- 6. Thêm dữ liệu cho bảng `restauranttables`
-- --------------------------------------------------------
INSERT INTO `restauranttables` (`table_id`, `floor_id`, `table_name`, `capacity`, `status`, `pos_x`, `pos_y`) VALUES
-- Tầng 1
(1, 1, 'A1', 2, 'free', 8, 8),
(2, 1, 'A2', 2, 'occupied', 26, 8),
(3, 1, 'A3', 4, 'reserved', 44, 8),
(4, 1, 'A4', 4, 'free', 62, 8),
(11, 1, 'B1', 6, 'occupied', 15, 40),
(12, 1, 'B2', 6, 'free', 38, 40),
(13, 1, 'B3', 4, 'free', 61, 40),
(8, 1, 'C1', 2, 'free', 8, 70),
(9, 1, 'C2', 2, 'reserved', 26, 70),
(10, 1, 'C3', 4, 'occupied', 44, 70),
(14, 1, 'C4', 4, 'free', 62, 70),
-- Tầng 2
(5, 2, 'V1', 8, 'occupied', 10, 20),
(6, 2, 'V2', 10, 'free', 35, 20),
(7, 2, 'V3', 12, 'free', 60, 20),
(15, 2, 'V4', 8, 'free', 10, 60);

-- --------------------------------------------------------
-- 7. Thêm dữ liệu cho bảng `dishes`
-- --------------------------------------------------------
INSERT INTO `dishes` (`dish_id`, `category_id`, `name`, `description`, `price`) VALUES
-- Khai vị
(1, 1, 'Gỏi cuốn tôm thịt', 'Bánh tráng cuốn tôm, thịt, bún và rau sống.', 65000.00),
(2, 1, 'Chả giò hải sản', 'Chả giò chiên giòn với nhân hải sản tươi ngon.', 75000.00),
(3, 1, 'Salad dầu giấm', 'Salad rau củ tươi trộn với sốt dầu giấm.', 55000.00),
(4, 1, 'Súp cua', 'Súp nóng hổi với thịt cua và trứng cút.', 45000.00),
-- Món chính
(5, 2, 'Phở bò tái', 'Phở bò truyền thống với thịt bò tái mềm.', 70000.00),
(6, 2, 'Bún chả Hà Nội', 'Bún với chả nướng và nước mắm chua ngọt.', 65000.00),
(7, 2, 'Cơm tấm sườn bì chả', 'Cơm tấm với sườn nướng, bì và chả trứng.', 75000.00),
(8, 2, 'Bò lúc lắc', 'Thịt bò xào với ớt chuông và hành tây.', 120000.00),
(9, 2, 'Cá diêu hồng hấp xì dầu', 'Cá diêu hồng tươi hấp với xì dầu và gừng.', 180000.00),
(10, 2, 'Lẩu Thái Tomyum', 'Lẩu Thái chua cay với hải sản.', 350000.00),
(11, 2, 'Steak bò Mỹ', 'Thịt bò Mỹ nướng theo yêu cầu.', 450000.00),
-- Tráng miệng
(12, 3, 'Chè khúc bạch', 'Chè mát lạnh với khúc bạch, nhãn và hạnh nhân.', 35000.00),
(13, 3, 'Bánh flan', 'Bánh flan mềm mịn, béo ngậy vị caramel.', 25000.00),
(14, 3, 'Rau câu dừa', 'Rau câu làm từ nước dừa tươi.', 20000.00),
-- Đồ uống
(15, 4, 'Nước chanh', 'Nước chanh tươi mát lạnh.', 30000.00),
(16, 4, 'Nước cam ép', 'Nước cam tươi nguyên chất.', 40000.00),
(17, 4, 'Coca-Cola', 'Nước ngọt có gas.', 25000.00),
(18, 4, 'Bia Tiger', 'Bia Tiger lon.', 35000.00),
-- Món ăn kèm
(19, 5, 'Kim chi', 'Cải thảo lên men kiểu Hàn Quốc.', 30000.00),
(20, 5, 'Cơm trắng', 'Cơm trắng nóng.', 15000.00),
-- Mì và món chính từ các nước
(21, 2, 'Mì ramen Tonkotsu', 'Mì ramen với nước hầm xương heo kiểu Nhật.', 95000.00),
(22, 2, 'Mì ramen Shoyu', 'Mì ramen nước tương với trứng lòng đào.', 90000.00),
(23, 2, 'Mì ramen Miso', 'Mì ramen với nước dùng miso đậm đà.', 90000.00),
(24, 2, 'Mì Udon tempura', 'Mì Udon Nhật ăn kèm tempura tôm.', 95000.00),
(25, 2, 'Mì Soba lạnh', 'Mì kiều mạch Soba dùng lạnh với nước chấm.', 85000.00),
(26, 2, 'Mì Yakisoba xào', 'Mì xào kiểu Nhật với rau và thịt.', 90000.00),
(27, 2, 'Mì Somen lạnh', 'Mì sợi nhỏ dùng lạnh với nước chấm thanh nhẹ.', 85000.00),
(28, 2, 'Ramen cay Hàn Quốc', 'Mì ramen cay phong cách Hàn Quốc.', 90000.00),
(29, 2, 'Mì jjajangmyeon', 'Mì Hàn sốt tương đen đậm vị.', 95000.00),
(30, 2, 'Mì kimchi bò', 'Mì nước kimchi cay với thịt bò.', 90000.00),
(31, 2, 'Mì udon bò Bulgogi', 'Udon ăn kèm thịt bò ướp Bulgogi.', 98000.00),
(32, 2, 'Mì lạnh Naengmyeon', 'Mì lạnh Hàn Quốc với nước dùng mát.', 92000.00),
(33, 2, 'Pad Thai tôm', 'Mì xào Pad Thai với tôm và đậu phộng.', 95000.00),
(34, 2, 'Pad See Ew bò', 'Mì Thái xào nước tương đậm với bò.', 92000.00),
(35, 2, 'Mì xào hải sản Thái', 'Mì xào hải sản phong cách Thái.', 98000.00),
(36, 2, 'Laksa Singapore', 'Mì laksa nước cốt dừa cay béo.', 99000.00),
(37, 2, 'Mì Hokkien Mee', 'Mì xào Hokkien với tôm và mực.', 97000.00),
(38, 2, 'Mì tom yum hải sản', 'Mì nước tom yum chua cay với hải sản.', 98000.00),
(39, 2, 'Mì xào kiểu Mã Lai', 'Mì xào cay nhẹ kiểu Malaysia.', 92000.00),
(40, 2, 'Mì xào Singapore curry', 'Mì xào cà ri kiểu Singapore.', 93000.00),
(41, 2, 'Spaghetti Carbonara', 'Mì Ý sốt kem trứng và thịt xông khói.', 110000.00),
(42, 2, 'Spaghetti Bolognese', 'Mì Ý sốt thịt bò bằm cà chua.', 105000.00),
(43, 2, 'Spaghetti hải sản', 'Mì Ý với tôm, mực và nghêu.', 120000.00),
(44, 2, 'Fettuccine Alfredo', 'Mì dẹt sốt kem phô mai béo.', 115000.00),
(45, 2, 'Penne Arrabbiata', 'Mì ống sốt cà chua cay nhẹ.', 98000.00),
(46, 2, 'Lasagna bò phô mai', 'Mì lasagna nướng nhiều lớp phô mai.', 130000.00),
(47, 2, 'Tagliatelle nấm kem', 'Mì trứng Ý với sốt kem nấm.', 115000.00),
(48, 2, 'Mì Ý pesto basil', 'Mì Ý sốt pesto húng quế tươi.', 105000.00),
(49, 2, 'Mì Ý sốt hải sản cay', 'Spaghetti sốt cà chua cay với hải sản.', 120000.00),
(50, 2, 'Mì Ý chay rau củ', 'Spaghetti với rau củ nướng và dầu ô liu.', 98000.00),
(51, 2, 'Mì Trung Hoa xào giòn', 'Mì chiên giòn xào rau củ và thịt.', 95000.00),
(52, 2, 'Mì hoành thánh xá xíu', 'Mì nước với hoành thánh và thịt xá xíu.', 90000.00),
(53, 2, 'Mì trứng xào tôm', 'Mì trứng xào với tôm và rau.', 92000.00),
(54, 2, 'Mì gạo xào Singapore', 'Mì gạo xào cà ri kiểu Singapore.', 93000.00),
(55, 2, 'Mì gà kiểu Hainan', 'Mì ăn kèm gà luộc Hainan.', 95000.00),
(56, 2, 'Mì phở xào bò', 'Bánh phở xào bò kiểu Việt Nam.', 90000.00),
(57, 2, 'Bún bò Huế đặc biệt', 'Bún bò Huế cay với chả và giò.', 85000.00),
(58, 2, 'Bún riêu cua', 'Bún riêu cua đồng thơm ngon.', 80000.00),
(59, 2, 'Bún thịt nướng', 'Bún ăn kèm thịt nướng và rau sống.', 80000.00),
(60, 2, 'Mì Quảng gà', 'Mì Quảng với thịt gà và đậu phộng.', 82000.00),
(61, 2, 'Mì Quảng tôm thịt', 'Mì Quảng tôm thịt đậm đà.', 85000.00),
(62, 2, 'Mì xào giòn hải sản', 'Mì chiên giòn xào hải sản.', 98000.00),
(63, 2, 'Mì xào bò sa tế', 'Mì xào bò sốt sa tế cay.', 92000.00),
(64, 2, 'Mì Ý sốt kem nấm', 'Spaghetti sốt kem nấm thơm.', 110000.00),
(65, 2, 'Mì Ý sốt tôm cay', 'Spaghetti với tôm sốt cay.', 118000.00),
(66, 2, 'Mì ramen hải sản', 'Ramen Nhật với hải sản tổng hợp.', 98000.00),
(67, 2, 'Mì ramen chay', 'Ramen với rau củ và nấm.', 88000.00),
(68, 2, 'Mì soba chay lạnh', 'Soba lạnh dùng với rau củ tươi.', 87000.00),
(69, 2, 'Mì udon cà ri Nhật', 'Udon nước cà ri Nhật đậm vị.', 95000.00),
(70, 2, 'Mì Ý hải sản sốt kem', 'Mì Ý với hải sản và sốt kem.', 125000.00),
-- Món ăn kèm
(71, 5, 'Khoai tây chiên kiểu Pháp', 'Khoai tây chiên vàng giòn.', 60000.00),
(72, 5, 'Bánh mì bơ tỏi', 'Bánh mì nướng bơ tỏi thơm.', 55000.00),
(73, 5, 'Salad Caesar', 'Salad rau xanh với sốt Caesar.', 75000.00),
(74, 5, 'Salad Hy Lạp', 'Salad cà chua, dưa leo và phô mai feta.', 78000.00),
(75, 5, 'Bánh mì que phô mai', 'Bánh mì que nướng phô mai.', 55000.00),
(76, 5, 'Rau củ nướng mật ong', 'Rau củ nướng sốt mật ong nhẹ.', 70000.00),
(77, 5, 'Khoai lang chiên', 'Khoai lang chiên giòn ngọt.', 60000.00),
(78, 5, 'Gỏi xoài khô bò', 'Gỏi xoài chua ngọt với khô bò.', 80000.00),
(79, 5, 'Ngô chiên bơ', 'Ngô hạt chiên bơ thơm.', 55000.00),
(80, 5, 'Bánh bao chiên', 'Bánh bao chiên giòn nhân thịt.', 65000.00),
(81, 5, 'Kim chi củ cải', 'Kim chi củ cải giòn.', 32000.00),
(82, 5, 'Đậu hũ chiên giòn', 'Đậu hũ chiên giòn ăn kèm sốt.', 65000.00),
(83, 5, 'Bắp non xào bơ tỏi', 'Bắp non xào bơ tỏi thơm.', 70000.00),
(84, 5, 'Xà lách trộn dầu giấm', 'Xà lách tươi trộn dầu giấm nhẹ.', 55000.00),
(85, 5, 'Khoai tây nghiền bơ', 'Khoai tây nghiền bơ sữa béo.', 65000.00),
-- Tráng miệng
(86, 3, 'Tiramisu cà phê', 'Bánh tiramisu hương cà phê Ý.', 75000.00),
(87, 3, 'Panna cotta dâu', 'Panna cotta mềm mịn với sốt dâu.', 70000.00),
(88, 3, 'Kem vani socola', 'Kem vani kèm sốt socola.', 60000.00),
(89, 3, 'Bánh cheesecake chanh dây', 'Cheesecake mát với sốt chanh dây.', 80000.00),
(90, 3, 'Bánh brownie socola', 'Brownie socola đậm vị.', 65000.00),
(91, 3, 'Kem trà xanh matcha', 'Kem matcha Nhật Bản thơm.', 70000.00),
(92, 3, 'Chuối nếp nướng', 'Chuối bọc nếp nướng than hồng.', 55000.00),
(93, 3, 'Chè trôi nước', 'Chè trôi nước nhân đậu xanh.', 45000.00),
(94, 3, 'Chè bưởi', 'Chè bưởi đậu xanh nước cốt dừa.', 45000.00),
(95, 3, 'Kem dừa non', 'Kem dừa non trong trái dừa.', 75000.00),
-- Đồ uống
(96, 4, 'Trà đào cam sả', 'Trà đào cam sả mát lạnh.', 45000.00),
(97, 4, 'Trà sữa trân châu', 'Trà sữa với trân châu dẻo.', 50000.00),
(98, 4, 'Nước ép táo', 'Nước ép táo tươi.', 45000.00),
(99, 4, 'Sinh tố xoài', 'Sinh tố xoài chín mịn.', 55000.00),
(100, 4, 'Mocktail nhiệt đới', 'Mocktail trái cây nhiệt đới.', 65000.00);

-- --------------------------------------------------------
-- 7. Thêm dữ liệu cho bảng `reservations`
-- --------------------------------------------------------
INSERT INTO `reservations` (`reservation_id`, `table_id`, `user_id`, `res_date`, `res_time`, `number_of_people`, `status`, `guest_name`, `guest_phone`) VALUES
(1, 5, 4, CURDATE() + INTERVAL 1 DAY, '19:00:00', 6, 'booked', NULL, NULL),
(2, 2, 5, CURDATE() + INTERVAL 2 DAY, '12:00:00', 2, 'booked', NULL, NULL),
(3, 9, 6, CURDATE() - INTERVAL 1 DAY, '20:00:00', 5, 'completed', NULL, NULL),
(4, 1, 7, CURDATE(), '18:30:00', 4, 'booked', NULL, NULL),
(5, 6, 8, CURDATE() - INTERVAL 3 DAY, '19:30:00', 2, 'cancelled', NULL, NULL),
(6, 7, NULL, CURDATE() + INTERVAL 3 DAY, '19:00:00', 3, 'booked', 'Khách vãng lai A', '0987654321'),
(7, 10, 9, CURDATE() - INTERVAL 2 DAY, '11:30:00', 2, 'completed', NULL, NULL),
(8, 4, 10, CURDATE() + INTERVAL 1 DAY, '20:30:00', 4, 'booked', NULL, NULL),
(9, 3, 4, CURDATE() - INTERVAL 5 DAY, '19:00:00', 4, 'completed', NULL, NULL),
(10, 5, NULL, CURDATE() + INTERVAL 4 DAY, '12:30:00', 7, 'booked', 'Khách vãng lai B', '0987123456');

-- --------------------------------------------------------
-- 8. Thêm dữ liệu cho bảng `orders`
-- --------------------------------------------------------
INSERT INTO `orders` (`order_id`, `user_id`, `table_id`, `address_id`, `order_type`, `status`, `is_paid`, `payment_method`, `placed_at`) VALUES
-- Dine-in
(1, 4, 3, NULL, 'dine-in', 'preparing', 0, NULL, NOW() - INTERVAL 10 MINUTE),
(2, 5, 8, NULL, 'dine-in', 'new', 0, NULL, NOW() - INTERVAL 5 MINUTE),
(3, 6, 9, NULL, 'dine-in', 'completed', 1, 'cash', NOW() - INTERVAL 1 DAY),
(4, 7, 1, NULL, 'dine-in', 'completed', 1, 'credit_card', NOW() - INTERVAL 2 DAY),
(5, 8, 2, NULL, 'dine-in', 'cancelled', 0, NULL, NOW() - INTERVAL 3 DAY),
(6, 9, 7, NULL, 'dine-in', 'completed', 1, 'e_wallet', NOW() - INTERVAL '2' MONTH),
(7, 10, 4, NULL, 'dine-in', 'completed', 1, 'cash', NOW() - INTERVAL '2' MONTH),
(8, 4, 6, NULL, 'dine-in', 'preparing', 0, NULL, NOW() - INTERVAL 15 MINUTE),
(9, 5, 10, NULL, 'dine-in', 'completed', 1, 'credit_card', NOW() - INTERVAL '1' MONTH),
(10, 6, 3, NULL, 'dine-in', 'completed', 1, 'cash', NOW() - INTERVAL '1' MONTH),
-- Delivery
(11, 4, NULL, 1, 'delivery', 'preparing', 1, 'e_wallet', NOW() - INTERVAL 20 MINUTE),
(12, 5, NULL, 2, 'delivery', 'completed', 1, 'e_wallet', NOW() - INTERVAL 4 DAY),
(13, 4, NULL, 1, 'delivery', 'cancelled', 0, NULL, NOW() - INTERVAL 5 DAY),
(14, 5, NULL, 2, 'delivery', 'new', 1, 'credit_card', NOW() - INTERVAL 2 MINUTE),
(15, 4, NULL, 1, 'delivery', 'completed', 1, 'cash', NOW() - INTERVAL '1' MONTH),
-- Pickup
(16, 7, NULL, NULL, 'pickup', 'completed', 1, 'cash', NOW() - INTERVAL 6 DAY),
(17, 8, NULL, NULL, 'pickup', 'preparing', 1, 'e_wallet', NOW() - INTERVAL 25 MINUTE),
(18, 9, NULL, NULL, 'pickup', 'completed', 1, 'credit_card', NOW() - INTERVAL '2' MONTH),
(19, 10, NULL, NULL, 'pickup', 'cancelled', 0, NULL, NOW() - INTERVAL 7 DAY),
(20, 7, NULL, NULL, 'pickup', 'new', 1, 'cash', NOW() - INTERVAL 3 MINUTE);

-- --------------------------------------------------------
-- 9. Thêm dữ liệu cho bảng `orderitems`
-- --------------------------------------------------------
INSERT INTO `orderitems` (`order_id`, `dish_id`, `quantity`, `unit_price`) VALUES
-- Order 1
(1, 5, 2, 70000.00), (1, 15, 2, 30000.00),
-- Order 2
(2, 7, 1, 75000.00), (2, 16, 1, 40000.00),
-- Order 3
(3, 8, 1, 120000.00), (3, 11, 1, 450000.00), (3, 18, 4, 35000.00),
-- Order 4
(4, 1, 2, 65000.00), (4, 6, 2, 65000.00), (4, 12, 2, 35000.00),
-- Order 5 (cancelled)
-- Order 6
(6, 10, 1, 350000.00), (6, 20, 2, 15000.00),
-- Order 7
(7, 9, 1, 180000.00), (7, 17, 3, 25000.00),
-- Order 8
(8, 2, 1, 75000.00), (8, 4, 1, 45000.00),
-- Order 9
(9, 5, 4, 70000.00), (9, 19, 2, 30000.00),
-- Order 10
(10, 7, 2, 75000.00), (10, 13, 2, 25000.00),
-- Order 11
(11, 6, 2, 65000.00), (11, 15, 2, 30000.00),
-- Order 12
(12, 8, 1, 120000.00), (12, 20, 1, 15000.00),
-- Order 13 (cancelled)
-- Order 14
(14, 1, 1, 65000.00),
-- Order 15
(15, 5, 2, 70000.00), (15, 17, 2, 25000.00),
-- Order 16
(16, 7, 1, 75000.00),
-- Order 17
(17, 11, 1, 450000.00), (17, 20, 1, 15000.00),
-- Order 18
(18, 10, 1, 350000.00), (18, 16, 2, 40000.00),
-- Order 19 (cancelled)
-- Order 20
(20, 6, 1, 65000.00);

-- --------------------------------------------------------
-- 10. Cập nhật `total_amount` cho bảng `orders`
-- --------------------------------------------------------
UPDATE orders o
JOIN (
    SELECT order_id, SUM(quantity * unit_price) AS total
    FROM orderitems
    GROUP BY order_id
) oi ON o.order_id = oi.order_id
SET o.total_amount = oi.total;

-- --------------------------------------------------------
-- 11. Thêm dữ liệu cho bảng `orderreviews`
-- --------------------------------------------------------
INSERT INTO `orderreviews` (`review_id`, `order_id`, `user_id`, `rating`, `comment`) VALUES
(1, 3, 6, 5, 'Dịch vụ rất tốt, nhân viên nhiệt tình.'),
(2, 4, 7, 4, 'Đồ ăn ngon, không gian hơi ồn ào.'),
(3, 6, 9, 5, 'Tuyệt vời! Sẽ quay lại.'),
(4, 7, 10, 3, 'Phục vụ hơi chậm vào giờ cao điểm.'),
(5, 9, 5, 4, 'Mọi thứ đều ổn.'),
(6, 10, 6, 5, 'Nhà hàng sạch sẽ, món ăn trình bày đẹp.'),
(7, 12, 5, 4, 'Giao hàng nhanh, đồ ăn còn nóng.'),
(8, 15, 4, 5, 'Rất hài lòng với đơn hàng này.'),
(9, 16, 7, 4, 'Đồ ăn đóng gói cẩn thận.'),
(10, 18, 9, 2, 'Lẩu bị nguội và hơi ít đồ ăn kèm.');

-- --------------------------------------------------------
-- 12. Thêm dữ liệu cho bảng `dishreviews`
-- --------------------------------------------------------
INSERT INTO `dishreviews` (`review_id`, `dish_id`, `user_id`, `rating`, `comment`, `order_id`) VALUES
(1, 8, 6, 5, 'Món bò lúc lắc rất mềm và đậm vị.', 3),
(2, 11, 6, 5, 'Steak ngon xuất sắc, đúng độ chín yêu cầu.', 3),
(3, 1, 7, 4, 'Gỏi cuốn tươi, nhưng nước chấm hơi nhạt.', 4),
(4, 6, 7, 5, 'Bún chả chuẩn vị Hà Nội.', 4),
(5, 10, 9, 5, 'Lẩu thái rất ngon, đậm đà.', 6),
(6, 9, 10, 3, 'Cá hấp hơi tanh.', 7),
(7, 5, 5, 4, 'Phở bò ngon, nước dùng trong.', 9),
(8, 7, 6, 5, 'Cơm tấm sườn mềm, thấm vị.', 10),
(9, 11, 8, 5, 'Steak giao đến vẫn còn nóng, rất ngon.', 17),
(10, 10, 9, 2, 'Lẩu Thái không được cay lắm.', 18);

-- --------------------------------------------------------
-- 13. Thêm dữ liệu cho bảng `chatconversations`
-- --------------------------------------------------------
INSERT INTO `chatconversations` (`conversation_id`, `user_id`, `started_at`, `ended_at`, `outcome`) VALUES
(1, 4, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 5 MINUTE, 'successful'),
(2, 5, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 3 MINUTE, 'successful'),
(3, 6, NOW() - INTERVAL 10 HOUR, NOW() - INTERVAL 10 HOUR + INTERVAL 7 MINUTE, 'unsuccessful'),
(4, 4, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 5 HOUR + INTERVAL 4 MINUTE, 'successful'),
(5, 7, NOW() - INTERVAL 2 HOUR, NULL, 'ongoing');

-- --------------------------------------------------------
-- 14. Thêm dữ liệu cho bảng `chatmessages`
-- --------------------------------------------------------
INSERT INTO `chatmessages` (`conversation_id`, `sender_type`, `content`) VALUES
-- Conversation 1
(1, 'user', 'Chào bạn, tôi muốn đặt bàn cho 6 người vào 7h tối mai.'),
(1, 'bot', 'Chào bạn. Rất vui được hỗ trợ. Bạn vui lòng cho biết tên và số điện thoại liên hệ ạ.'),
(1, 'user', 'Tôi là Nguyễn Văn An, sđt 0911111111.'),
(1, 'bot', 'Cảm ơn bạn. Yêu cầu đặt bàn cho 6 người vào 19:00 ngày mai dưới tên Nguyễn Văn An đã được ghi nhận. Chúng tôi sẽ liên hệ xác nhận sớm. Cảm ơn bạn!'),

-- Conversation 2
(2, 'user', 'Nhà hàng có món chay không?'),
(2, 'bot', 'Chào bạn, hiện tại nhà hàng có các món chay như Salad dầu giấm, Rau câu dừa. Bạn có muốn xem chi tiết không ạ?'),
(2, 'user', 'Ok cảm ơn.'),

-- Conversation 3
(3, 'user', 'Tôi muốn khiếu nại về đơn hàng #10'),
(3, 'bot', 'Chào bạn, rất xin lỗi về trải nghiệm không tốt của bạn. Bạn có thể cho tôi biết vấn đề bạn gặp phải không ạ?'),
(3, 'user', 'Món ăn bị nguội'),
(3, 'bot', 'Tôi rất tiếc về sự cố này. Để tôi kết nối bạn với nhân viên chăm sóc khách hàng để được hỗ trợ tốt nhất.'),
(3, 'staff', 'Chào anh/chị, em là nhân viên chăm sóc khách hàng. Em xin ghi nhận phản hồi và sẽ có phương án xử lý ạ.'),

-- Conversation 4
(4, 'user', 'Kiểm tra đơn hàng của tôi'),
(4, 'bot', 'Chào bạn, bạn vui lòng cung cấp mã đơn hàng hoặc số điện thoại đặt hàng ạ.'),
(4, 'user', 'sđt 0911111111'),
(4, 'bot', 'Đơn hàng #11 của bạn đang trong quá trình chuẩn bị và sẽ sớm được giao đi. Cảm ơn bạn.'),

-- Conversation 5
(5, 'user', 'Menu'),
(5, 'bot', 'Chào bạn, bạn có thể xem thực đơn đầy đủ của chúng tôi tại [link-menu] nhé.');

INSERT INTO `ingredients` (`ingredient_id`, `name`, `stock_quantity`, `unit`, `warning_level`) VALUES
(1, 'Thịt bò', 5.00, 'kg', 10.00),
(2, 'Hành tây', 20.00, 'kg', 15.00),
(3, 'Phở khô', 50.00, 'gói', 20.00),
(4, 'Tương ớt', 4.00, 'chai', 5.00),
(5, 'Dầu ăn', 8.00, 'lít', 10.00);

INSERT INTO `supplies` (`supply_id`, `name`, `stock_quantity`, `unit`, `type`) VALUES
(1, 'Hộp đựng mang về', 100, 'cái', 'Đóng gói'),
(2, 'Đũa dùng 1 lần', 500, 'đôi', 'Dụng cụ ăn uống'),
(3, 'Túi nilon', 250, 'cái', 'Đóng gói'),
(4, 'Nước rửa chén', 5, 'chai', 'Vệ sinh');

-- --------------------------------------------------------
-- Kết thúc chèn dữ liệu
-- --------------------------------------------------------

-- Hiển thị thông báo hoàn tất
SELECT 'Dữ liệu mẫu đã được chèn thành công!' AS `status`;