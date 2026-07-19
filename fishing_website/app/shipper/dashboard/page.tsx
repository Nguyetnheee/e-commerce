'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Clock3,
  ExternalLink,
  Filter,
  History,
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  Truck,
  UploadCloud,
  X,
} from 'lucide-react';
import { shipperApi } from '../../../lib/api';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dziemd19e';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'e-commerce';

const STATUS_META: Record<string, { label: string; className: string }> = {
  PACKING: { label: 'Chờ kho bàn giao', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  SHIPPING: { label: 'Đang giao hàng', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  DELIVERY_FAILED: { label: 'Giao không thành công', className: 'bg-red-50 text-red-700 border-red-200' },
  DELIVERED: { label: 'Đã giao hàng', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RETURNED: { label: 'Đã trả về kho', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-slate-100 text-slate-600 border-slate-300' },
};

const FILTERS = [
  { value: 'ALL', label: 'Tất cả đơn' },
  { value: 'PACKING', label: 'Chờ bàn giao' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERY_FAILED', label: 'Giao thất bại' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'RETURNED', label: 'Trả về kho' },
];

const FAILURE_REASONS = [
  'Khách hàng không có mặt',
  'Địa chỉ không chính xác',
  'Khách hàng từ chối nhận gói hàng',
  'Điều kiện thời tiết không đảm bảo',
  'Vấn đề hậu cần hoặc phương tiện',
];

const money = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

const dateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN') : 'Chưa cập nhật';

export default function ShipperDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [deliveryOrder, setDeliveryOrder] = useState<any | null>(null);
  const [failedOrder, setFailedOrder] = useState<any | null>(null);
  const [failureReason, setFailureReason] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      const data = await shipperApi.getAssignedOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      alert(error.message || 'Không thể tải danh sách đơn được giao.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/admin-login');
      return;
    }
    try {
      const user = JSON.parse(session);
      if (user.role !== 'shipper') {
        router.push(user.role === 'admin' ? '/admin/dashboard' : user.role === 'kho' ? '/kho/dashboard' : '/admin-login');
        return;
      }
      setUserEmail(user.email);
      fetchOrders();
    } catch {
      localStorage.removeItem('user_session');
      router.push('/admin-login');
    }
  }, [router]);

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === 'ALL' || order.status === filter;
      const searchable = [
        order.id,
        order.orderCode,
        order.recipientName,
        order.recipientPhone,
        order.shippingAddress,
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!normalizedKeyword || searchable.includes(normalizedKeyword));
    });
  }, [orders, filter, keyword]);

  const counts = useMemo(() => ({
    assigned: orders.length,
    active: orders.filter((order) => order.status === 'SHIPPING').length,
    delivered: orders.filter((order) => order.status === 'DELIVERED').length,
    failed: orders.filter((order) => order.status === 'DELIVERY_FAILED').length,
  }), [orders]);

  const uploadProof = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn đúng tệp hình ảnh.');
      return;
    }
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Không thể tải ảnh xác nhận.');
      const data = await response.json();
      setProofImageUrl(data.secure_url);
    } catch (error: any) {
      alert(error.message || 'Tải ảnh xác nhận thất bại.');
    } finally {
      setUploadingProof(false);
    }
  };

  const completeDelivery = async () => {
    if (!deliveryOrder || !proofImageUrl) {
      alert('Bắt buộc chụp hoặc tải ảnh xác nhận gói hàng đã được giao.');
      return;
    }
    setSubmitting(true);
    try {
      await shipperApi.completeDelivery(deliveryOrder.id, proofImageUrl);
      setDeliveryOrder(null);
      setProofImageUrl('');
      await fetchOrders(true);
      alert('Đã xác nhận giao hàng thành công.');
    } catch (error: any) {
      alert(error.message || 'Không thể hoàn tất giao hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  const failDelivery = async () => {
    if (!failedOrder || !failureReason) {
      alert('Vui lòng chọn lý do giao hàng không thành công.');
      return;
    }
    setSubmitting(true);
    try {
      await shipperApi.failDelivery(failedOrder.id, failureReason);
      setFailedOrder(null);
      setFailureReason('');
      await fetchOrders(true);
      alert('Đã ghi nhận giao hàng không thành công và chuyển quản trị viên đánh giá.');
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật giao hàng thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user_session');
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface font-sans">
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div className="font-extrabold text-body-lg">
            <span className="text-[#00288e]">WildStream</span>
            <span className="ml-1 text-[12px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">Giao hàng</span>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <div className="hidden sm:block text-right">
            <div className="text-label-sm font-bold">{userEmail}</div>
            <div className="text-[10px] text-amber-600 font-bold uppercase">Nhân viên giao hàng</div>
          </div>
          <button onClick={logout} className="flex items-center gap-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg font-bold text-label-sm">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-sm md:p-md space-y-md">
        <section className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-md rounded-2xl shadow-lg">
          <div className="text-label-sm uppercase tracking-widest font-bold text-amber-100">Quản lý vòng đời giao hàng</div>
          <h1 className="text-headline-md font-bold mt-1">Đơn hàng được phân công</h1>
          <p className="text-white/85 mt-1">
            Theo dõi đơn chờ bàn giao, đang giao, giao thất bại, đã giao và trả về kho trong cùng một nơi.
          </p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-sm">
          {[
            { label: 'Tổng được phân công', value: counts.assigned, icon: PackageCheck, color: 'text-blue-700 bg-blue-50' },
            { label: 'Đang giao', value: counts.active, icon: Truck, color: 'text-amber-700 bg-amber-50' },
            { label: 'Đã giao', value: counts.delivered, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'Chờ xử lý thất bại', value: counts.failed, icon: AlertTriangle, color: 'text-red-700 bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-outline-variant/20 rounded-2xl p-sm shadow-sm flex justify-between gap-xs">
              <div><div className="text-[11px] font-bold uppercase text-on-surface-variant">{label}</div><div className="text-headline-md font-black mt-1">{value} đơn</div></div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            </div>
          ))}
        </section>

        <section className="bg-white border border-outline-variant/20 rounded-2xl p-sm shadow-sm">
          <div className="flex flex-col lg:flex-row gap-sm justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-3 text-outline" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm mã đơn, khách hàng, SĐT hoặc địa chỉ..." className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-outline-variant/40 rounded-xl outline-none focus:border-amber-600" />
            </div>
            <div className="flex gap-xs overflow-x-auto">
              <Filter className="w-4 h-4 mt-2.5 text-outline flex-shrink-0" />
              {FILTERS.map((item) => (
                <button key={item.value} onClick={() => setFilter(item.value)} className={`px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap border ${filter === item.value ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-outline-variant/40 text-on-surface-variant'}`}>
                  {item.label}
                </button>
              ))}
              <button onClick={() => fetchOrders(true)} disabled={refreshing} className="p-2 border border-outline-variant/40 rounded-lg text-primary" title="Làm mới">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-sm">
            <h2 className="text-body-lg font-bold flex items-center gap-xs"><History className="w-5 h-5 text-amber-600" /> Danh sách và lịch sử giao hàng</h2>
            <span className="text-label-sm text-on-surface-variant">{filteredOrders.length} kết quả</span>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl p-xl text-center border"><RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" /><p className="mt-sm">Đang tải đơn hàng...</p></div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-xl text-center border"><PackageCheck className="w-12 h-12 text-slate-300 mx-auto" /><p className="mt-sm font-bold">Không có đơn phù hợp bộ lọc</p></div>
          ) : (
            <div className="space-y-sm">
              {filteredOrders.map((order) => {
                const meta = STATUS_META[order.status] || { label: order.status, className: 'bg-slate-50 text-slate-700 border-slate-200' };
                return (
                  <article key={order.id} className="bg-white rounded-2xl border border-outline-variant/25 shadow-sm p-sm md:p-md">
                    <div className="flex flex-col lg:flex-row gap-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-xs mb-sm">
                          <span className="font-mono font-black text-primary">#{order.orderCode || order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${meta.className}`}>{meta.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentMethod === 'COD' ? 'Thu tiền COD' : 'Chờ thanh toán'}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-xs text-label-sm">
                          <div className="flex gap-xs"><MapPin className="w-4 h-4 text-outline flex-shrink-0" /><span><strong>{order.recipientName}</strong><br />{order.shippingAddress}</span></div>
                          <div className="space-y-1">
                            <div className="flex gap-xs"><Phone className="w-4 h-4 text-outline" /><a className="text-primary font-bold" href={`tel:${order.recipientPhone}`}>{order.recipientPhone}</a></div>
                            <div>Tổng thu: <strong>{money(order.totalAmount)}</strong></div>
                            <div>Lần giao: <strong>{order.deliveryAttemptCount || 0}</strong></div>
                            {order.trackingNumber && <div>Mã theo dõi: <strong className="font-mono">{order.trackingNumber}</strong></div>}
                          </div>
                        </div>
                        {order.items?.length > 0 && (
                          <div className="mt-sm bg-slate-50 rounded-xl p-xs text-[11px]">
                            {order.items.map((item: any, index: number) => (
                              <div key={item.id || index} className="flex justify-between gap-sm py-0.5">
                                <span>{item.productName || item.variantName || `Sản phẩm #${item.productId || ''}`}</span>
                                <strong>x{item.quantity}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                        {order.deliveryFailureReason && (
                          <div className="mt-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-xs text-[11px]">
                            <strong>Lý do thất bại:</strong> {order.deliveryFailureReason} · {dateTime(order.deliveryFailedAt)}
                          </div>
                        )}
                        {order.deliveryProofImage && (
                          <a href={order.deliveryProofImage} target="_blank" rel="noreferrer" className="mt-xs inline-flex items-center gap-1 text-[11px] text-primary font-bold">
                            <Camera className="w-3.5 h-3.5" /> Xem ảnh xác nhận giao hàng <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {order.shippingHistory?.length > 0 && (
                          <details className="mt-sm rounded-xl border border-outline-variant/30 bg-white">
                            <summary className="cursor-pointer px-xs py-2 text-[11px] font-bold text-primary">
                              Xem lịch sử vận chuyển ({order.shippingHistory.length})
                            </summary>
                            <div className="border-t px-sm py-xs space-y-xs">
                              {order.shippingHistory.map((event: any) => (
                                <div key={event.id} className="relative pl-sm border-l-2 border-amber-200 text-[11px]">
                                  <div className="font-bold">{STATUS_META[event.status]?.label || event.status}</div>
                                  <div className="text-on-surface-variant">{event.note}</div>
                                  <div className="text-[10px] text-outline">{dateTime(event.createdAt)} · {event.actor}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                      <div className="lg:w-64 flex lg:flex-col justify-end gap-xs">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress || '')}`} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-1 border border-outline-variant/50 px-3 py-2 rounded-lg font-bold text-[11px]">
                          <MapPin className="w-4 h-4" /> Mở chỉ đường
                        </a>
                        {order.status === 'SHIPPING' && (
                          <>
                            <button onClick={() => { setFailedOrder(order); setFailureReason(''); }} className="flex-1 border border-red-200 bg-red-50 text-red-700 px-3 py-2 rounded-lg font-bold text-[11px]">
                              Giao không thành công
                            </button>
                            <button onClick={() => { setDeliveryOrder(order); setProofImageUrl(''); }} className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold text-[11px]">
                              Xác nhận đã giao
                            </button>
                          </>
                        )}
                        {order.status === 'PACKING' && (
                          <div className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 p-xs rounded-lg flex gap-1">
                            <Clock3 className="w-4 h-4 flex-shrink-0" /> Chờ kho đóng gói, xác minh người nhận và bàn giao.
                          </div>
                        )}
                        {order.status === 'DELIVERY_FAILED' && (
                          <div className="text-[11px] bg-red-50 text-red-700 border border-red-200 p-xs rounded-lg">
                            Đang chờ Admin quyết định giao lại, hủy đơn hoặc trả về kho.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {deliveryOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 p-sm overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-white rounded-3xl max-w-lg w-full p-md shadow-2xl">
              <div className="flex justify-between items-center border-b pb-sm"><h3 className="font-black text-body-lg flex gap-xs"><Camera className="text-emerald-600" /> Xác nhận giao hàng</h3><button onClick={() => setDeliveryOrder(null)}><X /></button></div>
              <p className="text-label-sm my-sm">Bắt buộc có ảnh gói hàng đã giao cho khách. Sau khi xác nhận, đơn sẽ hoàn tất và không thể sửa lại.</p>
              {proofImageUrl ? (
                <img src={proofImageUrl} alt="Ảnh xác nhận giao hàng" className="w-full h-64 object-contain bg-slate-50 border rounded-xl" />
              ) : (
                <label className="h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50">
                  <UploadCloud className="w-10 h-10 text-slate-400" /><span className="font-bold mt-xs">{uploadingProof ? 'Đang tải ảnh...' : 'Chụp hoặc chọn ảnh giao hàng'}</span>
                  <input type="file" accept="image/*" capture="environment" disabled={uploadingProof} onChange={(e) => uploadProof(e.target.files?.[0])} className="hidden" />
                </label>
              )}
              <div className="flex gap-xs mt-sm"><button onClick={() => setDeliveryOrder(null)} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold">Hủy</button><button disabled={!proofImageUrl || submitting} onClick={completeDelivery} className="flex-1 bg-emerald-600 disabled:opacity-50 text-white py-2 rounded-lg font-bold">{submitting ? 'Đang cập nhật...' : 'Xác nhận đã giao'}</button></div>
            </div>
          </div>
        </div>
      )}

      {failedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 p-sm overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-white rounded-3xl max-w-lg w-full p-md shadow-2xl">
              <div className="flex justify-between items-center border-b pb-sm"><h3 className="font-black text-body-lg flex gap-xs"><AlertTriangle className="text-red-600" /> Báo giao không thành công</h3><button onClick={() => setFailedOrder(null)}><X /></button></div>
              <p className="text-label-sm my-sm">Chọn lý do thực tế. Đơn sẽ được chuyển cho Admin đánh giá để giao lại, hủy hoặc trả về kho.</p>
              <div className="space-y-xs">
                {FAILURE_REASONS.map((reason) => (
                  <label key={reason} className={`flex gap-xs border rounded-xl p-xs cursor-pointer ${failureReason === reason ? 'border-red-500 bg-red-50' : 'border-outline-variant/40'}`}>
                    <input type="radio" name="failureReason" value={reason} checked={failureReason === reason} onChange={() => setFailureReason(reason)} />
                    <span className="text-label-sm font-semibold">{reason}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-xs mt-sm"><button onClick={() => setFailedOrder(null)} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold">Quay lại</button><button disabled={!failureReason || submitting} onClick={failDelivery} className="flex-1 bg-red-600 disabled:opacity-50 text-white py-2 rounded-lg font-bold">{submitting ? 'Đang cập nhật...' : 'Xác nhận thất bại'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
