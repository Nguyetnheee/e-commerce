'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, HelpCircle, ShoppingCart, Home } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { orderApi } from '../../../lib/api';

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderCode =
    searchParams.get('orderCode') ||
    searchParams.get('orderId') ||
    searchParams.get('vnp_TxnRef') ||
    'N/A';

  const errorCode =
    searchParams.get('code') ||
    searchParams.get('errorCode') ||
    searchParams.get('vnp_ResponseCode') ||
    '99';

  const description =
    searchParams.get('desc') ||
    searchParams.get('message') ||
    'Giao dịch đã bị hủy hoặc bị từ chối.';

  // Automatically inform backend to mark order as CANCELLED and restore stock
  useEffect(() => {
    if (orderCode && orderCode !== 'N/A') {
      orderApi.cancelPaymentOrder(orderCode).catch((err) => {
        console.log('Payment cancellation recorded or already processed:', err);
      });
    }
  }, [orderCode]);

  const handleReorder = () => {
    router.push('/checkout');
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-outline-variant/30 shadow-ambient p-lg md:p-xl text-center space-y-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-error" />

      <div className="w-20 h-20 bg-red-50 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
        <XCircle className="w-12 h-12" />
      </div>

      <div className="space-y-xs">
        <h1 className="text-headline-md font-bold tracking-tight text-on-surface">Thanh toán thất bại</h1>
        <p className="text-body-md text-on-surface-variant/80">{description}</p>
      </div>

      <div className="bg-slate-50 border border-outline-variant/20 rounded-2xl p-sm text-left space-y-xs text-label-sm font-sans text-on-surface-variant">
        <div className="flex justify-between gap-sm">
          <span>Mã đơn hàng:</span>
          <span className="font-mono font-bold text-on-surface break-all text-right">{orderCode}</span>
        </div>
        <div className="flex justify-between gap-sm">
          <span>Mã lỗi phản hồi:</span>
          <span className="font-mono font-bold text-error">{errorCode}</span>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-sm text-left flex gap-xs items-start text-label-sm font-sans text-amber-800">
        <HelpCircle className="w-4.5 h-4.5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Gợi ý khắc phục:</span>
          <ul className="list-disc list-inside space-y-1 text-on-surface-variant/90 text-[11px]">
            <li>Giao dịch PayOS đã bị hủy hoặc chưa hoàn tất.</li>
            <li>Đơn hàng cũ đã dừng xử lý, không thể thanh toán tiếp.</li>
            <li>Vui lòng nhấn nút <strong>Đặt lại đơn hàng</strong> để tạo đơn hàng mới.</li>
          </ul>
        </div>
      </div>

      <div className="pt-sm space-y-xs">
        <button
          onClick={handleReorder}
          className="w-full bg-[#00288e] hover:bg-[#1e40af] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-xs cursor-pointer transition-colors shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>ĐẶT LẠI ĐƠN HÀNG</span>
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-on-surface font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-xs cursor-pointer transition-colors"
        >
          <Home className="w-4 h-4 text-outline" />
          <span>Quay về trang chủ</span>
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop">
        <Suspense fallback={
          <div className="max-w-md w-full bg-white rounded-3xl border border-outline-variant/30 shadow-ambient p-lg text-center font-semibold text-body-md text-on-surface-variant">
            Đang hiển thị lỗi giao dịch...
          </div>
        }>
          <PaymentFailureContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
