'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Folder,
  Layers,
  ArrowRight
} from 'lucide-react';
import { adminApi, productApi } from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

interface CategoryItem {
  id: number;
  name: string;
  sortOrder: number;
  children?: CategoryItem[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>(''); // empty string means root category
  const [savingCategory, setSavingCategory] = useState(false);
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

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productApi.getCategoriesTree();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!name.trim()) {
      setErrors({ name: 'Tên danh mục không được để trống!' });
      return;
    }

    try {
      setSavingCategory(true);
      const pid = parentId ? Number(parentId) : null;

      if (editingCategory) {
        // Edit category
        await adminApi.updateCategory(editingCategory.id, {
          name: name.trim(),
          parentId: pid
        });
        alert('Cập nhật danh mục thành công!');
        setEditingCategory(null);
      } else {
        // Add new category
        await adminApi.createCategory({
          name: name.trim(),
          parentId: pid
        });
        alert('Tạo danh mục mới thành công!');
        setIsAddModalOpen(false);
      }

      // Reset form & reload
      setName('');
      setParentId('');
      setErrors({});
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý danh mục.');
    } finally {
      setSavingCategory(false);
    }
  };

  const startEdit = (cat: CategoryItem, parentIdVal?: number) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentId(parentIdVal ? String(parentIdVal) : '');
  };

  const handleDelete = (cat: CategoryItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa danh mục',
      message: `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"? Thao tác này có thể ảnh hưởng đến sản phẩm liên kết.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.deleteCategory(cat.id);
          alert('Xóa danh mục thành công!');
          loadCategories();
        } catch (err: any) {
          alert(err.message || 'Lỗi khi xóa danh mục.');
        }
      }
    });
  };

  return (
    <div className="space-y-md font-sans text-left">
      
      {/* HEADER ACTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <h2 className="text-headline-md font-black text-on-surface tracking-tight flex items-center gap-xs">
            <FolderTree className="w-7 h-7 text-[#00288e]" />
            <span>Quản lý Danh mục</span>
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
            Tạo lập cấu trúc cây danh mục sản phẩm cho website thương mại điện tử
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setName('');
            setParentId('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-xs bg-[#00288e] hover:bg-[#00288e]/90 text-white font-bold px-lg py-2.5 rounded-xl shadow-lg shadow-[#00288e]/10 transition-all cursor-pointer text-label-sm border-none"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* CATEGORY TREE CONTAINER */}
      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant/10 bg-slate-50 flex items-center justify-between">
          <span className="text-label-sm font-bold text-on-surface-variant">CẤU TRÚC DANH MỤC HIỆN TẠI</span>
          <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
            {categories.length} Nhóm chính
          </span>
        </div>

        {loading ? (
          <div className="p-xl text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-sm"></div>
            <p className="text-body-sm text-on-surface-variant font-bold">Đang tải dữ liệu danh mục...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant">
            <Folder className="w-12 h-12 text-slate-300 mx-auto mb-xs" />
            <p className="text-body-sm font-bold">Chưa có danh mục sản phẩm nào</p>
            <p className="text-[11px] mt-0.5">Bấm nút góc trên bên phải để tạo danh mục đầu tiên.</p>
          </div>
        ) : (
          <div className="p-md md:p-lg space-y-sm">
            {categories.map((parent) => (
              <div 
                key={parent.id} 
                className="border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Parent Row */}
                <div className="flex items-center justify-between px-md py-3.5 bg-slate-50/50">
                  <div className="flex items-center gap-xs">
                    <Layers className="w-4 h-4 text-[#00288e]" />
                    <span className="font-bold text-on-surface">{parent.name}</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-600 font-extrabold px-1.5 py-0.5 rounded">
                      ID #{parent.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-xs">
                    <button
                      onClick={() => startEdit(parent)}
                      className="p-1.5 text-[#00288e] hover:bg-[#00288e]/10 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
                      title="Sửa tên/nhóm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(parent)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Children) */}
                <div className="bg-white p-sm divide-y divide-outline-variant/10">
                  {parent.children && parent.children.length > 0 ? (
                    parent.children.map((child) => (
                      <div 
                        key={child.id} 
                        className="flex items-center justify-between pl-lg pr-md py-2.5 hover:bg-slate-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-xs">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <Folder className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-on-surface text-body-sm">{child.name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 rounded">
                            ID #{child.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-xs">
                          <button
                            onClick={() => startEdit(child, parent.id)}
                            className="p-1 text-[#00288e] hover:bg-[#00288e]/10 rounded cursor-pointer transition-colors border-none bg-transparent"
                            title="Sửa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(child)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-colors border-none bg-transparent"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pl-lg py-2.5 text-slate-400 text-body-xs font-medium italic">
                      Không có loại danh mục con
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-md md:p-lg text-left shadow-2xl animate-in fade-in duration-200">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <FolderTree className="w-5 h-5 text-[#00288e]" />
              <span>{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm danh mục mới'}</span>
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cần câu Lure, Máy câu đứng..."
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
                <label className="text-label-sm font-bold text-on-surface-variant">Danh mục cha (Tùy chọn)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e] cursor-pointer"
                >
                  <option value="">Không có (Danh mục gốc)</option>
                  {categories
                    .filter(c => !editingCategory || c.id !== editingCategory.id) // Prevent selecting itself as parent
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Nếu chọn danh mục cha, danh mục này sẽ hiển thị như một danh mục con (loại sản phẩm).
                </p>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                    setErrors({});
                  }}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer transition-colors text-label-sm border-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-lg py-2 bg-[#00288e] hover:bg-[#00288e]/90 rounded-lg text-white font-bold cursor-pointer transition-colors text-label-sm flex items-center gap-xs border-none"
                >
                  {savingCategory ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : editingCategory ? 'Cập nhật' : 'Tạo mới'}
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
