# Bối cảnh dự án: Website Quản lý Nhà hàng - Nhóm 14

Tài liệu này mô tả chi tiết các chức năng của hệ thống website quản lý nhà hàng, được phân chia theo vai trò người dùng. Mục tiêu là cung cấp một nguồn thông tin tham chiếu đầy đủ và nhất quán cho AI Assistant để hỗ trợ phát triển và tránh quên ngữ cảnh.

## 0. Ghi chú chung về dự án

- **Trọng tâm sản phẩm:** Nhà hàng tập trung chủ yếu vào các món mì nổi tiếng trên thế giới. Các món ăn kèm, tráng miệng và đồ uống là các sản phẩm phụ.
- **Thiết kế đáp ứng (Responsive Design):** Tất cả các giao diện phía khách hàng phải được thiết kế để hoạt động tốt trên cả máy tính (desktop) và thiết bị di động (mobile).
- **Dữ liệu mẫu:** Trong giai đoạn phát triển giao diện, hệ thống sẽ sử dụng dữ liệu mẫu (mock data) để không phụ thuộc vào backend.

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
