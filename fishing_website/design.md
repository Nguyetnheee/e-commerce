# Tài liệu Hướng dẫn Phong cách Thiết kế (Design Guidelines)
## Dự án: Wild & Water - WildStream Gear

Tài liệu này ghi lại các quy chuẩn, phong cách thiết kế và hệ thống giao diện chính của website **Wild & Water (WildStream Gear)**. Mọi trang mới hoặc thành phần (component) mới được phát triển thêm trong tương lai cần tuân thủ nghiêm ngặt các quy tắc dưới đây nhằm đảm bảo tính đồng bộ (consistency) và trải nghiệm cao cấp cho người dùng.

---

## 1. Phong cách & Định hướng Thẩm mỹ Chủ đạo
*   **Tinh thần thương hiệu:** *Wild & Water* kết hợp sự bền bỉ, mộc mạc của thiên nhiên hoang dã với sự hiện đại, tinh tế của thiết bị dã ngoại cao cấp.
*   **Trải nghiệm thị giác (Visual Feeling):** 
    *   **Gọn gàng & Khoáng đạt:** Sử dụng khoảng trắng hợp lý (`spacing.lg`, `spacing.xl`).
    *   **Tactile (Cảm giác vật lý thực tế):** Bo góc lớn thân thiện (`rounded-2xl`), đổ bóng mềm mịn tạo chiều sâu (`shadow-ambient`).
    *   **Sinh động & Responsive:** Có phản hồi micro-interaction khi rê chuột (hover) trên tất cả các phần tử tương tác (như phóng to nhẹ hình ảnh, tăng độ sâu của bóng, chuyển đổi màu sắc mượt mà).

---

## 2. Hệ thống Màu sắc (Color Palette)

Hệ thống màu sắc được cấu hình trong `tailwind.config.ts` nhằm mô tả các yếu tố tự nhiên (Đại dương, Rừng già, Đất đá, Lửa trại):

| Phân loại | Tên Màu | Mã HEX | Tailwind Class | Vai trò / Ngữ cảnh sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Ocean Blue | `#00288e` | `bg-primary`, `text-primary` | Màu thương hiệu chính, nút CTA nổi bật, link active, tiêu đề lớn. |
| **Secondary** | Forest Green | `#1f6c3a` | `bg-secondary`, `text-secondary` | Dùng cho các chủ đề Sông suối, biểu tượng thiên nhiên hoang dã. |
| **Tertiary** | Rust / Orange Earth | `#5b2400` / `#7f3500` | `bg-tertiary`, `text-tertiary` | Dùng cho chủ đề Hồ cá, mang cảm giác mộc mạc, yên bình của đất. |
| **Accent** | Accent Orange | `#e05600` | `bg-accent-orange` | Nhãn trạng thái nổi bật ("Mới về"), số đếm giỏ hàng, cảnh báo. |
| **Background** | Light Gray | `#f8f9fa` | `bg-background` | Màu nền chung toàn trang, tạo cảm giác sạch sẽ, sang trọng. |
| **Text (On Surface)** | Near Black | `#191c1d` | `text-on-surface` | Màu chữ chính (body, heading) đảm bảo độ tương phản cao. |
| **Text Secondary** | Slate Gray | `#444653` | `text-on-surface-variant` | Chữ phụ, mô tả ngắn, trạng thái không hoạt động. |

### Các Surface Containers (Nền khối)
Để tạo chiều sâu phân tầng giao diện, sử dụng các lớp nền container kế thừa từ màu trắng đến xám nhạt:
*   `bg-surface-container-lowest` (`#ffffff`): Dùng cho nền thẻ sản phẩm, header, ô thông tin nổi bật.
*   `bg-surface-container-low` (`#f3f4f5`): Dùng cho nền bộ lọc sidebar, nền phụ của hình ảnh sản phẩm.
*   `bg-surface-container` (`#edeeef`): Dùng cho các khối nội dung lớn tách biệt.

---

## 3. Typography (Hệ chữ)

*   **Phông chữ chính:** Hệ thống `Sans-serif` (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`), tối ưu hiển thị tiếng Việt chuyên nghiệp, mượt mà và tải trang nhanh chóng.
*   **Font Weights:** `400` (Regular), `500` (Medium), `600` (Semibold), `700` (Bold), `800` (Extrabold - dùng riêng cho Logo thương hiệu).

### Thang kích thước chữ chuẩn (Font Scale):

```typescript
// Định nghĩa trong tailwind.config.ts
fontSize: {
  'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
  'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
  'headline-lg-mobile': ['28px', { lineHeight: '34px', letterSpacing: '-0.01em', fontWeight: '600' }],
  'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '0em', fontWeight: '600' }],
  'body-lg': ['18px', { lineHeight: '28px', letterSpacing: '0.01em', fontWeight: '400' }],
  'body-md': ['16px', { lineHeight: '24px', letterSpacing: '0.01em', fontWeight: '400' }],
  'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
  'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
}
```

*   **Sử dụng Headline XL:** Chỉ dùng cho Tiêu đề Hero Trang chủ (`text-headline-xl`).
*   **Sử dụng Headline LG/MD:** Cho tiêu đề các Section chính (`text-headline-lg`) hoặc Tiêu đề Banner Danh mục (`text-headline-md`).
*   **Sử dụng Body MD/LG:** Cho đoạn văn bản mô tả, thông tin chi tiết.
*   **Sử dụng Label MD/SM:** Cho chữ trong nút bấm, nhãn tag trạng thái, hoặc chữ nhỏ của bộ lọc.

---

## 4. Spacing, Layout & Shadows (Khoảng cách & Hiệu ứng)

### Bố cục & Lề trang
*   **Độ rộng nội dung tối đa:** Luôn bọc trong container `max-w-7xl mx-auto`.
*   **Lề ngang trang (Page Edge Padding):**
    *   Thiết bị di động: `px-margin-mobile` (`16px`).
    *   Thiết bị máy tính: `px-margin-desktop` (`64px`).
*   **Khoảng cách lưới (Grid Gutter):** `gap-gutter` (`24px`).
*   **Khoảng cách theo chiều dọc:**
    *   Giữa các khối nhỏ: `py-sm` (`16px`) hoặc `py-md` (`24px`).
    *   Giữa các Section lớn: `py-lg` (`48px`) hoặc `py-xl` (`80px`).

### Bo góc (Border Radius)
*   **Bo góc lớn (Tactile Rounding):** `rounded-2xl` (`1.5rem`) dùng cho Thẻ sản phẩm, Thẻ địa hình dã ngoại, Banners, Form lớn.
*   **Bo góc trung bình:** `rounded-xl` (`1rem`) dùng cho Hình ảnh bên trong thẻ.
*   **Bo góc nhỏ:** `rounded-md` (`0.75rem`) dùng cho Nút bấm (Buttons), ô nhập liệu (Inputs), ô chọn bộ lọc.
*   **Bo góc tròn hoàn toàn:** `rounded-full` dùng cho Thanh tìm kiếm, Nút hành động tròn (Yêu thích, Giỏ hàng tròn), và Nhãn trạng thái (Badge).

### Đổ bóng (Shadows)
*   **Bóng Ambient mặc định:** `shadow-ambient`
    *   *CSS:* `0 20px 40px -15px rgba(0, 40, 142, 0.08), 0 10px 20px -10px rgba(31, 108, 58, 0.05)`
*   **Bóng Ambient khi Hover:** `shadow-ambient-hover`
    *   *CSS:* `0 30px 60px -15px rgba(0, 40, 142, 0.12), 0 15px 30px -10px rgba(31, 108, 58, 0.08)`
*   *Lưu ý:* Luôn sử dụng hiệu ứng chuyển đổi mượt mà `transition-all duration-300` khi thay đổi bóng từ mặc định sang hover.

---

## 5. Đặc trưng Thiết kế theo Danh mục (Category Themes)

Dự án phân chia các sản phẩm theo 4 loại hình địa hình dã ngoại rõ rệt. Mỗi trang danh mục (`/category#<id>`) mang một tông màu và phong cách hiển thị riêng:

### A. Sông suối (`#river`)
*   **Màu sắc chủ đạo:** Secondary Forest Green (`#1f6c3a`).
*   **Triết lý:** Tối giản (Minimalism), nhẹ nhàng, tinh gọn.
*   **Thẻ sản phẩm:** Dạng tối giản (`cardStyle="minimal"`). Không có đánh giá sao hay mô tả rườm rà. Nút giỏ hàng dạng outline thanh lịch.

### B. Biển (`#sea`)
*   **Màu sắc chủ đạo:** Primary Ocean Blue (`#00288e`).
*   **Triết lý:** Chuyên nghiệp (Professional), mạnh mẽ, bền bỉ.
*   **Thẻ sản phẩm:** Dạng chi tiết đầy đủ (`cardStyle="detailed"`). Hiển thị số sao đánh giá, nút Yêu thích dạng trái tim ở góc ảnh, và nút "THÊM VÀO GIỎ" dạng thanh ngang rộng, nổi bật màu xanh đậm ở dưới.

### C. Hồ cá (`#lake`)
*   **Màu sắc chủ đạo:** Tertiary Rust/Brown (`#7f3500`).
*   **Triết lý:** Tĩnh lặng (Patience), thiền định, gần gũi thiên nhiên.
*   **Thẻ sản phẩm:** Dạng tròn trịa biệt lập (`cardStyle="lake"`). Hiển thị thương hiệu phụ ngay dưới tiêu đề. Nút giỏ hàng là hình tròn màu xanh Primary đặt gọn gàng ở góc phải kế bên giá tiền.

### D. Cắm trại & Dã ngoại (`#camping`)
*   **Màu sắc chủ đạo:** Dark Grey / Slate Charcoal (`#2e3132`).
*   **Triết lý:** Thám hiểm (Adventure), đa dụng, kiên cố.
*   **Thẻ sản phẩm:** Tương tự trang biển, sử dụng dạng chi tiết đầy đủ (`cardStyle="detailed"`) để nêu bật các tính năng và thông số kỹ thuật của sản phẩm dã ngoại.

---

## 6. Quy tắc Thiết kế Thành phần (Component Rules)

### A. Header & Điều hướng (Navigation)
*   Độ cao cố định `h-20` (80px), nền `bg-surface-container-lowest` để luôn nổi bật trên trang.
*   Viền dưới rất mỏng: `border-b border-outline-variant/30` để phân tách nhẹ nhàng.
*   **Chỉ báo trang hoạt động (Active Indicator):** Hiển thị một đường gạch chân mỏng `h-1 bg-primary rounded-full` nằm sát mép dưới của Header dưới tab đang chọn, chữ đổi sang `text-primary font-bold`.
*   Nút giỏ hàng có nhãn số lượng sản phẩm tròn màu cam (`bg-accent-orange`) nằm lệch ở góc trên bên phải.

### B. Thẻ Sản phẩm (Product Card)
Mọi thẻ sản phẩm đều phải tuân theo cấu trúc sau:
1.  **Khung bọc ngoài:** `bg-surface-container-lowest rounded-2xl shadow-ambient hover:shadow-ambient-hover p-sm`.
2.  **Khung ảnh sản phẩm:** Tỉ lệ `aspect-[4/5]`, nền xám nhạt `bg-surface-container-low`, bo góc `rounded-xl`. Ảnh sản phẩm tự động zoom nhẹ (`group-hover:scale-102`) với hiệu ứng `duration-500`.
3.  **Hệ thống Nhãn tag trạng thái (Badges):**
    *   *Bán chạy:* Nền xanh lá nhạt `bg-[#a4f1b2] text-[#24703e]`.
    *   *Mới về:* Nền cam `bg-accent-orange text-white`.
    *   *Premium:* Nền xanh dương đậm `bg-[#1e40af] text-white`.
4.  **Hành động phụ:** Chỉ có trên kiểu thẻ `detailed` (nút thả tim yêu thích hình tròn có viền đổ bóng).

### C. Nút bấm & Tương tác (Buttons & Controls)
*   **Nút bấm chính (Primary Button):** Nền xanh dương `bg-[#00288e]`, khi hover chuyển sang xanh sáng hơn `bg-[#1e40af]`, chữ trắng, bo góc `rounded-md`, chữ `text-label-sm font-semibold`.
*   **Nút bấm phụ (Secondary / Outline Button):** Viền xám `border border-outline-variant/60`, khi hover chuyển sang viền màu primary `hover:border-primary` và nền có độ mờ primary `hover:bg-primary/5`.

---

## 7. Checklist khi Thiết kế Trang Mới

Khi tạo thêm trang mới (ví dụ: Trang chi tiết sản phẩm, Trang giỏ hàng, Trang thanh toán), hãy tự kiểm tra theo các câu hỏi sau:
1.  [ ] Trang đã sử dụng font hệ thống `Sans-serif` (`font-sans`) và nền `bg-background` (`#f8f9fa`) chưa?
2.  [ ] Các tiêu đề chính có dùng đúng cỡ chữ và độ dày quy định trong mục 3 không?
3.  [ ] Các thẻ thông tin, khối giao diện có được bo góc đúng chuẩn `rounded-2xl` và đổ bóng `shadow-ambient` để tạo độ nổi khối tactile không?
4.  [ ] Nếu trang thuộc về một danh mục cụ thể (Biển/Sông/Hồ/Cắm trại), tông màu và phong cách thẻ sản phẩm có khớp với thuộc tính danh mục đó tại mục 5 không?
5.  [ ] Mọi nút bấm, thẻ liên kết có các lớp transition tương tác (`transition-all duration-200` hoặc `duration-300`) để mang lại cảm giác mượt mà khi rê chuột chưa?
6.  [ ] Giao diện đã được tối ưu hóa responsive đầy đủ chưa (sử dụng các lề `px-margin-mobile` trên điện thoại và `px-margin-desktop` trên máy tính)?

---
*Wild & Water Design System - Cập nhật lần cuối: 29/06/2026.*

