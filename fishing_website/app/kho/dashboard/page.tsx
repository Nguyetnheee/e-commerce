'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../../lib/api';
import { 
  LogOut, 
  Package, 
  AlertTriangle, 
  Clipboard, 
  ArrowDownCircle, 
  Activity, 
  Plus, 
  Check, 
  RefreshCw, 
  Search,
  Trash,
  Eye
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

export default function KhoDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [warehouseStats, setWarehouseStats] = useState({
    totalStock: 0,
    lowStockSkuCount: 0,
    packingOrderCount: 0,
    todayReceiptCount: 0,
    lowStockThreshold: 5,
  });
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
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

  // Tab & Modal control states
  const [activeTab, setActiveTab] = useState<'lowStock' | 'vouchers' | 'packingOrders'>('lowStock');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for creating a new voucher
  const [newVoucher, setNewVoucher] = useState({
    supplier: 'Shimano Japan Co.',
    notes: '',
    items: [
      { sku: '', name: '', qty: 10, price: 150000, shelf: '', isNew: false }
    ]
  });

  // Calculate status based on stock and min levels
  const getStatus = (stock: number, min: number) => {
    if (stock === 0) return 'Hết hàng';
    if (stock <= min / 2) return 'Cực thấp';
    if (stock <= min) return 'Sắp hết';
    return 'Bình thường';
  };

  const fetchRealWarehouseData = async () => {
    try {
      const stats = await adminApi.getInventoryDashboard();
      setWarehouseStats({
        totalStock: Number(stats?.totalStock || 0),
        lowStockSkuCount: Number(stats?.lowStockSkuCount || 0),
        packingOrderCount: Number(stats?.packingOrderCount || 0),
        todayReceiptCount: Number(stats?.todayReceiptCount || 0),
        lowStockThreshold: Number(stats?.lowStockThreshold || 5),
      });
    } catch (e) {
      console.error('Không thể tải số liệu tổng hợp kho:', e);
    }

    try {
      const alerts = await adminApi.getOutOfStockAlerts();
      if (Array.isArray(alerts)) {
        setProducts(alerts.map((v: any) => ({
          id: v.variantId || v.id,
          sku: v.sku || `VAR-${v.id}`,
          name: [v.productName, v.variantName].filter(Boolean).join(' — ') || `Lựa chọn sản phẩm #${v.id}`,
          stock: Number(v.stockQuantity || 0),
          min: warehouseStats.lowStockThreshold,
          shelf: 'Chưa cập nhật',
          status: Number(v.stockQuantity || 0) === 0 ? 'Hết hàng' : 'Sắp hết'
        })));
      }
    } catch (e) {
      console.error('Không thể tải cảnh báo tồn kho:', e);
    }

    try {
      // 2. Fetch logs from API
      const apiLogs = await adminApi.getInventoryLogs();
      if (Array.isArray(apiLogs)) {
        setLogs(apiLogs.map((log: any) => {
          const quantity = Number(log.quantityChange || 0);
          const isImport = quantity > 0;
          const createdAt = log.createdAt ? new Date(log.createdAt) : null;
          return {
          id: log.id,
          time: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString('vi-VN') : 'Chưa có thời gian',
          action: `${isImport ? 'Nhập kho' : 'Xuất kho'} ${Math.abs(quantity)} ${log.productName || 'sản phẩm'}${log.variantName ? ` — ${log.variantName}` : ''}. Tồn kho: ${log.previousStock ?? 0} → ${log.newStock ?? 0}. Lý do: ${log.reason || 'Không ghi chú'}`,
          tag: isImport ? 'NHẬP KHO' : 'XUẤT KHO'
          };
        }));
      }
    } catch (e) {
      console.error('Không thể tải lịch sử kho:', e);
    }

    try {
      // 2.5. Fetch Vouchers
      const apiVouchers = await adminApi.getWarehouseReceipts();
      if (Array.isArray(apiVouchers)) {
        const mappedVouchers = apiVouchers.map((v: any) => ({
          code: v.code,
          supplier: v.supplier,
          notes: v.notes,
          createdBy: v.createdBy,
          createdAt: v.createdAt ? new Date(v.createdAt).toLocaleString('vi-VN') : '',
          totalQty: v.totalQty,
          totalValue: v.totalValue,
          items: v.items || []
        }));
        setVouchers(mappedVouchers);
      }
    } catch (e) {
      console.error('Không thể tải phiếu nhập kho:', e);
    }

    try {
      setLoadingOrders(true);
      const packingRes = await adminApi.getOrders('PACKING');
      setOrders(Array.isArray(packingRes) ? packingRes : []);
    } catch (e) {
      console.error('Lỗi khi tải đơn hàng kho:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number | string, nextStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, nextStatus);
      alert(`Đã cập nhật trạng thái đơn hàng #${orderId} thành: ${nextStatus === 'PACKING' ? 'ĐANG ĐÓNG GÓI' : 'ĐANG GIAO HÀNG'}`);
      fetchRealWarehouseData();
    } catch (err: any) {
      alert('Không thể cập nhật trạng thái đơn hàng: ' + (err.message || err));
    }
  };

  useEffect(() => {
    fetchRealWarehouseData();
  }, []);

  // Authentication gate
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('user_session');
      if (!session) {
        router.push('/admin-login');
        return;
      }
      try {
        const user = JSON.parse(session);
        if (user.role !== 'kho') {
          if (user.role === 'admin') router.push('/admin/dashboard');
          else if (user.role === 'shipper') router.push('/shipper/dashboard');
          else router.push('/admin-login');
        } else {
          setUserEmail(user.email);
          setLoading(false);
        }
      } catch (e) {
        localStorage.removeItem('user_session');
        router.push('/admin-login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/admin-login');
  };

  const handleReplenish = async (item: any) => {
    const sku = item.sku;
    const variantId = item.id;
    
    if (variantId) {
      try {
        const newStock = item.stock + 15;
        await adminApi.updateVariantStock(variantId, newStock, `Bổ sung 15 chiếc từ cảnh báo kho - SKU: ${sku}`);
        alert(`Bổ sung 15 chiếc cho SKU: ${sku} thành công trên hệ thống backend!`);
      } catch (err: any) {
        alert('Lỗi cập nhật tồn kho lên Backend: ' + (err.message || err));
        return;
      }
    } else {
      alert(`Đã gửi yêu cầu bổ sung hàng hóa cho mã SKU: ${sku}. Phòng Mua hàng sẽ phê duyệt.`);
    }
    
    await fetchRealWarehouseData();
  };

  // Generate Voucher code like PNK-YYYYMMDD-XXXX
  const generateVoucherCode = () => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() + 
                    (now.getMonth() + 1).toString().padStart(2, '0') + 
                    now.getDate().toString().padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PNK-${dateStr}-${rand}`;
  };

  const handleAddItemRow = () => {
    setNewVoucher(prev => ({
      ...prev,
      items: [...prev.items, { sku: '', name: '', qty: 10, price: 150000, shelf: '', isNew: false }]
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    setNewVoucher(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      return { 
        ...prev, 
        items: updatedItems.length > 0 ? updatedItems : [{ sku: '', name: '', qty: 10, price: 150000, shelf: '', isNew: false }] 
      };
    });
  };

  const handleItemRowChange = (index: number, field: string, value: any) => {
    setNewVoucher(prev => {
      const updatedItems = [...prev.items];
      if (field === 'sku') {
        if (value === 'NEW_PRODUCT') {
          updatedItems[index] = { ...updatedItems[index], sku: '', name: '', isNew: true, shelf: '' };
        } else {
          const found = products.find(p => p.sku === value);
          updatedItems[index] = { 
            ...updatedItems[index], 
            sku: value, 
            name: found ? found.name : '', 
            shelf: found ? found.shelf : '',
            isNew: false 
          };
        }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      return { ...prev, items: updatedItems };
    });
  };

  const handleConfirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter and build items list
    const validItems = newVoucher.items.filter(item => item.sku !== '' || (item.isNew && item.name !== ''));
    if (validItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm hợp lệ.');
      return;
    }
    
    const voucherCode = generateVoucherCode();
    const totalQty = validItems.reduce((sum, item) => sum + Number(item.qty), 0);
    const totalValue = validItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
    
    const itemsData = validItems.map(item => {
      let finalSku = item.sku;
      if (item.isNew) {
        finalSku = item.sku.trim() || `WS-NEW-${Math.floor(100 + Math.random() * 900)}`;
      }
      return {
        sku: finalSku,
        qty: Number(item.qty),
        price: Number(item.price),
        shelf: item.shelf || 'Kệ Tạm'
      };
    });

    try {
      // 1. Call Backend API to create warehouse receipt
      const createdReceipt = await adminApi.createWarehouseReceipt({
        supplier: newVoucher.supplier,
        notes: newVoucher.notes || 'Nhập kho từ đối tác',
        items: itemsData
      });

      // 2. Automatically log the Quality Inspection (PASSED)
      await adminApi.createWarehouseInspection({
        supplier: newVoucher.supplier,
        inspectType: 'IMPORT',
        status: 'PASSED',
        notes: `Kiểm định lô hàng nhập kho #${voucherCode} từ nhà cung cấp ${newVoucher.supplier}. Đạt tiêu chuẩn chất lượng.`,
        checklist: {
          quantityMatched: true,
          packagingIntact: true,
          modelCorrect: true,
          conditionGood: true,
          accessoriesIncluded: true,
          warrantyCardIncluded: true
        },
        rejectedQuantity: 0
      });

      // Reset form
      setNewVoucher({
        supplier: 'Shimano Japan Co.',
        notes: '',
        items: [
          { sku: '', name: '', qty: 10, price: 150000, shelf: '', isNew: false }
        ]
      });
      setIsCreateModalOpen(false);
      alert(`Nhập kho thành công! Đã tạo phiếu nhập ${createdReceipt?.code || voucherCode} với tổng cộng ${totalQty} sản phẩm và kiểm định đạt.`);
      
      // Reload receipts from server
      fetchRealWarehouseData();
    } catch (err: any) {
      alert('Lỗi tạo phiếu nhập kho trên máy chủ: ' + (err.message || err));
    }
  };

  const handleViewVoucherDetail = async (v: any) => {
    try {
      const detail = await adminApi.getWarehouseReceipt(v.code);
      setSelectedVoucher(detail);
    } catch (err) {
      console.log('Error loading voucher detail from backend:', err);
      setSelectedVoucher(v);
    }
    setIsDetailModalOpen(true);
  };

  // Filter low stock items based on search and stock logic
  const lowStockItems = products.filter(p => {
    // Only display items where stock <= p.min
    const isLow = p.stock <= p.min;
    if (!isLow) return false;
    if (searchQuery) {
      return p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-secondary border-t-transparent animate-spin mx-auto mb-md"></div>
          <p className="text-body-md text-on-surface-variant font-semibold">Đang kết nối hệ thống kho...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface font-sans flex flex-col">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-full bg-[#1f6c3a] flex items-center justify-center text-white">
            <Package className="w-5 h-5" />
          </div>
          <div className="font-sans text-body-lg tracking-tight font-extrabold flex items-baseline">
            <span className="text-[#00288e]">WildStream</span>
            <span className="text-[#1f6c3a] ml-0.5 text-[13px] font-semibold bg-secondary/10 px-1.5 py-0.5 rounded">Kho</span>
          </div>
        </div>

        {/* User profile & logout */}
        <div className="flex items-center gap-sm">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-label-sm font-bold text-on-surface">{userEmail}</span>
            <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">Quản lý kho</span>
          </div>
          
          <div className="h-8 w-px bg-outline-variant/40 hidden sm:block" />

          <div id="notification-bell-slot" className="flex items-center" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-xs bg-error-container hover:bg-error/10 text-error text-label-sm font-bold px-3 py-1.5 rounded-lg border border-error/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-sm md:p-md space-y-md">
        
        {/* BANNER */}
        <div className="bg-gradient-to-r from-[#1f6c3a] to-[#24703e] text-white p-md rounded-2xl shadow-ambient flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
          <div>
            <span className="text-label-sm text-[#a4f1b2] uppercase tracking-widest font-bold block mb-1">Hệ thống quản lý kho vận</span>
            <h1 className="text-headline-lg-mobile md:text-headline-md font-bold tracking-tight">Khu vực điều hành Kho hàng</h1>
            <p className="text-body-md text-white/80 mt-1">
              Số liệu được tổng hợp trực tiếp từ cơ sở dữ liệu. Có <strong className="text-[#a4f1b2]">{warehouseStats.lowStockSkuCount} mã SKU</strong> còn tối đa {warehouseStats.lowStockThreshold} sản phẩm.
            </p>
          </div>
          
          <div className="flex items-center gap-xs">
            <button 
              onClick={() => fetchRealWarehouseData()}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-label-sm font-semibold flex items-center gap-xs transition-colors"
            >
              <RefreshCw className="w-4.5 h-4.5" />
              <span>Làm mới số liệu</span>
            </button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
          
          {/* Card 1 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Tổng sản phẩm tồn</span>
              <span className="text-headline-md font-bold text-[#1f6c3a] tracking-tight">{warehouseStats.totalStock.toLocaleString('vi-VN')} sp</span>
              <span className="text-[11px] text-secondary font-bold block mt-1">Tổng tồn các SKU trong DB</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-[#1f6c3a] flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Cảnh báo sắp hết</span>
              <span className="text-headline-md font-bold text-amber-600 tracking-tight">{warehouseStats.lowStockSkuCount} SKU</span>
              <span className="text-[11px] text-amber-600 font-bold block mt-1">
                Cần bổ sung gấp
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Đơn chờ đóng gói</span>
              <span className="text-headline-md font-bold text-[#1f6c3a] tracking-tight">{warehouseStats.packingOrderCount} đơn</span>
              <span className="text-[11px] text-secondary font-bold block mt-1">
                Đang chuẩn bị nhãn
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-[#1f6c3a] flex items-center justify-center flex-shrink-0">
              <Clipboard className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Nhập kho hôm nay</span>
              <span className="text-headline-md font-bold text-[#1f6c3a] tracking-tight">{warehouseStats.todayReceiptCount} lô hàng</span>
              <span className="text-[11px] text-secondary font-bold block mt-1">
                Đã kiểm định SKU
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-[#1f6c3a] flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          
          {/* LEFT: Tabbed Work Area (2 Columns) */}
          <div className="lg:col-span-2 space-y-md">
            
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
              
              {/* Tab Header Controls */}
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3 mb-4 flex-wrap gap-sm">
                <div className="flex items-center gap-md">
                  <button
                    onClick={() => setActiveTab('lowStock')}
                    className={`pb-2 text-body-lg font-bold tracking-tight border-b-2 transition-all duration-200 cursor-pointer ${
                      activeTab === 'lowStock' 
                        ? 'border-[#1f6c3a] text-[#1f6c3a]' 
                        : 'border-transparent text-on-surface-variant/60 hover:text-on-surface'
                    }`}
                  >
                    Cảnh báo tồn kho ({warehouseStats.lowStockSkuCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('vouchers')}
                    className={`pb-2 text-body-lg font-bold tracking-tight border-b-2 transition-all duration-200 cursor-pointer ${
                      activeTab === 'vouchers' 
                        ? 'border-[#1f6c3a] text-[#1f6c3a]' 
                        : 'border-transparent text-on-surface-variant/60 hover:text-on-surface'
                    }`}
                  >
                    Lịch sử Phiếu Nhập ({vouchers.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('packingOrders')}
                    className={`pb-2 text-body-lg font-bold tracking-tight border-b-2 transition-all duration-200 cursor-pointer ${
                      activeTab === 'packingOrders' 
                        ? 'border-[#1f6c3a] text-[#1f6c3a]' 
                        : 'border-transparent text-on-surface-variant/60 hover:text-on-surface'
                    }`}
                  >
                    Lấy & Đóng gói đơn ({orders.length})
                  </button>
                </div>
                
                {activeTab === 'lowStock' && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm mã SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-label-sm bg-[#f8f9fa] border border-outline-variant/30 rounded-lg focus:outline-none focus:border-secondary w-40 transition-all duration-200"
                    />
                    <Search className="w-4 h-4 text-outline absolute left-2.5 top-2.5" />
                  </div>
                )}
              </div>

              {/* TAB 1: LOW STOCK WARNING TABLE */}
              {activeTab === 'lowStock' && (
                <div className="overflow-x-auto">
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-emerald-50 text-[#1f6c3a] rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-body-md text-on-surface font-semibold">Kho hàng an toàn!</p>
                      <p className="text-label-sm text-on-surface-variant/60 mt-1">Tất cả sản phẩm hiện đang trên mức an toàn.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-label-sm">
                      <thead>
                        <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                          <th className="py-2.5">Mã SKU</th>
                          <th className="py-2.5">Tên sản phẩm</th>
                          <th className="py-2.5 text-center">Tồn / Tối thiểu</th>
                          <th className="py-2.5">Khu Vực Kệ</th>
                          <th className="py-2.5">Trạng thái</th>
                          <th className="py-2.5 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant font-sans">
                        {lowStockItems.map((item) => (
                          <tr key={item.sku} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="py-3 font-mono font-bold text-[#1f6c3a]">{item.sku}</td>
                            <td className="py-3">
                              <span className="font-semibold text-on-surface block">{item.name}</span>
                            </td>
                            <td className="py-3 text-center font-bold">
                              <span className={item.stock <= 2 ? 'text-error' : 'text-amber-600'}>
                                {item.stock}
                              </span>
                              <span className="text-on-surface-variant/60"> / {item.min}</span>
                            </td>
                            <td className="py-3 font-semibold">{item.shelf}</td>
                            <td className="py-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                item.status === 'Cực thấp'
                                  ? 'bg-red-50 text-error border-red-200'
                                  : item.status === 'Đang nhập'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {item.status !== 'Đang nhập' ? (
                                <button
                                  onClick={() => handleReplenish(item)}
                                  className="bg-secondary hover:bg-secondary/90 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  Yêu cầu nhập
                                </button>
                              ) : (
                                <span className="text-[11px] text-blue-600 font-bold flex items-center justify-end gap-1">
                                  <Check className="w-3.5 h-3.5" /> Đã gửi yêu cầu
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* TAB 2: VOUCHERS LIST */}
              {activeTab === 'vouchers' && (
                <div className="overflow-x-auto">
                  {vouchers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clipboard className="w-6 h-6" />
                      </div>
                      <p className="text-body-md text-on-surface font-semibold">Chưa có phiếu nhập kho nào</p>
                      <p className="text-label-sm text-on-surface-variant/60 mt-1">Sử dụng nút "Tạo phiếu nhập mới" ở cột bên phải để lập lô hàng.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-label-sm">
                      <thead>
                        <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                          <th className="py-2.5">Mã Phiếu</th>
                          <th className="py-2.5">Nhà cung cấp</th>
                          <th className="py-2.5">Ngày tạo</th>
                          <th className="py-2.5 text-center">Tổng SP</th>
                          <th className="py-2.5 text-right">Tổng giá trị</th>
                          <th className="py-2.5 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant font-sans">
                        {vouchers.map((v) => (
                          <tr key={v.code} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="py-3 font-mono font-bold text-blue-600">{v.code}</td>
                            <td className="py-3 font-semibold text-on-surface">{v.supplier}</td>
                            <td className="py-3 text-on-surface-variant/80">{v.createdAt}</td>
                            <td className="py-3 text-center font-bold">{v.totalQty}</td>
                            <td className="py-3 text-right font-mono font-bold text-[#1f6c3a]">
                              {v.totalValue.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleViewVoucherDetail(v)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-blue-200"
                              >
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* TAB 3: PACKING ORDERS LIST */}
              {activeTab === 'packingOrders' && (
                <div className="overflow-x-auto">
                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-body-sm text-on-surface-variant font-medium">Đang lấy danh sách đơn hàng...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-emerald-50 text-[#1f6c3a] rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-body-md text-on-surface font-semibold">Đã đóng gói toàn bộ đơn hàng!</p>
                      <p className="text-label-sm text-on-surface-variant/60 mt-1">Không có đơn hàng nào chờ xử lý lấy hàng hoặc đóng gói.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-label-sm">
                      <thead>
                        <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                          <th className="py-2.5">Mã đơn</th>
                          <th className="py-2.5">Khách hàng / Điện thoại</th>
                          <th className="py-2.5">Địa chỉ</th>
                          <th className="py-2.5">Trạng thái</th>
                          <th className="py-2.5 text-right">Thao tác xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant font-sans">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="py-3 font-mono font-bold text-on-surface">#{o.id}</td>
                            <td className="py-3">
                              <span className="font-semibold text-on-surface block">{o.recipientName || 'Chưa có tên người nhận'}</span>
                              <span className="text-[11px] text-on-surface-variant/60">{o.recipientPhone || 'Chưa có số điện thoại'}</span>
                            </td>
                            <td className="py-3 max-w-[200px] truncate" title={o.shippingAddress}>
                              {o.shippingAddress}
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                o.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-blue-50 text-blue-600 border-blue-200'
                              }`}>
                                {o.status === 'PENDING' ? 'CHỜ LẤY HÀNG' : 'ĐANG ĐÓNG GÓI'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {o.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'PACKING')}
                                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none shadow-sm"
                                >
                                  Lấy hàng (Pick)
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'SHIPPING')}
                                  className="bg-[#1f6c3a] hover:bg-[#2c7d48] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none shadow-sm"
                                >
                                  Đóng gói xong (Ship)
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* RIGHT: Timeline & Fast Tasks */}
          <div className="space-y-md">
            
            {/* Timeline */}
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
              <h3 className="text-body-lg font-bold text-on-surface mb-xs">Lịch sử xuất nhập kho</h3>
              <p className="text-label-sm text-on-surface-variant/80 mb-sm">Nhật ký hoạt động kệ hàng</p>

              <div className="space-y-sm">
                {logs.slice(0, 5).map((log, i) => (
                  <div key={log.id || i} className="flex gap-sm text-label-sm">
                    <div className="flex flex-col items-center">
                      <span className={`w-2.5 h-2.5 rounded-full ring-4 ${
                        log.tag === 'NHẬP KHO' 
                          ? 'bg-secondary ring-secondary/10' 
                          : log.tag === 'XUẤT KHO' 
                            ? 'bg-blue-500 ring-blue-500/10' 
                            : log.tag === 'HOÀN TRẢ'
                              ? 'bg-amber-600 ring-amber-600/10'
                              : 'bg-outline ring-outline/10'
                      } flex-shrink-0 mt-1`} />
                      {i < Math.min(logs.length, 5) - 1 && <div className="w-px h-full bg-outline-variant/30 mt-1" />}
                    </div>
                    <div className="pb-xs">
                      <div className="font-bold text-on-surface flex justify-between gap-md">
                        <span className={`text-[10px] uppercase font-extrabold ${
                          log.tag === 'NHẬP KHO' ? 'text-[#1f6c3a]' : log.tag === 'XUẤT KHO' ? 'text-blue-600' : 'text-amber-700'
                        }`}>{log.tag}</span>
                        <span className="text-[10px] text-on-surface-variant/50 font-normal">{log.time}</span>
                      </div>
                      <p className="text-on-surface-variant/85 text-body-sm mt-0.5">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stock adjustments */}
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
              <h3 className="text-body-lg font-bold text-on-surface mb-sm">Thao tác kho nhanh</h3>
              
              <div className="grid grid-cols-1 gap-xs font-sans">
                <button
                  onClick={() => fetchRealWarehouseData()}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-secondary/5 border border-outline-variant/30 hover:border-secondary text-label-sm font-semibold transition-all duration-200 w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Đồng bộ dữ liệu kho</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Tải lại số liệu trực tiếp từ cơ sở dữ liệu</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNewVoucher({
                      supplier: 'Shimano Japan Co.',
                      notes: '',
                      items: [{ sku: '', name: '', qty: 10, price: 150000, shelf: '', isNew: false }]
                    });
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-secondary/5 border border-outline-variant/30 hover:border-secondary text-label-sm font-semibold transition-all duration-200 w-full cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Tạo phiếu nhập mới</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Khai báo lô hàng cập cảng mới</div>
                  </div>
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* CREATE VOUCHER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-outline-variant/30 flex justify-between items-center">
              <div>
                <h2 className="text-body-lg font-bold text-on-surface">Tạo Phiếu Nhập Kho Mới</h2>
                <p className="text-[11px] text-on-surface-variant/80">Khai báo lô hàng cập cảng & cập nhật tồn kho</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-on-surface-variant/70 hover:text-on-surface p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmReceipt} className="flex flex-col flex-grow overflow-hidden text-label-sm">
              <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                
                {/* Top Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant/70 mb-1">
                      Nhà cung cấp <span className="text-error">*</span>
                    </label>
                    <select
                      value={newVoucher.supplier}
                      onChange={(e) => setNewVoucher(prev => ({ ...prev, supplier: e.target.value }))}
                      className="w-full p-2 bg-[#f8f9fa] border border-outline-variant/30 rounded-lg focus:outline-none focus:border-secondary font-semibold"
                    >
                      <option value="Shimano Japan Co.">Shimano Japan Co.</option>
                      <option value="Naturehike Outdoor Ltd.">Naturehike Outdoor Ltd.</option>
                      <option value="WildStream Gear Factory">WildStream Gear Factory</option>
                      <option value="Daiwa Fishing Supplies">Daiwa Fishing Supplies</option>
                      <option value="Đại lý phân phối Việt Nam">Đại lý phân phối Việt Nam</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant/70 mb-1">
                      Người lập phiếu
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userEmail || 'kho@wildstream.com'}
                      className="w-full p-2 bg-[#e9ecef] border border-outline-variant/30 rounded-lg font-semibold text-on-surface-variant/80 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant/70 mb-1">
                      Ngày lập phiếu
                    </label>
                    <input
                      type="text"
                      disabled
                      value={new Date().toLocaleDateString('vi-VN')}
                      className="w-full p-2 bg-[#e9ecef] border border-outline-variant/30 rounded-lg font-semibold text-on-surface-variant/80 cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant/70 mb-1">
                      Ghi chú phiếu nhập
                    </label>
                    <textarea
                      value={newVoucher.notes}
                      onChange={(e) => setNewVoucher(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Nhập lý lý nhập kho, số vận đơn, thông tin container..."
                      rows={2}
                      className="w-full p-2 bg-[#f8f9fa] border border-outline-variant/30 rounded-lg focus:outline-none focus:border-secondary font-medium"
                    />
                  </div>
                </div>

                {/* Dynamic Item list */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-on-surface text-body-md">Danh sách sản phẩm nhập</h4>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-white bg-secondary hover:bg-secondary/90 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm dòng
                    </button>
                  </div>

                  {/* Table layout for items */}
                  <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-label-sm">
                      <thead className="bg-[#f8f9fa] text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-outline-variant/25">
                        <tr>
                          <th className="px-3 py-2.5 w-[40%]">Sản phẩm / SKU</th>
                          <th className="px-3 py-2.5 w-[20%]">Vị trí kệ</th>
                          <th className="px-3 py-2.5 w-[15%] text-center">Số lượng</th>
                          <th className="px-3 py-2.5 w-[15%] text-right">Đơn giá (đ)</th>
                          <th className="px-3 py-2.5 w-[10%] text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {newVoucher.items.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                            {/* Product select / input */}
                            <td className="px-3 py-2">
                              {!item.isNew ? (
                                <select
                                  value={item.sku}
                                  onChange={(e) => handleItemRowChange(index, 'sku', e.target.value)}
                                  required
                                  className="w-full p-1.5 bg-[#f8f9fa] border border-outline-variant/30 rounded-lg focus:outline-none focus:border-secondary font-semibold text-body-sm"
                                >
                                  <option value="">-- Chọn sản phẩm --</option>
                                  {products.map(p => (
                                    <option key={p.sku} value={p.sku}>
                                      {p.name} ({p.sku})
                                    </option>
                                  ))}
                                  <option value="NEW_PRODUCT" className="text-secondary font-bold">
                                    + [Sản phẩm mới chưa có]
                                  </option>
                                </select>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      placeholder="Mã SKU (ví dụ: WS-FISH-999)"
                                      value={item.sku}
                                      onChange={(e) => handleItemRowChange(index, 'sku', e.target.value)}
                                      required
                                      className="w-[70%] p-1 bg-amber-50/50 border border-amber-300 focus:border-secondary focus:outline-none rounded-lg font-mono font-bold text-body-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleItemRowChange(index, 'sku', '')}
                                      className="text-on-surface-variant/60 hover:text-error text-[10px] font-bold underline"
                                    >
                                      Chọn lại
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Tên sản phẩm..."
                                    value={item.name}
                                    onChange={(e) => handleItemRowChange(index, 'name', e.target.value)}
                                    required
                                    className="w-full p-1 bg-amber-50/50 border border-amber-300 focus:border-secondary focus:outline-none rounded-lg font-semibold text-body-sm"
                                  />
                                </div>
                              )}
                            </td>

                            {/* Shelf location */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                placeholder="e.g. Kệ A-01"
                                value={item.shelf}
                                onChange={(e) => handleItemRowChange(index, 'shelf', e.target.value)}
                                className="w-full p-1.5 bg-[#f8f9fa] border border-outline-variant/30 focus:border-secondary focus:outline-none rounded-lg font-semibold text-body-sm"
                              />
                            </td>

                            {/* Quantity */}
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) => handleItemRowChange(index, 'qty', parseInt(e.target.value) || 0)}
                                required
                                className="w-16 p-1.5 text-center bg-[#f8f9fa] border border-outline-variant/30 focus:border-secondary focus:outline-none rounded-lg font-bold text-body-sm"
                              />
                            </td>

                            {/* Price */}
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={item.price}
                                onChange={(e) => handleItemRowChange(index, 'price', parseInt(e.target.value) || 0)}
                                required
                                className="w-24 p-1.5 text-right bg-[#f8f9fa] border border-outline-variant/30 focus:border-secondary focus:outline-none rounded-lg font-mono font-bold text-body-sm"
                              />
                            </td>

                            {/* Delete button */}
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(index)}
                                className="text-error/80 hover:text-error hover:bg-error/5 p-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant/30 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase font-bold">Tổng giá trị tạm tính</span>
                  <strong className="text-body-md text-[#1f6c3a] font-mono text-[16px]">
                    {newVoucher.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0).toLocaleString('vi-VN')} đ
                  </strong>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-on-surface font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-body-sm"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1f6c3a] hover:bg-[#1c5d33] text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer text-body-sm"
                  >
                    Xác nhận nhập kho
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* VOUCHER DETAIL MODAL */}
      {isDetailModalOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-outline-variant/30 flex justify-between items-center">
              <div>
                <h2 className="text-body-lg font-bold text-on-surface">Chi tiết Phiếu Nhập Kho</h2>
                <p className="text-[11px] font-mono text-blue-600 font-bold">{selectedVoucher.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-on-surface-variant/70 hover:text-on-surface p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-grow text-label-sm">
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#f8f9fa] p-4 rounded-xl border border-outline-variant/20">
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 block uppercase font-bold">Thủ kho lập phiếu</span>
                  <span className="font-semibold text-on-surface text-body-sm">{selectedVoucher.createdBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 block uppercase font-bold">Ngày lập</span>
                  <span className="font-semibold text-on-surface text-body-sm">{selectedVoucher.createdAt}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 block uppercase font-bold">Nhà cung cấp</span>
                  <span className="font-semibold text-[#1f6c3a] text-body-sm">{selectedVoucher.supplier}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 block uppercase font-bold">Trạng thái</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Đã Nhập Kho
                  </span>
                </div>
                {selectedVoucher.notes && (
                  <div className="col-span-2 border-t border-outline-variant/20 pt-2 mt-1">
                    <span className="text-[10px] text-on-surface-variant/60 block uppercase font-bold">Ghi chú</span>
                    <p className="text-on-surface-variant/90 font-medium text-body-sm">{selectedVoucher.notes}</p>
                  </div>
                )}
              </div>

              {/* Item list */}
              <div>
                <h4 className="font-bold text-on-surface mb-2 text-body-md">Danh sách sản phẩm nhập</h4>
                <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-label-sm">
                    <thead className="bg-[#f8f9fa] text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-outline-variant/20">
                      <tr>
                        <th className="px-3 py-2">Mã SKU</th>
                        <th className="px-3 py-2">Tên sản phẩm</th>
                        <th className="px-3 py-2 text-center">Số lượng</th>
                        <th className="px-3 py-2 text-right">Đơn giá</th>
                        <th className="px-3 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-medium text-on-surface-variant">
                      {selectedVoucher.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-600">{item.sku}</td>
                          <td className="px-3 py-2.5 text-on-surface font-semibold">{item.name}</td>
                          <td className="px-3 py-2.5 text-center font-bold">{item.qty}</td>
                          <td className="px-3 py-2.5 text-right font-mono">{item.price.toLocaleString('vi-VN')} đ</td>
                          <td className="px-3 py-2.5 text-right font-mono text-on-surface font-bold">
                            {(item.qty * item.price).toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant/30 flex justify-between items-center text-label-sm">
              <div>
                <span className="text-on-surface-variant/70 font-semibold">Tổng cộng: </span>
                <strong className="text-body-md text-[#1f6c3a] font-mono text-[16px]">
                  {selectedVoucher.totalValue.toLocaleString('vi-VN')} đ
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-secondary text-white hover:bg-secondary/95 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-body-sm"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-outline-variant/20 py-sm px-margin-mobile md:px-margin-desktop text-center text-label-sm text-on-surface-variant/60 font-sans mt-lg">
        WildStream Gear Warehouse Management Hub &copy; 2026. All rights reserved.
      </footer>

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
