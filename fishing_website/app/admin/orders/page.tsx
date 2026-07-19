'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  X, 
  Check, 
  Truck, 
  AlertCircle, 
  DollarSign, 
  CreditCard 
} from 'lucide-react';
import { adminApi } from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isPrompt?: boolean;
    promptPlaceholder?: string;
    promptValue?: string;
    onConfirm: (val?: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Actions loading state
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrders();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (orderId: number | string, newStatus: string) => {
    const confirmMsg = newStatus === 'PACKING' 
      ? `Xác nhận phê duyệt đơn hàng #${orderId} và chuyển trạng thái đóng gói (PACKING)?`
      : newStatus === 'SHIPPING'
        ? `Xác nhận chuyển giao đơn hàng #${orderId} cho đơn vị vận chuyển (SHIPPING)?`
        : `Xác nhận đơn hàng #${orderId} đã giao hàng THÀNH CÔNG (DELIVERED)?`;

    setConfirmModal({
      isOpen: true,
      title: 'Cập nhật trạng thái đơn hàng',
      message: confirmMsg,
      isPrompt: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          setUpdatingId(orderId);
          await adminApi.updateOrderStatus(orderId, newStatus);
          alert('Cập nhật trạng thái đơn hàng thành công!');
          loadOrders();
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }
        } catch (err: any) {
          alert(err.message || 'Lỗi khi cập nhật trạng thái.');
        } finally {
          setUpdatingId(null);
        }
      }
    });
  };

  const handleCancelOrder = (orderId: number | string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy đơn hàng',
      message: `Vui lòng nhập lý do hủy đơn hàng #${orderId} bên dưới:`,
      isPrompt: true,
      promptPlaceholder: 'Nhập lý do hủy đơn...',
      promptValue: '',
      onConfirm: async (reason) => {
        if (!reason || !reason.trim()) {
          alert('Bạn phải nhập lý do hủy đơn!');
          return;
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          setUpdatingId(orderId);
          await adminApi.cancelOrder(orderId, reason.trim());
          alert('Đã hủy đơn hàng thành công!');
          loadOrders();
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' });
          }
        } catch (err: any) {
          alert(err.message || 'Lỗi khi hủy đơn hàng.');
        } finally {
          setUpdatingId(null);
        }
      }
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      String(o.id).includes(searchQuery) ||
      (o.recipientName && o.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.recipientPhone && o.recipientPhone.includes(searchQuery));
    
    if (selectedStatus === 'ALL') return matchesSearch;
    return o.status === selectedStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PACKING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'PACKING': return 'Đóng gói';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="space-y-md">
      
      {/* HEADER SECTION */}
      <div>
        <span className="text-label-sm text-secondary uppercase font-semibold tracking-wider block mb-1">
          WildStream CMS
        </span>
        <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
          Quản lý Đơn hàng
        </h1>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex flex-wrap items-center justify-between gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          {/* Search bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm tên khách, SĐT, mã đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-xs">
            <span className="text-label-sm text-on-surface-variant font-semibold">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-1.5 px-3 text-label-sm focus:outline-none focus:border-primary cursor-pointer font-sans"
            >
              <option value="ALL">Tất cả đơn hàng</option>
              <option value="PENDING">Chờ phê duyệt (PENDING)</option>
              <option value="PACKING">Đang đóng gói (PACKING)</option>
              <option value="SHIPPING">Đang vận chuyển (SHIPPING)</option>
              <option value="DELIVERED">Đã giao hàng (DELIVERED)</option>
              <option value="CANCELLED">Đã hủy đơn (CANCELLED)</option>
            </select>
          </div>
        </div>

        <span className="text-label-sm text-on-surface-variant">
          Kết quả lọc: <strong>{filteredOrders.length}</strong> đơn hàng
        </span>
      </div>

      {/* ORDERS LIST TABLE */}
      {loading ? (
        <div className="py-20 text-center font-semibold text-on-surface-variant flex flex-col items-center gap-sm">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span>Đang tải danh sách đơn hàng...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-xl text-center shadow-ambient text-left">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-body-lg font-bold text-on-surface text-center">Không tìm thấy đơn hàng nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-label-sm font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-md">Mã đơn</th>
                  <th className="py-3.5 px-md">Ngày đặt</th>
                  <th className="py-3.5 px-md">Khách hàng</th>
                  <th className="py-3.5 px-md">Phương thức</th>
                  <th className="py-3.5 px-md">Tổng hóa đơn</th>
                  <th className="py-3.5 px-md">Trạng thái</th>
                  <th className="py-3.5 px-md text-right">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-md font-mono font-bold text-[#00288e]">#WS-{order.id}</td>
                    <td className="py-4 px-md">
                      <span className="flex items-center gap-xs text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-md">
                      <div className="font-bold text-on-surface">{order.recipientName || 'Khách hàng'}</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                        <Phone className="w-3 h-3 text-outline" /> {order.recipientPhone}
                      </div>
                    </td>
                    <td className="py-4 px-md text-[11px] font-medium">
                      {order.paymentMethod || 'Chuyển khoản (PayOS)'}
                    </td>
                    <td className="py-4 px-md font-bold text-emerald-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total || 0)}
                    </td>
                    <td className="py-4 px-md">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(order.status)}`}>
                        {getStatusName(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-md text-right" onClick={(e) => e.stopPropagation()}>
                      {updatingId === order.id ? (
                        <span className="text-[11px] font-semibold text-outline">Đang xử lý...</span>
                      ) : (
                        <div className="flex justify-end gap-xs">
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'PACKING')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                                title="Phê duyệt"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] px-2.5 py-1 rounded border border-red-200"
                                title="Hủy đơn"
                              >
                                Hủy đơn
                              </button>
                            </>
                          )}
                          {order.status === 'PACKING' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                              title="Giao đơn vị vận chuyển"
                            >
                              Giao hàng (Ship)
                            </button>
                          )}
                          {order.status === 'SHIPPING' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                              title="Hoàn thành giao hàng"
                            >
                              Hoàn thành
                            </button>
                          )}
                          {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                            <span className="text-[11px] italic text-on-surface-variant/40">Không thể sửa</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-md md:p-lg text-left shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-md">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                  Chi tiết đơn hàng
                </span>
                <h2 className="text-headline-sm font-black text-on-surface mt-xs font-mono">
                  #WS-{selectedOrder.id}
                </h2>
              </div>

              {/* Recipient details */}
              <div className="bg-slate-50 border border-outline-variant/20 rounded-2xl p-sm md:p-md space-y-sm text-label-sm font-sans">
                <h3 className="font-bold text-on-surface border-b border-slate-200 pb-2 flex items-center gap-xs">
                  <User className="w-4 h-4 text-primary" />
                  <span>Thông tin khách nhận hàng</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-xs text-on-surface-variant">
                  <div>Họ tên: <strong className="text-on-surface">{selectedOrder.recipientName}</strong></div>
                  <div>SĐT nhận: <strong className="text-on-surface">{selectedOrder.recipientPhone}</strong></div>
                  <div className="sm:col-span-2 flex items-start gap-xs mt-1">
                    <MapPin className="w-4 h-4 text-outline mt-0.5 flex-shrink-0" />
                    <span>Địa chỉ: <strong className="text-on-surface">{selectedOrder.shippingAddress}, {selectedOrder.city}</strong></span>
                  </div>
                </div>
              </div>

              {/* Items ordered */}
              <div className="space-y-xs">
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-xs">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span>Danh sách sản phẩm mua</span>
                </h3>
                
                <div className="border border-outline-variant/20 rounded-2xl overflow-hidden divide-y divide-outline-variant/10 text-body-sm bg-white">
                  {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-sm flex justify-between items-center text-left">
                      <div className="min-w-0">
                        <div className="font-bold text-on-surface truncate max-w-[280px]">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                          Số lượng: <strong>{item.quantity}</strong>
                        </div>
                      </div>
                      <div className="font-semibold text-slate-700 text-right">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost invoice summary */}
              <div className="border-t border-outline-variant/10 pt-sm space-y-xs text-label-sm font-sans">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Phương thức thanh toán:</span>
                  <span className="font-bold text-on-surface">{selectedOrder.paymentMethod || 'PayOS'}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-on-surface">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shippingFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface border-t border-dashed border-slate-200 pt-xs mt-1">
                  <span className="font-black text-body-md">TỔNG THANH TOÁN:</span>
                  <span className="font-black text-body-md text-emerald-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total || 0)}
                  </span>
                </div>
              </div>

              {/* Actions details inside modal */}
              {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                <div className="pt-sm border-t border-outline-variant/10 flex justify-end gap-sm">
                  {selectedOrder.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'PACKING')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-md rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Phê duyệt đơn hàng
                      </button>
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-md rounded-xl border border-red-200 cursor-pointer"
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'PACKING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPING')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-md rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Giao đơn vị vận chuyển
                    </button>
                  )}
                  {selectedOrder.status === 'SHIPPING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-md rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Xác nhận đã giao hàng
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isPrompt={confirmModal.isPrompt}
        promptPlaceholder={confirmModal.promptPlaceholder}
        promptValue={confirmModal.promptValue}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
