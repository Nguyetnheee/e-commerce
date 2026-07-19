'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { CheckCircle2, Package, ShieldCheck, MapPin, CreditCard, ChevronRight, ArrowRight } from 'lucide-react';

interface OrderData {
  fullname: string;
  phone: string;
  address: string;
  paymentMethod: string;
  total: number;
  orderId: string;
  date: string;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  // Retrieve order details from sessionStorage or fallback to mock details
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = sessionStorage.getItem('lastOrder');
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      } else {
        // Fallback mockup order to guarantee visual excellence on direct visit
        setOrder({
          fullname: 'Nguyễn Văn A',
          phone: '0912345678',
          address: 'Số 10, ngõ 123 đường Xuân Thủy, Cầu Giấy, Hà Nội',
          paymentMethod: 'Thanh toán khi nhận hàng (COD)',
          total: 4950000,
          orderId: 'WSG-385921',
          date: new Date().toLocaleDateString('vi-VN'),
        });
      }
    }
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Main Order Success Layout */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        
        {/* TOP: Large circular green checkmark icon & Headline */}
        <section className="text-center py-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#a4f1b2]/45 flex items-center justify-center mb-sm text-secondary">
            <CheckCircle2 className="w-12 h-12 text-[#24703e]" />
          </div>
          
          <h1 className="text-headline-md md:text-headline-lg font-bold text-[#00288e] tracking-tight leading-tight">
            Đặt hàng thành công!
          </h1>
          
          <p className="text-body-md text-on-surface-variant mt-xs">
            Cảm ơn bạn đã tin dùng trang bị dã ngoại của WildStream Gear.
          </p>
        </section>

        {/* SUCCESS BANNER: Light green background with dark text */}
        <section className="mb-md">
          <div className="bg-[#a4f1b2] rounded-xl p-sm text-center shadow-sm border border-[#24703e]/10">
            <p className="text-label-md font-bold text-[#24703e] leading-snug">
              Mã đơn hàng của bạn là <span className="font-extrabold text-[#00288e]">{order.orderId}</span>. Đơn hàng đang được hệ thống xác nhận tự động.
            </p>
          </div>
        </section>

        {/* DETAILS: Two white cards side-by-side */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-sm md:gap-md mb-md">
          
          {/* CARD 1: Thông tin đơn hàng */}
          <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md text-left">
            <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-sm pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <Package className="w-4.5 h-4.5 text-primary" />
              Thông tin đơn hàng
            </h3>
            
            <div className="space-y-sm text-body-md">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Mã đơn hàng:</span>
                <span className="font-bold text-on-surface">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Ngày đặt:</span>
                <span className="font-bold text-on-surface">{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Thanh toán:</span>
                <span className="font-semibold text-on-surface text-right">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Họ và tên:</span>
                <span className="font-bold text-on-surface">{order.fullname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Số điện thoại:</span>
                <span className="font-bold text-on-surface">{order.phone}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Giao hàng */}
          <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md text-left">
            <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-sm pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <MapPin className="w-4.5 h-4.5 text-secondary" />
              Giao nhận hàng
            </h3>
            
            <div className="space-y-sm text-body-md">
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-variant font-medium">Địa chỉ giao hàng:</span>
                <span className="font-bold text-on-surface leading-tight">{order.address}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-on-surface-variant font-medium">Đơn vị vận chuyển:</span>
                <span className="font-bold text-on-surface">Giao Hàng Nhanh (GHN)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Mã vận đơn:</span>
                <span className="font-mono font-bold text-primary">GHN-83921094</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Thời gian nhận dự kiến:</span>
                <span className="font-bold text-secondary">Từ 2 - 3 ngày làm việc</span>
              </div>
            </div>
          </div>

        </section>

        {/* BELOW THEM: Full-width card for 'Sản phẩm đã đặt' */}
        <section className="mb-lg">
          <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md text-left">
            <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-md pb-xs border-b border-outline-variant/10">
              Sản phẩm đã đặt
            </h3>
            
            <div className="divide-y divide-outline-variant/10 space-y-sm">
              {/* Product Row 1 */}
              <div className="flex items-center gap-md py-xs">
                <div className="w-14 h-14 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                  <img src="/images/product-tent.png" alt="Lều Horizon" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-body-md font-bold text-on-surface line-clamp-1">Lều cắm trại 4 người Horizon</h4>
                  <p className="text-[11px] text-on-surface-variant">Màu sắc: Forest Green | Số lượng: 1</p>
                </div>
                <span className="text-body-md font-bold text-on-surface font-sans">3.450.000 ₫</span>
              </div>

              {/* Product Row 2 */}
              <div className="flex items-center gap-md py-xs pt-sm">
                <div className="w-14 h-14 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                  <img src="/images/product-chair-terrain.png" alt="Ghế dã ngoại" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-body-md font-bold text-on-surface line-clamp-1">Ghế dã ngoại xếp gọn Naturehike</h4>
                  <p className="text-[11px] text-on-surface-variant">Màu sắc: Warm Orange | Số lượng: 2</p>
                </div>
                <span className="text-body-md font-bold text-on-surface font-sans">1.500.000 ₫</span>
              </div>
            </div>

            {/* Subtotal row */}
            <div className="flex justify-between items-center border-t border-outline-variant/10 pt-sm mt-sm">
              <span className="text-label-md font-bold text-on-surface">Tổng số tiền đã thanh toán</span>
              <span className="text-headline-md font-extrabold text-primary font-sans">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </section>

        {/* BOTTOM ACTIONS: Theo dõi đơn hàng & Tiếp tục mua sắm */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-sm md:gap-md pt-sm border-t border-outline-variant/20">
          {/* Tracking button (Ocean Blue, filled) */}
          <a
            href="/order-tracking"
            className="w-full sm:w-60 bg-[#00288e] hover:bg-[#1e40af] text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center gap-xs shadow-md hover:shadow transition-all duration-200"
          >
            <span>THEO DÕI ĐƠN HÀNG</span>
          </a>

          {/* Keep shopping button (Ghost style, 1px outline) */}
          <a
            href="/"
            className="w-full sm:w-60 border border-[#00288e] text-[#00288e] hover:bg-[#00288e]/5 bg-transparent text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center transition-all duration-200"
          >
            <span>TIẾP TỤC MUA SẮM</span>
          </a>
        </section>

      </main>

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
