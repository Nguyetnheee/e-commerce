'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Calendar, CreditCard, ShoppingBag, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { orderApi } from '../../../lib/api';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedOrder, setSavedOrder] = useState<any>(null);
  const [realPaymentStatus, setRealPaymentStatus] = useState<string>('PENDING');
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('lastOrder');
      if (raw) {
        try {
          setSavedOrder(JSON.parse(raw));
        } catch {
          setSavedOrder(null);
        }
      }
    }
  }, []);

  const orderCode =
    searchParams.get('orderCode') ||
    searchParams.get('orderId') ||
    searchParams.get('vnp_TxnRef') ||
    savedOrder?.orderId ||
    'N/A';

  const amountRaw =
    searchParams.get('amount') ||
    searchParams.get('total') ||
    searchParams.get('vnp_Amount') ||
    savedOrder?.total ||
    '0';

  let amount = Number(amountRaw);
  if (searchParams.get('vnp_Amount')) {
    amount = amount / 100;
  }

  const paymentMethod = savedOrder?.paymentMethod || 'Thanh toán qua PayOS';
  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const checkStatus = () => {
    if (orderCode === 'N/A') {
      setCheckingStatus(false);
      return;
    }
    setCheckingStatus(true);
    orderApi.getPaymentStatus(orderCode)
      .then((res) => {
        if (res && res.paymentStatus) {
          setRealPaymentStatus(res.paymentStatus);
        }
      })
      .catch((err) => {
        console.error('Error checking payment status:', err);
      })
      .finally(() => {
        setCheckingStatus(false);
      });
  };

  useEffect(() => {
    checkStatus();
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 6 || realPaymentStatus === 'PAID') {
        clearInterval(interval);
        return;
      }
      count++;
      orderApi.getPaymentStatus(orderCode)
        .then((res) => {
          if (res && res.paymentStatus) {
            setRealPaymentStatus(res.paymentStatus);
            if (res.paymentStatus === 'PAID') {
              clearInterval(interval);
            }
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [orderCode]);

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-outline-variant/30 shadow-ambient p-lg md:p-xl text-center space-y-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm animate-pulse">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-xs">
        <h1 className="text-headline-md font-bold tracking-tight text-on-surface">
          {realPaymentStatus === 'PAID' ? 'Thanh toán thành công!' : 'Đang xử lý thanh toán'}
        </h1>
        <p className="text-body-md text-on-surface-variant/80">
          {realPaymentStatus === 'PAID' 
            ? 'Cảm ơn bạn! Giao dịch đã được ghi nhận thanh toán thành công.' 
            : 'Đơn hàng của bạn đã được tiếp nhận. Đang chờ cổng PayOS xác nhận chuyển khoản ngân hàng...'}
        </p>
      </div>

      <div className="bg-slate-50 border border-outline-variant/20 rounded-2xl p-sm md:p-md text-left space-y-sm text-label-sm font-sans">
        <h3 className="font-bold text-on-surface border-b border-slate-200 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Thông tin giao dịch</span>
          </span>
          <div className="flex items-center gap-xs">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              realPaymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {realPaymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
            </span>
            <button 
              onClick={checkStatus} 
              disabled={checkingStatus} 
              className="p-1 rounded hover:bg-slate-200 text-outline active:scale-95 disabled:opacity-50"
              type="button"
              title="Làm mới trạng thái"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </h3>

        <div className="grid grid-cols-2 gap-y-xs">
          <div className="text-on-surface-variant/80 flex items-center gap-xs">
            <CreditCard className="w-3.5 h-3.5 text-outline" />
            <span>Mã đơn hàng:</span>
          </div>
          <div className="text-right font-mono font-bold text-on-surface">{orderCode}</div>

          <div className="text-on-surface-variant/80 flex items-center gap-xs">
            <ShoppingBag className="w-3.5 h-3.5 text-outline" />
            <span>Số tiền thanh toán:</span>
          </div>
          <div className="text-right font-bold text-emerald-600">{formattedAmount}</div>

          <div className="text-on-surface-variant/80 flex items-center gap-xs">
            <Calendar className="w-3.5 h-3.5 text-outline" />
            <span>Phương thức:</span>
          </div>
          <div className="text-right text-on-surface-variant">{paymentMethod}</div>

          <div className="text-on-surface-variant/80 flex items-center gap-xs">
            <Calendar className="w-3.5 h-3.5 text-outline" />
            <span>Thời gian:</span>
          </div>
          <div className="text-right text-on-surface-variant">{new Date().toLocaleDateString('vi-VN')}</div>
        </div>
      </div>

      <div className="pt-sm space-y-xs">
        <button
          onClick={() => router.push('/order-tracking')}
          className="w-full bg-[#00288e] hover:bg-[#1e40af] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-xs cursor-pointer transition-colors shadow-sm"
        >
          <span>Theo dõi trạng thái đơn hàng</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-on-surface font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop">
        <Suspense fallback={
          <div className="max-w-md w-full bg-white rounded-3xl border border-outline-variant/30 shadow-ambient p-lg text-center font-semibold text-body-md text-on-surface-variant">
            Đang xác nhận kết quả thanh toán...
          </div>
        }>
          <PaymentSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
