-- Sử dụng database `resv01_db`
USE resv01_db;

-- --------------------------------------------------------
-- I. BÁO CÁO KINH DOANH
-- --------------------------------------------------------

-- 1. Doanh thu theo tháng (chỉ tính các đơn hàng đã hoàn thành)
SELECT 
    DATE_FORMAT(placed_at, '%Y-%m') AS month,
    SUM(total_amount) AS total_revenue,
    COUNT(order_id) AS total_orders
FROM orders
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;

-- 2. Top 5 món ăn bán chạy nhất (theo số lượng)
SELECT 
    d.name AS dish_name,
    SUM(oi.quantity) AS total_quantity_sold
FROM orderitems oi
JOIN dishes d ON oi.dish_id = d.dish_id
GROUP BY d.name
ORDER BY total_quantity_sold DESC
LIMIT 5;

-- 3. Top 5 khách hàng chi tiêu nhiều nhất
SELECT 
    u.name AS customer_name,
    u.email,
    SUM(o.total_amount) AS total_spent
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.status = 'completed'
GROUP BY u.user_id, u.name, u.email
ORDER BY total_spent DESC
LIMIT 5;

-- 4. Tỷ lệ hủy đơn hàng
SELECT 
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
    (SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS cancellation_rate_percent
FROM orders;

-- 5. Doanh thu theo từng loại đơn hàng (dine-in, delivery, pickup)
SELECT 
    order_type,
    SUM(total_amount) AS total_revenue,
    COUNT(order_id) AS number_of_orders
FROM orders
WHERE status = 'completed'
GROUP BY order_type
ORDER BY total_revenue DESC;

-- --------------------------------------------------------
-- II. BÁO CÁO VẬN HÀNH
-- --------------------------------------------------------

-- 6. Tỷ lệ sử dụng bàn (số bàn đang có khách / tổng số bàn)
SELECT
    (SELECT COUNT(*) FROM restauranttables WHERE status = 'occupied') AS occupied_tables,
    COUNT(*) AS total_tables,
    ((SELECT COUNT(*) FROM restauranttables WHERE status = 'occupied') / COUNT(*)) * 100 AS occupancy_rate_percent
FROM restauranttables;

-- 7. Số lượt đặt bàn theo ngày trong tuần
SELECT 
    DAYNAME(res_date) AS day_of_week,
    COUNT(reservation_id) AS total_reservations
FROM reservations
GROUP BY day_of_week
ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- 8. Số lượng khách trung bình cho mỗi lượt đặt bàn
SELECT 
    AVG(number_of_people) AS avg_guests_per_reservation
FROM reservations
WHERE status IN ('booked', 'completed');

-- 9. Hiệu suất nhân viên (ví dụ: số đơn hàng đã hoàn thành được phục vụ)
-- Giả định: Cần có bảng phân công nhân viên cho đơn hàng để có số liệu chính xác.
-- Đây là truy vấn giả định nếu có cột `staff_id` trong bảng `orders`.
-- SELECT u.name, COUNT(o.order_id) AS completed_orders FROM orders o JOIN users u ON o.staff_id = u.user_id WHERE o.status = 'completed' GROUP BY u.user_id;
-- Vì không có, ta có thể đếm số hội thoại chat mà nhân viên đã tham gia.
SELECT 
    u.name AS staff_name,
    COUNT(DISTINCT cm.conversation_id) AS handled_conversations
FROM chatmessages cm
JOIN chatconversations cc ON cm.conversation_id = cc.conversation_id
JOIN users u ON cc.user_id = u.user_id -- Giả định nhân viên xử lý chat của user đó
WHERE cm.sender_type = 'staff'
GROUP BY u.name;

-- --------------------------------------------------------
-- III. BÁO CÁO TRẢI NGHIỆM KHÁCH HÀNG
-- --------------------------------------------------------

-- 10. Điểm đánh giá trung bình cho dịch vụ (từ order_reviews)
SELECT AVG(rating) AS avg_service_rating FROM orderreviews;

-- 11. Điểm đánh giá trung bình cho từng món ăn (từ dish_reviews)
SELECT 
    d.name AS dish_name,
    AVG(dr.rating) AS avg_dish_rating,
    COUNT(dr.review_id) AS total_reviews
FROM dishreviews dr
JOIN dishes d ON dr.dish_id = d.dish_id
GROUP BY d.name
ORDER BY avg_dish_rating DESC;

-- 12. Top 3 món ăn được đánh giá cao nhất (rating >= 4)
SELECT 
    d.name AS dish_name,
    AVG(dr.rating) AS avg_rating,
    COUNT(dr.review_id) AS review_count
FROM dishreviews dr
JOIN dishes d ON dr.dish_id = d.dish_id
GROUP BY d.name
HAVING avg_rating >= 4
ORDER BY avg_rating DESC, review_count DESC
LIMIT 3;

-- 13. Khách hàng có nhiều cuộc hội thoại với chatbot nhất
SELECT 
    u.name AS customer_name,
    COUNT(c.conversation_id) AS total_conversations
FROM chatconversations c
JOIN users u ON c.user_id = u.user_id
GROUP BY u.user_id, u.name
ORDER BY total_conversations DESC
LIMIT 5;

-- 14. Phân loại kết quả các cuộc hội thoại chatbot
SELECT 
    outcome,
    COUNT(conversation_id) AS count
FROM chatconversations
WHERE outcome IS NOT NULL
GROUP BY outcome;

-- 15. Tìm các đơn hàng có đánh giá dịch vụ thấp (dưới 3 sao) để xem xét
SELECT 
    o.order_id,
    u.name AS customer_name,
    r.rating,
    r.comment,
    o.placed_at
FROM orderreviews r
JOIN orders o ON r.order_id = o.order_id
JOIN users u ON r.user_id = u.user_id
WHERE r.rating < 3
ORDER BY o.placed_at DESC;