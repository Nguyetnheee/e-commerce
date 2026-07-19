'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  ShoppingBag, 
  UploadCloud, 
  Sliders, 
  Edit3, 
  Search, 
  Package, 
  EyeOff, 
  ListPlus, 
  DollarSign, 
  Layers 
} from 'lucide-react';
import { adminApi, productApi } from '../../../lib/api';

// Cloudinary constants
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dziemd19e';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'e-commerce';

export default function AdminProductsPage() {
  // Products states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Selected Product for Variants Detail
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Modals visibility
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [adjustingVariant, setAdjustingVariant] = useState<any | null>(null);
  const [editingPriceVariant, setEditingPriceVariant] = useState<any | null>(null);

  // New Product Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdSubCat, setNewProdSubCat] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdSupplier, setNewProdSupplier] = useState('');
  const [initialSku, setInitialSku] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [initialStock, setInitialStock] = useState('10');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // New Variant Form States
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarName, setNewVarName] = useState('Tiêu chuẩn');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarStock, setNewVarStock] = useState('10');
  const [savingVariant, setSavingVariant] = useState(false);

  // Stock Adjustment Form States
  const [adjustStockQty, setAdjustStockQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Nhập hàng bổ sung');
  const [savingStock, setSavingStock] = useState(false);

  // Price Edit Form States
  const [editPriceVal, setEditPriceVal] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Edit Product Form States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdCat, setEditProdCat] = useState('');
  const [editProdBrand, setEditProdBrand] = useState('');
  const [editProdSupplier, setEditProdSupplier] = useState('');
  const [savingEditProduct, setSavingEditProduct] = useState(false);

  const handleOpenEditProduct = (p: any) => {
    setEditingProduct(p);
    setEditProdName(p.name || '');
    setEditProdImage(p.image || '');
    setEditProdDesc(p.description || '');
    setEditProdCat(String(p.categoryId || ''));
    setEditProdBrand(String(p.brandId || ''));
    setEditProdSupplier(String(p.supplierId || ''));
    setErrors({});
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim()) {
      alert('Tên sản phẩm không được để trống!');
      return;
    }

    try {
      setSavingEditProduct(true);
      await adminApi.updateProduct(editingProduct.id, {
        name: editProdName.trim(),
        image: editProdImage.trim(),
        description: editProdDesc.trim(),
        categoryId: Number(editProdCat),
        brandId: Number(editProdBrand),
        supplierId: editProdSupplier ? Number(editProdSupplier) : undefined,
        isVisible: editingProduct.isVisible ?? true
      });
      alert('Cập nhật thông tin sản phẩm thành công!');
      setEditingProduct(null);
      loadProducts();
      if (selectedProduct && selectedProduct.id === editingProduct.id) {
        setSelectedProduct({
          ...selectedProduct,
          name: editProdName.trim(),
          image: editProdImage.trim(),
          description: editProdDesc.trim(),
          categoryId: Number(editProdCat),
          brandId: Number(editProdBrand),
          supplierId: editProdSupplier ? Number(editProdSupplier) : undefined,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật sản phẩm.');
    } finally {
      setSavingEditProduct(false);
    }
  };

  // Load Categories, Brands and Suppliers
  const loadMetadata = async () => {
    try {
      const [catsRes, brandsRes, suppliersRes] = await Promise.allSettled([
        productApi.getCategoriesTree(),
        productApi.getAllBrands(),
        adminApi.getSuppliers()
      ]);

      const catsData = catsRes.status === 'fulfilled' ? catsRes.value : [];
      const brandsData = brandsRes.status === 'fulfilled' ? brandsRes.value : [];
      const suppliersData = suppliersRes.status === 'fulfilled' ? suppliersRes.value : [];

      if (Array.isArray(catsData)) setCategories(catsData);
      if (Array.isArray(brandsData)) setBrands(brandsData);
      if (Array.isArray(suppliersData)) setSuppliers(suppliersData);
      
      // Select default metadata values for forms
      if (catsData && catsData.length > 0) {
        setNewProdCat(String(catsData[0].id));
        if (catsData[0].children && catsData[0].children.length > 0) {
          setNewProdSubCat(String(catsData[0].children[0].id));
        }
      }
      if (brandsData && brandsData.length > 0) setNewProdBrand(String(brandsData[0].id));
      if (suppliersData && suppliersData.length > 0) setNewProdSupplier(String(suppliersData[0].id));
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  // Load Products list
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getProducts();
      if (res && Array.isArray(res.content)) {
        setProducts(res.content);
      } else if (Array.isArray(res)) {
        setProducts(res);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
    loadProducts();
  }, []);

  // Auto-generate Product SKU when modal opens
  useEffect(() => {
    if (isAddProductOpen) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      setInitialSku(`WS-PROD-${randomNum}`);
    } else {
      setInitialSku('');
    }
  }, [isAddProductOpen]);

  // Auto-generate Variant SKU when modal opens
  useEffect(() => {
    if (isAddVariantOpen) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      setNewVarSku(`WS-VAR-${randomNum}`);
    } else {
      setNewVarSku('');
    }
  }, [isAddVariantOpen]);

  // Fetch variants for selected product
  const loadVariants = async (productId: number | string) => {
    try {
      setLoadingVariants(true);
      const data = await productApi.getVariantsByProductId(productId);
      if (Array.isArray(data)) {
        setVariants(data);
      }
    } catch (err) {
      console.error('Error loading product variants:', err);
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      loadVariants(selectedProduct.id);
    }
  }, [selectedProduct]);

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Tải ảnh thất bại');
      const data = await res.json();
      setNewProdImage(data.secure_url);
    } catch (err) {
      alert('Lỗi tải ảnh lên Cloudinary.');
    } finally {
      setUploadingImg(false);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (product: any) => {
    const newStatus = !product.isVisible;
    try {
      await adminApi.updateProductStatus(product.id, newStatus);
      alert(`Đã cập nhật trạng thái hiển thị của sản phẩm thành công!`);
      loadProducts();
      if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({ ...selectedProduct, isVisible: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái.');
    }
  };

  // Save new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!newProdName.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống!';
    }
    if (!newProdCat || Number(newProdCat) <= 0) {
      newErrors.categoryId = 'Vui lòng chọn danh mục sản phẩm!';
    }
    if (newProdCat && categories.find(c => String(c.id) === newProdCat)?.children?.length && (!newProdSubCat || Number(newProdSubCat) <= 0)) {
      newErrors.subCategoryId = 'Vui lòng chọn loại danh mục sản phẩm con!';
    }
    if (!newProdBrand || Number(newProdBrand) <= 0) {
      newErrors.brandId = 'Vui lòng chọn thương hiệu!';
    }
    if (!newProdSupplier) {
      newErrors.supplierId = 'Vui lòng chọn nhà cung cấp!';
    }
    if (!initialSku.trim()) {
      newErrors.sku = 'Mã SKU không được để trống!';
    }
    if (!initialPrice.trim()) {
      newErrors.price = 'Giá bán không được để trống!';
    } else if (Number(initialPrice) <= 0) {
      newErrors.price = 'Giá bán phải lớn hơn 0!';
    }
    if (!initialStock.trim()) {
      newErrors.stock = 'Số lượng tồn kho không được để trống!';
    } else if (Number(initialStock) < 0) {
      newErrors.stock = 'Số lượng tồn kho không được nhỏ hơn 0!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto-scroll the modal container back to top so user sees the validation messages
      const modalEl = document.querySelector('.max-h-\\[90vh\\]');
      if (modalEl) {
        modalEl.scrollTop = 0;
      }
      return;
    }

    try {
      setSavingProduct(true);
      // Map selected parent category to usageType required by the backend
      let usageType = 'BIEN';
      const selectedParentCatId = Number(newProdCat);
      const parentCat = categories.find(c => c.id === selectedParentCatId);
      if (parentCat) {
        const nameNorm = parentCat.name.toLowerCase();
        if (nameNorm.includes('biển') || nameNorm.includes('bien')) {
          usageType = 'BIEN';
        } else if (nameNorm.includes('sông') || nameNorm.includes('song')) {
          usageType = 'SONG';
        } else if (nameNorm.includes('hồ') || nameNorm.includes('ho')) {
          usageType = 'HO';
        } else if (nameNorm.includes('cắm') || nameNorm.includes('cam') || nameNorm.includes('dã') || nameNorm.includes('da') || nameNorm.includes('ngoại') || nameNorm.includes('ngoai')) {
          usageType = 'CAM_TRAI';
        }
      }

      // 1. Create product atomically with initial variant (or fallback to 2-step if needed)
      let product: any = null;
      try {
        product = await adminApi.createProductFull({
          name: newProdName.trim(),
          image: newProdImage.trim() || '/images/product-rod.png',
          description: newProdDesc.trim() || 'Sản phẩm dã ngoại câu cá.',
          categoryId: Number(newProdSubCat || newProdCat),
          brandId: Number(newProdBrand),
          supplierId: newProdSupplier ? Number(newProdSupplier) : undefined,
          usageType: usageType,
          time: Date.now(),
          tagIds: [2],
          isVisible: true,
          initialVariant: {
            sku: initialSku.trim(),
            variantName: 'Mặc định',
            basePrice: Number(initialPrice),
            stockQuantity: Number(initialStock)
          }
        });
      } catch (fullErr) {
        console.warn('createProductFull endpoint fallback:', fullErr);
        product = await adminApi.createProduct({
          name: newProdName.trim(),
          image: newProdImage.trim() || '/images/product-rod.png',
          description: newProdDesc.trim() || 'Sản phẩm dã ngoại câu cá.',
          categoryId: Number(newProdSubCat || newProdCat),
          brandId: Number(newProdBrand),
          supplierId: newProdSupplier ? Number(newProdSupplier) : undefined,
          usageType: usageType,
          time: Date.now(),
          tagIds: [2],
          isVisible: true
        });

        if (product && product.id) {
          await adminApi.createVariant(product.id, {
            sku: initialSku.trim(),
            variantName: 'Mặc định',
            basePrice: Number(initialPrice),
            stockQuantity: Number(initialStock)
          });
        }
      }

      if (!product || !product.id) {
        throw new Error('Khởi tạo sản phẩm thất bại.');
      }

      alert('Thêm sản phẩm mới và biến thể mặc định thành công!');
      setIsAddProductOpen(false);
      
      // Reset form
      setNewProdName('');
      setNewProdImage('');
      setNewProdDesc('');
      setInitialSku('');
      setInitialPrice('');
      setInitialStock('10');
      setErrors({});
      if (categories && categories.length > 0) {
        setNewProdCat(String(categories[0].id));
        if (categories[0].children && categories[0].children.length > 0) {
          setNewProdSubCat(String(categories[0].children[0].id));
        } else {
          setNewProdSubCat('');
        }
      }
      if (brands && brands.length > 0) setNewProdBrand(String(brands[0].id));
      if (suppliers && suppliers.length > 0) setNewProdSupplier(String(suppliers[0].id));
      
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo sản phẩm.');
    } finally {
      setSavingProduct(false);
    }
  };

  // Save new variant
  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!newVarSku.trim()) {
      newErrors.varSku = 'Mã SKU biến thể không được để trống!';
    }
    if (!newVarName.trim()) {
      newErrors.varName = 'Tên biến thể không được để trống!';
    }
    if (!newVarPrice.trim()) {
      newErrors.varPrice = 'Giá bán biến thể không được để trống!';
    } else if (Number(newVarPrice) <= 0) {
      newErrors.varPrice = 'Giá bán biến thể phải lớn hơn 0!';
    }
    if (!newVarStock.trim()) {
      newErrors.varStock = 'Số lượng tồn kho không được để trống!';
    } else if (Number(newVarStock) < 0) {
      newErrors.varStock = 'Số lượng tồn kho không được nhỏ hơn 0!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSavingVariant(true);
      await adminApi.createVariant(selectedProduct.id, {
        sku: newVarSku.trim(),
        variantName: newVarName.trim(),
        basePrice: Number(newVarPrice),
        stockQuantity: Number(newVarStock)
      });
      alert('Tạo biến thể mới thành công!');
      setIsAddVariantOpen(false);
      
      // Reset form
      setNewVarSku('');
      setNewVarName('Tiêu chuẩn');
      setNewVarPrice('');
      setNewVarStock('10');
      setErrors({});

      loadVariants(selectedProduct.id);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm biến thể.');
    } finally {
      setSavingVariant(false);
    }
  };

  // Adjust stock
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingVariant) return;
    const qty = Number(adjustStockQty);
    if (isNaN(qty) || qty < 0) {
      alert('Số lượng tồn kho phải là số dương hợp lệ!');
      return;
    }

    try {
      setSavingStock(true);
      await adminApi.updateVariantStock(adjustingVariant.id, qty, adjustReason.trim());
      alert('Điều chỉnh số lượng tồn kho thành công!');
      setAdjustingVariant(null);
      setAdjustStockQty('');
      setAdjustReason('Nhập hàng bổ sung');
      if (selectedProduct) loadVariants(selectedProduct.id);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật tồn kho.');
    } finally {
      setSavingStock(false);
    }
  };

  // Edit price
  const handleEditPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceVariant) return;
    const price = Number(editPriceVal);
    if (isNaN(price) || price <= 0) {
      alert('Giá bán phải lớn hơn 0!');
      return;
    }

    try {
      setSavingPrice(true);
      await adminApi.updateVariantPrice(editingPriceVariant.id, price);
      alert('Cập nhật giá bán biến thể thành công!');
      setEditingPriceVariant(null);
      setEditPriceVal('');
      if (selectedProduct) loadVariants(selectedProduct.id);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật giá bán.');
    } finally {
      setSavingPrice(false);
    }
  };

  // Filter products on client
  const filteredProducts = products.filter(p => {
    const matchesKeyword = p.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                           String(p.id).includes(searchKeyword);
    const matchesCat = selectedCategory ? String(p.categoryId) === selectedCategory : true;
    const matchesBrand = selectedBrand ? String(p.brandId) === selectedBrand : true;
    return matchesKeyword && matchesCat && matchesBrand;
  });

  return (
    <div className="space-y-md">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <span className="text-label-sm text-secondary uppercase font-semibold tracking-wider block mb-1">
            WildStream CMS
          </span>
          <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
            Quản lý Sản phẩm
          </h1>
        </div>
        
        <button
          onClick={() => {
            const randomNum = Math.floor(10000 + Math.random() * 90000);
            setInitialSku(`WS-PROD-${randomNum}`);
            setErrors({});
            setIsAddProductOpen(true);
          }}
          className="flex items-center gap-xs bg-primary hover:bg-[#1e40af] text-white text-label-sm font-bold px-lg py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" />
          <span>THÊM SẢN PHẨM MỚI</span>
        </button>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex flex-wrap items-center justify-between gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          {/* Search bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-1.5 px-3 text-label-sm focus:outline-none focus:border-primary cursor-pointer font-sans"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-1.5 px-3 text-label-sm focus:outline-none focus:border-primary cursor-pointer font-sans"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <span className="text-label-sm text-on-surface-variant">
          Tổng cộng: <strong>{filteredProducts.length}</strong> sản phẩm
        </span>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        
        {/* LEFT 2 COLUMNS: Products List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center font-semibold text-on-surface-variant flex flex-col items-center gap-sm">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <span>Đang tải danh sách sản phẩm...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant/70">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-body-md text-on-surface">Không tìm thấy sản phẩm nào</p>
                <p className="text-label-sm text-on-surface-variant/60 mt-1">Cơ sở dữ liệu đang rỗng hoặc bộ lọc chưa khớp.</p>
              </div>
            ) : (
              <table className="w-full text-label-sm font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-md">ID</th>
                    <th className="py-3 px-md">Ảnh</th>
                    <th className="py-3 px-md">Tên sản phẩm</th>
                    <th className="py-3 px-md">Trạng thái</th>
                    <th className="py-3 px-md text-right">Biến thể</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                        }`}
                        onClick={() => setSelectedProduct(p)}
                      >
                        <td className="py-4 px-md font-mono font-bold text-slate-500">#{p.id}</td>
                        <td className="py-4 px-md">
                          <img 
                            src={p.image || '/images/product-rod.png'} 
                            alt={p.name}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-rod.png'; }}
                            className="w-10 h-10 object-cover rounded-lg border border-outline-variant/30"
                          />
                        </td>
                        <td className="py-4 px-md">
                          <div className="font-bold text-on-surface line-clamp-1">{p.name}</div>
                          <div className="flex gap-xs mt-1">
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {categories.find(c => c.id === p.categoryId)?.name || 'Danh mục khác'}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {brands.find(b => b.id === p.brandId)?.name || 'Hãng khác'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-md">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(p);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5 border ${
                              p.isVisible 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {p.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{p.isVisible ? 'Hiển thị' : 'Ẩn'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-md text-right">
                          <div className="flex items-center justify-end gap-xs">
                            <button 
                              type="button"
                              className="text-primary hover:text-white bg-primary/10 hover:bg-primary px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(p);
                              }}
                            >
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              className="text-slate-600 hover:text-white bg-slate-100 hover:bg-slate-700 p-1.5 rounded-lg transition-all"
                              title="Sửa thông tin sản phẩm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditProduct(p);
                              }}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              className="text-red-500 hover:text-white bg-red-50 hover:bg-red-600 p-1.5 rounded-lg transition-all"
                              title="Xóa sản phẩm"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${p.name}" (ID #${p.id})?`)) return;
                                try {
                                  await adminApi.deleteProduct(p.id);
                                  alert('Đã xóa sản phẩm thành công!');
                                  if (selectedProduct && selectedProduct.id === p.id) {
                                    setSelectedProduct(null);
                                  }
                                  loadProducts();
                                } catch (err: any) {
                                  alert(err.message || 'Không thể xóa sản phẩm.');
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Product Detail & Variants Drawer */}
        <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm text-left h-fit space-y-md">
          {selectedProduct ? (
            <div className="space-y-md">
              
              {/* Product Profile */}
              <div className="border-b border-outline-variant/20 pb-sm flex gap-sm items-start">
                <img 
                  src={selectedProduct.image || '/images/product-rod.png'}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-xl border border-outline-variant/30 flex-shrink-0"
                />
                <div className="min-w-0 flex-grow">
                  <h3 className="font-black text-on-surface text-label-md line-clamp-2 leading-snug">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex flex-wrap gap-xs items-center mt-1 text-[11px] text-on-surface-variant font-medium">
                    <span>ID: #{selectedProduct.id}</span>
                    <span>•</span>
                    <button 
                      type="button"
                      onClick={() => handleToggleVisibility(selectedProduct)} 
                      className={`font-semibold ${selectedProduct.isVisible ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {selectedProduct.isVisible ? 'Hiển thị' : 'Đang ẩn'}
                    </button>
                  </div>
                  <div className="flex gap-xs mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(selectedProduct)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa sản phẩm</span>
                    </button>
                    <a
                      href={`/product/${selectedProduct.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-2 py-1 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Xem trên Web</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Title list variants */}
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-xs">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Danh sách Biến thể</span>
                </h4>
                <button
                  onClick={() => {
                    const randomNum = Math.floor(10000 + Math.random() * 90000);
                    setNewVarSku(`WS-VAR-${randomNum}`);
                    setErrors({});
                    setIsAddVariantOpen(true);
                  }}
                  className="inline-flex items-center gap-0.5 text-primary hover:text-white bg-primary/10 hover:bg-primary font-bold text-[10px] px-2 py-1 rounded"
                >
                  <ListPlus className="w-3 h-3" />
                  <span>THÊM BIẾN THỂ</span>
                </button>
              </div>

              {/* Variants list display */}
              <div className="space-y-xs max-h-[350px] overflow-y-auto pr-xs">
                {loadingVariants ? (
                  <div className="py-6 text-center text-on-surface-variant/60 font-medium">
                    Đang tải biến thể...
                  </div>
                ) : variants.length === 0 ? (
                  <div className="py-6 text-center text-on-surface-variant/50 font-medium text-label-sm border border-dashed rounded-xl">
                    Chưa tạo biến thể nào.
                  </div>
                ) : (
                  variants.map((v) => (
                    <div 
                      key={v.id} 
                      className="p-sm bg-slate-50 border border-outline-variant/20 rounded-xl hover:border-primary/30 transition-all text-left space-y-1 relative group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-bold text-[#00288e] bg-primary/5 px-1.5 py-0.5 rounded">
                          SKU: {v.sku}
                        </span>
                        <div className="flex gap-xs">
                          <button
                            onClick={() => {
                              setEditingPriceVariant(v);
                              setEditPriceVal(String(v.basePrice ?? v.price ?? 0));
                            }}
                            className="p-1 rounded text-slate-400 hover:text-primary hover:bg-slate-200 transition-colors"
                            title="Sửa giá"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingVariant(v);
                              setAdjustStockQty(String(v.stockQuantity));
                            }}
                            className="p-1 rounded text-slate-400 hover:text-primary hover:bg-slate-200 transition-colors"
                            title="Sửa kho"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Bạn có chắc muốn xóa biến thể "${v.variantName || v.name || v.sku}"?`)) return;
                              try {
                                await adminApi.deleteVariant(v.id);
                                alert('Đã xóa biến thể thành công!');
                                if (selectedProduct) loadVariants(selectedProduct.id);
                              } catch (err: any) {
                                alert(err.message || 'Không thể xóa biến thể.');
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa biến thể"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-on-surface text-[12px]">{v.variantName || v.name || 'Mặc định'}</div>
                      
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-on-surface-variant/80 font-medium">
                          Giá: <strong className="text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.basePrice ?? v.price ?? 0)}</strong>
                        </span>
                        <span className="text-on-surface-variant/80 font-medium">
                          Tồn kho: <strong className={v.stockQuantity <= 3 ? 'text-red-500' : 'text-slate-700'}>{v.stockQuantity}</strong>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-on-surface-variant/50 font-medium">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <span>Bấm chọn một sản phẩm trong danh sách để quản lý biến thể, tồn kho và cập nhật giá.</span>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-sm backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="bg-white rounded-3xl max-w-xl w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>Thêm sản phẩm mới</span>
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-sm font-sans text-label-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                
                {/* Product Name */}
                <div className="flex flex-col gap-0.5 md:col-span-2">
                  <label className="font-bold text-on-surface-variant">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cần câu cá Shimano Stella SW..."
                    value={newProdName}
                    onChange={(e) => {
                      setNewProdName(e.target.value);
                      if (errors.name) setErrors(prev => { const c = { ...prev }; delete c.name; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none`}
                  />
                  {errors.name && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.name}</span>}
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Danh mục sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProdCat}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProdCat(val);
                      if (errors.categoryId) setErrors(prev => { const c = { ...prev }; delete c.categoryId; return c; });
                      const parent = categories.find(c => String(c.id) === val);
                      if (parent && parent.children && parent.children.length > 0) {
                        setNewProdSubCat(String(parent.children[0].id));
                      } else {
                        setNewProdSubCat('');
                      }
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.categoryId ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none cursor-pointer font-sans`}
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.categoryId}</span>}
                </div>

                {/* Subcategory (Category Type) Selection */}
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Loại danh mục sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProdSubCat}
                    onChange={(e) => {
                      setNewProdSubCat(e.target.value);
                      if (errors.subCategoryId) setErrors(prev => { const c = { ...prev }; delete c.subCategoryId; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.subCategoryId ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none cursor-pointer font-sans`}
                    disabled={!newProdCat || !categories.find(c => String(c.id) === newProdCat)?.children?.length}
                  >
                    {(() => {
                      const parent = categories.find(c => String(c.id) === newProdCat);
                      if (parent && parent.children && parent.children.length > 0) {
                        return [
                          <option key="placeholder" value="">Chọn loại danh mục...</option>,
                          ...parent.children.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))
                        ];
                      }
                      return <option value="">Không có loại danh mục</option>;
                    })()}
                  </select>
                  {errors.subCategoryId && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.subCategoryId}</span>}
                </div>

                {/* Brand Selection */}
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProdBrand}
                    onChange={(e) => {
                      setNewProdBrand(e.target.value);
                      if (errors.brandId) setErrors(prev => { const c = { ...prev }; delete c.brandId; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.brandId ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none cursor-pointer font-sans`}
                  >
                    <option value="">Chọn thương hiệu...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {errors.brandId && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.brandId}</span>}
                </div>

                {/* Supplier Selection */}
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProdSupplier}
                    onChange={(e) => {
                      setNewProdSupplier(e.target.value);
                      if (errors.supplierId) setErrors(prev => { const c = { ...prev }; delete c.supplierId; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.supplierId ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none cursor-pointer font-sans`}
                  >
                    <option value="">Chọn nhà cung cấp...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.supplierId && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.supplierId}</span>}
                </div>

                {/* Cloudinary Image Upload */}
                <div className="flex flex-col gap-0.5 md:col-span-2">
                  <label className="font-bold text-on-surface-variant">Hình ảnh sản phẩm</label>
                  {newProdImage ? (
                    <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-outline-variant/30">
                      <img 
                        src={newProdImage} 
                        alt="Product upload" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setNewProdImage('')}
                          className="flex items-center gap-xs bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa ảnh</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-primary rounded-xl p-md flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all duration-200 cursor-pointer min-h-[120px] text-center">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-xs animate-bounce" />
                      <span className="font-bold text-slate-500">
                        {uploadingImg ? 'Đang tải ảnh...' : 'Nhấp chuột để chọn tệp tải lên'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImg}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-0.5 md:col-span-2">
                  <label className="font-bold text-on-surface-variant">Mô tả tóm tắt</label>
                  <textarea
                    placeholder="Mô tả thông tin cần thiết..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* VARIANT HEADER */}
                <div className="md:col-span-2 border-t border-outline-variant/10 my-1 pt-2">
                  <h4 className="font-bold text-emerald-700 uppercase tracking-wider text-[11px] mb-xs">
                    Thiết lập biến thể đầu tiên
                  </h4>
                </div>

                {/* Sku */}
                <div className="flex flex-col gap-0.5 md:col-span-2">
                  <label className="font-bold text-on-surface-variant">
                    Mã SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Ví dụ: WS-ROD-01"
                    value={initialSku}
                    className="w-full bg-slate-100 border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none font-mono text-slate-500 cursor-not-allowed"
                  />
                  {errors.sku && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.sku}</span>}
                </div>

                {/* Price */}
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Giá bán (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 1500000"
                    value={initialPrice}
                    onChange={(e) => {
                      setInitialPrice(e.target.value);
                      if (errors.price) setErrors(prev => { const c = { ...prev }; delete c.price; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.price ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none`}
                  />
                  {errors.price && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.price}</span>}
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={initialStock}
                    onChange={(e) => {
                      setInitialStock(e.target.value);
                      if (errors.stock) setErrors(prev => { const c = { ...prev }; delete c.stock; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.stock ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none`}
                  />
                  {errors.stock && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.stock}</span>}
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-md">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setErrors({});
                  }}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer border-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer transition-colors border-none"
                >
                  {savingProduct ? 'ĐANG LƯU...' : 'LƯU SẢN PHẨM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-sm backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="bg-white rounded-3xl max-w-xl w-full p-md md:p-lg text-left shadow-2xl">
              <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
                <Edit3 className="w-5 h-5 text-primary" />
                <span>Chỉnh sửa thông tin sản phẩm #{editingProduct.id}</span>
              </h3>

              <form onSubmit={handleUpdateProduct} className="space-y-sm font-sans text-label-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  
                  {/* Product Name */}
                  <div className="flex flex-col gap-0.5 md:col-span-2">
                    <label className="font-bold text-on-surface-variant">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e5e7eb] focus:border-primary rounded-lg py-2 px-3 focus:outline-none"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="flex flex-col gap-0.5">
                    <label className="font-bold text-on-surface-variant">
                      Danh mục sản phẩm
                    </label>
                    <select
                      value={editProdCat}
                      onChange={(e) => setEditProdCat(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e5e7eb] focus:border-primary rounded-lg py-2 px-3 focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Selection */}
                  <div className="flex flex-col gap-0.5">
                    <label className="font-bold text-on-surface-variant">
                      Thương hiệu
                    </label>
                    <select
                      value={editProdBrand}
                      onChange={(e) => setEditProdBrand(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e5e7eb] focus:border-primary rounded-lg py-2 px-3 focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="">Chọn thương hiệu...</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL */}
                  <div className="flex flex-col gap-0.5 md:col-span-2">
                    <label className="font-bold text-on-surface-variant">
                      Hình ảnh sản phẩm (URL)
                    </label>
                    <input
                      type="text"
                      value={editProdImage}
                      onChange={(e) => setEditProdImage(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e5e7eb] focus:border-primary rounded-lg py-2 px-3 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-0.5 md:col-span-2">
                    <label className="font-bold text-on-surface-variant">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      rows={3}
                      value={editProdDesc}
                      onChange={(e) => setEditProdDesc(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e5e7eb] focus:border-primary rounded-lg py-2 px-3 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer border-none"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingEditProduct}
                    className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer transition-colors border-none"
                  >
                    {savingEditProduct ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VARIANT */}
      {isAddVariantOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-sm backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="bg-white rounded-3xl max-w-sm w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <Plus className="w-5 h-5 text-primary" />
              <span>Thêm biến thể mới</span>
            </h3>

            <form onSubmit={handleCreateVariant} className="space-y-sm font-sans text-label-sm">
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant font-mono">
                  Mã SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Ví dụ: WS-ROD-02"
                  value={newVarSku}
                  className="w-full bg-slate-100 border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none font-mono text-slate-500 cursor-not-allowed"
                />
                {errors.varSku && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.varSku}</span>}
              </div>


              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">
                  Tên biến thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVarName}
                  onChange={(e) => {
                    setNewVarName(e.target.value);
                    if (errors.varName) setErrors(prev => { const c = { ...prev }; delete c.varName; return c; });
                  }}
                  className={`w-full bg-[#f8f9fa] border ${errors.varName ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none`}
                />
                {errors.varName && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.varName}</span>}
              </div>

              <div className="grid grid-cols-2 gap-xs">
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Giá bán (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 1200000"
                    value={newVarPrice}
                    onChange={(e) => {
                      setNewVarPrice(e.target.value);
                      if (errors.varPrice) setErrors(prev => { const c = { ...prev }; delete c.varPrice; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.varPrice ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none`}
                  />
                  {errors.varPrice && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.varPrice}</span>}
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="font-bold text-on-surface-variant">
                    Tồn kho ban đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newVarStock}
                    onChange={(e) => {
                      setNewVarStock(e.target.value);
                      if (errors.varStock) setErrors(prev => { const c = { ...prev }; delete c.varStock; return c; });
                    }}
                    className={`w-full bg-[#f8f9fa] border ${errors.varStock ? 'border-red-500 focus:border-red-500' : 'border-[#e5e7eb] focus:border-primary'} rounded-lg py-2 px-3 focus:outline-none`}
                  />
                  {errors.varStock && <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.varStock}</span>}
                </div>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-md">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddVariantOpen(false);
                    setErrors({});
                  }}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer border-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingVariant}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer border-none"
                >
                  {savingVariant ? 'ĐANG TẠO...' : 'TẠO BIẾN THỂ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* MODAL: ADJUST STOCK */}
      {adjustingVariant && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <Sliders className="w-5 h-5 text-primary" />
              <span>Điều chỉnh Tồn kho</span>
            </h3>

            <div className="text-[11px] text-on-surface-variant space-y-0.5 mb-sm font-sans">
              <div>Biến thể: <strong>{adjustingVariant.name}</strong></div>
              <div>SKU hiện tại: <strong className="font-mono">{adjustingVariant.sku}</strong></div>
              <div>Số lượng hiện tại: <strong>{adjustingVariant.stockQuantity}</strong></div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-sm font-sans text-label-sm">
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">Nhập số lượng tồn kho mới *</label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 30"
                  value={adjustStockQty}
                  onChange={(e) => setAdjustStockQty(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">Lý do điều chỉnh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhập hàng bổ sung đợt hè..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-md">
                <button
                  type="button"
                  onClick={() => setAdjustingVariant(null)}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingStock}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer"
                >
                  {savingStock ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRICE */}
      {editingPriceVariant && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <DollarSign className="w-5 h-5 text-primary" />
              <span>Cập nhật Giá bán</span>
            </h3>

            <div className="text-[11px] text-on-surface-variant space-y-0.5 mb-sm font-sans">
              <div>Biến thể: <strong>{editingPriceVariant.name}</strong></div>
              <div>SKU hiện tại: <strong className="font-mono">{editingPriceVariant.sku}</strong></div>
              <div>Giá hiện tại: <strong className="text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(editingPriceVariant.price)}</strong></div>
            </div>

            <form onSubmit={handleEditPrice} className="space-y-sm font-sans text-label-sm">
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-on-surface-variant">Nhập giá bán mới (VND) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 1650000"
                  value={editPriceVal}
                  onChange={(e) => setEditPriceVal(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-md">
                <button
                  type="button"
                  onClick={() => setEditingPriceVariant(null)}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer"
                >
                  {savingPrice ? '...' : 'CẬP NHẬT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
