'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Check, 
  X, 
  Activity, 
  ChevronRight, 
  Plus,
  Compass,
  FileText,
  UploadCloud,
  Trash2,
  Building2,
  RotateCcw
} from 'lucide-react';
import { adminApi } from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

// Cấu hình Cloudinary để tải ảnh trực tiếp từ máy tính (Thay đổi các giá trị này theo tài khoản của bạn)
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dziemd19e';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'e-commerce';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Real dashboard metrics state
  const [revenue, setRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [approvalOrder, setApprovalOrder] = useState<any | null>(null);
  const [shippers, setShippers] = useState<any[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
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

  // Add Product Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCat, setNewProductCat] = useState('1'); 
  const [newProductBrand, setNewProductBrand] = useState('1'); 
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantName, setNewVariantName] = useState('Tiêu chuẩn');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('10');
  const [savingProduct, setSavingProduct] = useState(false);

  // Cloudinary image upload states
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      const now = new Date();
      
      // Current Month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];

      // 1. Fetch Month Revenue
      const revData = await adminApi.getRevenueReport(firstDay, lastDay);
      if (revData && revData.totalRevenue !== undefined) {
        setRevenue(Number(revData.totalRevenue));
      }

      // 2. Fetch Orders list
      const [ordersData, staffData] = await Promise.all([adminApi.getOrders(), adminApi.getAllAdmins()]);
      if (Array.isArray(ordersData)) {
        setTotalOrders(ordersData.length);
        const pending = ordersData.filter((o: any) => {
          if (o.status !== 'PENDING') return false;
          if (o.paymentMethod === 'PAYOS' && o.paymentStatus !== 'PAID') return false;
          return true;
        }).sort((a: any, b: any) => {
          const timeA = a.orderDate || a.createdAt ? new Date(a.orderDate || a.createdAt).getTime() : 0;
          const timeB = b.orderDate || b.createdAt ? new Date(b.orderDate || b.createdAt).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA;
          return Number(b.id) - Number(a.id);
        });
        setPendingOrders(pending);
      }
      if (Array.isArray(staffData)) {
        setShippers(staffData.filter((user: any) => user.roles?.includes('SHIPPER') && user.status === 'ACTIVE'));
      }

      // 3. Fetch Chart Weekly Revenue
      const weeklyData = await adminApi.getRevenueReport(sevenDaysAgoStr, todayStr);
      if (weeklyData && Array.isArray(weeklyData.dailyRevenues)) {
        setChartData(weeklyData.dailyRevenues);
      }

      setLoadingData(false);
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
      setLoadingData(false);
    }
  };

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
        if (user.role !== 'admin') {
          if (user.role === 'kho') router.push('/kho/dashboard');
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

  useEffect(() => {
    if (!loading) {
      loadDashboardData();
    }
  }, [loading]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/admin-login');
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-md"></div>
          <p className="text-body-md text-on-surface-variant font-semibold">Đang tải dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  const handleApproveOrder = (order: any) => {
    setApprovalOrder(order);
    setSelectedShipperId(order.assignedShipperId ? String(order.assignedShipperId) : '');
  };

  const confirmApproval = async () => {
    if (!approvalOrder) return;
    if (!selectedShipperId) {
      alert('Vui lòng chọn shipper phụ trách giao đơn.');
      return;
    }
    try {
      await adminApi.approveOrder(approvalOrder.id, selectedShipperId);
      setApprovalOrder(null);
      await loadDashboardData();
      alert('Đã phê duyệt đơn hàng. Hệ thống đã chuyển thông tin sang bộ phận KHO.');
    } catch (err: any) {
      alert(err.message || 'Phê duyệt đơn hàng thất bại.');
    }
  };

  const handleCancelOrder = (id: number | string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy đơn hàng',
      message: `Nhập lý do hủy đơn hàng #${id} bên dưới:`,
      isPrompt: true,
      promptPlaceholder: 'Nhập lý do hủy đơn...',
      promptValue: '',
      onConfirm: async (reason) => {
        if (!reason || !reason.trim()) {
          alert('Vui lòng nhập lý do hủy đơn!');
          return;
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.cancelOrder(id, reason.trim());
          alert(`Đã hủy đơn hàng #${id}.`);
          loadDashboardData();
        } catch (err: any) {
          alert(err.message || 'Hủy đơn hàng thất bại.');
        }
      }
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newVariantPrice.trim() || !newVariantSku.trim()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Tên sản phẩm, Mã SKU, Giá bán)!');
      return;
    }

    try {
      setSavingProduct(true);
      
      // 1. Create Product
      const product = await adminApi.createProduct({
        name: newProductName.trim(),
        image: newProductImage.trim() || '/images/product-rod.png',
        description: newProductDesc.trim() || 'Sản phẩm dã ngoại câu cá cao cấp.',
        categoryId: Number(newProductCat),
        brandId: Number(newProductBrand),
        tagIds: [2], // Default tag "Mới" (id=2)
        isVisible: true
      });

      if (!product || !product.id) {
        throw new Error('Không thể khởi tạo ID sản phẩm từ hệ thống backend.');
      }

      // 2. Create Product Variant
      await adminApi.createVariant(product.id, {
        sku: newVariantSku.trim(),
        variantName: newVariantName.trim(),
        basePrice: Number(newVariantPrice),
        stockQuantity: Number(newVariantStock)
      });

      alert(`Thêm sản phẩm "${newProductName}" và biến thể thành công!`);
      setIsAddModalOpen(false);
      
      // Reset fields
      setNewProductName('');
      setNewProductImage('');
      setNewProductDesc('');
      setNewProductCat('1');
      setNewProductBrand('1');
      setNewVariantSku('');
      setNewVariantName('Tiêu chuẩn');
      setNewVariantPrice('');
      setNewVariantStock('10');

      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi thêm sản phẩm.');
    } finally {
      setSavingProduct(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Render weekly line chart
  const getChartPoints = () => {
    if (!chartData || chartData.length === 0) {
      return {
        path: "M 0 120 L 80 100 L 160 110 L 240 70 L 320 60 L 400 45 L 480 35 L 500 35",
        area: "M 0 150 L 0 120 L 80 100 L 160 110 L 240 70 L 320 60 L 400 45 L 480 35 L 500 35 L 500 150 Z",
        nodes: [
          { cx: 80, cy: 100, val: '20M' },
          { cx: 160, cy: 110, val: '15M' },
          { cx: 240, cy: 70, val: '40M' },
          { cx: 320, cy: 60, val: '45M' },
          { cx: 400, cy: 45, val: '60M' },
          { cx: 480, cy: 35, val: '70M' }
        ],
        dates: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
      };
    }

    const width = 500;
    const height = 110;
    const topMargin = 20;

    const maxVal = Math.max(...chartData.map(d => Number(d.revenue || 0)), 1000000);
    const len = chartData.length;
    
    const points = chartData.map((d, index) => {
      const x = len > 1 ? (index * (width / (len - 1))) : 0;
      const pct = Number(d.revenue || 0) / maxVal;
      const y = height - (pct * (height - topMargin)) + topMargin;
      return { x, y, val: Number(d.revenue || 0), date: d.date };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    const area = `M 0 150 L ${path.substring(2)} L ${points[points.length - 1].x} 150 Z`;

    const nodes = points.map(p => ({
      cx: p.x,
      cy: p.y,
      val: new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(p.val)
    }));

    const dates = points.map(p => {
      const dateObj = new Date(p.date);
      return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    });

    return { path, area, nodes, dates };
  };

  const chart = getChartPoints();

  // Mock timeline logs
  const systemLogs = [
    { id: 1, time: '15 phút trước', user: 'Kho (kho@...)', action: 'Cập nhật tồn kho hàng "Lều Peak-4" (+15 chiếc)', type: 'kho' },
    { id: 2, time: '40 phút trước', user: 'Shipper (shipper@...)', action: 'Báo giao hàng THÀNH CÔNG đơn #WS-1042', type: 'shipper' },
    { id: 3, time: '1 giờ trước', user: 'Admin (Bạn)', action: 'Duyệt và xuất kho đơn hàng #WS-1041', type: 'admin' },
    { id: 4, time: '2 giờ trước', user: 'Hệ thống', action: 'Đơn hàng mới được tạo bởi khách hàng', type: 'system' },
  ];

  return (
    <div className="space-y-md">
      {/* WELCOME BANNER */}
        <div className="bg-gradient-to-r from-[#00288e] to-[#1e40af] text-white p-md rounded-2xl shadow-ambient flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
          <div>
            <span className="text-label-sm text-[#a8b8ff] uppercase tracking-widest font-bold block mb-1">Hệ thống quản lý trung tâm</span>
            <h1 className="text-headline-lg-mobile md:text-headline-md font-bold tracking-tight">Xin chào, Quản trị viên!</h1>
            <p className="text-body-md text-white/80 mt-1">Hôm nay hệ thống hoạt động ổn định. Có {pendingOrders.length} đơn hàng đang chờ bạn phê duyệt.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-label-sm font-semibold flex items-center gap-xs">
            <Activity className="w-4.5 h-4.5 text-secondary-container animate-pulse" />
            <span>Môi trường: Production</span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
          
          {/* Card 1: Revenue */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow transition-shadow duration-200 flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Doanh thu tháng</span>
              <span className="text-headline-md font-bold text-[#00288e] tracking-tight">
                {loadingData ? '...' : formatPrice(revenue)}
              </span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.5% so với tháng trước
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-[#00288e] flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow transition-shadow duration-200 flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Đơn hàng tổng cộng</span>
              <span className="text-headline-md font-bold text-[#00288e] tracking-tight">
                {loadingData ? '...' : `${totalOrders} đơn`}
              </span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                <span className="bg-secondary/15 px-1 rounded text-[9px] uppercase font-extrabold">Hệ thống</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-[#00288e] flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Users */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow transition-shadow duration-200 flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Thành viên hệ thống</span>
              <span className="text-headline-md font-bold text-[#00288e] tracking-tight">Hoạt động</span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                <span className="bg-secondary/15 px-1 rounded text-[9px] uppercase font-extrabold">Real-time</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-[#00288e] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Conversion */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow transition-shadow duration-200 flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Tỷ lệ hoàn thành</span>
              <span className="text-headline-md font-bold text-[#00288e] tracking-tight">100%</span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> Ổn định
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-[#00288e] flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* DETAILS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          
          {/* LEFT: Charts & Pending Orders (2 Columns on large) */}
          <div className="lg:col-span-2 space-y-md">
            
            {/* Sales Chart */}
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
              <div className="flex items-center justify-between mb-sm">
                <div>
                  <h3 className="text-body-lg font-bold text-on-surface">Biểu đồ doanh thu tuần</h3>
                  <p className="text-label-sm text-on-surface-variant/80">Cập nhật động theo ngày giao dịch</p>
                </div>
                <select className="bg-surface-container border border-outline-variant/30 rounded-lg text-label-sm font-semibold px-2.5 py-1 focus:outline-none">
                  <option>7 ngày qua</option>
                </select>
              </div>

              {/* Premium SVG Line Chart */}
              <div className="w-full h-48 bg-[#f8f9fa] rounded-xl border border-outline-variant/10 p-xs relative flex flex-col justify-between">
                <svg className="w-full h-full" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00288e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00288e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Gradient Area under line */}
                  <path d={chart.area} fill="url(#chartGrad)" />

                  {/* Line Graph */}
                  <path d={chart.path} fill="none" stroke="#00288e" strokeWidth="3" strokeLinecap="round" />

                  {/* Nodes / Dots */}
                  {chart.nodes.map((node, i) => (
                    <g key={i}>
                      <circle cx={node.cx} cy={node.cy} r="4" fill="#00288e" stroke="white" strokeWidth="1.5" />
                      <text x={node.cx} y={node.cy - 7} textAnchor="middle" className="text-[8px] font-bold fill-[#00288e]">{node.val}</text>
                    </g>
                  ))}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between px-xs text-[10px] text-on-surface-variant font-bold">
                  {chart.dates.map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Orders Table */}
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
              <div className="flex justify-between items-center mb-sm">
                <div>
                  <h3 className="text-body-lg font-bold text-on-surface">Đơn hàng cần duyệt gấp</h3>
                  <p className="text-label-sm text-on-surface-variant/80">Yêu cầu xác nhận thanh toán & chuyển tiếp kho</p>
                </div>
                <button className="text-label-sm font-bold text-[#00288e] hover:underline flex items-center gap-0.5">
                  Tất cả đơn hàng <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-label-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-2.5">Mã đơn</th>
                      <th className="py-2.5">Khách hàng</th>
                      <th className="py-2.5">Sản phẩm</th>
                      <th className="py-2.5">Tổng tiền</th>
                      <th className="py-2.5">Thanh toán</th>
                      <th className="py-2.5">Trạng thái</th>
                      <th className="py-2.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant">
                    {loadingData ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-on-surface-variant/60 font-semibold">
                          Đang tải danh sách đơn hàng...
                        </td>
                      </tr>
                    ) : pendingOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-on-surface-variant/60 font-semibold">
                          Không có đơn hàng nào cần phê duyệt.
                        </td>
                      </tr>
                    ) : (
                      pendingOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-3 font-bold text-[#00288e]">#WS-{order.id}</td>
                          <td className="py-3">
                            <div className="font-semibold text-on-surface">{order.recipientName || 'Khách hàng'}</div>
                            <div className="text-[10px] text-on-surface-variant/60">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                            </div>
                          </td>
                          <td className="py-3 max-w-[150px] truncate">
                            {order.items && order.items.map((it: any) => it.productName).join(', ')}
                          </td>
                          <td className="py-3 font-bold text-on-surface">{formatPrice(order.totalAmount)}</td>
                          <td className="py-3">
                            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full border ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="bg-blue-50 text-[#00288e] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              Chờ duyệt
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-xs">
                              <button
                                onClick={() => handleApproveOrder(order)}
                                className="w-7 h-7 rounded-md bg-secondary/10 hover:bg-secondary text-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-secondary/20"
                                title="Duyệt đơn"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="w-7 h-7 rounded-md bg-error/10 hover:bg-error text-error hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-error/20"
                                title="Hủy đơn"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Logs & Quick Actions */}
          <div className="space-y-md">
            
            {/* System Logs Timeline */}
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-body-lg font-bold text-on-surface mb-xs">Nhật ký vận hành</h3>
                <p className="text-label-sm text-on-surface-variant/80 mb-sm">Các thao tác thời gian thực</p>
              </div>

              <div className="space-y-sm">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex gap-sm text-label-sm">
                    <div className="flex flex-col items-center">
                      <span className={`w-2.5 h-2.5 rounded-full ring-4 ${
                        log.type === 'kho' 
                          ? 'bg-secondary ring-secondary/10' 
                          : log.type === 'shipper' 
                            ? 'bg-amber-600 ring-amber-600/10' 
                            : 'bg-primary ring-primary/10'
                      } flex-shrink-0 mt-1`} />
                      <div className="w-px h-full bg-outline-variant/30 mt-1" />
                    </div>
                    <div className="pb-sm">
                      <div className="font-bold text-on-surface flex justify-between gap-md">
                        <span>{log.user}</span>
                        <span className="text-[10px] text-on-surface-variant/50 font-normal">{log.time}</span>
                      </div>
                      <p className="text-on-surface-variant/85 text-body-sm mt-0.5">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
               <h3 className="text-body-lg font-bold text-on-surface mb-sm">Thao tác nhanh</h3>
              
              <div className="grid grid-cols-1 gap-xs font-sans">
                <button
                  onClick={() => router.push('/category')}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-primary/5 border border-outline-variant/30 hover:border-primary text-label-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Xem Cửa hàng Khách</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Trang chủ / Sản phẩm bán lẻ</div>
                  </div>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-[#1f6c3a]/5 border border-outline-variant/30 hover:border-secondary text-label-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Thêm sản phẩm mới</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Đăng tải trang bị câu cá mới</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/suppliers')}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-blue-600/5 border border-outline-variant/30 hover:border-[#00288e] text-label-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00288e]/10 text-[#00288e] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Quản lý Nhà cung cấp</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Thông tin đối tác & Hàng nhập khẩu</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/returns')}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-amber-600/5 border border-outline-variant/30 hover:border-amber-600 text-label-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Quản lý Đổi trả hàng</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Kiểm định chất lượng & Trả hàng</div>
                  </div>
                </button>

                <button
                  onClick={() => alert('Đang kết xuất báo cáo doanh thu PDF...')}
                  className="flex items-center gap-xs text-left p-xs rounded-xl hover:bg-[#5b2400]/5 border border-outline-variant/30 hover:border-tertiary text-label-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-[#5b2400] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-on-surface">Kết xuất báo cáo</div>
                    <div className="text-[10px] text-on-surface-variant font-normal">Doanh thu & Sản lượng tồn kho</div>
                  </div>
                </button>
              </div>
            </div>

          </div>

        </div>



      {/* ADD PRODUCT MODAL OVERLAY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-ambient border border-outline-variant/20 p-md md:p-lg text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm mb-md">
              <h2 className="text-body-lg font-bold text-[#00288e] uppercase tracking-wider">
                Thêm sản phẩm mới & Biến thể
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-sm font-sans text-label-sm">
              <div className="grid grid-cols-2 gap-sm">
                {/* Product Name */}
                <div className="flex flex-col gap-xs col-span-2">
                  <label className="font-bold text-on-surface-variant">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên sản phẩm..."
                    value={newProductName}
                    onChange={(e) => {
                      setNewProductName(e.target.value);
                      if (!newVariantSku) {
                        const code = 'WS-' + e.target.value.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
                        setNewVariantSku(code);
                      }
                    }}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e]"
                  />
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-xs">
                  <label className="font-bold text-on-surface-variant">Danh mục *</label>
                  <select
                    value={newProductCat}
                    onChange={(e) => setNewProductCat(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e] cursor-pointer"
                  >
                    <option value="1">Sông</option>
                    <option value="2">Biển</option>
                    <option value="3">Dã ngoại</option>
                  </select>
                </div>

                {/* Brand Selection */}
                <div className="flex flex-col gap-xs">
                  <label className="font-bold text-on-surface-variant">Thương hiệu *</label>
                  <select
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e] cursor-pointer"
                  >
                    <option value="1">SHIMANO</option>
                    <option value="2">DAIWA</option>
                    <option value="3">ABU GARCIA</option>
                    <option value="4">NATUREHIKE</option>
                  </select>
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-xs col-span-2">
                  <label className="font-bold text-on-surface-variant">Ảnh sản phẩm *</label>
                  
                  {newProductImage ? (
                    <div className="relative group w-full h-44 rounded-xl overflow-hidden border border-outline-variant/30 bg-[#f8f9fa] flex items-center justify-center shadow-sm">
                      <img 
                        src={newProductImage} 
                        alt="Product Preview" 
                        className="h-full w-auto object-contain"
                      />
                      {/* Overlay delete button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Xóa ảnh sản phẩm',
                              message: 'Bạn có chắc muốn xoá ảnh này?',
                              isPrompt: false,
                              onConfirm: () => {
                                setNewProductImage('');
                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="flex items-center gap-xs bg-error hover:bg-error/80 text-white text-label-sm font-bold px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer shadow-ambient border-none"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa ảnh</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#d1d5db] hover:border-[#00288e] rounded-xl p-md flex flex-col items-center justify-center bg-[#f8f9fa] hover:bg-[#f3f4f6] transition-all duration-200 cursor-pointer relative min-h-[140px] text-center text-on-surface">
                      <UploadCloud className="w-8 h-8 text-on-surface-variant/50 mb-xs animate-bounce" />
                      <span className="text-body-sm font-bold text-on-surface-variant">
                        {uploadingImage ? 'Đang tải ảnh lên...' : 'Bấm vào đây để tải ảnh từ máy'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/40 mt-0.5">Hỗ trợ các định dạng ảnh JPG, PNG, WEBP</span>
                      
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;



                          setUploadingImage(true);
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                          try {
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (!res.ok) {
                              const errData = await res.json();
                              throw new Error(errData.error?.message || 'Tải ảnh lên Cloudinary thất bại');
                            }
                            
                            const data = await res.json();
                            setNewProductImage(data.secure_url);
                          } catch (err: any) {
                            alert(err.message || 'Lỗi khi tải ảnh lên Cloudinary.');
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-xs col-span-2">
                  <label className="font-bold text-on-surface-variant">Mô tả ngắn</label>
                  <textarea
                    placeholder="Mô tả sản phẩm..."
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    rows={2}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e] resize-none"
                  />
                </div>

                {/* DIVIDER FOR VARIANT */}
                <div className="col-span-2 border-t border-outline-variant/10 my-1 pt-1">
                  <h4 className="font-bold text-[#1f6c3a] uppercase tracking-wider text-[11px] mb-xs">
                    Thông tin Biến thể sản phẩm (Variant)
                  </h4>
                </div>

                {/* Sku */}
                <div className="flex flex-col gap-xs">
                  <label className="font-bold text-on-surface-variant">Mã SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: WS-ROD-102"
                    value={newVariantSku}
                    onChange={(e) => setNewVariantSku(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e]"
                  />
                </div>

                {/* Variant Name */}
                <div className="flex flex-col gap-xs">
                  <label className="font-bold text-on-surface-variant">Tên biến thể *</label>
                  <input
                    type="text"
                    required
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e]"
                  />
                </div>

                {/* Base Price */}
                <div className="flex flex-col gap-xs">
                  <label className="font-bold text-on-surface-variant">Giá bán (VND) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 1200000"
                    value={newVariantPrice}
                    onChange={(e) => setNewVariantPrice(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e]"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="flex flex-col gap-xs">
                  <label className="font-bold text-on-surface-variant">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    required
                    value={newVariantStock}
                    onChange={(e) => setNewVariantStock(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-[#00288e]"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-md">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-lg py-2 bg-surface-container hover:bg-surface-container-high rounded-md text-on-surface font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-lg py-2 bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-md cursor-pointer transition-colors"
                >
                  {savingProduct ? 'ĐANG LƯU...' : 'LƯU SẢN PHẨM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {approvalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-md md:p-lg text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-sm">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Xác nhận phê duyệt</span>
                <h2 className="text-headline-sm font-black mt-1">Đơn hàng #WS-{approvalOrder.id}</h2>
              </div>
              <button type="button" onClick={() => setApprovalOrder(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-outline">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-sm my-md text-label-sm">
              <div className="bg-slate-50 rounded-xl p-sm">
                <p className="text-on-surface-variant">Khách hàng</p>
                <p className="font-bold">{approvalOrder.recipientName}</p>
                <p>{approvalOrder.recipientPhone}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-sm">
                <p className="text-on-surface-variant">Trạng thái thanh toán</p>
                <p className={`font-extrabold ${approvalOrder.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {approvalOrder.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </p>
                <p>{approvalOrder.paymentMethod === 'PAYOS' ? 'Chuyển khoản PayOS' : 'COD'}</p>
              </div>
            </div>

            <div className="mb-md">
              <label className="text-label-sm font-bold block mb-xs">Gán shipper phụ trách *</label>
              <select
                value={selectedShipperId}
                onChange={(event) => setSelectedShipperId(event.target.value)}
                className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl px-sm py-3 focus:outline-none focus:border-primary"
              >
                <option value="">-- Chọn shipper đang hoạt động --</option>
                {shippers.map((shipper) => (
                  <option key={shipper.id} value={shipper.id}>{shipper.fullname} ({shipper.email})</option>
                ))}
              </select>
              {shippers.length === 0 && <p className="text-[11px] text-error mt-1">Chưa có tài khoản SHIPPER đang hoạt động.</p>}
            </div>

            <div className="border border-outline-variant/20 rounded-xl divide-y divide-outline-variant/10">
              {approvalOrder.items?.map((item: any) => (
                <div key={item.id} className="p-sm flex justify-between gap-sm text-label-sm">
                  <div>
                    <p className="font-bold">{item.productName}</p>
                    <p className="text-[11px] text-on-surface-variant">SL: {item.quantity}</p>
                  </div>
                  <p className="font-bold">{formatPrice((item.soldPrice || 0) * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center py-md border-b border-outline-variant/20">
              <span className="font-black">TỔNG TIỀN HÓA ĐƠN</span>
              <span className="text-headline-sm font-black text-emerald-700">{formatPrice(approvalOrder.totalAmount)}</span>
            </div>

            <div className="flex justify-end gap-sm mt-md">
              <button type="button" onClick={() => setApprovalOrder(null)} className="px-md py-2.5 rounded-xl bg-slate-100 font-bold">Quay lại</button>
              <button type="button" onClick={confirmApproval} disabled={!selectedShipperId} className="px-md py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold">
                XÁC NHẬN PHÊ DUYỆT
              </button>
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
