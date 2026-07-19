'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2 
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';
import { adminApi } from '../../../lib/api';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  productsProvided: string;
}

const defaultSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'Shimano Japan Co.', phone: '+81 6-6223-3211', email: 'sales@shimano.co.jp', address: 'Sakai, Osaka, Nhật Bản', productsProvided: 'Cần câu, Máy câu' },
  { id: 'SUP-002', name: 'Daiwa Corporation', phone: '+81 42-475-2111', email: 'info@daiwa.co.jp', address: 'Higashikurume, Tokyo, Nhật Bản', productsProvided: 'Cần câu, Dây câu, Lưỡi câu' },
  { id: 'SUP-003', name: 'Naturehike Co. Ltd', phone: '+86 574-88308801', email: 'global@naturehike.com', address: 'Ninh Ba, Chiết Giang, Trung Quốc', productsProvided: 'Lều trại, Lò sưởi dã ngoại' },
];

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productsProvided, setProductsProvided] = useState('');

  const loadSuppliers = async () => {
    try {
      const data = await adminApi.getSuppliers();
      if (Array.isArray(data)) {
        setSuppliers(data);
      }
    } catch (err) {
      console.log('Using localStorage fallback for suppliers:', err);
      const saved = localStorage.getItem('admin_suppliers');
      if (saved) {
        try {
          setSuppliers(JSON.parse(saved));
        } catch (e) {
          setSuppliers(defaultSuppliers);
        }
      } else {
        setSuppliers(defaultSuppliers);
        localStorage.setItem('admin_suppliers', JSON.stringify(defaultSuppliers));
      }
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await adminApi.createSupplier({
        name: name.trim(),
        phone: phone.trim() || 'Chưa cung cấp',
        email: email.trim() || 'Chưa cung cấp',
        address: address.trim() || 'Chưa cung cấp',
        productsProvided: productsProvided.trim() || 'Chưa phân loại'
      });
      setSuppliers([created, ...suppliers]);

      // Reset Form
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setProductsProvided('');
      setIsAddModalOpen(false);
      alert(`Thêm nhà cung cấp "${created.name}" thành công!`);
    } catch (err: any) {
      alert('Lỗi khi thêm đối tác mới: ' + (err.message || err));
    }
  };

  const handleDeleteSupplier = (id: string, supName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa nhà cung cấp "${supName}"?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.deleteSupplier(id);
          const updated = suppliers.filter(s => s.id !== id);
          setSuppliers(updated);
          alert('Xóa nhà cung cấp thành công!');
        } catch (err: any) {
          alert('Lỗi khi xóa đối tác: ' + (err.message || err));
        }
      }
    });
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.productsProvided.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-md">
      {/* HEADER ACTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <span className="text-label-sm text-secondary uppercase font-semibold tracking-wider block mb-1">
            WildStream CMS
          </span>
          <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
            Quản lý Nhà cung cấp
          </h1>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-xs bg-primary hover:bg-[#1e40af] text-white text-label-sm font-bold px-lg py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm đối tác mới</span>
        </button>
      </div>

      {/* TOP CONTROLS */}
        {/* TOP CONTROLS */}
        <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex justify-between items-center gap-md flex-wrap">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Tìm tên, mã, ngành hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-body-sm bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#00288e] transition-colors"
            />
            <Search className="w-4.5 h-4.5 text-outline absolute left-3 top-2.5" />
          </div>
          <span className="text-label-sm text-on-surface-variant">
            Hiển thị <strong>{filteredSuppliers.length}</strong> nhà cung cấp
          </span>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/70">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-body-md text-on-surface">Không tìm thấy nhà cung cấp nào</p>
                <p className="text-label-sm text-on-surface-variant/60 mt-1">Vui lòng kiểm tra lại từ khóa hoặc thêm mới nhà cung cấp.</p>
              </div>
            ) : (
              <table className="w-full text-left text-label-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-extrabold">
                    <th className="py-3 px-4">Mã đối tác</th>
                    <th className="py-3 px-4">Tên nhà cung cấp</th>
                    <th className="py-3 px-4">Thông tin liên hệ</th>
                    <th className="py-3 px-4">Địa chỉ trụ sở</th>
                    <th className="py-3 px-4">Mặt hàng cung cấp</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant font-sans">
                  {filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-[#00288e]">{sup.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-on-surface text-body-sm">{sup.name}</span>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant/80">
                          <Phone className="w-3.5 h-3.5 text-outline" />
                          <span>{sup.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant/80">
                          <Mail className="w-3.5 h-3.5 text-outline" />
                          <span>{sup.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate" title={sup.address}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                          <span>{sup.address}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-[#00288e]/10 text-[#00288e] text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-[#00288e]/20">
                          {sup.productsProvided}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-error cursor-pointer border border-red-200 transition-colors"
                          title="Xóa nhà cung cấp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-outline-variant/30 flex justify-between items-center">
              <div>
                <h2 className="text-body-lg font-bold text-on-surface">Thêm nhà cung cấp mới</h2>
                <p className="text-[11px] text-on-surface-variant/80">Thiết lập thông tin đối tác cung cấp trang bị</p>
              </div>
            </div>

            <form onSubmit={handleAddSupplier} className="p-6 space-y-sm text-label-sm font-sans">
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">Tên nhà cung cấp *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Shimano Japan Co."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-[#00288e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-xs">
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: +81 6-6223-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-[#00288e]"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">Email</label>
                  <input
                    type="email"
                    placeholder="Ví dụ: sales@partner.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-[#00288e]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">Địa chỉ trụ sở</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sakai, Osaka, Nhật Bản"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-[#00288e]"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">Các sản phẩm cung cấp</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cần câu, Lưỡi câu, Dây cước..."
                  value={productsProvided}
                  onChange={(e) => setProductsProvided(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-[#00288e]"
                />
              </div>

              <div className="flex justify-end gap-xs pt-md border-t border-slate-100 mt-md">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-on-surface-variant hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00288e] hover:bg-[#1e40af] text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Thêm đối tác
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
