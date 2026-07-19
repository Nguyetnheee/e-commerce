'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { getAuthToken, orderApi } from '../../lib/api';

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  variantName: string;
  quantity: number;
  soldPrice: number;
}

interface CustomerOrder {
  id: number;
  orderCode: string;
  status: 'PENDING' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const orderStatus: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  PACKING: { text: 'Đang đóng gói', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  SHIPPING: { text: 'Đang giao hàng', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DELIVERED: { text: 'Đã giao hàng', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-50 text-red-700 border-red-200' },
};

const paymentStatus: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ thanh toán', className: 'text-amber-700' },
  PAID: { text: 'Đã thanh toán', className: 'text-emerald-700' },
  FAILED: { text: 'Thanh toán thất bại', className: 'text-red-700' },
  CANCELLED: { text: 'Đã hủy thanh toán', className: 'text-red-700' },
};

export default function OrderTrackingPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    if (!getAuthToken()) {
      setLoading(false);
      router.push('/login');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    orderApi.getMyOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((error) => setErrorMsg(error.message || 'Không thể tải danh sách đơn hàng.'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    loadOrders();
    const refreshOnFocus = () => loadOrders();
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((order) =>
      order.orderCode?.toLowerCase().includes(keyword) ||
      order.items?.some((item) => item.productName?.toLowerCase().includes(keyword))
    );
  }, [orders, query]);

  const formatPrice = (value: number = 0) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const formatDate = (value: string) =>
    value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      <Header />

      <main className="flex-grow w-full max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-sm mb-md text-left">
          <div>
            <h1 className="text-headline-md md:text-headline-lg font-bold tracking-tight">Đơn hàng của bạn</h1>
            <p className="text-label-sm text-on-surface-variant font-medium mt-1">
              Tất cả đơn hàng và trạng thái mới nhất được tổng hợp tự động
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center justify-center gap-xs px-sm py-2.5 bg-white border border-outline-variant/30 rounded-lg text-label-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md mb-md">
          <label htmlFor="orderSearch" className="text-label-sm font-bold uppercase tracking-wider block mb-xs">
            Tìm theo mã đơn hoặc sản phẩm
          </label>
          <div className="relative">
            <input
              id="orderSearch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập mã đơn hàng hoặc tên sản phẩm..."
              className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-3 pl-4 pr-12 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search className="w-5 h-5 text-outline absolute right-4 top-3.5" />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-md bg-error-container text-on-error-container border border-error/20 p-sm rounded-xl flex items-center gap-sm">
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-xl text-center shadow-ambient">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-sm" />
            <p className="font-semibold text-on-surface-variant">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-xl text-center shadow-ambient border border-outline-variant/10">
            <ShoppingBag className="w-12 h-12 text-outline-variant mx-auto mb-sm" />
            <h2 className="text-body-lg font-bold">{query ? 'Không tìm thấy đơn hàng phù hợp' : 'Bạn chưa có đơn hàng nào'}</h2>
            <p className="text-label-sm text-on-surface-variant mt-xs">
              {query ? 'Hãy kiểm tra lại mã đơn hoặc tên sản phẩm.' : 'Đơn hàng sẽ tự động xuất hiện tại đây sau khi đặt hàng.'}
            </p>
          </div>
        ) : (
          <div className="space-y-sm">
            {filteredOrders.map((order) => {
              const status = orderStatus[order.status] || { text: order.status, className: 'bg-slate-50 text-slate-700 border-slate-200' };
              const payStatus = paymentStatus[order.paymentStatus] || { text: order.paymentStatus, className: 'text-slate-700' };
              const expanded = expandedOrder === order.orderCode;
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <article key={order.id} className="bg-white rounded-2xl shadow-ambient border border-outline-variant/10 overflow-hidden text-left">
                  <button
                    type="button"
                    onClick={() => setExpandedOrder(expanded ? null : order.orderCode)}
                    className="w-full p-md md:p-lg text-left hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
                      <div className="flex items-start gap-sm min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-xs">
                            <span className="font-extrabold text-primary">Đơn #{order.orderCode}</span>
                            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${status.className}`}>{status.text}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-md gap-y-1 mt-1 text-[11px] text-on-surface-variant">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(order.createdAt)}</span>
                            <span>{itemCount} sản phẩm</span>
                            <span className={payStatus.className}>{payStatus.text}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-md">
                        <div className="text-right">
                          <span className="text-[10px] text-on-surface-variant block">Tổng thanh toán</span>
                          <span className="text-body-lg font-extrabold text-primary">{formatPrice(order.totalAmount)}</span>
                        </div>
                        {expanded ? <ChevronUp className="w-5 h-5 text-outline" /> : <ChevronDown className="w-5 h-5 text-outline" />}
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-outline-variant/10 p-md md:p-lg space-y-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm text-label-sm">
                        <div className="bg-slate-50 rounded-xl p-sm space-y-xs">
                          <h3 className="font-bold flex items-center gap-xs"><MapPin className="w-4 h-4 text-primary" />Thông tin nhận hàng</h3>
                          <p><span className="text-on-surface-variant">Người nhận:</span> {order.recipientName}</p>
                          <p><span className="text-on-surface-variant">Điện thoại:</span> {order.recipientPhone}</p>
                          <p><span className="text-on-surface-variant">Địa chỉ:</span> {order.shippingAddress}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-sm space-y-xs">
                          <h3 className="font-bold flex items-center gap-xs"><CreditCard className="w-4 h-4 text-primary" />Thanh toán và xử lý</h3>
                          <p><span className="text-on-surface-variant">Phương thức:</span> {order.paymentMethod === 'PAYOS' ? 'Chuyển khoản PayOS' : 'Thanh toán khi nhận hàng (COD)'}</p>
                          <p><span className="text-on-surface-variant">Thanh toán:</span> <span className={`font-bold ${payStatus.className}`}>{payStatus.text}</span></p>
                          <p><span className="text-on-surface-variant">Cập nhật:</span> {formatDate(order.updatedAt)}</p>
                          {order.cancelReason && <p className="text-error"><span className="font-bold">Lý do hủy:</span> {order.cancelReason}</p>}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold uppercase tracking-wider text-label-sm flex items-center gap-xs pb-xs border-b border-outline-variant/10">
                          <ClipboardList className="w-4 h-4 text-primary" />Sản phẩm trong đơn
                        </h3>
                        <div className="divide-y divide-outline-variant/10">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-sm py-sm">
                              <img src={item.productImage || '/images/product-tent.png'} alt={item.productName} className="w-14 h-14 rounded-lg object-cover bg-surface-container" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{item.productName}</p>
                                <p className="text-[11px] text-on-surface-variant">{item.variantName || 'Mặc định'} · Số lượng: {item.quantity}</p>
                              </div>
                              <span className="font-bold shrink-0">{formatPrice(item.soldPrice * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-outline-variant/10 pt-sm space-y-xs text-label-sm">
                        {Boolean(order.discountAmount) && (
                          <div className="flex justify-between text-secondary">
                            <span>Giảm giá{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                            <span>-{formatPrice(order.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Tổng thanh toán</span>
                          <span className="text-headline-md font-extrabold text-primary">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
