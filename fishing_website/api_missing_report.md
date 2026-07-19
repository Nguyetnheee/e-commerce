# Báo cáo các API còn thiếu trong luồng Product, Checkout, Payment

Tài liệu này tổng hợp chi tiết các API cần bổ sung hoặc cải tiến ở phía Backend (BE) để tối ưu hóa và vận hành mượt mà các luồng chức năng chính trên website. Hãy chuyển giao tài liệu này cho đội ngũ phát triển Backend của bạn.

---

## 1. Luồng Sản phẩm (Product Flow)

### Hiện trạng
Backend đã cung cấp các API cơ bản: lấy tất cả sản phẩm (`GET /api/v1/products`), chi tiết sản phẩm (`GET /api/v1/products/{id}`), và tìm kiếm.

### Các API / Chức năng cần bổ sung ở Backend:
1. **Bộ lọc nâng cao ở DB Layer (Advanced Query Filters):**
   - **Yêu cầu:** Hiện tại API `GET /api/v1/products` chỉ lọc được theo `categoryId`, `brandId`. Frontend đang phải tải toàn bộ sản phẩm về rồi tự lọc thủ công theo khoảng giá, chất liệu, độ cứng (action). Khi dữ liệu lớn lên, cách này sẽ làm chậm hệ thống.
   - **Đề xuất tham số bổ sung cho API:**
     * `minPrice` & `maxPrice`: Lọc sản phẩm có giá biến thể (variant price) nằm trong khoảng.
     * `materials` (ví dụ: Titan, Carbon, Thép không gỉ): Danh sách chất liệu lọc.
     * `actions` (ví dụ: Fast, Moderate, Slow): Độ cứng của cần câu.
   - **Endpoint đề xuất:** Cập nhật tham số query của `GET /api/v1/products`.

2. **Sắp xếp sản phẩm (Sorting API):**
   - **Yêu cầu:** Cho phép người dùng sắp xếp danh sách sản phẩm ở giao diện.
   - **Đề xuất tham số:** `sortBy` nhận các giá trị như `priceAsc` (giá tăng dần), `priceDesc` (giá giảm dần), `bestSeller` (bán chạy nhất), `newest` (mới nhất).

3. **API danh sách Thương hiệu/Thẻ lọc động:**
   - **Yêu cầu:** Hiện tại chỉ có API lấy tất cả thương hiệu (`GET /api/v1/brands`). Cần có API lấy danh sách thương hiệu *chỉ thuộc về một danh mục hoặc địa hình câu cụ thể* để bộ lọc bên sidebar hiển thị chính xác các thương hiệu đang có sản phẩm.
   - **Endpoint đề xuất:** `GET /api/v1/brands?categoryId={id}` hoặc `GET /api/v1/brands?location={BIEN/HO/SUOI}`.

---

## 2. Luồng Đặt hàng & Giao hàng (Checkout & Order Flow)

### Hiện trạng
Backend đã có API tạo đơn hàng `POST /api/v1/orders` nhận thông tin người nhận, địa chỉ và danh sách sản phẩm biến thể.

### Các API / Chức năng cần bổ sung ở Backend:
1. **API tính phí vận chuyển động (Shipping Fee Calculation API):**
   - **Yêu cầu:** Frontend hiện tại đang tính cứng phí vận chuyển (miễn phí ship cho đơn hàng trên 3,000,000đ, đơn dưới tính 50,000đ). Cần có API tính phí vận chuyển động dựa trên địa chỉ tỉnh/thành phố của khách hàng và trọng lượng đơn hàng.
   - **Endpoint đề xuất:**
     * `POST /api/v1/orders/shipping-fee`
     * **Request Body:** `{ "province": "Hà Nội", "district": "Cầu Giấy", "items": [{ "variantId": 1, "quantity": 2 }] }`
     * **Response:** `{ "shippingFee": 35000 }`

2. **API Quản lý & Áp dụng Mã giảm giá (Discount/Coupon API):**
   - **Yêu cầu:** Giao diện mockup yêu cầu áp dụng mã giảm giá (như `WILD15`). Backend cần có luồng kiểm tra mã giảm giá hợp lệ và trừ tiền trực tiếp trên đơn hàng.
   - **Endpoints đề xuất:**
     * `POST /api/v1/coupons/validate` để kiểm tra mã giảm giá từ giao diện giỏ hàng trước khi checkout.
     * Thêm trường `couponCode` (string, optional) vào request body của API tạo đơn hàng `POST /api/v1/orders`.

---

## 3. Luồng Cổng thanh toán (Payment Flow & PayOS Integration)

### Hiện trạng
Backend tích hợp PayOS, trả về `checkoutUrl` when tạo đơn hàng thành công bằng phương thức chuyển khoản. Trạng thái đơn hàng được đồng bộ tự động thông qua Webhook PayOS gọi vào Backend.

### Các API / Chức năng cần bổ sung ở Backend:
1. **API kiểm tra trạng thái thanh toán từ Client (Payment Status Inquiry API):**
   - **Yêu cầu:** Sau khi khách hàng thực hiện chuyển khoản thành công trên trang PayOS và được chuyển hướng về trang thành công (`/payment/success`), frontend cần gọi API để truy vấn trạng thái thanh toán của đơn hàng ngay lập tức để cập nhật thông tin "Thanh toán thành công / Chờ xử lý" lên màn hình cho khách hàng an tâm.
   - **Endpoint đề xuất:**
     * `GET /api/v1/orders/tracking/{orderCode}/payment-status`
     * **Response:** `{ "orderCode": "WSG-12345", "paymentStatus": "PAID/PENDING/FAILED" }`

2. **API tạo lại liên kết thanh toán PayOS (Regenerate Payment Link API):**
   - **Yêu cầu:** Nếu khách hàng bấm hủy thanh toán hoặc gặp sự cố ngắt kết nối khi đang ở trang thanh toán PayOS, đơn hàng đã được tạo trong hệ thống với trạng thái `PENDING` (chờ thanh toán), nhưng liên kết PayOS cũ có thể đã hết hạn hoặc bị đóng. Cần có API để người dùng tạo lại link thanh toán PayOS mới cho đơn hàng hiện tại mà không bắt họ phải tạo lại giỏ hàng và đặt đơn mới từ đầu.
   - **Endpoint đề xuất:**
     * `POST /api/v1/orders/{orderCode}/recreate-payment-link`
     * **Response:** `{ "checkoutUrl": "https://pay.payos.vn/web/..." }`

---

## 4. Luồng Bài viết & Blog (Blog & Post Flow)

### Hiện trạng
Backend hiện tại mới chỉ cung cấp các API quản lý bài viết thuộc quyền quản trị Admin (`GET /api/v1/admin/posts`, `POST /api/v1/admin/posts`, `DELETE /api/v1/admin/posts/{id}`). Các API này yêu cầu xác thực bằng Token của Admin (Bearer Token). Khi khách hàng vãng lai truy cập vào trang Blog công khai, do không có token admin nên việc gọi các API này sẽ bị trả về lỗi `401 Unauthorized` hoặc `403 Forbidden`, dẫn tới không thể tải bài viết thật từ CSDL.

### Các API / Chức năng cần bổ sung ở Backend:
1. **API lấy danh sách bài viết công khai (Public Blog List API):**
   - **Yêu cầu:** Cho phép khách hàng công khai truy cập mà không yêu cầu đăng nhập hay Header Authorization (xóa bỏ chế độ bắt buộc có Token đối với API này).
   - **Endpoint đề xuất:**
     * `GET /api/v1/posts`
     * **Response:** Trả về danh sách bài viết chứa thông tin tiêu đề, tác giả, slug, tóm tắt và nội dung bài viết tương tự `PostResponse`.

2. **API lấy chi tiết bài viết công khai (Public Blog Detail API):**
   - **Yêu cầu:** Cho phép khách hàng đọc nội dung đầy đủ của một bài viết cụ thể mà không cần quyền Admin.
   - **Endpoint đề xuất:**
     * `GET /api/v1/posts/{id}` hoặc `GET /api/v1/posts/slug/{slug}` (để hỗ trợ SEO đường dẫn đẹp).
     * **Response:** Trả về chi tiết bài viết.

