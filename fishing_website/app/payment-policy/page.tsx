'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  CreditCard, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle,
  Info,
  DollarSign,
  Smartphone,
  CheckCircle
} from 'lucide-react';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg md:py-xl">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <nav className="mb-sm text-label-sm text-on-surface-variant/70 flex items-center gap-xs">
            <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
            <span>/</span>
            <span className="text-on-surface font-medium">Chính sách thanh toán</span>
          </nav>

          {/* Page Title & Intro */}
          <header className="mb-md">
            <h1 className="text-[32px] md:text-headline-lg font-bold text-primary tracking-tight leading-tight mb-xs">
              Chính sách thanh toán & Bảo mật giao dịch
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Nhằm mang đến trải nghiệm mua sắm tiện lợi và an tâm tuyệt đối, **Wild & Water (WildStream Gear)** áp dụng các phương thức thanh toán an toàn, quy chuẩn hóa giao dịch tài chính theo quy định Chương 14 của hệ thống.
            </p>
          </header>

          {/* Main policy body block with tactile style */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-ambient hover:shadow-ambient-hover transition-all duration-300 p-6 md:p-10 space-y-8">
            
            {/* Section 1: Các phương thức thanh toán được hỗ trợ */}
            <section className="space-y-4">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  1. Các phương thức thanh toán hỗ trợ
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Hiện tại, quý khách mua sắm tại website có thể thanh toán trực tiếp qua hai phương thức chính thức sau:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm pt-xs">
                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/15 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-label-sm font-semibold mb-xs">
                      COD
                    </span>
                    <h4 className="text-label-md font-bold text-on-surface">Thanh toán tiền mặt khi nhận hàng</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">
                      Nhận hàng và thanh toán trực tiếp bằng tiền mặt (VND) cho nhân viên giao nhận. An toàn, tin cậy.
                    </p>
                  </div>
                </div>

                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/15 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-label-sm font-semibold mb-xs">
                      VNPay
                    </span>
                    <h4 className="text-label-md font-bold text-on-surface">Cổng thanh toán online VNPay</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">
                      Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử. Hỗ trợ tất cả ngân hàng nội địa nhanh chóng.
                    </p>
                  </div>
                </div>
              </div>

              {/* Expansion plans (14.2) */}
              <div className="p-sm bg-surface-container rounded-xl text-[13px] text-on-surface-variant leading-relaxed flex gap-xs items-center">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong>Mở rộng trong tương lai:</strong> Hệ thống đang hoàn thiện tích hợp để sớm hỗ trợ thêm Ví điện tử MoMo, ZaloPay và thanh toán Thẻ tín dụng quốc tế (Visa/Mastercard).
                </span>
              </div>
            </section>

            {/* Section 2: Quy định thanh toán COD */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  2. Quy định khi thanh toán COD (14.3)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Phương thức COD chỉ khả dụng cho các khu vực giao nhận được đối tác của WildStream hỗ trợ trong nước.
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-body-md text-on-surface-variant leading-relaxed">
                <li>Tiền thanh toán sẽ do nhân viên giao nhận của đơn vị đối tác thu trực tiếp tại địa chỉ giao hàng.</li>
                <li>Hóa đơn chi tiết kèm thuế suất được gửi kèm kiện hàng và hiển thị qua tài khoản cá nhân.</li>
                <li>Trường hợp giao nhận COD không thành công sau tối đa 3 lần phát hàng, đơn hàng sẽ được chuyển hoàn về kho và hệ thống tự động hủy đơn.</li>
              </ul>
            </section>

            {/* Section 3: Quy định thanh toán online qua VNPay */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  3. Quy định thanh toán online qua VNPay (14.4)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Khi thanh toán qua cổng VNPay, hệ thống sẽ thực hiện theo quy tắc bảo mật và xác minh callback từ phía đối tác:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-body-md text-on-surface-variant leading-relaxed">
                <li>Khách hàng xác nhận thanh toán &rarr; Hệ thống chuyển hướng sang giao diện thanh toán bảo mật của VNPay &rarr; Khách thực hiện quét QR hoặc thanh toán &rarr; Trả về callback của WildStream.</li>
                <li><strong className="text-on-surface">Bắt buộc xác minh:</strong> Mọi giao dịch VNPay đều phải xác minh chữ ký điện tử (Signature) thành công trước khi hệ thống cập nhật trạng thái đơn hàng.</li>
                <li>Chữ ký không hợp lệ hoặc callback giả mạo sẽ bị hệ thống từ chối ngay lập tức và ghi nhận cảnh báo bảo mật.</li>
                <li>Đơn đặt hàng sẽ ở trạng thái chờ xử lý (Pending) cho đến khi nhận được xác thực thành công từ cổng VNPay.</li>
              </ul>
            </section>

            {/* Section 4: Xử lý khi thanh toán thất bại */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-accent-orange/10 rounded-xl text-accent-orange">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  4. Xử lý khi giao dịch thanh toán thất bại (14.6)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Trường hợp kết nối lỗi, tài khoản không đủ số dư hoặc khách hàng chủ động hủy trên trang VNPay:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm text-[14px]">
                <div className="p-sm bg-surface-container rounded-xl">
                  <span className="font-bold text-primary block">Giữ nguyên đơn hàng chờ</span>
                  <p className="text-on-surface-variant mt-1">Đơn đặt hàng vẫn được lưu lại với trạng thái "Đang chờ thanh toán" để quý khách có thể thực hiện thanh toán lại mà không cần tạo giỏ hàng mới.</p>
                </div>
                <div className="p-sm bg-surface-container rounded-xl">
                  <span className="font-bold text-secondary block">Không khấu trừ hàng tồn kho</span>
                  <p className="text-on-surface-variant mt-1">Để tránh bán quá mức, hệ thống không khấu trừ hàng tồn kho vĩnh viễn cho đến khi thanh toán thành công. Đơn hàng hết hạn thanh toán (timeout) sẽ tự động hủy.</p>
                </div>
              </div>
            </section>

            {/* Section 5: Bảo mật thanh toán */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  5. Cam kết bảo mật thanh toán (14.8)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Hệ thống thương mại điện tử WildStream áp dụng các tiêu chuẩn an ninh nghiêm ngặt bậc nhất:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-body-md text-on-surface-variant leading-relaxed">
                <li><strong className="text-on-surface">Mã hóa dữ liệu nhạy cảm:</strong> Mọi thông tin thẻ và tài khoản ngân hàng của bạn đều được mã hóa bằng giao thức SSL/TLS khi truyền dữ liệu.</li>
                <li><strong className="text-on-surface">Không lưu trữ thông tin thẻ:</strong> Hệ thống máy chủ của WildStream Gear hoàn toàn không lưu trữ thông tin đăng nhập thanh toán hoặc số thẻ của bạn. Mọi thanh toán đều do VNPay xử lý trực tiếp.</li>
                <li><strong className="text-on-surface">Ngăn ngừa thanh toán trùng lặp:</strong> Thuật toán đối soát tự động từ chối xử lý các yêu cầu thanh toán bị trùng lặp trong thời gian ngắn để tránh trừ tiền 2 lần của khách hàng.</li>
              </ul>
            </section>

          </div>

          {/* Quick Support Widget */}
          <footer className="mt-md p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left">
            <div>
              <h4 className="text-label-md font-bold text-on-surface">Giao dịch của bạn bị gián đoạn hay bị trừ tiền chưa rõ lý do?</h4>
              <p className="text-label-sm text-on-surface-variant mt-1">Chúng tôi hỗ trợ đối soát giao dịch và giải quyết ngay lập tức.</p>
            </div>
            <a 
              href="tel:19006886" 
              className="px-md py-sm bg-primary text-white text-label-sm font-semibold rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-300"
            >
              Liên hệ CSKH 24/7
            </a>
          </footer>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
