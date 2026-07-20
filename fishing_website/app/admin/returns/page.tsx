'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../../lib/api';
import { 
  Search, 
  RotateCcw, 
  CheckCircle,
  XCircle,
  CreditCard,
  Building2,
  UserCheck,
  Check,
  Ban,
  PackageCheck,
  AlertOctagon
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
  refundAmount?: number;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  inspectionNote?: string;
  date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'PENDING_INSPECTION' | 'RESTOCKED' | 'DISPOSED';
}

const defaultReturns: ReturnRequest[] = [
  { id: 'RET-101', orderId: '2026-07-01-9982', customerName: 'Trần Minh Hoàng', productName: 'Máy câu Shimano Stella SW', variantId: '1', variantSku: 'WS-SHI-STELLA', quantity: 1, reason: 'Hàng trầy xước nhẹ khi vận chuyển', refundAmount: 18500000, bankName: 'Vietcombank', bankAccount: '0071001234567', bankHolder: 'TRAN MINH HOANG', date: '2026-07-10', status: 'PENDING_APPROVAL' },
  { id: 'RET-102', orderId: '2026-07-02-1209', customerName: 'Phạm Thị Lan', productName: 'Lều Dã Ngoại Peak-4 Naturehike', variantId: '2', variantSku: 'WS-CAMP-PEAK4', quantity: 1, reason: 'Sai màu sắc so với đơn đặt hàng', refundAmount: 5800000, bankName: 'Techcombank', bankAccount: '1903456789012', bankHolder: 'PHAM THI LAN', date: '2026-07-11', status: 'APPROVED' },
  { id: 'RET-103', orderId: '2026-06-28-5432', customerName: 'Lê Văn Nam', productName: 'Bộ Lưỡi Câu Titan Chống Gỉ', variantId: '3', variantSku: 'WS-HOOK-TITAN', quantity: 2, reason: 'Kích cỡ lưỡi câu quá bé', refundAmount: 360000, bankName: 'MB Bank', bankAccount: '9704221234567', bankHolder: 'LE VAN NAM', date: '2026-07-08', status: 'REFUNDED' },
  { id: 'RET-104', orderId: '2026-07-05-8812', customerName: 'Nguyễn Văn A', productName: 'Cần câu Lure Daiwa Crossfire X', variantId: '4', variantSku: 'WS-DAI-CROSS', quantity: 1, reason: 'Đơn giao hàng thất bại - Hàng trả lại kho kiểm định', date: '2026-07-15', status: 'PENDING_INSPECTION' },
];

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const data = await adminApi.getReturns();
      if (Array.isArray(data) && data.length > 0) {
        setReturns(data);
      } else {
        setReturns(defaultReturns);
      }
    } catch (err) {
      console.log('Using default returns fallback:', err);
      setReturns(defaultReturns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleApprove = (ret: ReturnRequest) => {
    setConfirmModal({
      isOpen: true,
      title: 'SOP-009 — Phê duyệt Yêu cầu Đổi trả',
      message: `Bạn có chắc chắn PHÊ DUYỆT yêu cầu hoàn tiền cho đơn hàng #${ret.orderId} của khách hàng ${ret.customerName}?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.approveReturn(ret.id);
          alert('Đã phê duyệt yêu cầu đổi trả thành công. Chuyển cho Kế toán/Tài chính hoàn tiền.');
          loadReturns();
        } catch (err: any) {
          alert('Lỗi khi phê duyệt: ' + (err.message || err));
        }
      }
    });
  };

  const handleReject = (ret: ReturnRequest) => {
    const reason = prompt('Nhập lý do từ chối yêu cầu đổi trả:', 'Sản phẩm không thuộc diện bảo hành/đổi trả.');
    if (!reason) return;

    setConfirmModal({
      isOpen: true,
      title: 'SOP-009 — Từ chối Yêu cầu Đổi trả',
      message: `Xác nhận TỪ CHỐI yêu cầu hoàn tiền cho đơn hàng #${ret.orderId}? Lý do: "${reason}"`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.rejectReturn(ret.id, reason);
          alert('Đã từ chối yêu cầu đổi trả.');
          loadReturns();
        } catch (err: any) {
          alert('Lỗi khi từ chối: ' + (err.message || err));
        }
      }
    });
  };

  const handleConfirmRefund = (ret: ReturnRequest) => {
    const amountStr = ret.refundAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ret.refundAmount) : 'số tiền yêu cầu';
    setConfirmModal({
      isOpen: true,
      title: 'SOP-009 — Xác nhận Chuyển khoản Hoàn tiền',
      message: `Xác nhận đã CHUYỂN KHOẢN HOÀN TIỀN thành công (${amountStr}) tới STK ${ret.bankAccount} (${ret.bankName} - ${ret.bankHolder})?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.refundReturn(ret.id);
          alert('Đã xác nhận hoàn tiền chuyển khoản hoàn tất (REFUNDED)!');
          loadReturns();
        } catch (err: any) {
          alert('Lỗi khi xác nhận hoàn tiền: ' + (err.message || err));
        }
      }
    });
  };

  const handleRestock = (ret: ReturnRequest) => {
    setConfirmModal({
      isOpen: true,
      title: 'Chính sách 17.6 — Kiểm kho: Chấp nhận & Khôi phục tồn kho',
      message: `Sản phẩm tình trạng tốt. Xác nhận BỔ SUNG ${ret.quantity} sản phẩm (${ret.productName}) vào tồn kho CSDL?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.restockReturn(ret.id);
          loadReturns();
          alert('Đã xử lý nhập lại kho thành công & cộng tồn kho CSDL!');
        } catch (err: any) {
          alert('Lỗi khi khôi phục tồn kho: ' + (err.message || err));
        }
      }
    });
  };

  const handleDispose = (ret: ReturnRequest) => {
    setConfirmModal({
      isOpen: true,
      title: 'Chính sách 17.6 — Kiểm kho: Đánh dấu Hàng hư hỏng',
      message: `Xác nhận ĐÁNH DẤU HÀNG LƯU KHO BỊ HƯ HỎNG (tiêu hủy) cho yêu cầu ${ret.id}? Tồn kho sẽ KHÔNG được cộng lại.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.disposeReturn(ret.id);
          loadReturns();
          alert('Đã đánh dấu hàng lưu kho bị hư hỏng (DISPOSED).');
        } catch (err: any) {
          alert('Lỗi khi cập nhật tiêu hủy: ' + (err.message || err));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'APPROVED':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'REJECTED':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'REFUNDED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PENDING_INSPECTION':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'RESTOCKED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DISPOSED':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'Chờ Admin duyệt';
      case 'APPROVED': return 'Đã duyệt - Chờ hoàn tiền';
      case 'REJECTED': return 'Từ chối hoàn tiền';
      case 'REFUNDED': return 'Đã hoàn tiền (REFUNDED)';
      case 'PENDING_INSPECTION': return 'Chờ kiểm tra kho';
      case 'RESTOCKED': return 'Khôi phục tồn kho (RESTOCKED)';
      case 'DISPOSED': return 'Hàng hư hỏng (DISPOSED)';
      default: return status;
    }
  };

  return (
    <div className="space-y-md text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <span className="text-label-sm text-secondary uppercase font-semibold tracking-wider block mb-1">
            WildStream CMS — Quy trình SOP-009 & Policy 17.6
          </span>
          <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
            Xử lý Đổi trả hàng & Hoàn tiền Chuyển khoản
          </h1>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex justify-between items-center gap-md flex-wrap">
        <div className="flex items-center gap-sm flex-wrap">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-xs">
            <span className="text-label-sm text-on-surface-variant font-semibold">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-1.5 px-3 text-label-sm focus:outline-none focus:border-primary cursor-pointer font-sans"
            >
              <option value="ALL">Tất cả yêu cầu</option>
              <option value="PENDING_APPROVAL">SOP-009: Chờ Admin phê duyệt</option>
              <option value="APPROVED">SOP-009: Đã duyệt - Chờ chuyển khoản</option>
              <option value="REFUNDED">SOP-009: Đã hoàn tiền chuyển khoản</option>
              <option value="PENDING_INSPECTION">Policy 17.6: Chờ kiểm kho</option>
              <option value="RESTOCKED">Policy 17.6: Đã khôi phục tồn kho</option>
              <option value="DISPOSED">Policy 17.6: Đã đánh dấu hư hỏng</option>
            </select>
          </div>
        </div>

        <span className="text-label-sm text-on-surface-variant font-semibold">
          Hiển thị <strong>{filteredReturns.length}</strong> hồ sơ xử lý
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant font-semibold">Đang tải hồ sơ đổi trả...</div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant/70">
              <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-body-md text-on-surface">Không tìm thấy yêu cầu nào</p>
              <p className="text-label-sm text-on-surface-variant/60 mt-1">Hệ thống đổi trả và hoàn tiền đang hoạt động bình thường.</p>
            </div>
          ) : (
            <table className="w-full text-left text-label-sm font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-extrabold">
                  <th className="py-3 px-4">Mã hồ sơ</th>
                  <th className="py-3 px-4">Khách hàng & Đơn</th>
                  <th className="py-3 px-4">Sản phẩm & Số tiền</th>
                  <th className="py-3 px-4">Thông tin TK Ngân hàng (SOP-009)</th>
                  <th className="py-3 px-4">Trạng thái vòng đời</th>
                  <th className="py-3 px-4 text-right">Quyết định xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#00288e] bg-blue-50/20">{ret.id}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-on-surface block">{ret.customerName}</span>
                      <span className="text-[11px] text-on-surface-variant/70 font-mono block">Mã đơn: #{ret.orderId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-on-surface block">{ret.productName}</span>
                      {ret.refundAmount ? (
                        <span className="text-[12px] text-amber-700 font-extrabold block">
                          Hoàn tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ret.refundAmount)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#00288e] font-mono block">SKU: {ret.variantSku} (x{ret.quantity})</span>
                      )}
                      <span className="text-[11px] text-on-surface-variant/80 block mt-0.5" title={ret.reason}>Lý do: {ret.reason}</span>
                    </td>
                    <td className="py-4 px-4">
                      {ret.bankName ? (
                        <div className="bg-amber-50/60 border border-amber-200/60 p-2 rounded-xl text-[11px] space-y-0.5">
                          <div className="font-bold text-amber-900 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-amber-700" /> {ret.bankName}
                          </div>
                          <div className="font-mono font-bold text-on-surface flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" /> {ret.bankAccount}
                          </div>
                          <div className="text-on-surface-variant flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" /> {ret.bankHolder}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Không có TK ngân hàng</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(ret.status)}`}>
                        {getStatusName(ret.status)}
                      </span>
                      {ret.inspectionNote && (
                        <div className="text-[10px] text-slate-500 mt-1 italic max-w-[150px] truncate" title={ret.inspectionNote}>
                          Ghi chú: {ret.inspectionNote}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {/* Actions for SOP-009 Refund Flow */}
                      {ret.status === 'PENDING_APPROVAL' && (
                        <div className="flex justify-end gap-xs">
                          <button
                            onClick={() => handleApprove(ret)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Phê duyệt yêu cầu hoàn tiền"
                          >
                            <Check className="w-3.5 h-3.5" /> Duyệt SOP-009
                          </button>
                          <button
                            onClick={() => handleReject(ret)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] px-2 py-1.5 rounded-lg border border-red-200 cursor-pointer flex items-center gap-1"
                            title="Từ chối yêu cầu hoàn tiền"
                          >
                            <Ban className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      )}

                      {ret.status === 'APPROVED' && (
                        <button
                          onClick={() => handleConfirmRefund(ret)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Xác nhận đã chuyển khoản thành công"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Xác nhận đã chuyển khoản
                        </button>
                      )}

                      {/* Actions for Policy 17.6 Warehouse Inspection */}
                      {ret.status === 'PENDING_INSPECTION' && (
                        <div className="flex justify-end gap-xs">
                          <button
                            onClick={() => handleRestock(ret)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Tình trạng tốt - Khôi phục tồn kho"
                          >
                            <PackageCheck className="w-3.5 h-3.5" /> Khôi phục tồn
                          </button>
                          <button
                            onClick={() => handleDispose(ret)}
                            className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Đánh dấu hàng lưu kho bị hư hỏng"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" /> Báo hư hỏng
                          </button>
                        </div>
                      )}

                      {(ret.status === 'REFUNDED' || ret.status === 'RESTOCKED' || ret.status === 'DISPOSED' || ret.status === 'REJECTED') && (
                        <span className="text-slate-400 font-semibold italic text-[11px]">Đã hoàn tất xử lý</span>
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
