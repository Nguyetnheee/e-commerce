'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  ShieldCheck, 
  Key, 
  Database, 
  FileText, 
  EyeOff,
  UserCheck,
  History
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <span className="text-on-surface font-medium">Chính sách bảo mật</span>
          </nav>

          {/* Page Title & Intro */}
          <header className="mb-md">
            <h1 className="text-[32px] md:text-headline-lg font-bold text-primary tracking-tight leading-tight mb-xs">
              Chính sách bảo mật & Quyền riêng tư
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Sự tin cậy và an toàn thông tin là nền tảng hoạt động của **Wild & Water (WildStream Gear)**. Chúng tôi cam kết bảo vệ dữ liệu cá nhân của quý khách bằng những công nghệ bảo mật tiên tiến nhất, tuân thủ đúng Chương 5 và Chương 21 của tài liệu hệ thống.
            </p>
          </header>

          {/* Main policy body block with tactile style */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-ambient hover:shadow-ambient-hover transition-all duration-300 p-6 md:p-10 space-y-8">
            
            {/* Section 1: Mục đích thu thập dữ liệu */}
            <section className="space-y-4">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  1. Dữ liệu thu thập & Mục đích sử dụng (21.6)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Để phục vụ việc xử lý đơn hàng và cung cấp dịch vụ tốt nhất, WildStream Gear chỉ thu thập các thông tin cá nhân cần thiết sau:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm pt-xs">
                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/15 flex gap-sm items-start">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Email & Số điện thoại</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Dùng để đăng ký tài khoản, gửi thông báo cập nhật trạng thái đơn hàng và hỗ trợ khách hàng nhanh chóng.</p>
                  </div>
                </div>

                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/15 flex gap-sm items-start">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Địa chỉ giao hàng</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Sử dụng để định vị địa chỉ giao nhận (Tỉnh, Quận, Phường, Đường phố) và in nhãn vận chuyển bàn giao đối tác.</p>
                  </div>
                </div>

                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/15 flex gap-sm items-start">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Thông tin giao dịch</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Lịch sử mua hàng, trạng thái thanh toán, mã đơn hàng nhằm mục đích đối soát tài chính và quản lý đổi trả.</p>
                  </div>
                </div>

                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/15 flex gap-sm items-start">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">4</span>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Thông tin thanh toán trực tuyến</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Mã hóa kết nối trực tiếp đến cổng thanh toán VNPay, không lưu trữ trên hệ thống máy chủ của chúng tôi.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Cam kết bảo mật thông tin khách hàng */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  2. Cam kết bảo mật dữ liệu khách hàng (SP-008 & GB-014)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Chúng tôi tuyệt đối bảo vệ quyền riêng tư cá nhân và cam kết:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-body-md text-on-surface-variant leading-relaxed">
                <li><strong className="text-on-surface">Bảo vệ ranh giới dữ liệu:</strong> Thông tin cá nhân của mỗi khách hàng được cách ly hoàn toàn trên cơ sở dữ liệu. Khách hàng khác hoặc bên thứ ba không có quyền truy cập trái phép.</li>
                <li><strong className="text-on-surface">Giới hạn truy cập nội bộ:</strong> Chỉ những nhân viên được cấp quyền hệ thống (như CSKH, Quản lý kho, Kế toán) mới có thể xem thông tin đơn nhận theo đúng vai trò nghiệp vụ (RBAC).</li>
                <li><strong className="text-on-surface">Không bán/chia sẻ dữ liệu:</strong> WildStream Gear cam kết không bán, trao đổi hoặc cho thuê thông tin cá nhân của quý khách cho bên thứ ba vì bất kỳ mục đích thương mại nào.</li>
              </ul>
            </section>

            {/* Section 3: Bảo mật thanh toán và tài khoản */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Key className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  3. Quy chuẩn bảo mật tài khoản & mật khẩu
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Nhằm tự bảo vệ tài khoản cá nhân, hệ thống bắt buộc thực thi các nguyên tắc an ninh nghiêm ngặt sau:
              </p>

              <div className="space-y-3 pl-2">
                <div className="flex items-start gap-sm">
                  <UserCheck className="w-5 h-5 text-secondary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Độ phức tạp mật khẩu bắt buộc (AP-005 & 21.3)</h4>
                    <p className="text-body-md text-on-surface-variant leading-relaxed mt-0.5">
                      Mật khẩu đăng ký phải chứa ít nhất 8 ký tự, bao gồm chữ cái viết hoa, chữ cái viết thường và chữ số, không chứa khoảng trắng.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-sm">
                  <UserCheck className="w-5 h-5 text-secondary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Mã hóa mật khẩu 1 chiều (SP-003 & 21.3)</h4>
                    <p className="text-body-md text-on-surface-variant leading-relaxed mt-0.5">
                      Mật khẩu của bạn được băm và mã hóa một chiều trước khi lưu trữ vào cơ sở dữ liệu. Ngay cả quản trị viên hệ thống cũng không thể đọc được mật khẩu văn bản thuần túy của bạn.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-sm">
                  <UserCheck className="w-5 h-5 text-secondary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Tự động hết hạn phiên đăng nhập (SP-006 & 21.5)</h4>
                    <p className="text-body-md text-on-surface-variant leading-relaxed mt-0.5">
                      Đảm bảo an toàn khi bạn quên đăng xuất trên thiết bị công cộng. Phiên đăng nhập sẽ tự động hết hạn sau một khoảng thời gian không hoạt động, yêu cầu bạn xác thực lại để tiếp tục mua sắm.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Nhật ký kiểm toán */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-tertiary/10 rounded-xl text-tertiary">
                  <History className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  4. Nhật ký hệ thống & Kiểm toán (SP-005 & 21.7)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Mọi hành động quan trọng trên hệ thống của chúng tôi đều được ghi lại tự động vào nhật ký kiểm toán không thể sửa đổi:
              </p>

              <div className="p-sm bg-surface-container rounded-xl text-[13px] text-on-surface-variant leading-relaxed">
                Các sự kiện được ghi lại bao gồm: Đăng nhập/Đăng xuất, Thay đổi thông tin sản phẩm, Thay đổi số lượng hàng tồn kho của thủ kho, Sự kiện thanh toán, Giao dịch tài chính và Hoạt động của quản trị viên. Nhật ký này đảm bảo tính minh bạch tối đa và hỗ trợ điều tra bất kỳ hành vi bất thường nào.
              </div>
            </section>

          </div>

          {/* Quick Support Widget */}
          <footer className="mt-md p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left">
            <div>
              <h4 className="text-label-md font-bold text-on-surface">Quý khách muốn thực hiện quyền thay đổi dữ liệu cá nhân?</h4>
              <p className="text-label-sm text-on-surface-variant mt-1">Bạn có thể tự cập nhật hồ sơ cá nhân hoặc yêu cầu xóa tài khoản qua CSKH.</p>
            </div>
            <a 
              href="/profile" 
              className="px-md py-sm bg-primary text-white text-label-sm font-semibold rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-300"
            >
              Cài đặt tài khoản
            </a>
          </footer>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
