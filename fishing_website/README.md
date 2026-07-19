# WildStream Gear - E-commerce 

## Giới thiệu (About The Project)

** WildStream Gear ** là một nền tảng thương mại điện tử chuyên cung cấp các trang thiết bị dã ngoại và câu cá cao cấp. Dự án được thiết kế với mục tiêu mang lại trải nghiệm mua sắm trực tuyến mượt mà, an toàn và trực quan cho những người đam mê các hoạt động ngoài trời (outdoor).

Dự án được xây dựng bằng TypeScript, framework Next.js và Tailwind CSS.

🔗 **Live Demo**: https://fishing-website-fe.vercel.app

## Tính năng nổi bật (Key Features)

Dựa trên tài liệu đặc tả hệ thống, Frontend được thiết kế để đáp ứng các luồng nghiệp vụ phức tạp:

1. Trải nghiệm mua sắm mượt mà: Duyệt sản phẩm theo danh mục (Biển, Sông suối, Cắm trại), tìm kiếm và bộ lọc (Filter) chi tiết theo thông số kỹ thuật.

2. Quản lý Giỏ hàng & Đơn hàng: Thêm/bớt sản phẩm, tính toán giá trị giỏ hàng real-time, áp dụng mã khuyến mãi (Voucher).

3. Checkout & Thanh toán (Payment): Hỗ trợ đa dạng phương thức thanh toán (COD, tích hợp VNPay), thu thập địa chỉ giao hàng chuyên nghiệp.

4. Xác thực người dùng (Authentication): Đăng nhập/Đăng ký qua Email/Password và Google OAuth.

5. Responsive Design: Giao diện tương thích hoàn hảo trên cả thiết bị di động (Mobile) và máy tính (Desktop).

## Công nghệ sử dụng (Tech Stack)

- Framework: Next.js (App Router / Pages Router)
- Ngôn ngữ: TypeScript
- Styling: Tailwind CSS
- Build Tool: PostCSS
- Deployment: Vercel

## Hướng dẫn cài đặt (Getting Started)

Làm theo các bước sau để cài đặt và chạy dự án trên môi trường local của bạn.
1. Yêu cầu hệ thống (Prerequisites)
Node.js (phiên bản 18.x trở lên)
npm hoặc yarn

2. Cài đặt (Installation)
- Clone repository về máy tính:

`git clone https://github.com/Nguyetnheee/fishing-website-fe.git`

`cd fishing-website-fe`


Cài đặt các thư viện phụ thuộc (dependencies):

`npm install`
**hoặc**
`yarn install`

3. Cấu hình biến môi trường (Environment Variables)
Tạo một file .env.local ở thư mục gốc của dự án và thêm các biến môi trường cần thiết (ví dụ: API URL, thông tin cổng thanh toán).
NEXT_PUBLIC_API_URL=http://localhost:3000/api

4. Chạy dự án (Run the Development Server)
`npm run dev`
**hoặc**
`yarn dev`

Mở trình duyệt và truy cập http://localhost:3000 để xem kết quả.

## Cấu trúc dự án (Project Structure)
Dự án tuân thủ cấu trúc tiêu chuẩn, giúp code gọn gàng và dễ bảo trì:

```text
 fishing-website-fe
├── 📄 README.md                 # Tài liệu hướng dẫn.
├── 📄 design.md                 # Chứa các quy tắc thiết kế (UI/UX).
├── 📄 project.md                # Tài liệu nghiệp vụ nội bộ của nhóm.
├── 📄 tailwind.config.ts        # Cấu hình styling (Tailwind CSS).
├── 📄 postcss.config.js         # Cấu hình styling (PostCSS).
├── 📄 next.config.mjs           # Cấu hình framework Next.js.
└── 📄 tsconfig.json             # Cấu hình TypeScript.
```
## Contributors
1. Trần Hoàng Nguyệt Nhi 
2. Trần Phan Khải Hưng 
3. Trần Triệu Bảo Long 
4. Lê Đỗ Nhật Anh

**Được phát triển cho dự án môn học Thương Mại Điện Tử (ISC301).*
