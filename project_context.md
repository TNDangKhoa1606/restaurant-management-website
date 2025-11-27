# Đồ án tốt nghiệp
# Bối cảnh dự án: Website Quản lý Nhà hàng - Nhóm 14

Tài liệu này mô tả chi tiết các chức năng của hệ thống website quản lý nhà hàng, được phân chia theo vai trò người dùng. Mục tiêu là cung cấp một nguồn thông tin tham chiếu đầy đủ và nhất quán cho AI Assistant để hỗ trợ phát triển và tránh quên ngữ cảnh.

## 0. Ghi chú chung về dự án

- **Trọng tâm sản phẩm:** Nhà hàng tập trung chủ yếu vào các món mì nổi tiếng trên thế giới. Các món ăn kèm, tráng miệng và đồ uống là các sản phẩm phụ.
- **Thiết kế đáp ứng (Responsive Design):** Tất cả các giao diện phía khách hàng phải được thiết kế để hoạt động tốt trên cả máy tính (desktop) và thiết bị di động (mobile).
- **Dữ liệu mẫu:** Trong giai đoạn phát triển giao diện, hệ thống sẽ sử dụng dữ liệu mẫu (mock data) để không phụ thuộc vào backend.
- **Ưu tiên bắt buộc #1 – Hoàn thiện luồng Order (Đặt bàn & Gọi món / Đặt món online):** Mọi thay đổi backend/frontend liên quan đơn hàng, đặt bàn, menu, kho phải tuân theo luồng dưới đây **trước khi** mở rộng tính năng khác.

### 0.1. Tóm tắt luồng Order (BẮT BUỘC LÀM ĐẦU TIÊN)

> **Ghi chú cho AI / Dev:** Trước khi chỉnh sửa code, hãy đọc kỹ mục này để không phá vỡ luồng nghiệp vụ Order.

#### 0.1.1. Luồng Order phía Khách hàng

> **Trạng thái triển khai (19/11/2025):** Core luồng 0.1.1 (Bước 1–5 cho đặt món online `delivery`/`pickup` + xem lịch sử/chi tiết đơn) đã được triển khai end-to-end trên frontend + backend. Các tính năng hậu mãi nâng cao như đánh giá đơn/món và cổng thanh toán online được xem là **mở rộng**, không bắt buộc phải làm trước khi điều chỉnh/mở rộng các phần khác.

- **Bước 1 – Xem & chọn món**  
  Xem menu online → Lọc/chọn món → Thêm/sửa/xóa món trong giỏ hàng.
- **Bước 2 – Chọn hình thức phục vụ (`orders.order_type`)**  
  - `dine-in`: Ăn tại chỗ, gắn với `restauranttables.table_id`.  
  - `delivery`: Giao tận nơi, gắn với `addresses.address_id`.  
  - `pickup`: Tự đến lấy, không cần bàn/địa chỉ.
- **Bước 3 – Nhập thông tin & ghi chú**  
  Điền thông tin khách, bàn hoặc địa chỉ; thêm ghi chú giao hàng/ghi chú món (`orderitems.note`).
- **Bước 4 – Thanh toán**  
  Cập nhật `orders.is_paid`, `payment_method`, `total_amount`, `placed_at`.
- **Bước 5 – Theo dõi & hậu mãi**  
  Khách xem trạng thái `orders.status` (`new` → `preparing` → `completed` / `cancelled`), lịch sử đơn. Tính năng đánh giá đơn (`orderreviews`) và món (`dishreviews`) hiện **chưa triển khai**, khi làm thêm cần đảm bảo không phá vỡ luồng Order và schema hiện tại.

#### 0.1.2. Luồng "Đặt bàn & Gọi món trước" (Pre-order Dine-in)

- **Bước 1 – Chọn ngày/giờ/số khách** trên `ReservationPage` (`reservations.res_date`, `res_time`, `number_of_people`).
- **Bước 2 – Chọn bàn trên sơ đồ**  
  Dùng API `/api/reservations/layout` để hiển thị `restauranttables` + trạng thái (`free/reserved/occupied`) và cờ `suitable`. Khách **bắt buộc** chọn một bàn đáp ứng sức chứa, không trùng giờ.
- **Bước 3 – Chọn chế độ**  
  - "Chỉ đặt bàn" → chỉ tạo `reservations`.  
  - "Đặt bàn & Gọi món trước" → tạo **reservation + order dine-in**.
- **Bước 4 – Chọn món pre-order trong `PreOrderPopup`**  
  Lấy menu thật qua `/api/menu` (`dishes` + `categories`, chỉ món `status = 'available'`), chọn món theo `dish_id` 1–20.
- **Bước 5 – Tạo dữ liệu trong DB**  
  1) `POST /api/reservations`: tạo bản ghi trong `reservations` với `table_id`, check trùng giờ, cập nhật `restauranttables.status = 'reserved'`.  
  2) `POST /api/orders`: tạo đơn `orders` với `order_type = 'dine-in'`, gắn `table_id`, thêm các dòng `orderitems` tương ứng.  
  3) `orderitems.note` chứa chuỗi dạng `"Pre-order cho đặt bàn #<reservation_id>"` để backend (Bếp) parse ra `reservation_id` và suy ra `arrival_time`.

#### 0.1.3. Luồng Order phía Nội bộ (Admin / Staff / Bếp)

- **Admin – Quản lý tổng thể đơn hàng (`OrderManagement.js`)**  
  - Gọi `/api/orders` để xem tất cả đơn (dine-in, delivery, pickup).  
  - Quyền `Admin` được xem chi tiết (`GET /api/orders/:id`), cập nhật trạng thái/hủy đơn (`PUT /api/orders/:id/status`).
- **Bếp – Món cần chế biến (`KitchenOrders.js`)**  
  - Gọi `/api/orders/kitchen` → backend trả các đơn `order_type = 'dine-in'`, `status IN ('new','preparing')`, gộp theo `order_id` + danh sách `orderitems`.  
  - Nếu `orderitems.note` có pre-order, backend gắn `is_preorder = true` + giờ khách đến.  
  - Chỉ `Admin` và `Kitchen` được đổi trạng thái món/đơn trên board Kanban.
- **Lễ tân – Đặt bàn (`ReservationManagement.js`)**  
  - Xem/duyệt/hủy/hoàn thành các `reservations`.  
  - Chỉ `Admin` và `Receptionist` được thao tác, các role khác chỉ xem.
- **Phục vụ – Tại bàn (Waiter/TableMap)**  
  - Nhận order tại bàn (dine-in) trực tiếp, gắn với `restauranttables.table_id`.  
  - Cập nhật trạng thái phục vụ món và bàn.

#### 0.1.4. Mapping nhanh giữa Luồng Order và Database

- **Bảng `orders`**  
  - Loại đơn: `order_type ENUM('dine-in','delivery','pickup')`.  
  - Trạng thái: `status ENUM('new','preparing','completed','cancelled')`.  
  - Liên kết: `user_id`, `table_id`, `address_id`, thanh toán (`is_paid`, `payment_method`, `total_amount`).
- **Bảng `orderitems`**  
  - Liên kết với `orders` và `dishes`.  
  - `quantity`, `unit_price`, `note`, `status ('new','preparing','done','cancelled')`.
- **Bảng `reservations` + `restauranttables`**  
  - `reservations` giữ ngày/giờ/số khách/bàn, trạng thái (`booked/completed/cancelled`).  
  - `restauranttables` giữ sơ đồ, sức chứa, trạng thái (`free/reserved/occupied`).
- **Bảng `dishes` + `categories`**  
  - `dishes.status` dùng để lọc menu hiển thị (`available`/`unavailable`/`hidden`).

#### 0.1.5. Checklist khi setup / sửa luồng Order

- **Bước 1 – DB**: chạy lần lượt `create_db.sql` → `data.sql` → `migration_sync_schema.sql`.  
- **Bước 2 – Kiểm tra cột quan trọng**: `dishes.status`, `ingredients.stock_quantity/unit/warning_level`, `orderitems.note/status`, các cột OAuth trong `users`, `restauranttables.group_name/is_group_master`.  
- **Bước 3 – Kiểm thử luồng Đặt bàn & Gọi món trước**:  
  - Tạo reservation + order dine-in pre-order từ giao diện khách.  
  - Kiểm tra Bếp (`KitchenOrders`) và Quản lý Đơn (`OrderManagement`) có hiển thị đúng.

---

## 1. Khách hàng (End-User)

### 1.1. Quản lý Tài khoản & Bảo mật
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Đăng ký tài khoản** | Người dùng tạo tài khoản bằng email/SĐT. Thông tin được lưu sau khi xác thực. |
| **Đăng ký qua Google/Facebook** | Hỗ trợ đăng ký nhanh qua Oauth2, liên kết với tài khoản mạng xã hội. |
| **Xác thực tài khoản** | Nhận OTP qua email/SMS để kích hoạt. Không xác thực không thể đăng nhập. |
| **Đăng nhập** | Sử dụng email/SĐT và mật khẩu. Có tùy chọn "nhớ đăng nhập". |
| **Đăng xuất** | Kết thúc phiên làm việc trên thiết bị hiện tại. |
| **Quên/Reset mật khẩu** | Yêu cầu link đặt lại mật khẩu qua email. |
| **Đổi mật khẩu** | Đổi mật khẩu khi đã đăng nhập bằng cách nhập mật khẩu cũ và mới. |
| **Quản lý đa thiết bị** | Xem danh sách thiết bị đang đăng nhập và có thể đăng xuất từ xa. |
| **Bảo mật 2 lớp (2FA)** | Bật/tắt xác thực hai lớp qua email hoặc Authenticator App. |

### 1.2. Quản lý Hồ sơ & Tùy chỉnh
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Cập nhật hồ sơ cá nhân** | Chỉnh sửa tên hiển thị, ngày sinh, địa chỉ giao hàng mặc định. |
| **Cập nhật hình ảnh đại diện** | Tải lên ảnh đại diện mới. |
| **Chuyển đổi ngôn ngữ** | Chọn giao diện Tiếng Việt hoặc Tiếng Anh. |
| **Chuyển đổi đơn vị tiền tệ** | Chuyển đổi giữa VND / USD, hệ thống tự động quy đổi. |
| **Quản lý địa chỉ giao hàng** | Thêm/sửa/xóa nhiều địa chỉ nhận hàng (nhà, văn phòng...). |

### 1.3. Đặt hàng & Đặt bàn
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Xem menu online** | Hiển thị thực đơn điện tử, có bộ lọc và gợi ý AI. |
| **Thêm món vào giỏ hàng** | Thêm/sửa/xóa các món trong giỏ hàng. |
| **Đặt món online** | Đặt hàng trực tuyến và chọn phương thức giao hàng. |
| **Xem sơ đồ bàn trống** | Xem sơ đồ bàn trống theo thời gian thực để chọn chỗ. |
| **Đặt bàn** | Nhập thông tin (ngày, giờ, số người) để giữ chỗ. |
| **Chọn loại giao hàng** | Chọn giữa giao tận nơi (delivery) hoặc tự đến lấy (pickup). |
| **Ghi chú giao hàng** | Thêm ghi chú tùy chọn cho đơn hàng (vd: "Không gọi cửa"). |
    
### 1.4. Thanh toán & Lịch sử
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Thanh toán online** | Hỗ trợ ví điện tử (Momo, ZaloPay), thẻ ngân hàng, chuyển khoản. |
| **Nhận hóa đơn điện tử** | Nhận hóa đơn PDF qua email hoặc xem trực tiếp trên web. |
| **Xem lịch sử mua hàng** | Danh sách các đơn hàng đã thanh toán (thời gian, tổng tiền, món đã gọi). |
| **Theo dõi đơn hàng** | Xem tiến độ đơn hàng (đang chuẩn bị, đang giao, hoàn tất). |
| **Đánh giá món ăn/dịch vụ** | Đánh giá sao và viết nhận xét sau khi hoàn tất đơn hàng. |

### 1.5. Tương tác & Thông báo
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Nhận thông báo** | Nhận thông báo về đơn hàng, khuyến mãi qua web hoặc email. |
| **Nhận thông báo đặt bàn** | Nhận xác nhận hoặc từ chối đặt bàn qua hệ thống/email. |
| **Gợi ý món thông minh** | AI gợi ý món ăn dựa trên lịch sử, sở thích, thời điểm. |
| **Chatbot AI hỗ trợ** | Hỗ trợ 24/7 về đặt bàn, hỏi đáp món ăn, theo dõi đơn hàng. |
| **Audit log cá nhân** | Ghi lại các hành động quan trọng của người dùng trên hệ thống. |

---

### 1.6. Giao diện đã hoàn thành (Phía Khách hàng)

| Giao diện / Component | Mô tả | Trạng thái |
| :--- | :--- | :--- |
| **Header** | Thanh điều hướng chính, logo, menu, nút đặt bàn. | Hoàn thành |
| **Footer** | Chân trang, thông tin liên hệ, mạng xã hội. | Hoàn thành |
| **BackToTop** | Nút cuộn lên đầu trang và icon giỏ hàng. | Hoàn thành |
| **Trang chủ (HomePage)** | Trang chính, tổng hợp nhiều thành phần. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ HeroSlider | Banner chính với hiệu ứng trượt. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ ComboBanner | Banner quảng cáo combo. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ IntroductionSection | Phần giới thiệu về nhà hàng và các lựa chọn. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ MenuHighlightSection | Phần làm nổi bật thực đơn với lưới ảnh. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ MenuDisplay (trên trang chủ) | Hiển thị một phần thực đơn để đặt món nhanh. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ RestaurantInfoSection | Giới thiệu không gian nhà hàng. | Hoàn thành |
| **Trang Thực đơn (MenuPage)** | Trang hiển thị đầy đủ thực đơn. | Hoàn thành |
| **Giỏ hàng (Cart)** | Panel trượt ra để xem và quản lý các món đã chọn. | Hoàn thành |
| **Trang Đặt bàn (ReservationPage)** | Giao diện form đặt bàn. | Hoàn thành |
| **Trang Thanh toán (CheckoutPage)** | Giao diện tóm tắt đơn hàng và form thông tin. | Hoàn thành |
| **Trang Giới thiệu (AboutPage)** | Giới thiệu về các mô hình phục vụ của nhà hàng. | Hoàn thành |
| **Trang Bài viết (BlogPage)** | Danh sách các bài viết, tin tức, khuyến mãi. | Hoàn thành |
| **Trang Liên hệ (ContactPage)** | Thông tin và form liên hệ của nhà hàng. | Hoàn thành |
| **Trang Đăng nhập (LoginPage)** | Giao diện form đăng nhập. | Hoàn thành |
| **Trang Đăng ký (RegisterPage)** | Giao diện form đăng ký. | Hoàn thành |
| **Trang Quên mật khẩu (ForgotPasswordPage)** | Giao diện form quên mật khẩu. | Hoàn thành |
| **Trang Hồ sơ cá nhân (UserProfile)** | Layout chung cho trang quản lý tài khoản. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ Thông tin cá nhân | Form xem và chỉnh sửa thông tin. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ Lịch sử đơn hàng | Danh sách các đơn hàng đã đặt. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ Sổ địa chỉ | Quản lý các địa chỉ giao hàng. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ Chi tiết đơn hàng | Xem thông tin chi tiết của một đơn hàng. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ Đổi mật khẩu | Form cho phép người dùng thay đổi mật khẩu. | Hoàn thành |
| &nbsp;&nbsp;&nbsp;↳ Chức năng Đăng xuất | Xóa phiên đăng nhập và chuyển về trang chủ. | Hoàn thành |


## 2. Nhân viên Nhà hàng

### 2.1. Module: Lễ tân
- **Quản lý đặt bàn:** Xem danh sách đặt bàn (trực tiếp & online), lọc theo ngày, giờ, trạng thái.
- **Xác nhận/Điều chỉnh/Hủy đặt bàn:** Duyệt, sửa đổi hoặc hủy yêu cầu đặt bàn của khách.
- **Hỗ trợ check-in:** Xác nhận khi khách đến, cập nhật trạng thái bàn thành "đang phục vụ".

### 2.2. Module: Bếp
- **Xem danh sách món cần chế biến:** Hiển thị các món đã được đặt theo thời gian thực.
- **Cập nhật trạng thái món:** Đánh dấu món là "đang làm" hoặc "đã xong".

### 2.3. Module: Phục vụ
- **Nhận đơn tại bàn:** Tạo đơn trực tiếp trên thiết bị di động cho khách gọi món tại chỗ.
- **Cập nhật trạng thái phục vụ:** Ghi nhận khi đã giao món cho khách.
- **Ghi chú yêu cầu đặc biệt:** Nhập các yêu cầu riêng của khách cho bếp (vd: "ít cay").

### 2.4. Giao diện đã hoàn thành (Phía Nhân viên)
| Giao diện / Component | Mô tả | Trạng thái |
| :--- | :--- | :--- |
| **DashboardLayout** | Layout chung cho tất cả các vai trò quản trị và nhân viên. | Hoàn thành |
| **Module Lễ tân** | | |
| &nbsp;&nbsp;&nbsp;↳ Quản lý Đặt bàn | Giao diện xem, xác nhận, hủy các lượt đặt bàn. | Hoàn thành |
| **Module Bếp** | | |
| &nbsp;&nbsp;&nbsp;↳ Món cần chế biến | Giao diện Kanban board theo dõi trạng thái món ăn. | Hoàn thành |
| **Module Phục vụ** | | |
| &nbsp;&nbsp;&nbsp;↳ Sơ đồ bàn | Giao diện sơ đồ bàn trực quan của nhà hàng. | Hoàn thành |
---

## 3. Quản trị viên (Admin)

### 3.1. Quản lý Vận hành
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Quản lý món ăn** | Thêm/sửa/xóa món, cập nhật giá, hình ảnh, phân loại và trạng thái hiển thị. |
| **Quản lý nguyên liệu** | Gắn nguyên liệu cho từng món để theo dõi tồn kho, chi phí. |
| **Gợi ý món nổi bật** | Đánh dấu các món cần ưu tiên hiển thị trên menu. |
| **Quản lý bàn ăn & sơ đồ** | Thêm/xóa/sắp xếp bàn, cập nhật trạng thái (trống, đã đặt...). |
| **Đặt bàn hộ khách** | Thực hiện đặt bàn thủ công cho khách qua điện thoại hoặc trực tiếp. |

### 3.2. Quản lý Đơn hàng
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Quản lý tổng thể đơn hàng** | Xem toàn bộ đơn hàng (tại bàn, online) và theo dõi trạng thái. |
| **Cập nhật tiến độ phục vụ** | Can thiệp và cập nhật trạng thái đơn hàng thủ công. |
| **Hủy đơn, đổi món** | Can thiệp vào đơn hàng đã đặt (hủy hoặc đổi món nếu chưa chế biến). |

### 3.3. Quản lý Con người
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Quản lý nhân viên** | Thêm, phân quyền (lễ tân, bếp, phục vụ), cập nhật thông tin. |
| **Quản lý ca làm** | Tạo và chỉnh sửa lịch làm việc cho nhân viên. |
| **Theo dõi hiệu suất nhân viên** | Thống kê số đơn hoàn thành, phản hồi từ khách để đánh giá. |
| **Xem lịch sử khách hàng** | Truy cập lịch sử đặt bàn, đơn hàng của từng khách. |
| **Quản lý khách hàng thân thiết** | Gắn tag "VIP", áp dụng chính sách ưu đãi riêng. |
| **Gửi khuyến mãi cá nhân** | Gửi ưu đãi riêng cho khách hàng thân thiết hoặc theo nhóm hành vi. |

### 3.4. Báo cáo & Thống kê
| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Thống kê doanh thu** | Xem doanh thu theo ngày/tuần/tháng, lọc theo nhiều tiêu chí. |
| **Thống kê món bán chạy** | Thống kê món được gọi nhiều nhất và cảnh báo món ít phổ biến. |
| **Thống kê bàn sử dụng** | Phân tích tỷ lệ sử dụng bàn theo giờ để xác định khung giờ cao điểm. |

---

## 4. Hệ thống AI / Chatbot

| Chức năng | Mô tả chi tiết |
| :--- | :--- |
| **Thống kê hội thoại** | Đếm tổng số cuộc hội thoại với Chatbot, lọc theo ngày/tuần/tháng. |
| **Thống kê tần suất tương tác** | Phân tích mức độ tương tác theo khung giờ để biết giờ cao điểm. |
| **Tích hợp gửi mail (Make.com)** | Tự động gửi email xác nhận đơn hàng sau khi đặt thành công. |
| **Thống kê đơn hàng** | Thu thập và phân tích tổng số đơn hàng theo ngày, khung giờ, loại món. |
| **Thống kê chi tiết món được order** | Đếm số lần mỗi món được đặt để xếp hạng. |
| **Thống kê order theo khung giờ** | Phân tích số lượng đơn hàng theo Sáng – Trưa – Chiều – Tối. |
| **Phân tích chất lượng hội thoại** | Đánh giá hội thoại là "Tốt" (có đặt hàng) hoặc "Không tốt" (spam, không phản hồi). |
| **Cảnh báo hội thoại lỗi** | Gắn cờ các hội thoại "Không tốt" để nhân viên xem lại. |
| **Can thiệp thủ công vào hội thoại** | Cho phép nhân viên tiếp quản cuộc trò chuyện khi chatbot không xử lý được. |
| **Giới hạn khung giờ hoạt động** | Cấu hình chatbot chỉ hoạt động trong giờ làm việc. |
| **Trả lời bằng hình ảnh tương tác** | Chatbot có thể gửi hình ảnh món ăn, sơ đồ bàn để tăng tính trực quan. |

---

## 5. Nhật ký phát triển (Development Log)

Mục này ghi lại các thay đổi và tiến độ quan trọng của dự án theo thời gian.

### Ngày 26/11/2025 – Hệ thống thông báo, Checkout và Admin Inventory

**Tóm tắt thay đổi trong ngày:**
- **Notification (frontend):** Tạo `NotificationContext` với toast + modal confirm dùng chung; override `window.alert` sang toast; thay toàn bộ `window.confirm` trên các màn chính (`Checkout`, `OrderManagement`, `CustomerManagement`, `InventoryManagement`, `EmployeeList`, `TableMap`) bằng hàm `confirm()` từ context.
- **Checkout (`Checkout.js`):** Khôi phục đầy đủ component Checkout cho luồng đặt món `delivery/pickup`, dọn logic cũ liên quan đặt cọc; giữ lại phần tạo VietQR demo cho đơn thường (chưa có bước demo-confirm giống `ReservationPayment`).
- **Admin Inventory (`InventoryManagement.js`):** Kết nối lại các hành động xóa nguyên liệu/vật tư/món ăn với modal confirm mới; sửa lỗi ESLint do thiếu state `editingDish`/`setEditingDish` khiến frontend không build được.

**Tóm tắt rất ngắn cho AI mở chat mới (26/11/2025):**
- Hệ thống đã có **NotificationProvider** toàn cục (toast + confirm modal), không dùng alert/confirm thô nữa.
- `Checkout.js` hiện chỉ xử lý đơn đặt món bình thường (delivery/pickup), luồng đặt cọc đã tách sang `ReservationPayment.js`.
- Lỗi build ở `InventoryManagement.js` vì thiếu state edit món đã được fix.

### Ngày 28/11/2025 – Seed thực đơn & tối ưu trang Menu

**Tóm tắt thay đổi trong ngày:**
- **Database seed (`data.sql`):** Thêm đầy đủ seed cho bảng `categories` và ~100 món trong `dishes` (mì, món chính, món phụ, tráng miệng, đồ uống); sửa lỗi khóa ngoại và cú pháp (thiếu `;`, comment `//`).
- **Trang Thực đơn (`MenuPage.js` + `MenuPage.css`):**
  - `/menu` giờ đọc dữ liệu thật từ `/api/menu`, chỉ dùng `fallbackMenuData` khi API lỗi.
  - Giao diện card dạng lưới 1–2–3 cột (mobile/tablet/desktop), mỗi card có ảnh, tiêu đề, danh sách món dạng bullet.
  - Tự động chia nhỏ nhóm **Món chính** thành nhiều card mì theo quốc gia: Việt Nam, Nhật, Hàn, Thái, Singapore/Malaysia, Trung Hoa, Ý, và card `Món chính khác`.
  - Thay các ảnh không liên quan bằng ảnh món ăn (tô mì, pasta) cho các nhóm mì.

**Tóm tắt rất ngắn cho AI mở chat mới (28/11/2025):**
- DB `resv01_db` đã có menu thật ~100 món; cần luôn chạy `data.sql` sau khi khởi tạo DB.
- `/menu` đang phụ thuộc `/api/menu` và logic group trong `MenuPage.js` để gom lại card theo quốc gia; không nên thay đổi API nếu không update phần group này.
- Layout và style của `MenuPage` đã ổn cho bản demo (lưới card + responsive), chỉ còn tinh chỉnh nhỏ về hình ảnh/nội dung nếu muốn.

**Công việc tiếp theo sau 28/11/2025 (gợi ý cho AI/Dev):**
- **[Frontend] Dọn cảnh báo ESLint còn lại:** xử lý warning `react-hooks/exhaustive-deps` trong `MenuPage.js` (liên quan `useEffect` và `splitMainDishesByType`) bằng cách thêm dependency hợp lý hoặc bọc helper trong `useCallback`.
- **[Docs] Cập nhật README:** hoàn thiện `README.md` ở root/backend/frontend với hướng dẫn chạy DB, start server, tài khoản demo và checklist demo nhanh các luồng chính.
- **[QA] Chạy lại toàn bộ kịch bản E2E ở mục 8:** chạy tuần tự, ghi lại bug (nếu có) rồi cập nhật lại checklist mục 7–8 cho khớp trạng thái thực tế.
- **[UI/UX] Tinh chỉnh trang Menu (optional):** thay ảnh đại diện riêng cho từng quốc gia nếu có asset đẹp hơn, hoặc bổ sung filter nhanh (lọc theo quốc gia/price range).

## 6. Lộ trình phát triển (Development Roadmap)

Phần này vạch ra kế hoạch phát triển các chức năng còn lại cho vai trò Quản trị viên (Admin) theo thứ tự ưu tiên để tối ưu hóa tốc độ hoàn thành và đảm bảo tính logic của hệ thống.

### Việc cần làm tiếp để chốt đồ án (26/11/2025 – Shortlist)
- **Nhóm A – Bắt buộc trước khi bảo vệ:**
  - Rà soát và xử lý toàn bộ warning build/ESLint/console còn lại (ví dụ: ký tự BOM ở `Checkout.js`).
  - Chạy lại toàn bộ các kịch bản trong mục **8. Kịch bản kiểm thử End-to-End**, fix bug giao diện hoặc luồng nếu phát sinh.
  - Cập nhật `README.md` (root, backend, frontend) với hướng dẫn setup môi trường, tài khoản demo, và checklist demo nhanh cho giảng viên.
- **Nhóm B – Nâng cao sau khi đã ổn định bản demo:**
  - Bổ sung hiển thị trạng thái cọc (Chưa cọc/Đã cọc online/Đã cọc tại quầy) trên `ReservationManagement` và lịch sử đặt bàn của khách, dựa trên `reservations.deposit_order_id` + `orders.is_paid`.
  - Đồng bộ luồng VietQR demo-confirm cho `Checkout.js` giống `ReservationPayment.js` (optional, nếu muốn minh họa thanh toán online đẹp hơn cho đơn thường).
  - Xây dựng phiên bản rút gọn của module Loyalty/VIP (gắn tag khách hàng thân thiết, ưu đãi cơ bản) dựa trên mô tả ở mục 3.3.
*   [ ] **Tích hợp báo cáo theo thời gian thực:** Phát triển API và giao diện để xem báo cáo theo thời gian thực.

### Ngày 22/11/2025: Luồng Đặt cọc & Thanh toán VietQR (Demo)

**Tóm tắt ngắn cho AI:**

- Hoàn thiện luồng **đặt bàn có cọc 50%** cho cả 2 chế độ: chỉ đặt bàn và đặt bàn + pre-order món.
- Thanh toán cọc bằng **VietQR tĩnh** (dùng tài khoản demo), không cần kết nối ngân hàng thật.
- Thêm 1 bước **xác nhận thanh toán DEMO** để phục vụ bảo vệ đồ án: khách bấm nút "Tôi đã chuyển khoản xong (Demo)", hệ thống tự đánh dấu đơn cọc đã thanh toán.

**Backend – Các thay đổi chính:**

- **DB / Schema:**
    - `restauranttables.price`: giá bàn, do Admin cấu hình trên giao diện quản lý bàn.
    - `reservations.deposit_order_id`: khóa ngoại trỏ sang `orders.order_id` của **đơn cọc**.
- **Đặt bàn có cọc:**
    - `controllers/reservationController.js`:
        - Thêm hàm `createReservationWithDeposit`:
            - Nhận `date, time, guests, name, phone, notes, userId, tableId, reservationType, items`.
            - Tính **fullAmount = tablePrice + tổng tiền món pre-order**.
            - Tính **depositAmount = fullAmount / 2**.
            - Tạo `reservation` gắn `table_id`.
            - (Nếu có pre-order) tạo thêm `order` bếp/kitchen cho món gọi trước.
            - Tạo **đơn cọc** trong bảng `orders` và lưu ID vào `reservations.deposit_order_id`.
- **Thanh toán & VietQR:**
    - `modules/payments/paymentController.js`:
        - `createPaymentSession`:
            - Nhận thêm `amount` (tùy chọn) để hỗ trợ **thanh toán một phần** (cọc 50%) thay vì luôn thanh toán full.
            - Nếu `amount` hợp lệ (`>0` và `<= order.total_amount`) thì dùng `amount` làm số tiền thanh toán.
            - Khi method = `vietqr`, gọi `vietqrService` sinh `qrImageUrl`, `amount`, `description`.
            - Trả về `{ paymentId, qrImageUrl, amount, description }` cho frontend.
        - **Fix phân quyền** cho đơn cọc: nếu `order.user_id` đang `NULL` nhưng `req.user` là khách đăng nhập, tự gán `order.user_id = req.user.user_id` trước khi check `canAccessOrder`.
        - Thêm hàm `demoConfirmPayment`:
            - Route: `POST /api/payments/:id/demo-confirm` (đã đăng nhập).
            - Tìm `payment` theo `payment_id`, lấy `order` tương ứng.
            - Chỉ cho phép **chủ đơn** hoặc **role nội bộ** (Admin/Receptionist/Waiter/Kitchen) xác nhận.
            - Cập nhật `payments.status = 'succeeded'` và gọi `markOrderAsPaid(order_id, method)` để:
                - Đặt `orders.is_paid = 1`.
                - Nếu `orders.status = 'new'` → chuyển sang `preparing`.
    - `modules/payments/services/vietqrService.js`:
        - Tạo URL ảnh VietQR tĩnh từ `img.vietqr.io` dựa trên **số tài khoản demo, ngân hàng, số tiền, nội dung chuyển khoản**.
    - `routes/paymentRoutes.js`:
        - `POST /api/payments/session` → `createPaymentSession`.
        - `POST /api/payments/:id/demo-confirm` → `demoConfirmPayment` (dùng cho **demo đồ án**).

**Frontend – Các màn hình liên quan:**

- **Đặt bàn (khách hàng) – `pages/Reservation.js`:**
    - Khi khách chọn **đặt bàn có cọc**, gọi `POST /api/reservations/deposit` (map tới `createReservationWithDeposit`).
    - Backend trả về `reservation` + `deposit_order_id` + `full_amount` + `deposit_amount`.
    - Điều hướng sang `/reservation-payment` với `state.reservation` chứa đầy đủ thông tin trên.

- **Trang thanh toán cọc riêng – `pages/ReservationPayment.js`:**
    - Dùng lại style của `Checkout.css` nhưng tách logic ra khỏi `Checkout.js` để tránh rối.
    - Hiển thị:
        - Thông tin đặt bàn: tên, SĐT, ngày/giờ, bàn, số khách, ghi chú.
        - Tổng giá trị (`fullAmount`) và số tiền cần cọc (`depositAmount = 50%`).
    - Luồng tạo VietQR:
        - Mặc định chọn payment method = `vietqr`.
        - Khi bấm **"Xác nhận thanh toán tiền cọc"**:
            - Gọi `POST /api/payments/session` với body:
                - `{ orderId: deposit_order_id, method: 'vietqr', amount: depositAmount }` và header `Authorization: Bearer <token>`.
            - Backend trả `{ paymentId, qrImageUrl, amount, description }`.
            - Lưu vào state:
                - `orderId = deposit_order_id`.
                - `paymentId` để dùng cho bước demo-confirm.
                - `qrInfo` để hiển thị QR.
    - Sau khi tạo QR:
        - Hiển thị block VietQR: ảnh QR, số tiền, nội dung chuyển khoản.
        - Hiển thị nút **"Tôi đã chuyển khoản xong (Demo)"** nếu có `paymentId`:
            - Gọi `POST /api/payments/{paymentId}/demo-confirm` với token hiện tại.
            - Nếu thành công: alert "Thanh toán tiền cọc (demo) đã được xác nhận. Hẹn gặp bạn tại nhà hàng!" và điều hướng về `/`.
    - Nếu khách chọn **"Thanh toán tiền cọc tại quầy"**:
        - Không tạo payment session, chỉ alert nhắc khách mang tiền cọc tới quầy trước giờ dùng bữa, rồi điều hướng về `/`.

- **Checkout đơn hàng thường – `pages/Checkout.js`:**
    - Đã được **làm sạch** để chỉ xử lý **đơn đặt món bình thường (delivery/pickup)**.
    - Không còn logic liên quan đến đặt cọc; VietQR trong Checkout hiện mới ở mức tạo QR (chưa có demo-confirm như ReservationPayment, có thể bổ sung sau nếu cần).

**Cách giải thích cho giảng viên khi demo:**

1. Khách đăng nhập bằng role **Customer**.
2. Vào trang Đặt bàn, chọn ngày/giờ/số khách, bàn, và chọn chế độ **có đặt cọc 50%**.
3. Submit → hệ thống tạo `reservation` + đơn cọc `orders`, thanh toán cọc 50% bằng VietQR (demo-confirm), cập nhật trạng thái cọc trong lịch sử đặt bàn và màn Lễ tân.
4. Tại `/reservation-payment`:
    - Hệ thống hiển thị đầy đủ thông tin đặt bàn và số tiền cọc.
    - Khi bấm **"Xác nhận thanh toán tiền cọc"**, hệ thống sinh mã VietQR với số tiền đúng 50%.
5. Nói với giảng viên: "Giả sử em đã mở app ngân hàng, quét mã và chuyển khoản xong".
6. Bấm **"Tôi đã chuyển khoản xong (Demo)"** → backend gọi `demoConfirmPayment`, đánh dấu **đơn cọc đã thanh toán**.
7. Hệ thống hiển thị thông báo thành công và quay về trang chủ.

**Gợi ý TODO / Hướng dẫn cho AI khi làm tiếp (không bắt buộc cho đồ án, nhưng nên biết):**

- **[UI trạng thái cọc]**: Trên màn `ReservationManagement.js` (Lễ tân) và lịch sử đặt bàn của khách, có thể hiển thị thêm cột/trạng thái kiểu:
    - "Đã cọc online", "Đã cọc tại quầy", "Chưa cọc" dựa trên `reservations.deposit_order_id` + `orders.is_paid`.
- **[Thanh toán cọc tiền mặt]**: Thêm action cho staff (Lễ tân) để đánh dấu **"Đã nhận cọc tiền mặt"**:
    - Ví dụ: API `POST /api/reservations/:id/mark-deposit-cash` hoặc dùng lại bảng `payments` với method = `cash`.
- **[Đồng bộ VietQR demo cho Checkout]**: Nếu muốn đẹp hơn, có thể copy cơ chế `paymentId + /demo-confirm` sang `Checkout.js` để demo thanh toán VietQR cho **đơn delivery/pickup** giống như đặt cọc.
- **[Thanh toán thật qua VietQR/MoMo]**: Đối với đồ án, không bắt buộc kết nối gateway thật. Nếu sau này nâng cấp:
    - Cần IPN/webhook từ ngân hàng/ví điện tử để tự động gọi logic tương đương `demoConfirmPayment`.
    - Cần thêm bảng log giao dịch chi tiết (mã giao dịch, thời gian, mã tham chiếu).

> **Lưu ý cho AI:** Khi chỉnh sửa các phần liên quan đến đặt cọc/Thanh toán:
> - Đừng phá vỡ các API đã dùng ở frontend: `/api/reservations/deposit`, `/api/payments/session`, `/api/payments/:id/demo-confirm`.
> - Hạn chế đổi schema trừ khi thực sự cần; ưu tiên mở rộng thêm cột hoặc bảng mới.
> - Đọc kỹ các controller: `reservationController`, `paymentController`, `tableController` trước khi sửa để tránh làm sai luồng.

---

## 7. Checklist triển khai thực tế (dùng cho bảo vệ đồ án)

- [x] Luồng đặt món online (delivery/pickup): khách xem menu, thêm vào giỏ, chọn hình thức giao hàng, tạo `orders` + `orderitems`, xem lịch sử đơn và chi tiết trong trang Profile.
- [x] Luồng đặt bàn & cọc VietQR: khách chọn ngày/giờ/bàn, tạo `reservations` + đơn cọc `orders`, thanh toán cọc 50% bằng VietQR (demo-confirm), cập nhật trạng thái cọc trong lịch sử đặt bàn và màn Lễ tân.
- [x] Luồng Pre-order Dine-in: khách đặt bàn kèm gọi món trước qua `PreOrderPopup`, backend tạo order pre-order cho Bếp, `KitchenOrders` hiển thị đúng món và giờ khách đến.
- [x] Luồng Staff – Bếp: màn hình `KitchenOrders` đọc danh sách đơn dine-in `new/preparing`, cho phép cập nhật trạng thái; đồng bộ với trạng thái bàn qua `orders` + `restauranttables`.
- [x] Luồng Staff – Phục vụ bàn: `TableMap` hiển thị sơ đồ bàn, cho phép mở `TableMenu` để tạo đơn tại bàn; bàn chuyển trạng thái `free/reserved/occupied` theo `reservations` và đơn dine-in thực tế.
- [x] Luồng Admin – Quản lý đơn: `OrderManagement.js` xem tất cả đơn, lọc, xem chi tiết, cập nhật trạng thái/hủy đơn.
- [x] Luồng Admin – Thống kê: `SalesReport.js` lấy dữ liệu thật từ `/api/reports/sales` (tổng đơn, tổng doanh thu, top món bán chạy) để demo phần báo cáo.
- [x] Thanh toán online VietQR: dùng `/api/payments/session` với method=`vietqr` cho cả đơn đặt món thường (`Checkout`) và đơn cọc đặt bàn (`ReservationPayment`), có nút demo xác nhận thanh toán.
- [x] Thanh toán MoMo Sandbox cho đơn hàng: backend tích hợp `momoService` (sandbox), tạo session `method='momo'` và chuyển hướng tới `payUrl`; kết quả được backend xử lý và chuyển tiếp về trang `/payment/result` trên frontend.
- [ ] Các tính năng nâng cao khác (2FA, đa thiết bị, Loyalty/VIP, AI/Chatbot, thống kê hội thoại...) **không bắt buộc** trong phạm vi demo tốt nghiệp hiện tại, nhưng đã được mô tả sẵn để làm roadmap mở rộng.

---

## 8. Kịch bản kiểm thử End-to-End (dành cho AI/Dev ở chat mới)

> **Mục tiêu:** Khi mở chat mới, AI hoặc Dev có thể dựa trên phần này để hiểu nhanh hệ thống đang ở trạng thái nào và test lại toàn bộ các luồng chính (không đụng tới AI/Chatbot).

### 8.1. Chuẩn bị môi trường

- [ ] Chạy lần lượt các script DB: `create_db.sql` → `data.sql` → `migration_sync_schema.sql`.
- [ ] Đảm bảo `.env` backend có các biến tối thiểu:
  - Kết nối MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
  - Cấu hình MoMo sandbox (tuỳ chọn, có default): `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT`, `MOMO_RETURN_URL`, `MOMO_IPN_URL`.
  - `PAYMENT_RESULT_URL` trỏ về `http://localhost:3000/payment/result` (hoặc domain frontend thực tế).
- [ ] Start backend (`backend/server.js`) và frontend (React app) bình thường.

### 8.2. Luồng Khách hàng – Đặt món online (delivery/pickup)

1. Vào trang `Menu` hoặc sử dụng `MenuDisplay` trên HomePage để thêm vài món vào giỏ hàng.
2. Mở panel giỏ hàng (BackToTop cart) → bấm "Đặt món" để đi tới `/checkout`.
3. Trên `/checkout`:
   - Chọn hình thức: `delivery` (có địa chỉ) hoặc `pickup`.
   - Điền Họ tên, SĐT, (và Địa chỉ nếu delivery).
   - Chọn phương thức thanh toán **Cash**.
4. Bấm "Xác nhận đặt món".
5. Kiểm tra:
   - DB: bảng `orders` có thêm 1 dòng `order_type` = `delivery`/`pickup`, `status = 'new'`, `is_paid = 0`.
   - `orderitems` chứa đúng danh sách món.
   - Trong Profile khách (`/profile/orders`) thấy đơn mới trong lịch sử.

### 8.3. Luồng Khách hàng – Đặt món online + VietQR (demo)

1. Đăng nhập với role `Customer` (hoặc user thường).
2. Lặp lại bước 8.2 nhưng chọn **VietQR** thay vì Cash.
3. Sau khi tạo đơn, frontend gọi `/api/payments/session` (method=`vietqr`).
4. Kiểm tra:
   - UI hiển thị block VietQR: ảnh QR, số tiền, nội dung chuyển khoản, nút **"Tôi đã chuyển khoản xong (Demo)"**.
5. Bấm nút Demo Confirm:
   - Gửi `POST /api/payments/:id/demo-confirm` với token.
   - Backend: `payments.status = 'succeeded'`, `orders.is_paid = 1`, nếu `status = 'new'` → `preparing`.
   - Frontend alert thành công và quay về `/`.

### 8.4. Luồng Khách hàng – Đặt món online + MoMo Sandbox

1. Đăng nhập với role `Customer`.
2. Thêm món vào giỏ, vào `/checkout`.
3. Chọn phương thức thanh toán **MoMo**.
4. Bấm "Xác nhận đặt món":
   - Backend tạo order.
   - Gọi `/api/payments/session` với `{ orderId, method: 'momo' }`.
   - Nhận `payUrl` từ MoMo sandbox → trình duyệt chuyển sang trang MoMo.
5. Thực hiện thao tác demo trên UI MoMo (không cần thanh toán thật).
6. MoMo redirect về backend `/api/payments/momo/return` → backend xử lý và redirect tiếp tới `/payment/result` trên frontend với `status` và `orderId`.
7. Kiểm tra:
   - Trang `/payment/result` hiển thị kết quả tương ứng.
   - DB: `payments.status` đã cập nhật, `orders.is_paid` và `orders.status` phù hợp.

### 8.5. Luồng Khách hàng – Đặt bàn có cọc 50% (VietQR demo)

1. Đăng nhập (hoặc dùng khách đã đăng ký) → vào `/reservation`.
2. Chọn ngày, giờ, số khách, mở sơ đồ bàn (`ReservationTableMap`) và chọn bàn phù hợp.
3. Chọn loại hình **Chỉ đặt bàn** hoặc **Đặt bàn & Gọi món trước**:
   - Nếu có pre-order → sau submit sẽ mở `PreOrderPopup` để chọn món, rồi mới gửi lên backend.
4. Submit form:
   - Gọi `POST /api/reservations/deposit`.
   - Backend tạo `reservations` + đơn cọc trong `orders` (và order pre-order nếu có).
   - Frontend điều hướng tới `/reservation-payment` với state `reservation`.
5. Tại `/reservation-payment`:
   - Kiểm tra thông tin đặt bàn (tên, SĐT, bàn, số khách, tổng tiền, tiền cọc 50%).
   - Mặc định chọn `paymentMethod = 'vietqr'`.
6. Bấm "Xác nhận thanh toán tiền cọc":
   - Gọi `/api/payments/session` với `{ orderId: deposit_order_id, method: 'vietqr', amount: depositAmount }`.
   - Hiển thị QR + nút demo-confirm.
7. Bấm "Tôi đã chuyển khoản xong (Demo)":
   - Gọi `/api/payments/:paymentId/demo-confirm`.
   - DB: đơn cọc được đánh dấu `is_paid = 1`, `status` cập nhật.
   - Frontend alert thành công và quay về `/`.

### 8.6. Luồng Pre-order Dine-in (Bếp nhìn thấy món gọi trước)

1. Làm lại 8.5 với chế độ **Đặt bàn & Gọi món trước**.
2. Khi tạo reservation, backend sẽ:
   - Tạo order dine-in pre-order gắn với bàn + reservation.
   - `orderitems.note` chứa "Pre-order cho đặt bàn #<reservation_id>".
3. Mở màn hình Bếp `/admin/kitchen-orders` (role Admin/Kitchen):
   - Thấy card đơn mới với flag `is_preorder = true`, có thông tin giờ đến dự kiến.
4. Thay đổi trạng thái trên Kanban (Mới → Đang làm → Đã xong) và kiểm tra cập nhật DB.

### 8.7. Luồng Staff – Phục vụ tại bàn (TableMap + TableMenu)

1. Đăng nhập với role `Waiter` hoặc `Admin`.
2. Vào `/admin/tables` (TableMap):
   - Xem trạng thái các bàn: `TRỐNG`, `ĐÃ ĐẶT`, `ĐANG PHỤC VỤ`.
3. Chọn một bàn trống → mở `TableMenu` (route `/table/:tableId` hoặc `/waiter/order/:tableId`).
4. Trên `TableMenu`:
   - Chọn một số món → bấm "Gửi yêu cầu đến bếp".
   - Backend tạo order dine-in, `restauranttables.status = 'occupied'`.
5. Quay lại TableMap:
   - Bàn đó chuyển sang trạng thái đang phục vụ.
6. Mở `KitchenOrders`:
   - Thấy đơn dine-in mới cho bàn vừa gọi.
7. Khi Bếp chuyển trạng thái đơn sang `completed` (và không còn đơn dine-in active nào cho bàn đó):
   - Kiểm tra TableMap: bàn tự quay về `TRỐNG`.

### 8.8. Luồng Khách hàng – Chỉnh giỏ hàng bằng PreOrderPopup trong Checkout

1. Thêm vài món vào giỏ hàng từ Menu.
2. Vào `/checkout`.
3. Bấm nút **"Chỉnh danh sách món bằng giao diện đặt món"** bên cột Tóm tắt đơn hàng.
4. `PreOrderPopup` xuất hiện với danh sách món hiện tại đã được load sẵn.
5. Thêm/bớt món trong popup, bấm "Thanh toán" (thực chất là xác nhận danh sách món):
   - Kiểm tra lại `cartItems` trên Checkout đã được cập nhật đúng.
   - Kiểm tra `localStorage.cartItems` đã sync với danh sách mới.
6. Tiếp tục đặt món bình thường (Cash/VietQR/MoMo) để hoàn tất đơn.

### 8.9. Luồng Admin – Quản lý đơn & Báo cáo

1. Đăng nhập `Admin` → vào `/admin/orders`:
   - Thấy các đơn vừa tạo ở các bước trên (dine-in, delivery, pickup).
   - Thử lọc, xem chi tiết, cập nhật trạng thái/hủy đơn.
2. Vào `/admin/reports`:
   - Chọn khoảng thời gian bao gồm các đơn vừa test.
   - API `/api/reports/sales` trả summary + `top_dishes`.
   - UI hiển thị tổng số đơn hoàn thành, tổng doanh thu, bảng Top món bán chạy.

> **Gợi ý cho AI ở chat mới:** Trước khi sửa code, hãy đọc nhanh mục 7 và 8 để nắm:
> - Những luồng nào đã hoàn chỉnh end-to-end và không nên phá vỡ.
> - Cách tái hiện các kịch bản test để verify sau khi chỉnh sửa.