# Hướng dẫn chạy Database

## Yêu cầu
- MySQL 8.0+
- MySQL Workbench hoặc CLI

## Thứ tự chạy các file SQL

### 1. Tạo cấu trúc database
```sql
source d:/restaurant-management-website/data/create_db.sql
```
> Tạo database `resv01_db` và tất cả các bảng cần thiết.

### 2. Thêm dữ liệu mẫu
```sql
source d:/restaurant-management-website/data/data.sql
```
> Thêm dữ liệu mẫu: roles, users, dishes, categories, tables, floors...

### 3. Đồng bộ schema (migration)
```sql
source d:/restaurant-management-website/data/migration_sync_schema.sql
```
> Cập nhật schema mới nhất (thêm cột, sửa bảng nếu có).

### 4. Cập nhật hình ảnh món ăn
```sql
source d:/restaurant-management-website/data/update_dish_images.sql
```
> Cập nhật đường dẫn hình ảnh cho 100 món ăn.

### 5. Thêm bảng phân quyền
```sql
source d:/restaurant-management-website/data/migration_permissions.sql
```
> Tạo bảng `permissions`, `role_permissions` và dữ liệu phân quyền mặc định.

### 6. Thêm users demo (tùy chọn)
```sql
source d:/restaurant-management-website/data/demo_users.sql
```
> Reset password và thêm nhiều users để demo.

---

## Tóm tắt thứ tự

| Bước | File | Mô tả |
|------|------|-------|
| 1 | `create_db.sql` | Tạo database & bảng |
| 2 | `data.sql` | Dữ liệu mẫu |
| 3 | `migration_sync_schema.sql` | Đồng bộ schema |
| 4 | `update_dish_images.sql` | Hình ảnh món ăn |
| 5 | `migration_permissions.sql` | Phân quyền |
| 6 | `demo_users.sql` | Users demo (tùy chọn) |

---

## Tài khoản demo

Sau khi chạy `demo_users.sql`, tất cả tài khoản dùng chung password: `123123`

| Vai trò | Email | Mô tả |
|---------|-------|-------|
| Admin | `admin@example.com` | Quản trị viên |
| Receptionist | `huong.nguyen@noodles.vn` | Lễ tân |
| Waiter | `nam.tran@noodles.vn` | Phục vụ |
| Kitchen | `bep.nguyen@noodles.vn` | Bếp |
| Customer | `nguyen.an@example.com` | Khách hàng |

---

## Lưu ý

- Chạy đúng thứ tự để tránh lỗi foreign key
- File `queries.sql` chứa các truy vấn tham khảo, không cần chạy
- Nếu gặp lỗi duplicate, có thể chạy lại từ bước 1 (sẽ xóa dữ liệu cũ)
