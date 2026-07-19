'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  Truck, 
  CheckCircle2, 
  ClipboardCheck, 
  MapPin, 
  AlertTriangle, 
  RotateCcw,
  RefreshCw,
  FileText,
  UserCheck
} from 'lucide-react';

export default function ShippingPolicyPage() {
  // Shipping statuses based on Section 17.4
  const shippingStatuses = [
    {
      status: 'Chờ đóng gói',
      desc: 'Đơn hàng đang chờ nhân viên kiểm kho và chuẩn bị sản phẩm.',
      color: 'bg-surface-container-high text-on-surface-variant'
    },
    {
      status: 'Đóng gói thành công',
      desc: 'Sản phẩm đã được kiểm tra chất lượng và đóng gói an toàn.',
      color: 'bg-secondary/10 text-secondary'
    },
    {
      status: 'Đang chờ lấy hàng',
      desc: 'Nhãn vận chuyển đã in, gói hàng sẵn sàng bàn giao cho đơn vị vận chuyển.',
      color: 'bg-primary/10 text-primary'
    },
    {
      status: 'Đang giao hàng',
      desc: 'Đơn hàng đã được bàn giao cho đối tác giao nhận và đang trên đường tới bạn.',
      color: 'bg-accent-yellow/20 text-[#a16207]'
    },
    {
      status: 'Giao hàng thành công',
      desc: 'Gói hàng đã được giao nhận thành công bởi khách hàng.',
      color: 'bg-[#a4f1b2] text-[#24703e]'
    },
    {
      status: 'Giao hàng thất bại',
      desc: 'Giao nhận không thành công do các lý do khách quan (không liên hệ được, sai địa chỉ, thời tiết...).',
      color: 'bg-error/10 text-error'
    },
    {
      status: 'Đã hoàn trả',
      desc: 'Đơn hàng giao thất bại và đã được chuyển hoàn an toàn về kho của WildStream.',
      color: 'bg-tertiary/10 text-tertiary'
    }
  ];

  // Shipping process steps based on Section 17.3
  const processSteps = [
    {
      step: '01',
      title: 'Xác nhận đơn hàng',
      desc: 'Hệ thống tự động xác nhận đơn hàng sau khi bạn thanh toán thành công (hoặc xác minh COD).'
    },
    {
      step: '02',
      title: 'Kiểm kho & Chuẩn bị',
      desc: 'Nhân viên kho xác minh SKU, kiểm tra số lượng và chất lượng sản phẩm thực tế.'
    },
    {
      step: '03',
      title: 'Đóng gói chuyên nghiệp',
      desc: 'Sản phẩm được bọc bóng khí chống sốc và đóng hộp các-tông hoặc túi chống thấm nước.'
    },
    {
      step: '04',
      title: 'Bàn giao vận chuyển',
      desc: 'In nhãn vận chuyển với mã vận đơn duy nhất và bàn giao cho đơn vị giao hàng đối tác.'
    },
    {
      step: '05',
      title: 'Giao hàng & Hoàn tất',
      desc: 'Đối tác tiến hành phát hàng tới địa chỉ của bạn. Bạn nhận hàng và đơn hàng hoàn tất!'
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
            <span className="text-on-surface font-medium">Chính sách vận chuyển</span>
          </nav>

          {/* Page Title & Intro */}
          <header className="mb-md">
            <h1 className="text-[32px] md:text-headline-lg font-bold text-primary tracking-tight leading-tight mb-xs">
              Chính sách vận chuyển & Giao hàng
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Chào mừng bạn đến với **Wild & Water (WildStream Gear)**. Chúng tôi luôn nỗ lực tối đa để mang các trang bị dã ngoại và câu cá cao cấp đến tay bạn một cách nhanh chóng, an toàn và chuyên nghiệp nhất. Dưới đây là các quy định chi tiết về vận chuyển giúp bạn hoàn toàn an tâm khi mua sắm.
            </p>
          </header>

          {/* Main policy body block with tactile style */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-ambient hover:shadow-ambient-hover transition-all duration-300 p-6 md:p-10 space-y-8">
            
            {/* Section 1: Điều kiện giao hàng */}
            <section className="space-y-4">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  1. Điều kiện tiên quyết để vận chuyển
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Để đảm bảo tính chính xác và tránh nhầm lẫn, một đơn hàng chỉ được bàn giao cho đối tác vận chuyển khi đáp ứng đầy đủ các điều kiện tiên quyết sau:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm pt-xs">
                <div className="flex gap-sm p-sm bg-surface-container-low rounded-xl border border-outline-variant/15">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Thanh toán được xác minh</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Đã thanh toán trực tuyến thành công hoặc đơn hàng COD đã được hệ thống xác nhận.</p>
                  </div>
                </div>
                <div className="flex gap-sm p-sm bg-surface-container-low rounded-xl border border-outline-variant/15">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Xác minh hàng tồn kho</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Số lượng sản phẩm trong kho vật lý được hệ thống đối chiếu khớp 100% với đơn hàng.</p>
                  </div>
                </div>
                <div className="flex gap-sm p-sm bg-surface-container-low rounded-xl border border-outline-variant/15">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Đóng gói hoàn tất</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Đơn hàng được nhân viên đóng gói thành công theo đúng tiêu chuẩn an toàn của hãng.</p>
                  </div>
                </div>
                <div className="flex gap-sm p-sm bg-surface-container-low rounded-xl border border-outline-variant/15">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Nhãn vận chuyển & Mã vận đơn</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Mã theo dõi vận đơn (Tracking Number) duy nhất đã được tạo thành công và dán trên kiện hàng.</p>
                  </div>
                </div>
              </div>

              {/* Business Note */}
              <div className="p-sm bg-primary/5 border-l-4 border-primary rounded-r-xl mt-xs text-[13px] text-on-surface-variant leading-relaxed">
                <span className="font-bold text-primary">Lưu ý nghiệp vụ:</span> Để bảo mật thông tin và đảm bảo tính thống nhất, nhãn vận chuyển sau khi in và dán lên kiện hàng sẽ không được sửa đổi. Nhân viên kho bắt buộc phải kiểm tra thông tin người nhận kỹ lưỡng trước khi xuất kho.
              </div>
            </section>

            {/* Section 2: Quy trình giao hàng */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <Truck className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  2. Quy trình vận hành & Giao nhận
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                WildStream Gear áp dụng quy trình xử lý đơn hàng khép kín nhằm tối giản thời gian chờ đợi của quý khách hàng:
              </p>

              {/* Vertical Stepper Process */}
              <div className="relative border-l-2 border-outline-variant/40 ml-4 pl-6 space-y-6 pt-xs">
                {processSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Stepper Bullet */}
                    <span className="absolute -left-[35px] top-0 w-[18px] h-[18px] rounded-full border-4 border-white bg-secondary ring-2 ring-secondary/35 flex items-center justify-center text-[10px] text-white font-bold" />
                    
                    <div>
                      <span className="text-label-sm text-secondary font-bold block">{step.step}. {step.title}</span>
                      <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Các trạng thái vận chuyển */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-tertiary/10 rounded-xl text-tertiary">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  3. Trạng thái vận chuyển cần biết
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Để theo dõi hành trình của đơn hàng một cách minh bạch, quý khách có thể tra cứu mã vận đơn với các trạng thái tương ứng sau:
              </p>

              {/* Custom responsive table */}
              <div className="overflow-x-auto border border-outline-variant/30 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20 text-label-md font-bold text-on-surface">
                      <th className="p-3 w-1/3">Trạng thái hệ thống</th>
                      <th className="p-3 w-2/3">Mô tả chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-body-md">
                    {shippingStatuses.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="p-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-semibold ${item.color}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-on-surface-variant font-sans text-[14px]">
                          {item.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Giao hàng thất bại và đổi trả lô hàng */}
            <section className="space-y-4 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-sm">
                <div className="p-2.5 bg-accent-orange/10 rounded-xl text-accent-orange">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
                  4. Xử lý khi giao hàng không thành công
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Đơn hàng có thể giao nhận không thành công vì một số lý do khách quan (người nhận không có mặt tại địa điểm giao hàng, địa chỉ không chính xác, người nhận từ chối nhận hàng, hoặc do thời tiết xấu và sự cố vận chuyển). Khi xảy ra trường hợp này:
              </p>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-sm pt-xs">
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/15 flex flex-col gap-xs">
                  <div className="flex items-center gap-xs text-primary font-bold text-label-md">
                    <RefreshCw className="w-4 h-4" />
                    <span>Lên lịch giao lại</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant leading-relaxed">
                    Hệ thống sẽ liên hệ với quý khách để thỏa thuận thời gian thuận tiện nhất và phân phối giao lại đơn hàng.
                  </p>
                </div>
                
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/15 flex flex-col gap-xs">
                  <div className="flex items-center gap-xs text-error font-bold text-label-md">
                    <RotateCcw className="w-4 h-4" />
                    <span>Hủy bỏ đơn hàng</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant leading-relaxed">
                    Trường hợp không thể liên lạc sau 3 lần giao hàng hoặc do thông tin sai lệch nghiêm trọng, đơn hàng sẽ tự động hủy.
                  </p>
                </div>

                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/15 flex flex-col gap-xs">
                  <div className="flex items-center gap-xs text-secondary font-bold text-label-md">
                    <MapPin className="w-4 h-4" />
                    <span>Hoàn trả về kho</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant leading-relaxed">
                    Kiện hàng được đóng gói và vận chuyển hoàn trả an toàn về kho tổng của WildStream để kiểm duyệt nội bộ.
                  </p>
                </div>
              </div>

              {/* Section 17.6 Return Policy Box */}
              <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2 mt-xs">
                <h4 className="text-label-md font-bold text-on-surface flex items-center gap-xs">
                  <UserCheck className="w-4 h-4 text-secondary" />
                  Quy trình kiểm tra hàng hoàn trả về kho
                </h4>
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  Tất cả các đơn hàng hoàn trả (do giao hàng không thành công hoặc do khách từ chối) khi về tới kho sẽ được bộ phận kiểm định hàng hóa đánh giá trạng thái vật lý kỹ lưỡng:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-label-sm text-on-surface-variant font-sans">
                  <li><strong className="text-secondary">Sản phẩm nguyên vẹn (Accepted):</strong> Hệ thống sẽ khôi phục hàng tồn kho để tiếp tục kinh doanh và cập nhật thông tin hoàn tiền cho khách hàng (nếu có).</li>
                  <li><strong className="text-error">Sản phẩm hư hỏng (Damaged):</strong> Được phân loại, cô lập độc lập và ghi nhận là hàng hư hỏng để hủy bỏ, tuyệt đối không đưa lại vào kho bán hàng.</li>
                </ul>
              </div>
            </section>

          </div>

          {/* Quick Support Widget */}
          <footer className="mt-md p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left">
            <div>
              <h4 className="text-label-md font-bold text-on-surface">Bạn cần hỗ trợ thêm thông tin vận chuyển?</h4>
              <p className="text-label-sm text-on-surface-variant mt-1">Đội ngũ CSKH hỗ trợ trực hotline từ 8:00 - 21:00 hàng ngày.</p>
            </div>
            <a 
              href="tel:19006886" 
              className="px-md py-sm bg-primary text-white text-label-sm font-semibold rounded-md hover:bg-primary/90 hover:shadow-md transition-all duration-300"
            >
              Hotline 1900 6886
            </a>
          </footer>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
