'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  Newspaper, 
  Users, 
  Building2, 
  RotateCcw, 
  LogOut, 
  User, 
  Activity,
  Menu,
  X,
  FolderTree,
  Award,
  MessageSquare
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication & Authorization Gate
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('user_session');
      if (!session) {
        window.location.replace('/admin-login');
        return;
      }
      try {
        const user = JSON.parse(session);
        if (user.role !== 'admin') {
          if (user.role === 'kho') window.location.replace('/kho/dashboard');
          else if (user.role === 'shipper') window.location.replace('/shipper/dashboard');
          else window.location.replace('/admin-login');
        } else {
          setUserEmail(user.email);
          setLoading(false);
        }
      } catch (e) {
        localStorage.removeItem('user_session');
        window.location.replace('/admin-login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    window.location.replace('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-md"></div>
          <p className="text-body-md text-on-surface-variant font-semibold">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Sản phẩm', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Danh mục', icon: FolderTree, path: '/admin/categories' },
    { name: 'Thương hiệu', icon: Award, path: '/admin/brands' },
    { name: 'Đơn hàng', icon: FileText, path: '/admin/orders' },
    { name: 'Đánh giá', icon: MessageSquare, path: '/admin/reviews' },
    { name: 'Bài viết Blog', icon: Newspaper, path: '/admin/posts' },
    { name: 'Danh sách User', icon: Users, path: '/admin/users' },
    { name: 'Nhà cung cấp', icon: Building2, path: '/admin/suppliers' },
    { name: 'Đổi trả hàng', icon: RotateCcw, path: '/admin/returns' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-on-surface font-sans flex flex-col lg:flex-row">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="lg:hidden w-full h-16 bg-[#0f172a] text-white px-md flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-label-sm">
            W
          </div>
          <span className="font-bold tracking-tight text-body-lg">WildStream CMS</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-white hover:bg-slate-800 rounded transition-all focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION (Desktop: sticky, Mobile: absolute slideout) */}
      <aside className={`
        fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-[#0f172a] text-slate-300 flex flex-col justify-between z-40 shadow-xl lg:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        h-full lg:h-auto
      `}>
        {/* Upper Sidebar */}
        <div className="flex flex-col flex-grow">
          
          {/* Brand Identity / Logo Header */}
          <div className="h-16 flex items-center px-md border-b border-slate-800 bg-[#020617] gap-xs flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[12px] font-black">
              W
            </div>
            <div className="font-sans text-label-md tracking-tight font-black flex items-baseline">
              <span className="text-white">WildStream</span>
              <span className="text-[#13c2c2] ml-1 text-[10px] font-bold bg-[#13c2c2]/10 px-1 py-0.5 rounded">CMS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-xs space-y-1 mt-md flex-grow overflow-y-auto max-h-[calc(100vh-180px)] lg:max-h-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-sm text-[13px] font-bold py-3 px-md rounded-xl text-left transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar / Profile and Logout */}
        <div className="p-sm border-t border-slate-800 bg-[#020617] space-y-sm flex-shrink-0">
          <div className="flex items-center gap-xs px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-white truncate max-w-[170px]" title={userEmail}>
                {userEmail}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#13c2c2] font-extrabold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Quản trị viên
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-xs bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 font-bold py-2.5 px-md rounded-xl text-[12px] border border-slate-700 hover:border-red-900/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* RIGHT MAIN PANEL */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* DESKTOP TOP STATUS BAR */}
        <header className="hidden lg:flex w-full h-16 bg-white border-b border-slate-200 px-lg items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-xs">
            <Activity className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Môi trường: Production</span>
          </div>
          
          <div className="flex items-center gap-sm">
            <div className="text-[11px] font-sans font-bold text-slate-400">
              Hệ thống Quản lý WildStream E-Commerce • {new Date().toLocaleDateString('vi-VN')}
            </div>
            <div id="notification-bell-slot" className="flex items-center" />
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600" title={userEmail}>
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* CONTENT CHILDREN AREA */}
        <main className="flex-grow p-sm md:p-md lg:p-lg overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
