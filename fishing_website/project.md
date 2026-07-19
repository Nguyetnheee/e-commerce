# Nhật ký Phát triển Dự án - Wild & Water

Bản ghi tiến độ và nhật ký các đầu việc đã hoàn thành cho dự án thương mại điện tử trang bị dã ngoại **Wild & Water**.

---

## 📅 Tiến độ cập nhật (26/06/2026)

### 1. ⚙️ Cấu trúc và Kiến trúc Dự án
*   Khởi tạo dự án Next.js (App Router) với TypeScript và Tailwind CSS.
*   Cấu hình tệp `tailwind.config.ts` để đồng bộ hóa hệ thống màu sắc (Primary Ocean Blue, Secondary Forest Green, Accent Warm Orange), khoảng cách spacing dã ngoại và góc bo tròn tactile (`rounded-2xl`).
*   Việt hóa tiêu đề và mô tả trong layout gốc `app/layout.tsx`.

### 2. 🧭 Điều hướng & Header Hợp nhất
*   Thiết kế thành phần điều hướng `components/Header.tsx` đồng bộ trên toàn bộ dự án.
*   Việt hóa toàn bộ thanh menu: **Trang chủ**, **Biển**, **Sông**, **Hồ**, **Hoạt động**, **Giới thiệu**.
*   Đồng bộ hóa hiệu ứng đường gạch chân màu xanh (Primary active line) cho từng danh mục dựa trên URL hash thực tế khi tải trang.
*   Thiết kế ô tìm kiếm bo tròn với chữ hiển thị *"Tìm kiếm trang bị..."*, nút giỏ hàng hiển thị số lượng vật phẩm `3`.

### 3. ⛺ Thẻ Địa hình trên Trang chủ (`app/page.tsx`)
*   Định cấu hình 4 thẻ địa hình lớn (Biển, Sông suối, Hồ cá, Cắm trại).
*   Chuyển đổi toàn bộ liên kết (`href`) từ liên kết hash nội bộ (`#`) thành liên kết chuyển hướng chính xác đến trang danh mục mua sắm:
    *   **Biển** -> `/category#sea`
    *   **Sông suối** -> `/category#river`
    *   **Hồ cá** -> `/category#lake`
    *   **Cắm trại** -> `/category#camping`

### 4. 🛍️ Trang Danh mục Mua sắm (`app/category/page.tsx`)
*   Xây dựng cơ chế bắt sự kiện thay đổi hash của Next.js trên client để hoán đổi layout tương ứng.
*   **Trang Câu Cá Sông Suối (#river)**: Layout tối giản hiển thị cần suối carbon dẻo dai.
*   **Trang Câu Cá Biển (#sea)**: Biểu ngữ đại dương, bộ lọc Chất liệu (Titan, Carbon, Thép không gỉ) và menu phụ phân loại (Trang bị, Trang phục, Khuyến mãi).
*   **Trang Câu Cá Hồ (#lake)**:
    *   Biểu ngữ cầu gỗ hồ mờ sương với tiêu đề biểu ngữ *"Đồ câu Hồ"*.
    *   Bộ lọc loại hình câu có `"Câu Lục"` được chọn mặc định trên sidebar.
    *   Giải quyết việc hiển thị 6 sản phẩm mặc định bằng cách cho phép các sản phẩm hỗ trợ nhiều loại hình câu (`types: string[]`).
    *   Đồng bộ nút giỏ hàng hình tròn màu xanh biển ở góc phải sản phẩm theo mẫu thiết kế.
    *   Thiết lập số đếm counter sản phẩm hiển thị `Hiển thị 24 sản phẩm` khi ở bộ lọc mặc định và cập nhật động khi thay đổi tùy chọn bộ lọc.
*   **Trang Cắm Trại & Dã Ngoại (#camping)**:
    *   Tích hợp biểu ngữ cắm trại dã ngoại trong rừng (`camping.png`).
    *   Bổ sung kho dữ liệu dã ngoại gồm Lều Peak-4, Ghế dã ngoại xếp gọn, Hòm 36L dã ngoại và Áo khoác chống UV.
    *   Tạo bộ lọc đặc trưng cho dã ngoại gồm Thương hiệu (WildStream, Naturehike) và phân loại dã ngoại (Lều trại, Ghế & Thảm, Phụ kiện, Trang phục).

### 5. 💳 Thành phần Thẻ Sản phẩm (`components/ProductCard.tsx`)
*   Thiết lập 3 phong cách thẻ:
    *   `minimal` (cho sông suối - tối giản).
    *   `detailed` (cho biển & cắm trại - có nút yêu thích, đánh giá sao, nút thêm giỏ hàng rộng).
    *   `lake` (cho hồ - tiêu đề thương hiệu phụ, nút giỏ hàng tròn xanh Primary bên góc phải).
*   Tối ưu hóa các thẻ tag badge trạng thái (`Bán chạy` - màu xanh lục nhạt, `Mới về` - màu xanh dương đậm hoặc cam).

---

## 🔬 Kết quả Kiểm thử & Build dự án
*   **Biên dịch Next.js Build**: Biên dịch thành công 100% không có lỗi Typescript hay CSS.
*   **Hoạt động local**: Máy chủ dev chạy ổn định, đồng bộ hash hoàn hảo trên trình duyệt.
