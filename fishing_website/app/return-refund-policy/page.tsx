'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  RefreshCcw, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  AlertCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ReturnRefundPolicyPage() {
  // Return steps based on SOP-008
  const returnWorkflow = [
    {
      step: '1',
      title: 'Gửi yêu cầu trả hàng',
      desc: 'Khách hàng gửi yêu cầu trả hàng qua hệ thống kèm lý do và hình ảnh minh họa sản phẩm thực tế.'
    },
    {
      step: '2',
      title: 'Quản trị viên đánh giá',
      desc: 'Bộ phận CSKH và Quản trị viên đánh giá tính hợp lệ của yêu cầu trả hàng dựa trên chính sách.'
    },
    {
      step: '3',
      title: 'Nhận sản phẩm trả lại',
      desc: 'Nếu yêu cầu được phê duyệt, khách hàng gửi trả sản phẩm về kho của WildStream Gear.'
    },
    {
      step: '4',
      title: 'Kiểm định chất lượng',
      desc: 'Bộ phận kiểm kho kiểm tra kỹ lưỡng trạng thái vật lý của sản phẩm hoàn trả.'
    },
    {
      step: '5',
      title: 'Xử lý tồn kho & Hoàn tiền',
      desc: 'Sản phẩm đạt chuẩn sẽ được bổ sung vào kho và kích hoạt quy trình hoàn tiền tự động.'
    }
  ];

  // Refund timeline details based on SOP-009
  const refundSteps = [
    {
      title: '1. Khởi tạo yêu cầu hoàn tiền',
      desc: 'Kích hoạt ngay khi sản phẩm hoàn trả vượt qua vòng kiểm tra chất lượng tại kho, hoặc khi đơn hàng được hủy trước khi giao.'
    },
    {
      title: '2. Phê duyệt của quản trị viên',
      desc: 'Yêu cầu được Quản trị viên xem xét và duyệt chi tài chính theo quy định kế toán nghiêm ngặt.'
    },
    {
      title: '3. Xác nhận tài chính',
      desc: 'Bộ phận kế toán thực hiện đối soát giao dịch gốc và lập lệnh chuyển khoản hoàn tiền.'
    },
    {
      title: '4. Chuyển khoản hoàn tiền',
      desc: 'Tiền được chuyển khoản hoàn trả về tài khoản gốc của khách hàng qua cổng VNPay hoặc chuyển khoản trực tiếp.'
    }
  ];

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
            <span className="text-on-surface font-medium">Chính sách đổi trả & hoàn tiền</span>
          </nav>

          {/* Page Title & Intro */}
          <header className="mb-md">
            <h1 className="text-[32px] md:text-headline-lg font-bold text-primary tracking-tight leading-tight mb-xs">
              Chính sách đổi trả & Hoàn tiền
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Tại **Wild & Water (WildStream Gear)**, sự hài lòng của bạn là ưu tiên hàng đầu. Chúng tôi cam kết xây dựng một quy trình đổi trả hàng và hoàn tiền minh bạch, nhanh chóng và công bằng, tuân thủ đúng các tiêu chuẩn vận hành nghiệp vụ.
            </p>
          </header>

          {/* Main policy body block with tactile style */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-ambient hover:shadow-ambient-hover transition-all duration-300 p-6 md:p-10 space-y-8">
            
            {/* Section 1: Điều kiện áp dụng hoàn tiền */}
            <section className="space-y-4">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  1. Điều kiện áp dụng hoàn tiền
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Quý khách hàng được quyền yêu cầu hoàn tiền và trả hàng trong các trường hợp sau đây (tuân thủ Chương 14.7 & 17.6):
              </p>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-start gap-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Đơn hàng bị hủy trước khi giao:</strong> Giao dịch thanh toán trực tuyến đã thành công nhưng đơn hàng được yêu cầu hủy trước khi bộ phận kho đóng gói và bàn giao cho đối tác vận chuyển.
                  </p>
                </div>
                <div className="flex items-start gap-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Hàng trả lại vượt qua kiểm tra chất lượng:</strong> Sản phẩm được gửi trả về kho trong trạng thái nguyên vẹn, không có dấu hiệu hư hỏng vật lý hoặc sử dụng sai quy cách, và được nhân viên kho kiểm định chấp nhận thành công.
                  </p>
                </div>
                <div className="flex items-start gap-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Giao hàng không thành công:</strong> Đơn hàng phát sinh lỗi giao nhận khách quan từ đối tác và được hoàn về kho tổng, sản phẩm kiểm định vẫn nguyên vẹn.
                  </p>
                </div>
              </div>

              {/* Warning box */}
              <div className="p-sm bg-error/5 border-l-4 border-error rounded-r-xl text-[13px] text-on-surface-variant leading-relaxed">
                <span className="font-bold text-error">Quy định từ chối hoàn tiền:</span> Chúng tôi từ chối hoàn tiền đối với các sản phẩm bị trầy xước, móp méo, mất bao bì gốc, thiếu phụ kiện đi kèm hoặc thẻ bảo hành bị rách hỏng khi hoàn trả.
              </div>
            </section>

            {/* Section 2: Quy trình yêu cầu trả hàng */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <RefreshCcw className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  2. Quy trình yêu cầu trả hàng (SOP-008)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Để thực hiện trả hàng, quý khách vui lòng tuân thủ quy trình vận hành tiêu chuẩn sau:
              </p>

              {/* Visual Workflow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-sm pt-xs relative">
                {returnWorkflow.map((item, idx) => (
                  <div key={idx} className="flex flex-col bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 relative">
                    <span className="text-[28px] font-extrabold text-secondary/25 leading-none mb-xs block">
                      {item.step}
                    </span>
                    <h4 className="text-label-md font-bold text-on-surface leading-tight mb-xs">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Return handling rule (Section 17.6) */}
              <div className="p-sm bg-surface-container rounded-xl text-[13px] text-on-surface-variant leading-relaxed flex gap-xs items-start">
                <ShieldAlert className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-on-surface">Chính sách xử lý hàng trả lại:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Nếu sản phẩm được <span className="text-secondary font-bold">chấp nhận</span> qua kiểm định: Hàng tồn kho được tự động khôi phục.</li>
                    <li>Nếu sản phẩm bị <span className="text-error font-bold">từ chối</span> (do hư hỏng): Sản phẩm bị loại bỏ vĩnh viễn và ghi nhận vào nhật ký kiểm tra hàng hư hỏng.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Cách thức và thời gian nhận lại tiền */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-tertiary/10 rounded-xl text-tertiary">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  3. Cách thức kiểm tra và thời gian nhận tiền (SOP-009)
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Tất cả các khoản tiền hoàn trả đều được xử lý và ghi nhận vĩnh viễn trên nhật ký tài chính của hệ thống:
              </p>

              {/* Refund Timeline Steps */}
              <div className="space-y-3 pl-2">
                {refundSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-sm items-start">
                    <span className="w-5 h-5 bg-tertiary text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-label-md font-bold text-on-surface">{step.title}</h4>
                      <p className="text-body-md text-on-surface-variant leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timing info */}
              <div className="p-sm bg-tertiary/5 border-l-4 border-tertiary rounded-r-xl text-[13px] text-on-surface-variant leading-relaxed mt-xs">
                <span className="font-bold text-tertiary">Thời gian nhận lại tiền:</span> Khoản hoàn trả sẽ được chuyển vào tài khoản ngân hàng hoặc thẻ gốc của quý khách trong vòng <strong>3 - 5 ngày làm việc</strong> đối với thẻ nội địa và tối đa <strong>15 ngày</strong> đối với thẻ quốc tế (tùy thuộc vào thời gian xử lý của ngân hàng phát hành). Quý khách sẽ nhận được email thông báo ngay khi giao dịch hoàn tất.
              </div>
            </section>

          </div>

          {/* Quick Support Widget */}
          <footer className="mt-md p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left">
            <div>
              <h4 className="text-label-md font-bold text-on-surface">Yêu cầu hoàn trả của bạn gặp trở ngại?</h4>
              <p className="text-label-sm text-on-surface-variant mt-1">Vui lòng chuẩn bị sẵn Mã đơn hàng để nhận hỗ trợ nhanh nhất.</p>
            </div>
            <a 
              href="mailto:support@wildstream.vn" 
              className="px-md py-sm bg-primary text-white text-label-sm font-semibold rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-300"
            >
              Email hỗ trợ đổi trả
            </a>
          </footer>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
