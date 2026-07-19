'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Search, 
  Globe, 
  Tag
} from 'lucide-react';
import { adminApi } from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

interface BrandItem {
  id: number;
  name: string;
  country?: string;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirm Modal state
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

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllBrands();
      if (Array.isArray(data)) {
        setBrands(data);
      }
    } catch (err) {
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!name.trim()) {
      setErrors({ name: 'Tên thương hiệu không được để trống!' });
      return;
    }

    try {
      setSavingBrand(true);
      const created = await adminApi.createBrand({
        name: name.trim(),
        country: country.trim() || undefined
      });
      alert(`Tạo thương hiệu "${created.name}" thành công!`);
      setIsAddModalOpen(false);
      setName('');
      setCountry('');
      setErrors({});
      loadBrands();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo thương hiệu.');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleDelete = (brand: BrandItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa thương hiệu',
      message: `Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}"? Thao tác này có thể ảnh hưởng đến sản phẩm liên kết.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.deleteBrand(brand.id);
          alert('Xóa thương hiệu thành công!');
          loadBrands();
        } catch (err: any) {
          alert(err.message || 'Lỗi khi xóa thương hiệu.');
        }
      }
    });
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.country && b.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-md font-sans text-left">
      
      {/* HEADER ACTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <h2 className="text-headline-md font-black text-on-surface tracking-tight flex items-center gap-xs">
            <Award className="w-7 h-7 text-[#00288e]" />
            <span>Quản lý Thương hiệu</span>
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
            Quản lý danh sách các thương hiệu và nhà sản xuất thiết bị câu cá
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setCountry('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-xs bg-[#00288e] hover:bg-[#00288e]/90 text-white font-bold px-lg py-2.5 rounded-xl shadow-lg shadow-[#00288e]/10 transition-all cursor-pointer text-label-sm border-none"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thương hiệu mới</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl border border-outline-variant/10 p-md flex flex-col md:flex-row gap-md items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, quốc gia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 pl-9 pr-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <span className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase">
          Tổng cộng: {filteredBrands.length} thương hiệu
        </span>
      </div>

      {/* BRANDS LIST CONTAINER */}
      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-xl text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-sm"></div>
            <p className="text-body-sm text-on-surface-variant font-bold">Đang tải dữ liệu thương hiệu...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-xs" />
            <p className="text-body-sm font-bold">Chưa có thương hiệu nào</p>
            <p className="text-[11px] mt-0.5">Bấm nút góc trên bên phải để tạo thương hiệu đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-label-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-md text-left">ID</th>
                  <th className="py-3.5 px-md text-left">Tên thương hiệu</th>
                  <th className="py-3.5 px-md text-left">Xuất xứ / Quốc gia</th>
                  <th className="py-3.5 px-md text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant">
                {filteredBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-md font-mono font-bold text-slate-500">#{b.id}</td>
                    <td className="py-3.5 px-md font-bold text-on-surface">{b.name}</td>
                    <td className="py-3.5 px-md">
                      {b.country ? (
                        <div className="flex items-center gap-xs">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.country}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa xác định</span>
                      )}
                    </td>
                    <td className="py-3.5 px-md text-right">
                      <button
                        onClick={() => handleDelete(b)}
                        className="inline-flex items-center gap-xs text-[11px] font-bold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-md md:p-lg text-left shadow-2xl animate-in fade-in duration-200">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <Award className="w-5 h-5 text-[#00288e]" />
              <span>Thêm thương hiệu mới</span>
            </h3>

            <form onSubmit={handleSaveBrand} className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">
                  Tên thương hiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: SHIMANO, DAIWA..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.name;
                      return copy;
                    });
                  }}
                  className={`bg-[#f8f9fa] border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-[#00288e]'} rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none`}
                />
                {errors.name && (
                  <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.name}</span>
                )}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Xuất xứ / Quốc gia (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhật Bản, Mỹ, Trung Quốc..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e]"
                />
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setErrors({});
                  }}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer transition-colors text-label-sm border-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingBrand}
                  className="px-lg py-2 bg-[#00288e] hover:bg-[#00288e]/90 rounded-lg text-white font-bold cursor-pointer transition-colors text-label-sm flex items-center gap-xs border-none"
                >
                  {savingBrand ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
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
