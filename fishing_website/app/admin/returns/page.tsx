'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../../lib/api';
import { 
  ArrowLeft, 
  Search, 
  Check, 
  Trash2, 
  RotateCcw, 
  AlertTriangle,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  variantId: string;
  variantSku: string;
  quantity: number;
  reason: string;
  date: string;
  status: 'PENDING_INSPECTION' | 'RESTOCKED' | 'DISPOSED';
}

const defaultReturns: ReturnRequest[] = [
  { id: 'RET-101', orderId: '2026-07-01-9982', customerName: 'Trần Minh Hoàng', productName: 'Máy câu Shimano Stella SW', variantId: '1', variantSku: 'WS-SHI-STELLA', quantity: 1, reason: 'Hàng trầy xước nhẹ khi vận chuyển', date: '2026-07-10', status: 'PENDING_INSPECTION' },
  { id: 'RET-102', orderId: '2026-07-02-1209', customerName: 'Phạm Thị Lan', productName: 'Lều Dã Ngoại Peak-4 Naturehike', variantId: '2', variantSku: 'WS-CAMP-PEAK4', quantity: 1, reason: 'Sai màu sắc so với đơn đặt hàng', date: '2026-07-11', status: 'PENDING_INSPECTION' },
  { id: 'RET-103', orderId: '2026-06-28-5432', customerName: 'Lê Văn Nam', productName: 'Bộ Lưỡi Câu Titan Chống Gỉ', variantId: '3', variantSku: 'WS-HOOK-TITAN', quantity: 2, reason: 'Kích cỡ lưỡi câu quá bé', date: '2026-07-08', status: 'RESTOCKED' },
];

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const loadReturns = async () => {
    try {
      const data = await adminApi.getReturns();
      if (Array.isArray(data)) {
        setReturns(data);
      }
    } catch (err) {
      console.log('Using localStorage fallback for returns:', err);
      const saved = localStorage.getItem('admin_returns');
      if (saved) {
        try {
          setReturns(JSON.parse(saved));
        } catch (e) {
          setReturns(defaultReturns);
        }
      } else {
        setReturns(defaultReturns);
        localStorage.setItem('admin_returns', JSON.stringify(defaultReturns));
      }
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleRestock = (ret: ReturnRequest) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận Nhập kho (Restock)',
      message: `Bạn có chắc chắn đồng ý nhận lại & BỔ SUNG ${ret.quantity} sản phẩm (${ret.productName}) vào tồn kho của hệ thống?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.restockReturn(ret.id);
          loadReturns();
          alert('Đã xử lý nhập lại kho thành công & cập nhật dữ liệu tồn kho biến thể!');
        } catch (err: any) {
          alert('Đã xảy ra lỗi khi gọi API Restock: ' + (err.message || err));
        }
      }
    });
  };

  const handleDispose = (retId: string, prodName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận Thải bỏ (Dispose)',
      message: `Bạn có chắc chắn quyết định THẢI BỎ (tiêu hủy) sản phẩm hoàn trả (${prodName}) này không? Hàng sẽ không được cộng lại vào kho.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.disposeReturn(retId);
          loadReturns();
          alert('Đã cập nhật trạng thái: THẢI BỎ thành công.');
        } catch (err: any) {
          alert('Lỗi cập nhật trạng thái: ' + (err.message || err));
        }
      }
    });
  };

  const filteredReturns = returns.filter(r => {
    const matchesSearch = 
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    return r.status === filterStatus && matchesSearch;
  });

  return (
    <div className="space-y-md">
      {/* HEADER ACTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <span className="text-label-sm text-secondary uppercase font-semibold tracking-wider block mb-1">
            WildStream CMS
          </span>
          <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
            Xử lý Đổi trả hàng & Hoàn tiền
          </h1>
        </div>
      </div>

      {/* TOP CONTROLS */}
        {/* TOP CONTROLS */}
        <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex justify-between items-center gap-md flex-wrap">
          <div className="flex items-center gap-sm flex-wrap">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Tìm mã đơn, khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-amber-600"
              />
              <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-xs">
              <span className="text-label-sm text-on-surface-variant font-semibold">Trạng thái:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-1.5 px-3 text-label-sm focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="ALL">Tất cả yêu cầu</option>
                <option value="PENDING_INSPECTION">Chờ kiểm định chất lượng</option>
                <option value="RESTOCKED">Đã kiểm định - Nhập lại kho</option>
                <option value="DISPOSED">Đã kiểm định - Thải bỏ</option>
              </select>
            </div>
          </div>

          <span className="text-label-sm text-on-surface-variant">
            Hiển thị <strong>{filteredReturns.length}</strong> yêu cầu đổi trả
          </span>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredReturns.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/70">
                <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-body-md text-on-surface">Không tìm thấy yêu cầu đổi trả nào</p>
                <p className="text-label-sm text-on-surface-variant/60 mt-1">Hệ thống đang hoạt động ổn định.</p>
              </div>
            ) : (
              <table className="w-full text-left text-label-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-extrabold">
                    <th className="py-3 px-4">Mã Đổi Trả</th>
                    <th className="py-3 px-4">Thông tin Đơn gốc</th>
                    <th className="py-3 px-4">Sản phẩm & Số lượng</th>
                    <th className="py-3 px-4">Lý do hoàn trả</th>
                    <th className="py-3 px-4">Trạng thái xử lý</th>
                    <th className="py-3 px-4 text-right">Quyết định kiểm định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant font-sans">
                  {filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-amber-700 bg-amber-50/30">{ret.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-on-surface block">{ret.customerName}</span>
                        <span className="text-[11px] text-on-surface-variant/70 block">Mã đơn: #{ret.orderId}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-on-surface block">{ret.productName}</span>
                        <span className="text-[11px] text-[#00288e] font-mono">SKU: {ret.variantSku} (x{ret.quantity})</span>
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate" title={ret.reason}>
                        {ret.reason}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          ret.status === 'PENDING_INSPECTION'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : ret.status === 'RESTOCKED'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {ret.status === 'PENDING_INSPECTION' ? 'CHỜ KIỂM ĐỊNH' : ret.status === 'RESTOCKED' ? 'NHẬP LẠI KHO' : 'ĐÃ THẢI BỎ'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {ret.status === 'PENDING_INSPECTION' ? (
                          <div className="flex justify-end gap-xs">
                            <button
                              onClick={() => handleRestock(ret)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                              title="Kiểm định đạt - Cộng lại tồn kho"
                            >
                              Nhập kho (Restock)
                            </button>
                            <button
                              onClick={() => handleDispose(ret.id, ret.productName)}
                              className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                              title="Kiểm định lỗi nặng - Tiêu huỷ hàng"
                            >
                              Thải bỏ (Dispose)
                            </button>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant/50 font-semibold italic text-[11px]">Đã kết luận</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
