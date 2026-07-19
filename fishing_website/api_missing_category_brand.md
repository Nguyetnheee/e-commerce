# Báo cáo các API Quản lý Danh mục & Thương hiệu còn thiếu cho Backend

Hiện tại, hệ thống đã kết nối hoàn chỉnh các API hiển thị Danh mục và Thương hiệu dưới dạng danh sách Dropdown để phục vụ chức năng tạo Sản phẩm mới trong trang Admin. 

Tuy nhiên, qua rà soát tài liệu OpenAPI (Swagger), chúng tôi nhận thấy **Backend chưa cung cấp các API để ADMIN có thể tự tạo mới, sửa đổi hoặc xóa các Danh mục và Thương hiệu** từ giao diện quản trị. 

Để ADMIN có thể tự chủ quản lý vòng đời dữ liệu này mà không cần can thiệp trực tiếp vào Database, kính đề xuất Backend bổ sung các đầu API sau:

---

## 1. Các API Quản lý Thương hiệu (Brands)
Hiện tại chỉ có API lấy danh sách thương hiệu (`GET /api/v1/admin/brands`). Đề xuất bổ sung:

### 1.1. Tạo mới thương hiệu
* **Endpoint:** `POST /api/v1/admin/brands`
* **Quyền hạn:** `ADMIN`
* **Request Body (`CreateBrandRequest`):**
  ```json
  {
    "name": "Tên thương hiệu (bắt buộc)",
    "country": "Quốc gia xuất xứ (tùy chọn)"
  }
  ```
* **Response (`201 Created`):** Trả về đối tượng BrandResponse chi tiết vừa tạo.

### 1.2. Cập nhật thương hiệu
* **Endpoint:** `PUT /api/v1/admin/brands/{id}`
* **Quyền hạn:** `ADMIN`
* **Request Body (`UpdateBrandRequest`):**
  ```json
  {
    "name": "Tên thương hiệu mới",
    "country": "Quốc gia xuất xứ mới"
  }
  ```

### 1.3. Xóa thương hiệu
* **Endpoint:** `DELETE /api/v1/admin/brands/{id}`
* **Quyền hạn:** `ADMIN`
* **Mô tả:** Xóa thương hiệu khỏi hệ thống. Nếu có sản phẩm đang liên kết, trả về mã lỗi `409 Conflict` kèm thông điệp phù hợp.

---

## 2. Các API Quản lý Danh mục sản phẩm (Categories)
Hiện tại chỉ có API lấy cây danh mục (`GET /api/v1/admin/categories/tree` và `PUT /api/v1/admin/categories/tree` để sắp xếp). Đề xuất bổ sung:

### 2.1. Tạo mới danh mục
* **Endpoint:** `POST /api/v1/admin/categories`
* **Quyền hạn:** `ADMIN`
* **Request Body (`CreateCategoryRequest`):**
  ```json
  {
    "name": "Tên danh mục (bắt buộc)",
    "parentId": 123 // ID danh mục cha nếu là danh mục con (tùy chọn), để null nếu là danh mục gốc
  }
  ```

### 2.2. Cập nhật danh mục
* **Endpoint:** `PUT /api/v1/admin/categories/{id}`
* **Quyền hạn:** `ADMIN`
* **Request Body (`UpdateCategoryRequest`):**
  ```json
  {
    "name": "Tên danh mục mới",
    "parentId": 123 // Cập nhật danh mục cha mới (tùy chọn)
  }
  ```

### 2.3. Xóa danh mục
* **Endpoint:** `DELETE /api/v1/admin/categories/{id}`
* **Quyền hạn:** `ADMIN`
* **Mô tả:** Xóa danh mục. Yêu cầu ràng buộc: Nếu danh mục có chứa sản phẩm hoặc có danh mục con trực thuộc, trả về mã lỗi `400 Bad Request` hoặc `409 Conflict`.
