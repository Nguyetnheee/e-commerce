'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  FileText, 
  UserPlus, 
  ShoppingBag, 
  Ticket, 
  XOctagon,
  Scale,
  ShieldCheck
} from 'lucide-react';

export default function TermsOfServicePage() {
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
            <span className="text-on-surface font-medium">Điều khoản dịch vụ</span>
          </nav>

          {/* Page Title & Intro */}
          <header className="mb-md">
            <h1 className="text-[32px] md:text-headline-lg font-bold text-primary tracking-tight leading-tight mb-xs">
              Điều khoản dịch vụ & Quy định mua hàng
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Chào mừng bạn đến với **Wild & Water (WildStream Gear)**. Bằng việc truy cập website và tiến hành mua hàng, quý khách đã đồng ý tuân thủ các quy tắc kinh doanh chung và điều khoản hoạt động được định nghĩa cụ thể theo hệ thống của chúng tôi.
            </p>
          </header>

          {/* Main policy body block with tactile style */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-ambient hover:shadow-ambient-hover transition-all duration-300 p-6 md:p-10 space-y-8">
            
            {/* Section 1: Quy định tài khoản */}
            <section className="space-y-4">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  1. Quy định đăng ký & sử dụng tài khoản
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Để thực hiện đặt hàng và quản lý giao dịch, quý khách cần tuân thủ quy định đăng ký tài khoản (tuân thủ Chương 4 & 23):
              </p>

              <ul className="list-disc pl-5 space-y-2 text-body-md text-on-surface-variant leading-relaxed">
                <li><strong className="text-on-surface">Không cho phép tài khoản khách mua hàng:</strong> Người dùng bắt buộc phải đăng nhập trước khi tiến hành thêm sản phẩm vào giỏ hàng hoặc thực hiện thanh toán (BC-001, BC-002, BR-001).</li>
                <li><strong className="text-on-surface">Sở hữu duy nhất:</strong> Mỗi khách hàng chỉ được sở hữu duy nhất một tài khoản hoạt động. Không cho phép các tài khoản trùng lặp sử dụng cùng một địa chỉ email (BA-003, BC-009, BR-003).</li>
                <li><strong className="text-on-surface">Đăng nhập mạng xã hội:</strong> Hệ thống hỗ trợ Đăng nhập Google (Google OAuth) và tự động tạo tài khoản khách hàng mới bằng email Google nếu chưa tồn tại (BA-009).</li>
              </ul>
            </section>

            {/* Section 2: Đặt hàng và tính hợp lệ của đơn hàng */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  2. Tính hợp lệ của đơn đặt hàng & Giá cả
                </h2>
              </div>
              
              <ul className="list-disc pl-5 space-y-2 text-body-md text-on-surface-variant leading-relaxed">
                <li><strong className="text-on-surface">Đơn hàng tối thiểu:</strong> Mỗi đơn hàng hợp lệ bắt buộc phải chứa ít nhất một sản phẩm (BC-008, CO-006).</li>
                <li><strong className="text-on-surface">Mức độ ưu tiên đơn hàng:</strong> Các đơn đặt hàng được hệ thống tiếp nhận và xử lý tự động theo thứ tự thời gian. Đơn đặt hàng được xác nhận trước có mức độ ưu tiên giao hàng cao hơn (BA-006).</li>
                <li><strong className="text-on-surface">Quy định về giá:</strong> Giá sản phẩm do quản trị viên quyết định trên website, niêm yết bằng tiền Việt Nam (VND). Khách hàng không thể thương lượng giá cả (BA-005, BA-008).</li>
                <li><strong className="text-on-surface">Tính bất biến của đơn hàng hoàn thành:</strong> Đơn hàng đã giao thành công và chuyển trạng thái "Đã hoàn thành" sẽ không thể chỉnh sửa sản phẩm, số lượng, địa chỉ giao hàng hoặc xóa vĩnh viễn khỏi hệ thống nhằm đảm bảo tính liêm chính kế toán (BC-005, BC-006, CO-008, DL-010).</li>
                <li>Khách hàng được quyền tra cứu nhưng không thể tự xóa dữ liệu lịch sử đặt hàng của mình (CO-014).</li>
              </ul>
            </section>

            {/* Section 3: Sử dụng Voucher */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-accent-orange/10 rounded-xl text-accent-orange">
                  <Ticket className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  3. Quy tắc áp dụng mã giảm giá (Voucher)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Để nhận chiết khấu khuyến mại theo Chương 18, việc áp dụng Voucher phải đáp ứng các quy tắc hệ thống sau:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm text-[14px]">
                <div className="p-sm bg-surface-container rounded-xl">
                  <span className="font-bold text-primary block">Không xếp chồng Voucher</span>
                  <p className="text-on-surface-variant mt-1">Mỗi đơn đặt hàng chỉ được áp dụng duy nhất một mã giảm giá. Không hỗ trợ xếp chồng (cộng dồn) nhiều voucher cùng lúc (DL-005).</p>
                </div>
                <div className="p-sm bg-surface-container rounded-xl">
                  <span className="font-bold text-secondary block">Xác thực trước thanh toán</span>
                  <p className="text-on-surface-variant mt-1">Mọi voucher sẽ được kiểm tra hạn dùng, số lượng khả dụng, điều kiện giá trị đơn hàng tối thiểu trước khi thanh toán (GB-008).</p>
                </div>
                <div className="p-sm bg-surface-container rounded-xl">
                  <span className="font-bold text-accent-orange block">Không giảm giá trị âm</span>
                  <p className="text-on-surface-variant mt-1">Tổng giá trị chiết khấu từ voucher không được phép giảm giá trị thanh toán của đơn hàng xuống dưới 0đ (VO-002).</p>
                </div>
                <div className="p-sm bg-surface-container rounded-xl">
                  <span className="font-bold text-on-surface block">Thu hồi khi thanh toán thành công</span>
                  <p className="text-on-surface-variant mt-1">Số lượng khả dụng của voucher trong kho khuyến mãi sẽ giảm đi 1 sau khi đơn hàng được thanh toán thành công (VO-005).</p>
                </div>
              </div>
            </section>

            {/* Section 4: Hủy đơn hàng */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-tertiary/10 rounded-xl text-tertiary">
                  <XOctagon className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  4. Chính sách hủy đơn hàng (13.4)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Khách hàng được quyền chủ động hủy bỏ đơn đặt hàng trên hệ thống khi đơn hàng ở các trạng thái sau:
              </p>

              <div className="space-y-3 pl-2 text-body-md text-on-surface-variant">
                <div className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-orange shrink-0" />
                  <span>Trạng thái đơn hàng = <strong>Đang chờ thanh toán</strong></span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                  <span>Trạng thái đơn hàng = <strong>Đang xử lý</strong> (trước khi đóng gói)</span>
                </div>
              </div>

              <div className="p-sm bg-error/5 border-l-4 border-error rounded-r-xl text-[13px] text-on-surface-variant leading-relaxed">
                <span className="font-bold text-error">Nghiêm cấm tự hủy đơn:</span> Quý khách tuyệt đối không thể tự hủy đơn hàng khi đơn hàng đã chuyển sang trạng thái <strong>Đóng gói, Đang chuyển hàng, Đã giao hàng</strong> hoặc <strong>Đã hoàn thành</strong>.
              </div>

              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Khi yêu cầu hủy đơn hàng được hệ thống phê duyệt thành công:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Số lượng sản phẩm tương ứng sẽ được khôi phục ngay vào kho tồn kho vật lý (CO-009, CO-020).</li>
                  <li>Số tiền thanh toán trước (nếu có) sẽ được tiến hành làm thủ tục hoàn trả lại cho quý khách theo đúng Chính sách hoàn tiền.</li>
                </ul>
              </p>
            </section>

          </div>

          {/* Quick Support Widget */}
          <footer className="mt-md p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left">
            <div>
              <h4 className="text-label-md font-bold text-on-surface">Quý khách có tranh chấp hoặc thắc mắc về điều khoản dịch vụ?</h4>
              <p className="text-label-sm text-on-surface-variant mt-1">Đội ngũ pháp chế và CSKH của WildStream luôn sẵn sàng lắng nghe.</p>
            </div>
            <a 
              href="mailto:support@wildstream.vn" 
              className="px-md py-sm bg-primary text-white text-label-sm font-semibold rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-300"
            >
              Gửi phản hồi pháp lý
            </a>
          </footer>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
