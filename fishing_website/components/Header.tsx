'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X, LogIn, UserPlus, ClipboardList, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cartApi, getAuthToken } from '../lib/api';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Sông');

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      title: 'Đơn hàng giao thất bại ⚠️',
      message: 'Đơn hàng #WS-12 giao không thành công. Vui lòng bấm để gửi yêu cầu hoàn tiền chuyển khoản.',
      link: '/profile?tab=orders',
      type: 'warning',
      isUnread: true,
      time: 'Mới đây'
    },
    {
      id: 2,
      title: 'Đơn hàng đã được giao 🎉',
      message: 'Đơn hàng #WS-11 đã giao hàng thành công. Hãy bấm để gửi đánh giá cho sản phẩm nhé!',
      link: '/profile?tab=orders',
      type: 'success',
      isUnread: true,
      time: '1 giờ trước'
    },
    {
      id: 3,
      title: 'Chào mừng cần thủ! 🎣',
      message: 'Chào mừng bạn đến với WildStream Gear! Hãy khám phá các trang bị dã ngoại & câu cá chuyên nghiệp.',
      link: '/category#camping',
      type: 'info',
      isUnread: false,
      time: '1 ngày trước'
    }
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const loadHeaderState = () => {
    if (typeof window === 'undefined') return;
    
    // Check login state
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setIsLoggedIn(true);
        setUserEmail(parsed.email || '');
      } catch (e) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }

    // Check cart count
    const token = getAuthToken();
    if (token) {
      cartApi.getCart()
        .then((data) => {
          if (Array.isArray(data)) {
            const count = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
            setCartCount(count);
          }
        })
        .catch((err) => {
          console.error('Error fetching cart in header:', err);
        });
    } else {
      const local = localStorage.getItem('cart');
      if (local) {
        try {
          const items = JSON.parse(local);
          if (Array.isArray(items)) {
            const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            setCartCount(count);
          }
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    }
  };

  useEffect(() => {
    loadHeaderState();

    // Listen to changes to keep count updated if pages modify it locally
    const handleCartUpdate = () => {
      loadHeaderState();
    };
    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('authSessionExpired', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('authSessionExpired', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setIsLoggedIn(false);
    setUserEmail('');
    setCartCount(0);
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Biển', href: '/category#sea' },
    { label: 'Sông', href: '/category#river' },
    { label: 'Hồ', href: '/category#lake' },
    { label: 'Cắm trại', href: '/category#camping' },
    { label: 'Khám phá', href: '/blog' },
    { label: 'Giới thiệu', href: '#about' },
  ];

  // Auto-set active tab based on pathname and hash
  useEffect(() => {
    const handleHashAndPath = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      
      if (pathname === '/category') {
        if (hash === 'sea') {
          setActiveTab('Biển');
        } else if (hash === 'lake') {
          setActiveTab('Hồ');
        } else if (hash === 'camping') {
          setActiveTab('Cắm trại');
        } else {
          setActiveTab('Sông');
        }
      } else if (pathname === '/') {
        setActiveTab('Trang chủ');
      } else if (pathname === '/blog') {
        setActiveTab('Khám phá');
      } else {
        setActiveTab('');
      }
    };

    handleHashAndPath();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashAndPath);
      return () => window.removeEventListener('hashchange', handleHashAndPath);
    }
  }, [pathname]);

  return (
    <header className="relative w-full h-20 bg-surface-container-lowest border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop transition-all duration-300 z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <a href="/" className="font-sans text-body-lg md:text-headline-md tracking-tight font-extrabold text-primary select-none focus-visible:outline-none">
            WildStream Gear
          </a>
        </div>

        {/* Center Desktop Navigation with Bottom Blue Active Line */}
        <nav className="hidden md:flex items-center h-full gap-md">
          {navLinks.map((link) => {
            const isActive = activeTab === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  setActiveTab(link.label);
                }}
                className={`relative flex items-center h-full px-xs font-sans text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 focus-visible:outline-none`}
              >
                {/* Blue border line at the bottom of active tab */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                )}
                <span className={isActive ? 'text-primary font-bold' : ''}>
                  {link.label}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Right Search and Actions */}
        <div className="flex items-center gap-sm md:gap-md">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm trang bị..."
              className="bg-surface-container-low border border-outline-variant/40 rounded-full py-2 pl-4 pr-10 text-label-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 lg:w-64 transition-all duration-200"
            />
            <Search className="w-4 h-4 text-outline absolute right-3 top-2.5 cursor-pointer hover:text-primary transition-colors" />
          </div>

          {/* Cart Icon with Orange Badge (Matches Mockup) */}
          <a 
            href="/cart"
            className="p-2 rounded-full hover:bg-surface-container text-on-surface hover:text-primary transition-all duration-200 focus-visible:outline-primary relative block"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 bg-accent-orange text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-sans font-bold shadow-sm leading-none">
              {cartCount}
            </span>
          </a>

          {/* Notification Bell Icon & Dropdown */}
          <div className="relative flex items-center" ref={notifRef}>
            <button 
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-full hover:bg-surface-container text-on-surface hover:text-primary transition-all duration-200 focus-visible:outline-primary relative group ${isNotifOpen ? 'bg-surface-container text-primary' : ''}`}
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              {notifications.some(n => n.isUnread) && (
                <span className="absolute top-1.5 right-1.5 bg-red-600 w-2 h-2 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                <div className="px-4 pb-2 border-b border-outline-variant/20 flex justify-between items-center">
                  <h4 className="text-label-md font-extrabold text-on-surface uppercase tracking-wide">Thông báo</h4>
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
                    }}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-outline-variant/10">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-label-sm text-on-surface-variant font-medium">
                      Không có thông báo mới nào
                    </div>
                  ) : (
                    notifications.map(n => (
                      <a 
                        key={n.id}
                        href={n.link}
                        onClick={() => {
                          setIsNotifOpen(false);
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isUnread: false } : item));
                        }}
                        className={`block p-3 hover:bg-slate-50 transition-colors duration-150 ${n.isUnread ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-xs">
                          <span className="text-xs font-bold text-on-surface">{n.title}</span>
                          <span className="text-[10px] text-outline whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">{n.message}</p>
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Icon with Dropdown Menu */}
          <div className="relative flex items-center" ref={userMenuRef}>
            <button 
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`p-2 rounded-full hover:bg-surface-container text-on-surface hover:text-primary transition-all duration-200 focus-visible:outline-primary ${isUserMenuOpen ? 'bg-surface-container text-primary' : ''}`}
              aria-label="Tài khoản"
              aria-expanded={isUserMenuOpen}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-outline-variant/30 rounded-xl shadow-ambient py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {isLoggedIn && (
                  <div className="px-4 py-2 border-b border-outline-variant/20 text-left">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Tài khoản</p>
                    <p className="text-[11px] font-semibold text-on-surface truncate mt-0.5">{userEmail}</p>
                  </div>
                )}
                
                <a
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-xs px-4 py-2.5 text-label-sm text-on-surface-variant hover:text-[#00288e] hover:bg-surface-container-low transition-colors duration-150 cursor-pointer font-sans font-bold"
                >
                  <User className="w-4 h-4 text-outline" />
                  Trang cá nhân
                </a>
                <a
                  href="/order-tracking"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-xs px-4 py-2.5 text-label-sm text-on-surface-variant hover:text-[#00288e] hover:bg-surface-container-low transition-colors duration-150 cursor-pointer font-sans font-bold"
                >
                  <ClipboardList className="w-4 h-4 text-outline" />
                  Theo dõi đơn hàng
                </a>
                
                <div className="border-t border-outline-variant/20 my-1"></div>
                
                {!isLoggedIn ? (
                  <>
                    <a
                      href="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-xs px-4 py-2.5 text-label-sm text-on-surface-variant hover:text-[#00288e] hover:bg-surface-container-low transition-colors duration-150 cursor-pointer font-sans font-bold"
                    >
                      <LogIn className="w-4 h-4 text-outline" />
                      Đăng nhập
                    </a>
                    <a
                      href="/register"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-xs px-4 py-2.5 text-label-sm text-on-surface-variant hover:text-[#00288e] hover:bg-surface-container-low transition-colors duration-150 cursor-pointer font-sans font-bold"
                    >
                      <UserPlus className="w-4 h-4 text-outline" />
                      Đăng ký
                    </a>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-xs px-4 py-2.5 text-label-sm text-error hover:bg-red-50 transition-colors duration-150 cursor-pointer font-sans font-bold"
                  >
                    <LogIn className="w-4 h-4 text-error" />
                    Đăng xuất
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-surface-container text-on-surface hover:text-primary transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Trình đơn di động"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface-container-lowest border-b border-outline-variant/30 shadow-lg px-margin-mobile py-sm z-40 transition-all duration-200">
          {/* Mobile Search */}
          <div className="relative mb-sm">
            <input
              type="text"
              placeholder="Tìm kiếm trang bị..."
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-full py-2 pl-4 pr-10 text-label-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none"
            />
            <Search className="w-4 h-4 text-outline absolute right-3 top-2.5" />
          </div>
          <nav className="flex flex-col gap-sm py-xs">
            {navLinks.map((link) => {
              const isActive = activeTab === link.label;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-body-md py-2 px-3 rounded-md hover:bg-surface-container transition-all duration-200 font-sans ${
                    isActive ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant'
                  }`}
                  onClick={() => {
                    setActiveTab(link.label);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
              );
            })}
            
            {/* Mobile User Section */}
            <div className="border-t border-outline-variant/20 my-2 pt-2">
              <a
                href="/profile"
                className="flex items-center gap-sm text-body-md py-2 px-3 rounded-md hover:bg-surface-container transition-all duration-200 font-sans text-on-surface-variant hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 text-outline" />
                Trang cá nhân
              </a>
              <a
                href="/order-tracking"
                className="flex items-center gap-sm text-body-md py-2 px-3 rounded-md hover:bg-surface-container transition-all duration-200 font-sans text-on-surface-variant hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ClipboardList className="w-5 h-5 text-outline" />
                Theo dõi đơn hàng
              </a>
              <div className="border-t border-outline-variant/10 my-2"></div>
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-sm px-3 pt-1">
                  <a
                    href="/login"
                    className="text-center text-label-md font-bold py-2 bg-surface-container rounded-md text-on-surface hover:bg-primary/10 transition-colors duration-150"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </a>
                  <a
                    href="/register"
                    className="text-center text-label-md font-bold py-2 bg-[#00288e] text-white rounded-md hover:bg-[#1e40af] transition-colors duration-150"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-sm px-3 pt-1">
                  <span className="text-[11px] font-semibold text-on-surface-variant break-all">Tài khoản: {userEmail}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center text-label-md font-bold py-2 bg-red-50 text-error border border-red-100 rounded-md hover:bg-red-100 transition-colors duration-150 cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
