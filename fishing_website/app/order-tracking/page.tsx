'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Search, Package, MapPin, ClipboardList, CheckCircle2, AlertCircle, ShoppingBag, Truck, Calendar } from 'lucide-react';
import { orderApi } from '../../lib/api';

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  variantName: string;
  quantity: number;
  soldPrice: number;
}

interface OrderTrackingData {
  orderCode: string;
  status: 'PENDING' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
}

export default function OrderTrackingPage() {
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) {
      alert('Vui lòng nhập mã đơn hàng!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setTrackingData(null);

    orderApi.trackOrder(orderCode.trim())
      .then((data) => {
        setLoading(false);
        if (data) {
          setTrackingData(data);
        } else {
          setErrorMsg('Không tìm thấy thông tin đơn hàng này trên hệ thống.');
        }
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.message || 'Mã đơn hàng không hợp lệ hoặc không tồn tại!');
      });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'PACKING': return 'Đang đóng gói';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng thành công';
      case 'CANCELLED': return 'Đã hủy đơn';
      default: return status;
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'PACKING': return 1;
      case 'SHIPPING': return 2;
      case 'DELIVERED': return 3;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const steps = [
    { title: 'Chờ duyệt', desc: 'Đơn hàng đang chờ xác nhận', icon: ClipboardList },
    { title: 'Đóng gói', desc: 'Đang chuẩn bị trang bị', icon: Package },
    { title: 'Vận chuyển', desc: 'Đang giao hàng tới bạn', icon: Truck },
    { title: 'Đã nhận', desc: 'Giao hàng thành công', icon: CheckCircle2 },
  ];

  const stepIndex = trackingData ? getStepIndex(trackingData.status) : 0;
  const isCancelled = trackingData?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      <Header />

      <main className="flex-grow w-full max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        {/* Page Title */}
        <div className="mb-md text-left">
          <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface tracking-tight">
            Theo dõi hành trình đơn hàng
          </h1>
          <p className="text-label-sm text-on-surface-variant font-medium mt-1">
            Tra cứu trực tiếp trạng thái chuẩn bị sản phẩm và lịch trình vận chuyển của bạn
          </p>
        </div>

        {/* Input box card */}
        <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md md:p-lg mb-md text-left">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-sm items-end sm:items-center">
            <div className="flex-grow flex flex-col gap-xs w-full">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                Nhập mã đơn hàng
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: WSG-129481 hoặc mã sinh tự động"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-3 pl-4 pr-12 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                <Search className="w-5 h-5 text-outline absolute right-4 top-3.5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-md py-3.5 px-lg flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer h-[50px] shrink-0"
            >
              <span>{loading ? 'ĐANG TÌM...' : 'TRA CỨU'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-md bg-error-container text-on-error-container border border-error/20 p-sm rounded-xl text-body-md flex items-center gap-sm">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Tracking Details */}
        {trackingData && (
          <div className="space-y-md">
            
            {/* Status Stepper Tracker */}
            <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md md:p-lg text-left">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm mb-md flex-wrap gap-xs">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">Mã vận đơn</span>
                  <span className="text-body-lg font-extrabold text-[#00288e]">{trackingData.orderCode}</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-label-sm font-bold shadow-xs select-none ${
                  isCancelled 
                    ? 'bg-error-container text-on-error-container border border-error/10'
                    : 'bg-primary/10 text-primary border border-primary/10'
                }`}>
                  Trạng thái: {getStatusText(trackingData.status)}
                </div>
              </div>

              {/* Steps Progress Visual Representation */}
              {isCancelled ? (
                <div className="bg-error-container/20 border border-error/10 text-on-error-container p-md rounded-xl flex items-center gap-sm text-body-md">
                  <AlertCircle className="w-6 h-6 text-error shrink-0" />
                  <div>
                    <h4 className="font-bold text-error">Đơn hàng đã bị hủy</h4>
                    <p className="text-[12px] opacity-80 mt-0.5">Chúng tôi đã hoàn lại sản phẩm về kho hàng. Vui lòng liên hệ hỗ trợ nếu đây là sự nhầm lẫn.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-sm relative pt-sm">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = stepIndex >= idx;
                    const isCurrent = stepIndex === idx;

                    return (
                      <div key={idx} className="flex md:flex-col items-center gap-sm md:gap-xs text-left md:text-center relative">
                        {/* Circle Badge Indicator */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 relative z-10 shrink-0 ${
                          isDone 
                            ? 'bg-[#00288e] text-white border-2 border-white' 
                            : 'bg-surface-container text-outline-variant'
                        } ${isCurrent ? 'ring-4 ring-[#00288e]/10' : ''}`}>
                          <StepIcon className="w-5.5 h-5.5" />
                        </div>

                        <div>
                          <h4 className={`text-label-md font-bold ${isDone ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>
                            {step.title}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant/80 mt-0.5 leading-relaxed max-w-[160px] md:mx-auto">
                            {step.desc}
                          </p>
                        </div>

                        {/* Line connector */}
                        {idx < 3 && (
                          <div className={`hidden md:block absolute left-[calc(50%+24px)] top-6 w-[calc(100%-48px)] h-0.5 z-0 ${
                            stepIndex > idx ? 'bg-[#00288e]' : 'bg-surface-container'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* List of Ordered items */}
            <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md md:p-lg text-left">
              <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-sm pb-xs border-b border-outline-variant/10">
                Sản phẩm trong đơn hàng
              </h3>

              <div className="divide-y divide-outline-variant/10">
                {trackingData.items && trackingData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-md py-sm">
                    <div className="w-16 h-16 bg-surface-container rounded-xl overflow-hidden shrink-0 border border-outline-variant/10">
                      <img 
                        src={item.productImage || '/images/product-tent.png'} 
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-body-md font-bold text-on-surface line-clamp-1">{item.productName}</h4>
                      <p className="text-[11px] text-on-surface-variant">{item.variantName} | Số lượng: {item.quantity}</p>
                    </div>
                    <span className="text-body-md font-bold text-primary font-sans shrink-0">
                      {formatPrice(item.soldPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="flex justify-between items-center border-t border-outline-variant/10 pt-sm mt-sm">
                <span className="text-label-md font-bold text-on-surface">Tổng số tiền thanh toán</span>
                <span className="text-headline-md font-extrabold text-primary font-sans">
                  {formatPrice(trackingData.items ? trackingData.items.reduce((sum, item) => sum + (item.soldPrice * item.quantity), 0) : 0)}
                </span>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
