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
import { userApi, orderApi, getAuthToken } from '../../lib/api';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string;
}

interface Order {
  id: string;
  date: string;
  total: string;
  status: 'Chờ xử lý' | 'Đang giao' | 'Đã giao' | 'Đã hủy';
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
  const [activeTab, setActiveTab] = useState<'account' | 'orders' | 'addresses'>('account');
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

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    orderApi.getMyOrders()
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedOrders = data.map((ord: any) => {
            const total = ord.items ? ord.items.reduce((sum: number, it: any) => sum + (it.soldPrice * it.quantity), 0) : 0;
            return {
              id: ord.id ? ord.id.toString() : 'WS-' + Math.floor(10000 + Math.random() * 90000),
              date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
              total: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total),
              status: (ord.status === 'DELIVERED' ? 'Đã giao' : ord.status === 'CANCELLED' ? 'Đã hủy' : ord.status === 'PENDING' ? 'Chờ xử lý' : 'Đang giao') as 'Chờ xử lý' | 'Đang giao' | 'Đã giao' | 'Đã hủy',
              items: (ord.items || []).map((it: any) => ({
                id: it.id ? it.id.toString() : 'item-' + Math.floor(Math.random() * 1000),
                name: it.productName || 'Sản phẩm dã ngoại',
                price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.soldPrice || 0),
                quantity: it.quantity || 1,
                imageUrl: it.productImage || '/images/product-rod.png',
              }))
            };
          });
          setOrders(mappedOrders);
        }
      })
      .catch((err) => {
        console.error('Error fetching user orders:', err);
      });
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
                              order.status === 'Đã giao' ? 'bg-[#e6f4ea] text-[#137333] border border-[#a8dab5]/30' :
                              order.status === 'Đang giao' ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#adcbf7]/30' :
                              order.status === 'Chờ xử lý' ? 'bg-[#fef7e0] text-[#b06000] border border-[#fde293]/30' :
                              'bg-[#fce8e6] text-[#c5221f] border border-[#f5b4ad]/30'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
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



            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
