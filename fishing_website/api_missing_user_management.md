# Báo cáo các API còn thiếu - Quản lý Người dùng & Đăng ký Admin (User Management & Admin Self-Registration)

Để hỗ trợ đầy đủ các tính năng quản lý người dùng, phân quyền, và đảm bảo Quản trị viên (Admin) có thể tự đăng ký tài khoản hoặc quản trị toàn bộ danh sách khách hàng/nhân sự, chúng tôi đề xuất bổ sung các API sau đây cho Backend:

---

## 1. Đăng ký Admin / Tự tạo tài khoản Admin bảo mật

### 1.1 Tạo tài khoản Admin đầu tiên (First Admin Initial Setup)
Dùng khi khởi tạo hệ thống lần đầu (hoặc khi Database trống không có tài khoản). API này chỉ hoạt động khi bảng `users` chưa có tài khoản ADMIN nào.
- **Endpoint:** `POST /api/v1/admin/auth/setup-first-admin`
- **Headers:** Không yêu cầu (Public)
- **Request Body:**
  ```json
  {
    "username": "superadmin",
    "email": "admin@wildstream.com",
    "password": "securepassword123",
    "fullname": "Super Admin"
  }
  ```
- **Response (200 OK):** Trả về thông tin Admin kèm JWT Token để đăng nhập ngay lập tức.

### 1.2 Đăng ký Admin qua Khóa bí mật (Secure Admin Registration)
Cho phép nhân sự tự tạo tài khoản Admin hoặc nhân viên từ xa nếu họ sở hữu mã khóa mời (Invitation Secret Key) được cấu hình trên Backend.
- **Endpoint:** `POST /api/v1/admin/auth/register-staff`
- **Request Body:**
  ```json
  {
    "email": "staff1@wildstream.com",
    "password": "password123",
    "fullname": "Nguyễn Văn A",
    "phone": "0987654321",
    "role": "MANAGER", 
    "adminSecretKey": "WILDSTREAM_STAFF_SECRET_2026"
  }
  ```
- **Response (200 OK):** Trả về tài khoản đã tạo thành công và liên kết tự động vào các bảng phân quyền tương ứng.

---

## 2. Quản lý Khách hàng & Nhân sự (User & Customer Management)

Hiện tại Backend đã có `GET /api/v1/admin/users` (lấy danh sách nhân viên Admin, Manager, Approver). Cần bổ sung các API sau:

### 2.1 Lấy danh sách Khách hàng (Get General Customers)
Lấy danh sách các tài khoản người dùng thông thường (Khách mua hàng) để Admin có thể kiểm tra thông tin.
- **Endpoint:** `GET /api/v1/admin/customers`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 10,
      "email": "customer@gmail.com",
      "fullname": "Trần Văn Khách",
      "phone": "0912345678",
      "address": "123 Đường ABC, Hà Nội",
      "createdAt": "2026-07-15T12:00:00Z"
    }
  ]
  ```

### 2.2 Xem chi tiết thông tin một User bất kỳ
- **Endpoint:** `GET /api/v1/admin/users/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Trả về thông tin chi tiết (bao gồm địa chỉ, ngày sinh, giới tính, vai trò và lịch sử mua hàng sơ bộ).

### 2.3 Khóa / Mở khóa tài khoản (Lock / Unlock User Account)
Admin có quyền khóa tạm thời tài khoản của khách hàng vi phạm chính sách hoặc khóa tài khoản của nhân viên đã nghỉ việc.
- **Endpoint:** `PUT /api/v1/admin/users/{id}/status`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "status": "LOCKED", // "ACTIVE" | "LOCKED" | "DISABLED"
    "reason": "Spam đơn hàng ảo hoặc nghi ngờ gian lận"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "userId": 10,
    "status": "LOCKED",
    "message": "Đã khóa tài khoản thành công."
  }
  ```

### 2.4 Xóa vĩnh viễn tài khoản (Delete User)
- **Endpoint:** `DELETE /api/v1/admin/users/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Đã xóa tài khoản ID {id} thành công khỏi hệ thống."
  }
  ```

---

## 3. Chính sách Bảo mật & Phân quyền chỉnh sửa hồ sơ (Profile Privacy & Authorization Policy)

Để bảo vệ quyền riêng tư và tính toàn vẹn dữ liệu cá nhân của người dùng, đề xuất thiết lập chính sách phân quyền chỉnh sửa hồ sơ như sau:

### 3.1 Cá nhân tự chỉnh sửa hồ sơ của mình (Self Profile Update)
- Mọi tài khoản thuộc bất kỳ vai trò nào (ADMIN, MANAGER, USER, SHIPPER) đều có quyền tự cập nhật thông tin hồ sơ của chính mình thông qua endpoint hồ sơ cá nhân.
- **Endpoint:** `PUT /api/v1/users/me` (Đã có trong thiết kế Swagger hiện tại nhưng cần đảm bảo tất cả vai trò đều có quyền gọi thành công).
- **Quyền truy cập:** Bất kỳ Token hợp lệ nào của chính user đó.

### 3.2 Hạn chế quyền của Admin đối với Hồ sơ người khác (Admin Profile Mutation Restriction)
- **Quy tắc phân quyền:** Admin chỉ được phép quản lý trạng thái tài khoản (Khóa/Mở khóa qua `/status`, Phân vai trò qua `/roles`, hoặc Xóa qua `DELETE /users/{id}`).
- **Hạn chế:** Admin **KHÔNG ĐƯỢC PHÉP** gọi API để thay đổi/chỉnh sửa thông tin cá nhân (như email, số điện thoại, tên hiển thị, ngày sinh, địa chỉ) của các tài khoản khác. 
- Mọi yêu cầu cập nhật dữ liệu cá nhân của một User khác bởi Admin (kể cả khi gửi kèm Token Admin) đều phải bị Backend chặn lại và trả về mã lỗi `403 Forbidden` (Không có quyền can thiệp vào thông tin cá nhân của người khác).

