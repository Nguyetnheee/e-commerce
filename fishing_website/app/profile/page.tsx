'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  User,
  ShoppingBag,
  MapPin,
  Star,
  LogOut,
  Camera,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Mail,
  Phone,
  Eye,
  X,
  Compass,
  BookOpen,
  Heart,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { userApi, orderApi, reviewApi, returnApi, getAuthToken } from '../../lib/api';

interface OrderItem {
  id: string;
  productId: number;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string;
}

interface Order {
  id: string;
  rawStatus: string;
  deliveredAt?: string;
  date: string;
  total: string;
  rawTotal?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  status: string;
  items: OrderItem[];
}

interface Address {
  id: string;
  name: string;
  phone: string;
  detail: string;
  type: 'Nhà riêng' | 'Văn phòng';
  isDefault: boolean;
}

export default function ProfileDashboard() {
  // Tab states: 'account' | 'orders' | 'addresses'
  const [activeTab, setActiveTab] = useState<'account' | 'orders' | 'addresses' | 'my-reviews'>('account');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Profile data states
  const [fullname, setFullname] = useState('Nguyễn Văn A');
  const [phone, setPhone] = useState('0987654321');
  const [email, setEmail] = useState('nguyenvana@example.com');
  const [dob, setDob] = useState('1998-05-15');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [avatarUrl, setAvatarUrl] = useState('/images/user-avatar.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address Book states
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      detail: 'Số 12, Ngõ 34, Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
      type: 'Nhà riêng',
      isDefault: true,
    },
    {
      id: 'addr-2',
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      detail: 'Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội',
      type: 'Văn phòng',
      isDefault: false,
    },
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [addressType, setAddressType] = useState<'Nhà riêng' | 'Văn phòng'>('Nhà riêng');
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  // Mock Order History (defaults, will be overwritten if API returns data)
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryActionOrder, setDeliveryActionOrder] = useState<Order | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reviewItem, setReviewItem] = useState<{ order: Order; item: OrderItem } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // SOP-009 Refund Request State
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundBankName, setRefundBankName] = useState('Vietcombank');
  const [refundBankAccount, setRefundBankAccount] = useState('');
  const [refundBankHolder, setRefundBankHolder] = useState('');

  const submitRefundRequest = async () => {
    if (!refundModalOrder || !refundReason.trim() || !refundBankAccount.trim() || !refundBankHolder.trim()) {
      showToast('Vui lòng nhập đầy đủ lý do và thông tin ngân hàng!', 'error');
      return;
    }
    try {
      setSubmittingAction(true);
      await returnApi.createReturn({
        orderId: String(refundModalOrder.id),
        customerName: fullname || 'Khách hàng',
        productName: refundModalOrder.items?.[0]?.name || 'Đơn hàng WildStream',
        variantId: 1,
        variantSku: 'WS-ORDER-' + refundModalOrder.id,
        quantity: 1,
        reason: refundReason.trim(),
        refundAmount: Number(refundModalOrder.rawTotal || parseInt(refundModalOrder.total?.replace(/\D/g, '') || '0') || 0),
        bankName: refundBankName,
        bankAccount: refundBankAccount.trim(),
        bankHolder: refundBankHolder.trim(),
      });
      setRefundModalOrder(null);
      setRefundReason('');
      setRefundBankAccount('');
      setRefundBankHolder('');
      showToast('Yêu cầu hoàn tiền đã gửi thành công! Tiền sẽ được hoàn trả lại tài khoản của bạn trong vòng từ 24h đến 48h làm việc sau khi Admin duyệt.');
    } catch (err: any) {
      showToast(err.message || 'Không thể gửi yêu cầu hoàn tiền', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const orderStatusLabel = (status: string) => ({
    PENDING: 'Chờ xử lý',
    PACKING: 'Đang đóng gói',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Shipper đã giao - chờ bạn xác nhận',
    DELIVERY_DISPUTED: 'Đang khiếu nại chưa nhận hàng',
    DELIVERY_FAILED: 'Giao hàng không thành công',
    RETURNED: 'Đã trả về kho',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  }[status] || status);

  const reloadOrders = async () => {
    const data = await orderApi.getMyOrders();
    if (!Array.isArray(data)) return;
    setOrders(data.map((ord: any) => ({
      id: String(ord.id),
      rawStatus: ord.status,
      deliveredAt: ord.deliveredAt,
      paymentStatus: ord.paymentStatus,
      paymentMethod: ord.paymentMethod,
      date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('vi-VN') : '',
      total: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
        .format(Number(ord.totalAmount || 0)),
      status: orderStatusLabel(ord.status),
      items: (ord.items || []).map((it: any) => ({
        id: String(it.id),
        productId: Number(it.productId),
        name: it.productName || 'Sản phẩm',
        price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
          .format(Number(it.soldPrice || 0)),
        quantity: it.quantity || 1,
        imageUrl: it.productImage || '/images/product-rod.png',
      })),
    })));
  };

  const loadMyReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewApi.getMyReviews();
      setMyReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading my reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-reviews') {
      loadMyReviews();
    }
  }, [activeTab]);

  // Load data from APIs on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch user profile
    userApi.getProfile()
      .then((data) => {
        setFullname(data.fullname || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setDob(data.dob || '');
        if (data.gender === 'Nam' || data.gender === 'Nữ' || data.gender === 'Khác') {
          setGender(data.gender);
        }
      })
      .catch((err) => {
        console.error('Error fetching user profile:', err);
        showToast('Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại!', 'error');
      });

    // Fetch user orders
    reloadOrders()
      .catch((err) => {
        console.error('Error fetching user orders:', err);
      });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'orders') {
        setActiveTab('orders');
      }
    }
  }, []);

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    userApi.updateProfile({
      fullname,
      phone,
      address: '',
      dob,
      gender
    })
      .then(() => {
        showToast('Lưu thông tin thay đổi thành công!');
      })
      .catch((err) => {
        showToast(err.message || 'Lưu thông tin thất bại!', 'error');
      });
  };

  // Avatar Upload Helper
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          showToast('Cập nhật ảnh đại diện mới thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Re-order Helper
  const handleReorder = (orderId: string) => {
    showToast(`Đã thêm lại tất cả sản phẩm của đơn hàng ${orderId} vào giỏ hàng!`, 'success');
  };

  const confirmReceived = async (order: Order) => {
    try {
      setSubmittingAction(true);
      await orderApi.confirmReceived(order.id);
      setDeliveryActionOrder(null);
      await reloadOrders();
      showToast('Đơn hàng đã hoàn thành. Bạn có thể đánh giá từng sản phẩm.');
    } catch (error: any) {
      // The two-hour auto-confirm job may complete the order between page load
      // and this click. Refresh first so the UI never keeps a stale action button.
      await reloadOrders().catch(() => undefined);
      const message = String(error?.message || '');
      if (message.includes('Chỉ có thể xác nhận đơn đang chờ khách hàng nhận hàng')) {
        setDeliveryActionOrder(null);
        showToast('Đơn hàng này đã được hệ thống cập nhật hoàn thành.', 'info');
      } else {
        showToast(message || 'Không thể xác nhận nhận hàng', 'error');
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  const reportNotReceived = async () => {
    if (!deliveryActionOrder || !reportReason.trim()) {
      showToast('Vui lòng mô tả tình trạng chưa nhận được hàng', 'error');
      return;
    }
    try {
      setSubmittingAction(true);
      await orderApi.reportNotReceived(deliveryActionOrder.id, reportReason.trim());
      setDeliveryActionOrder(null);
      setReportReason('');
      await reloadOrders();
      showToast('Báo cáo đã được gửi đến Admin xử lý', 'info');
    } catch (error: any) {
      showToast(error.message || 'Không thể gửi báo cáo', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const submitReview = async () => {
    if (!reviewItem) return;
    try {
      setSubmittingAction(true);
      const reqBody = {
        orderId: Number(reviewItem.order.id) || 0,
        productId: Number(reviewItem.item.productId),
        rating: reviewRating,
        text: reviewText.trim(),
        images: reviewImages,
      };

      if (editingReview) {
        await reviewApi.updateReview(editingReview.id, reqBody);
        showToast('Cập nhật đánh giá thành công!');
      } else {
        await reviewApi.createReview(reqBody);
        showToast('Đánh giá của bạn đã được lưu thành công!');
      }
      
      setReviewItem(null);
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
      setEditingReview(null);
      
      await reloadOrders();
      if (activeTab === 'my-reviews') {
        await loadMyReviews();
      }
    } catch (error: any) {
      showToast(error.message || 'Không thể lưu đánh giá', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Address Submit (Add/Edit)
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressName || !addressPhone || !addressDetail) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }

    if (editingAddressId) {
      // Edit mode
      setAddresses(prev => prev.map(addr => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            name: addressName,
            phone: addressPhone,
            detail: addressDetail,
            type: addressType,
            isDefault: addressIsDefault ? true : (addr.isDefault ? false : false), // Adjust defaults later
          };
        }
        return addressIsDefault ? { ...addr, isDefault: false } : addr;
      }));

      // If we set default now, handle defaults
      if (addressIsDefault) {
        setAddresses(prev => prev.map(addr => addr.id === editingAddressId ? { ...addr, isDefault: true } : { ...addr, isDefault: false }));
      }

      showToast('Cập nhật địa chỉ thành công!');
    } else {
      // Add mode
      const newId = `addr-${Date.now()}`;
      const newAddress: Address = {
        id: newId,
        name: addressName,
        phone: addressPhone,
        detail: addressDetail,
        type: addressType,
        isDefault: addressIsDefault || addresses.length === 0,
      };

      if (addressIsDefault) {
        setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })).concat(newAddress));
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }

      showToast('Thêm địa chỉ mới thành công!');
    }

    // Reset Address Form
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressName('');
    setAddressPhone('');
    setAddressDetail('');
    setAddressType('Nhà riêng');
    setAddressIsDefault(false);
  };

  // Edit Address trigger
  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressName(addr.name);
    setAddressPhone(addr.phone);
    setAddressDetail(addr.detail);
    setAddressType(addr.type);
    setAddressIsDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  // Delete Address
  const handleDeleteAddress = (id: string) => {
    const target = addresses.find(a => a.id === id);
    if (target?.isDefault && addresses.length > 1) {
      showToast('Không thể xóa địa chỉ mặc định! Vui lòng đặt địa chỉ khác làm mặc định trước.', 'error');
      return;
    }
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    showToast('Xóa địa chỉ thành công!');
  };



  // Mock Logout Action
  const handleLogout = () => {
    setShowLogoutModal(false);
    showToast('Đang đăng xuất khỏi hệ thống...', 'info');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-xs px-md py-sm rounded-xl shadow-lg border text-label-md font-semibold ${
            toast.type === 'success' ? 'bg-[#e6f4ea] text-[#137333] border-[#a8dab5]' :
            toast.type === 'error' ? 'bg-[#fce8e6] text-[#c5221f] border-[#f5b4ad]' :
            'bg-surface-tint/10 text-primary border-primary/20'
          }`}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md md:py-lg">
        
        {/* Layout Grid: Left Sidebar (3 cols) & Main Area (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* LEFT SIDEBAR (3 Columns on Desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-sm">
            
            {/* Sidebar Container */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md shadow-ambient flex flex-col items-center text-center">
              
              {/* Circular Avatar Container with dynamic hover camera overlay */}
              <div className="relative group w-24 h-24 mb-sm rounded-full overflow-hidden border-2 border-primary/10 shadow-sm cursor-pointer" onClick={triggerFileInput}>
                <img 
                  src={avatarUrl} 
                  alt="Ảnh đại diện" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to circular initials or standard placeholder if custom image fails to load
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />

              {/* User greeting */}
              <h2 className="text-body-lg font-bold text-on-surface tracking-tight">
                Chào, {fullname}
              </h2>
              <span className="text-label-sm text-on-surface-variant font-sans mt-0.5 opacity-80">
                Thành viên Bạc
              </span>

              {/* Divider */}
              <div className="w-full border-t border-outline-variant/20 my-md"></div>

              {/* Navigation Links */}
              <nav className="w-full flex flex-col gap-xs">
                {/* Tab: Thông tin tài khoản */}
                <button
                  onClick={() => { setActiveTab('account'); setShowAddressForm(false); }}
                  className={`w-full flex items-center gap-sm px-4 py-3 rounded-xl text-label-md font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === 'account'
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <User className={`w-5 h-5 ${activeTab === 'account' ? 'text-primary' : 'text-outline'}`} />
                  <span className="text-left">Thông tin tài khoản</span>
                </button>

                {/* Tab: Lịch sử đơn hàng */}
                <button
                  onClick={() => { setActiveTab('orders'); setShowAddressForm(false); }}
                  className={`w-full flex items-center gap-sm px-4 py-3 rounded-xl text-label-md font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === 'orders'
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <ShoppingBag className={`w-5 h-5 ${activeTab === 'orders' ? 'text-primary' : 'text-outline'}`} />
                  <span className="text-left">Lịch sử đơn hàng</span>
                </button>

                {/* Tab: Sổ địa chỉ */}
                <button
                  onClick={() => { setActiveTab('addresses'); setShowAddressForm(false); }}
                  className={`w-full flex items-center gap-sm px-4 py-3 rounded-xl text-label-md font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === 'addresses'
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <MapPin className={`w-5 h-5 ${activeTab === 'addresses' ? 'text-primary' : 'text-outline'}`} />
                  <span className="text-left">Sổ địa chỉ</span>
                </button>

                {/* Tab: Đánh giá của tôi */}
                <button
                  onClick={() => { setActiveTab('my-reviews'); setShowAddressForm(false); }}
                  className={`w-full flex items-center gap-sm px-4 py-3 rounded-xl text-label-md font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === 'my-reviews'
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <Star className={`w-5 h-5 ${activeTab === 'my-reviews' ? 'text-primary' : 'text-outline'}`} />
                  <span className="text-left">Đánh giá của tôi</span>
                </button>





                {/* Tab: Đăng xuất */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-sm px-4 py-3 rounded-xl text-label-md font-semibold text-error hover:bg-error/5 transition-all duration-200 focus:outline-none"
                >
                  <LogOut className="w-5 h-5 text-error" />
                  <span className="text-left">Đăng xuất</span>
                </button>
              </nav>

            </div>

          </div>

          {/* MAIN CONTENT AREA (9 Columns on Desktop) */}
          <div className="lg:col-span-9">
            
            {/* White card wrapper */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md sm:p-lg shadow-ambient min-h-[580px]">
              
              {/* TAB 1: THÔNG TIN TÀI KHOẢN (ACCOUNT INFO) */}
              {activeTab === 'account' && (
                <div className="animate-in fade-in duration-300">
                  {/* Header */}
                  <div className="border-b border-outline-variant/20 pb-sm mb-md text-left">
                    <h1 className="text-headline-md font-bold text-primary tracking-tight">
                      Thông tin cá nhân
                    </h1>
                    <p className="text-body-md text-on-surface-variant leading-relaxed mt-1">
                      Quản lý thông tin cá nhân và bảo mật tài khoản
                    </p>
                  </div>

                  {/* Form & Avatar Layout */}
                  <div className="flex flex-col-reverse md:flex-row gap-lg">
                    {/* Input Forms (2-Column Grid) */}
                    <form onSubmit={handleSaveProfile} className="flex-grow space-y-sm text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                        
                        {/* Họ và tên */}
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                            required
                          />
                        </div>

                        {/* Số điện thoại */}
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                            required
                          />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                            required
                          />
                        </div>

                        {/* Ngày sinh */}
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                            Ngày sinh
                          </label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                            required
                          />
                        </div>

                      </div>

                      {/* Gender Selection */}
                      <div className="flex flex-col gap-xs pt-xs">
                        <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                          Giới tính
                        </label>
                        <div className="flex gap-md mt-1">
                          {/* Nam */}
                          <label className="flex items-center gap-xs cursor-pointer select-none font-sans text-body-md text-on-surface">
                            <input
                              type="radio"
                              name="gender"
                              value="Nam"
                              checked={gender === 'Nam'}
                              onChange={() => setGender('Nam')}
                              className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary accent-secondary"
                            />
                            <span>Nam</span>
                          </label>

                          {/* Nữ */}
                          <label className="flex items-center gap-xs cursor-pointer select-none font-sans text-body-md text-on-surface">
                            <input
                              type="radio"
                              name="gender"
                              value="Nữ"
                              checked={gender === 'Nữ'}
                              onChange={() => setGender('Nữ')}
                              className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary accent-secondary"
                            />
                            <span>Nữ</span>
                          </label>

                          {/* Khác */}
                          <label className="flex items-center gap-xs cursor-pointer select-none font-sans text-body-md text-on-surface">
                            <input
                              type="radio"
                              name="gender"
                              value="Khác"
                              checked={gender === 'Khác'}
                              onChange={() => setGender('Khác')}
                              className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary accent-secondary"
                            />
                            <span>Khác</span>
                          </label>
                        </div>
                      </div>

                      {/* Call to Action Button */}
                      <div className="flex justify-end pt-md border-t border-outline-variant/10 mt-md">
                        <button
                          type="submit"
                          className="bg-secondary hover:bg-[#154a28] rounded-md text-white text-label-md font-bold px-6 py-3 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </form>

                    {/* Avatar Upload Column next to the form */}
                    <div className="flex flex-col items-center md:items-start gap-sm w-full md:w-48 flex-shrink-0 text-center md:text-left">
                      <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant w-full">
                        Ảnh đại diện
                      </label>
                      <div className="w-32 h-32 rounded-xl overflow-hidden border border-outline-variant/30 relative bg-surface-container-low shadow-sm">
                        <img 
                          src={avatarUrl} 
                          alt="Thumbnail Avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
                          }}
                        />
                      </div>
                      
                      {/* Ghost Upload Button (1px outline) */}
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="w-32 py-2 px-3 border border-outline-variant/60 hover:border-primary hover:bg-primary/5 rounded-md text-label-sm font-semibold text-on-surface-variant hover:text-primary transition-all duration-200 text-center flex items-center justify-center gap-xs"
                      >
                        <Camera className="w-4 h-4" />
                        Thay đổi
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: LỊCH SỬ ĐƠN HÀNG (ORDER HISTORY) */}
              {activeTab === 'orders' && (
                <div className="animate-in fade-in duration-300">
                  {/* Header */}
                  <div className="border-b border-outline-variant/20 pb-sm mb-md text-left">
                    <h1 className="text-headline-md font-bold text-primary tracking-tight">
                      Lịch sử đơn hàng
                    </h1>
                    <p className="text-body-md text-on-surface-variant leading-relaxed mt-1">
                      Theo dõi tiến độ đơn hàng và mua lại các sản phẩm yêu thích
                    </p>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-md">
                    {orders.map((order) => (
                      <div 
                        key={order.id}
                        className="border border-outline-variant/30 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm transition-all duration-200 hover:border-outline-variant/60"
                      >
                        {/* Order Sub-header */}
                        <div className="bg-surface-container-low px-md py-sm flex flex-wrap gap-sm justify-between items-center border-b border-outline-variant/30 text-left">
                          <div className="flex items-center gap-md">
                            <div>
                              <span className="text-[12px] text-on-surface-variant block uppercase font-bold tracking-wider">
                                Mã đơn hàng
                              </span>
                              <span className="text-label-md font-extrabold text-primary">
                                #{order.id}
                              </span>
                            </div>
                            <div className="border-l border-outline-variant/40 h-8"></div>
                            <div>
                              <span className="text-[12px] text-on-surface-variant block uppercase font-bold tracking-wider">
                                Ngày đặt
                              </span>
                              <span className="text-body-md text-on-surface font-semibold">
                                {order.date}
                              </span>
                            </div>
                          </div>
                          
                          {/* Order Status Badge */}
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-semibold ${
                              order.rawStatus === 'COMPLETED' ? 'bg-[#e6f4ea] text-[#137333] border border-[#a8dab5]/30' :
                              order.rawStatus === 'DELIVERED' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                              order.rawStatus === 'SHIPPING' ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#adcbf7]/30' :
                              order.rawStatus === 'PENDING' ? 'bg-[#fef7e0] text-[#b06000] border border-[#fde293]/30' :
                              'bg-[#fce8e6] text-[#c5221f] border border-[#f5b4ad]/30'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.rawStatus === 'DELIVERED' && order.deliveredAt && (
                          <div className="mx-md mt-md rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800 text-left">
                            <strong>Vui lòng xác nhận nhận hàng trong 2 giờ.</strong>{' '}
                            Nếu không có phản hồi, hệ thống sẽ tự động xác nhận vào{' '}
                            {new Date(new Date(order.deliveredAt).getTime() + 2 * 60 * 60 * 1000).toLocaleString('vi-VN')}.
                          </div>
                        )}

                        {order.rawStatus === 'DELIVERY_FAILED' && order.paymentStatus === 'PAID' && (
                          <div className="mx-md mt-md rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 text-left space-y-1">
                            <strong>⚠️ Giao hàng không thành công:</strong> Do bạn đã thanh toán trước cho đơn hàng này, vui lòng bấm nút <strong>"Yêu cầu hoàn tiền"</strong> bên dưới để gửi thông tin số tài khoản cho Admin duyệt hoàn.
                          </div>
                        )}

                        <div className="p-md divide-y divide-outline-variant/20">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-sm py-sm first:pt-0 last:pb-0 text-left">
                              <div className="w-16 h-20 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/20 flex-shrink-0 flex items-center justify-center">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=256";
                                  }}
                                />
                              </div>
                              <div className="flex-grow flex flex-col justify-between py-1">
                                <div>
                                  <h4 className="text-label-md font-bold text-on-surface line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <span className="text-[13px] text-on-surface-variant">
                                    Số lượng: {item.quantity}
                                  </span>
                                </div>
                                <span className="text-label-md font-semibold text-secondary">
                                  {item.price}
                                </span>
                                {(order.rawStatus === 'COMPLETED' || order.rawStatus === 'DELIVERED') && (
                                  <button
                                    type="button"
                                    onClick={() => setReviewItem({ order, item })}
                                    className="mt-2 w-fit px-3 py-1.5 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50 text-label-sm font-semibold"
                                  >
                                    Đánh giá sản phẩm
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="border-t border-outline-variant/20 px-md py-sm bg-surface-container-low/30 flex justify-between items-center">
                          <div>
                            <span className="text-body-md text-on-surface-variant font-medium">Tổng tiền:</span>
                            <span className="text-body-lg font-bold text-[#e05600] ml-xs">{order.total}</span>
                          </div>
                          <div className="flex gap-xs">
                            {order.rawStatus === 'DELIVERED' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { setDeliveryActionOrder(order); setReportReason(''); }}
                                  className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-md text-label-sm font-semibold"
                                >
                                  Tôi chưa nhận được hàng
                                </button>
                                <button
                                  type="button"
                                  onClick={() => confirmReceived(order)}
                                  disabled={submittingAction}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md text-label-sm font-semibold text-white"
                                >
                                  Đã nhận được hàng
                                </button>
                              </>
                            )}
                            {(order.rawStatus === 'COMPLETED' || order.rawStatus === 'DELIVERED') && (
                              <button
                                type="button"
                                onClick={() => setRefundModalOrder(order)}
                                className="px-3 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-label-sm font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                Đổi trả / Hoàn tiền (SOP-009)
                              </button>
                            )}
                            {order.rawStatus === 'DELIVERY_FAILED' && order.paymentStatus === 'PAID' && (
                              <button
                                type="button"
                                onClick={() => setRefundModalOrder(order)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-label-sm font-semibold cursor-pointer transition-colors"
                              >
                                Yêu cầu hoàn tiền
                              </button>
                            )}
                            <button
                              type="button"
                              className="px-4 py-2 border border-outline-variant/60 hover:border-primary hover:bg-primary/5 rounded-md text-label-sm font-semibold text-on-surface-variant hover:text-primary transition-all duration-200"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorder(order.id)}
                              className="px-4 py-2 bg-primary hover:bg-[#1e40af] rounded-md text-label-sm font-semibold text-white transition-all duration-200 shadow-sm"
                            >
                              Mua lại
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SỔ ĐỊA CHỈ (ADDRESS BOOK) */}
              {activeTab === 'addresses' && (
                <div className="animate-in fade-in duration-300">
                  
                  {/* Address List Screen */}
                  {!showAddressForm ? (
                    <div>
                      {/* Header */}
                      <div className="border-b border-outline-variant/20 pb-sm mb-md flex justify-between items-center text-left">
                        <div>
                          <h1 className="text-headline-md font-bold text-primary tracking-tight">
                            Sổ địa chỉ
                          </h1>
                          <p className="text-body-md text-on-surface-variant leading-relaxed mt-1">
                            Lưu và cập nhật địa chỉ giao nhận hàng của bạn
                          </p>
                        </div>
                        
                        {/* Add New Address Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddressId(null);
                            setAddressName('');
                            setAddressPhone('');
                            setAddressDetail('');
                            setAddressType('Nhà riêng');
                            setAddressIsDefault(false);
                            setShowAddressForm(true);
                          }}
                          className="bg-primary hover:bg-[#1e40af] rounded-md text-white text-label-sm font-semibold px-4 py-2.5 flex items-center gap-xs transition-all duration-200 shadow-sm focus:outline-none"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm địa chỉ
                        </button>
                      </div>

                      {/* Addresses List Container */}
                      <div className="space-y-sm">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            className={`border rounded-2xl p-md flex flex-col sm:flex-row justify-between items-start gap-md text-left transition-all duration-200 ${
                              addr.isDefault 
                                ? 'bg-primary/5 border-primary/40' 
                                : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60'
                            }`}
                          >
                            <div className="space-y-xs">
                              {/* Header Title with Custom Badges */}
                              <div className="flex items-center flex-wrap gap-xs">
                                <span className="text-body-md font-bold text-on-surface">
                                  {addr.name}
                                </span>
                                <span className="border-l border-outline-variant/40 h-4 mx-xs"></span>
                                <span className="text-body-md font-semibold text-on-surface-variant flex items-center gap-[4px]">
                                  <Phone className="w-3.5 h-3.5 text-outline" /> {addr.phone}
                                </span>

                                <span className="ml-xs inline-block text-[11px] px-2 py-0.5 font-bold uppercase tracking-wider rounded bg-surface-container text-on-surface-variant">
                                  {addr.type}
                                </span>

                                {addr.isDefault && (
                                  <span className="inline-block text-[11px] px-2 py-0.5 font-bold uppercase tracking-wider rounded bg-[#a4f1b2] text-[#24703e]">
                                    Mặc định
                                  </span>
                                )}
                              </div>

                              {/* Detail Address Text */}
                              <p className="text-body-md text-on-surface-variant leading-relaxed">
                                {addr.detail}
                              </p>
                            </div>

                            {/* Action Options */}
                            <div className="flex sm:flex-col items-end gap-xs w-full sm:w-auto flex-shrink-0 pt-sm sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 justify-end">
                              <button
                                type="button"
                                onClick={() => handleEditAddress(addr)}
                                className="px-3 py-1.5 hover:bg-primary/5 hover:text-primary rounded-md text-label-sm font-semibold text-on-surface-variant transition-colors flex items-center gap-[4px]"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="px-3 py-1.5 hover:bg-error/5 hover:text-error rounded-md text-label-sm font-semibold text-outline transition-colors flex items-center gap-[4px]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Address Form Screen */
                    <div className="animate-in slide-in-from-right duration-300">
                      {/* Header */}
                      <div className="border-b border-outline-variant/20 pb-sm mb-md flex justify-between items-center text-left">
                        <div>
                          <h1 className="text-headline-md font-bold text-primary tracking-tight">
                            {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ giao hàng mới'}
                          </h1>
                          <p className="text-body-md text-on-surface-variant leading-relaxed mt-1">
                            Vui lòng điền thông tin chi tiết chính xác để hỗ trợ vận chuyển nhanh chóng
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                          }}
                          className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                          aria-label="Đóng"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Add/Edit Form */}
                      <form onSubmit={handleAddressSubmit} className="space-y-sm text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                          {/* Họ tên người nhận */}
                          <div className="flex flex-col gap-xs">
                            <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                              Họ tên người nhận
                            </label>
                            <input
                              type="text"
                              value={addressName}
                              onChange={(e) => setAddressName(e.target.value)}
                              placeholder="Nguyễn Văn A"
                              className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                              required
                            />
                          </div>

                          {/* Số điện thoại người nhận */}
                          <div className="flex flex-col gap-xs">
                            <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                              Số điện thoại nhận hàng
                            </label>
                            <input
                              type="tel"
                              value={addressPhone}
                              onChange={(e) => setAddressPhone(e.target.value)}
                              placeholder="09xxxxxxxx"
                              className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                              required
                            />
                          </div>
                        </div>

                        {/* Địa chỉ chi tiết */}
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                            Địa chỉ nhận hàng chi tiết
                          </label>
                          <input
                            type="text"
                            value={addressDetail}
                            onChange={(e) => setAddressDetail(e.target.value)}
                            placeholder="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            className="bg-surface-container-low border border-outline-variant/40 rounded-md py-2.5 px-3.5 text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                            required
                          />
                        </div>

                        {/* Loại địa chỉ & Trạng thái Mặc định */}
                        <div className="flex flex-col sm:flex-row gap-md sm:items-center justify-between pt-xs">
                          <div className="flex flex-col gap-xs">
                            <label className="text-label-md uppercase tracking-wider font-semibold text-on-surface-variant">
                              Loại địa chỉ
                            </label>
                            <div className="flex gap-sm mt-1">
                              <label className="flex items-center gap-xs cursor-pointer select-none text-body-md text-on-surface">
                                <input
                                  type="radio"
                                  name="addressType"
                                  value="Nhà riêng"
                                  checked={addressType === 'Nhà riêng'}
                                  onChange={() => setAddressType('Nhà riêng')}
                                  className="w-4 h-4 text-secondary accent-secondary focus:ring-secondary"
                                />
                                <span>Nhà riêng</span>
                              </label>
                              <label className="flex items-center gap-xs cursor-pointer select-none text-body-md text-on-surface">
                                <input
                                  type="radio"
                                  name="addressType"
                                  value="Văn phòng"
                                  checked={addressType === 'Văn phòng'}
                                  onChange={() => setAddressType('Văn phòng')}
                                  className="w-4 h-4 text-secondary accent-secondary focus:ring-secondary"
                                />
                                <span>Văn phòng</span>
                              </label>
                            </div>
                          </div>

                          {/* Default check button */}
                          <label className="flex items-center gap-xs cursor-pointer select-none text-body-md text-on-surface sm:mt-6">
                            <input
                              type="checkbox"
                              checked={addressIsDefault}
                              onChange={(e) => setAddressIsDefault(e.target.checked)}
                              disabled={editingAddressId !== null && addresses.find(a => a.id === editingAddressId)?.isDefault}
                              className="w-4 h-4 rounded border-outline-variant text-secondary accent-secondary focus:ring-secondary"
                            />
                            <span className={editingAddressId !== null && addresses.find(a => a.id === editingAddressId)?.isDefault ? 'opacity-50 text-[13px]' : 'text-[13px]'}>
                              Đặt làm địa chỉ nhận hàng mặc định
                            </span>
                          </label>
                        </div>

                        {/* Form Buttons */}
                        <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/10 mt-md">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddressId(null);
                            }}
                            className="px-5 py-2.5 border border-outline-variant/60 hover:bg-surface-container-low rounded-md text-label-sm font-semibold text-on-surface-variant transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="bg-secondary hover:bg-[#154a28] rounded-md text-white text-label-sm font-bold px-5 py-2.5 transition-all duration-200 shadow-sm focus:outline-none"
                          >
                            Lưu thông tin
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                </div>
              )}

              {activeTab === 'my-reviews' && (
                <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-sm">
                  <div>
                    <h2 className="text-headline-sm font-black text-on-surface">Đánh giá của tôi</h2>
                    <p className="text-body-sm text-on-surface-variant mt-1">Xem, chỉnh sửa hoặc xóa các đánh giá sản phẩm của bạn.</p>
                  </div>

                  {loadingReviews ? (
                    <p className="text-sm text-on-surface-variant animate-pulse">Đang tải danh sách đánh giá...</p>
                  ) : myReviews.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">Bạn chưa gửi đánh giá nào.</p>
                  ) : (
                    <div className="space-y-4">
                      {myReviews.map((rev) => (
                        <div key={rev.id} className="border border-outline-variant/20 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-on-surface">Sản phẩm #{rev.productId}</h4>
                              <div className="flex text-amber-500 my-1">
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-outline">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{rev.text}</p>
                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-1.5 mt-2">
                              {rev.images.map((img: string, idx: number) => (
                                <img key={idx} src={img} alt="review" className="w-14 h-14 object-cover rounded-lg border shadow-xs" />
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2 justify-end">
                            <button
                              onClick={() => {
                                const item = {
                                  id: String(rev.id),
                                  productId: rev.productId,
                                  name: `Sản phẩm #${rev.productId}`
                                };
                                const order = {
                                  id: String(rev.orderId || '')
                                };
                                setEditingReview(rev);
                                setReviewRating(rev.rating);
                                setReviewText(rev.text || '');
                                setReviewImages(rev.images || []);
                                setReviewItem({ order: order as any, item: item as any });
                              }}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                                  try {
                                    await reviewApi.deleteReview(rev.id);
                                    showToast('Xóa đánh giá thành công!');
                                    loadMyReviews();
                                  } catch (error: any) {
                                    showToast(error.message || 'Lỗi khi xóa đánh giá', 'error');
                                  }
                                }
                              }}
                              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}



            </div>

          </div>

        </div>

      </main>

      {deliveryActionOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-left">
            <h2 className="text-xl font-bold text-on-surface">Báo cáo chưa nhận được hàng</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Đơn #{deliveryActionOrder.id} đã được shipper đánh dấu đã giao. Báo cáo này sẽ chuyển đơn sang trạng thái chờ Admin xử lý.
            </p>
            <textarea
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Ví dụ: Tôi chưa nhận được kiện hàng, shipper chưa liên hệ..."
              className="mt-4 w-full border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeliveryActionOrder(null)} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Hủy</button>
              <button disabled={submittingAction || !reportReason.trim()} onClick={reportNotReceived} className="px-4 py-2 rounded-lg bg-red-600 disabled:opacity-50 text-white font-semibold">Gửi báo cáo</button>
            </div>
          </div>
        </div>
      )}

      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-left">
            <h2 className="text-xl font-bold text-on-surface">Đánh giá {reviewItem.item.name}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Đánh giá được lưu theo đơn hàng #{reviewItem.order.id}.</p>
            <div className="flex gap-1 my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`${star} sao`}>
                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              className="w-full border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
            />

            {/* Real Review Image Upload */}
            <div className="my-4 text-left">
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Hình ảnh thực tế (Tối đa 3 ảnh)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    const fileList = Array.from(files).slice(0, 3);
                    const base64Promises = fileList.map(file => {
                      return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          resolve(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      });
                    });
                    Promise.all(base64Promises).then(results => {
                      setReviewImages(results);
                    });
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              
              {reviewImages.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {reviewImages.map((img, index) => (
                    <div key={index} className="relative w-16 h-16 border rounded-lg overflow-hidden group shadow-xs">
                      <img src={img} alt="review preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== index))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 border-none cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setReviewItem(null);
                  setEditingReview(null);
                  setReviewImages([]);
                }} 
                className="px-4 py-2 rounded-lg bg-slate-100 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button disabled={submittingAction} onClick={submitReview} className="px-4 py-2 rounded-lg bg-primary disabled:opacity-50 text-white font-semibold cursor-pointer border-none">Lưu đánh giá</button>
            </div>
          </div>
        </div>
      )}

      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Quy trình SOP-009 — Đổi trả & Hoàn tiền
                </span>
                <h2 className="text-xl font-black text-on-surface mt-1">Yêu cầu hoàn tiền đơn hàng #{refundModalOrder.id}</h2>
              </div>
              <button onClick={() => setRefundModalOrder(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">1. Lý do đổi trả / hoàn tiền <span className="text-red-600">*</span></label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="Mô tả lý do đổi trả (ví dụ: hàng hư hỏng do vận chuyển, sai sản phẩm...)"
                className="w-full border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                2. Thông tin Tài khoản Ngân hàng nhận hoàn tiền (SOP-009)
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">Tên Ngân hàng</label>
                <select
                  value={refundBankName}
                  onChange={(e) => setRefundBankName(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold text-on-surface"
                >
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="MB Bank">MB Bank</option>
                  <option value="ACB">ACB</option>
                  <option value="VPBank">VPBank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="VietinBank">VietinBank</option>
                  <option value="Agribank">Agribank</option>
                  <option value="TPBank">TPBank</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Số tài khoản <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={refundBankAccount}
                    onChange={(e) => setRefundBankAccount(e.target.value)}
                    placeholder="VD: 0071001234567"
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Tên chủ tài khoản <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={refundBankHolder}
                    onChange={(e) => setRefundBankHolder(e.target.value)}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left">
              <strong>* Thời gian xử lý hoàn tiền:</strong> Yêu cầu hoàn tiền sẽ được hệ thống xử lý và chuyển khoản lại vào tài khoản ngân hàng của bạn trong vòng từ <strong>24h đến 48h làm việc</strong> sau khi Admin phê duyệt.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setRefundModalOrder(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-sm">Hủy</button>
              <button
                disabled={submittingAction || !refundReason.trim() || !refundBankAccount.trim() || !refundBankHolder.trim()}
                onClick={submitRefundRequest}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm cursor-pointer"
              >
                {submittingAction ? 'Đang gửi...' : 'Xác nhận gửi Yêu cầu SOP-009'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
