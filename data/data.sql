-- Sử dụng database `resv01_db`
USE resv01_db;

-- Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại file
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE roles;
TRUNCATE TABLE users;
TRUNCATE TABLE restauranttables;
TRUNCATE TABLE categories;
TRUNCATE TABLE dishes;
TRUNCATE TABLE reservations;
TRUNCATE TABLE orders;
TRUNCATE TABLE orderitems;
TRUNCATE TABLE orderreviews;
TRUNCATE TABLE dishreviews;
TRUNCATE TABLE chatconversations;
TRUNCATE TABLE chatmessages;
TRUNCATE TABLE addresses;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- 1. Thêm dữ liệu cho bảng `roles`
-- --------------------------------------------------------
INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Staff'),
(3, 'Customer');

-- --------------------------------------------------------
-- 2. Thêm dữ liệu cho bảng `users`
-- Mật khẩu được hash bằng bcrypt, ví dụ: 'password123'
-- --------------------------------------------------------
INSERT INTO `users` (`user_id`, `role_id`, `name`, `email`, `phone`, `password_hash`) VALUES
-- Admin
(1, 1, 'Admin Manager', 'admin@example.com', '0901000001', 'admin123'),
-- Staff
(2, 2, 'Nhân viên A', 'staff.a@example.com', '0902000002', '123'),
(3, 2, 'Nhân viên B', 'staff.b@example.com', '0903000003', '123'),
-- Customers
(4, 3, 'Nguyễn Văn An', 'nguyen.an@example.com', '0911111111', '123'),
(5, 3, 'Trần Thị Bình', 'tran.binh@example.com', '0922222222', '123'),
(6, 3, 'Lê Hoàng Cường', 'le.cuong@example.com', '0933333333', '123'),
(7, 3, 'Phạm Thị Dung', 'pham.dung@example.com', '0944444444', '123'),
(8, 3, 'Võ Minh Hải', 'vo.hai@example.com', '0955555555', '123'),
(9, 3, 'Đỗ Gia Hân', 'do.han@example.com', '0966666666', '123'),
(10, 3, 'Hoàng Văn Kiên', 'hoang.kien@example.com', '0977777777', '123');

-- --------------------------------------------------------
-- 3. Thêm dữ liệu cho bảng `addresses`
-- --------------------------------------------------------
INSERT INTO `addresses` (`address_id`, `user_id`, `label`, `address_line`, `city`, `is_default`) VALUES
(1, 4, 'Nhà riêng', '123 Đường ABC, Phường 1, Quận 1', 'TP. Hồ Chí Minh', 1),
(2, 5, 'Công ty', '456 Đường XYZ, Phường 2, Quận 3', 'TP. Hồ Chí Minh', 1);

-- --------------------------------------------------------
-- 4. Thêm dữ liệu cho bảng `restauranttables`
-- --------------------------------------------------------
INSERT INTO `restauranttables` (`table_id`, `table_name`, `capacity`, `status`) VALUES
(1, 'Bàn 1', 4, 'free'),
(2, 'Bàn 2', 2, 'free'),
(3, 'Bàn 3', 6, 'occupied'),
(4, 'Bàn 4', 4, 'free'),
(5, 'Bàn 5', 8, 'reserved'),
(6, 'Bàn 6', 2, 'free'),
(7, 'Bàn 7', 4, 'free'),
(8, 'Bàn 8', 4, 'occupied'),
(9, 'Bàn 9', 6, 'free'),
(10, 'Bàn 10', 2, 'free');

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
-- 6. Thêm dữ liệu cho bảng `dishes`
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
(20, 5, 'Cơm trắng', 'Cơm trắng nóng.', 15000.00);

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

-- --------------------------------------------------------
-- Kết thúc chèn dữ liệu
-- --------------------------------------------------------

-- Hiển thị thông báo hoàn tất
SELECT 'Dữ liệu mẫu đã được chèn thành công!' AS `status`;