'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { notificationApi } from '../lib/api';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

export default function ToastAndBell() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('user_session');
      setIsLoggedIn(!!session);
    }
  }, [pathname]);

  const showBell = isLoggedIn && (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/kho') || 
    pathname.startsWith('/shipper') ||
    pathname.startsWith('/profile')
  );

  // Overriding window.alert
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleCustomToast = (e: Event) => {
        const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' }>;
        const { message, type } = customEvent.detail;
        addToast(message, type);
      };

      window.addEventListener('app-toast-trigger', handleCustomToast);

      const originalAlert = window.alert;
      window.alert = (msg: string) => {
        let type: 'success' | 'error' | 'info' = 'info';
        const lower = msg.toLowerCase();
        if (
          lower.includes('thành công') || 
          lower.includes('success') || 
          lower.includes('ok') || 
          lower.includes('đạt') ||
          lower.includes('khôi phục')
        ) {
          type = 'success';
        } else if (
          lower.includes('lỗi') || 
          lower.includes('error') || 
          lower.includes('thất bại') || 
          lower.includes('fail')
        ) {
          type = 'error';
        }

        addToast(msg, type);
      };

      return () => {
        window.alert = originalAlert;
        window.removeEventListener('app-toast-trigger', handleCustomToast);
      };
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadServerNotifications = async () => {
      try {
        const items = await notificationApi.getMine();
        if (Array.isArray(items)) {
          setNotifications(items.map((item: any) => ({
            id: `server-${item.id}`,
            message: item.message,
            type: item.type === 'success' || item.type === 'error' ? item.type : 'info',
            timestamp: item.createdAt
              ? new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
              : '',
            read: Boolean(item.read),
          })));
        }
      } catch (error) {
        console.error('Không thể tải thông báo từ máy chủ:', error);
      }
    };

    loadServerNotifications();
    const intervalId = window.setInterval(loadServerNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, [isLoggedIn, pathname]);

  // Persistent notifications history in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_notifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    localStorage.setItem('app_notifications', JSON.stringify(items));
  };

  const translateAndSimplifyError = (msg: string): string => {
    if (!msg) return 'Đã xảy ra lỗi không xác định.';
    const lower = msg.toLowerCase();
    
    if (lower.includes('failed to fetch') || lower.includes('network error') || lower.includes('net::err_failed')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng internet hoặc liên hệ kỹ thuật viên.';
    }
    if (lower.includes('cors') || lower.includes('access-control-allow-origin')) {
      return 'Phiên đăng nhập đã hết hạn hoặc kết nối bảo mật bị chặn. Vui lòng tải lại trang hoặc đăng nhập lại.';
    }
    if (lower.includes('unauthorized') || lower.includes('401')) {
      return 'Tài khoản hoặc mật khẩu không đúng, hoặc phiên làm việc đã hết hạn.';
    }
    if (lower.includes('forbidden') || lower.includes('403')) {
      return 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên cấp cao.';
    }
    if (lower.includes('not found') || lower.includes('404')) {
      return 'Không tìm thấy dữ liệu yêu cầu trên hệ thống.';
    }
    if (lower.includes('internal server error') || lower.includes('500')) {
      return 'Hệ thống đang gặp sự cố kỹ thuật từ máy chủ. Vui lòng thử lại sau ít phút.';
    }
    if (lower.includes('bad request') || lower.includes('400')) {
      return 'Thông tin yêu cầu không hợp lệ. Vui lòng kiểm tra kỹ lại thông tin đã nhập.';
    }
    if (lower.includes('already exists') || lower.includes('trùng') || lower.includes('duplicate')) {
      return 'Thông tin này đã tồn tại trên hệ thống (ví dụ: email hoặc mã này đã được sử dụng).';
    }
    
    return msg
      .replace(/failed/gi, 'thất bại')
      .replace(/error/gi, 'lỗi')
      .replace(/supplier/gi, 'nhà cung cấp')
      .replace(/product/gi, 'sản phẩm')
      .replace(/order/gi, 'đơn hàng')
      .replace(/user/gi, 'tài khoản')
      .replace(/variant/gi, 'biến thể');
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const translatedMessage = type === 'error' ? translateAndSimplifyError(message) : message;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Add to toasts
    setToasts(prev => [...prev, { id, message: translatedMessage, type }]);

    // Add to notifications history
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newNotif: NotificationItem = {
      id,
      message: translatedMessage,
      type,
      timestamp,
      read: false
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('app_notifications', JSON.stringify(updated));
      return updated;
    });

    // Auto-remove toast after 4s
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    notificationApi.markAllRead().catch(() => undefined);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* FLOATING BELL BUTTON (Styled to look built-in to the right headers) */}
      {showBell && (
        <div className="fixed top-[13px] right-14 lg:right-6 z-[999]" ref={dropdownRef}>
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) markAllAsRead();
            }}
            className="relative p-2 bg-[#00288e]/10 hover:bg-[#00288e]/20 text-[#00288e] rounded-full transition-all focus:outline-none cursor-pointer border border-[#00288e]/20 shadow-sm"
            title="Thông báo"
          >
            {unreadCount > 0 ? (
              <BellRing className="w-5 h-5 text-[#00288e] animate-swing" />
            ) : (
              <Bell className="w-5 h-5 text-[#00288e]" />
            )}

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATIONS HISTORY DROPDOWN PANEL (Light modern styling matching CMS) */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/80 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 text-left font-sans z-[1000]">
              {/* Header */}
              <div className="px-4 py-3 bg-[#00288e]/5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-[#00288e] text-body-md flex items-center gap-1.5">
                  <span>Nhật ký thông báo</span>
                  {notifications.length > 0 && (
                    <span className="text-[11px] bg-[#00288e]/10 text-[#00288e] px-2 py-0.5 rounded-full font-bold">
                      {notifications.length}
                    </span>
                  )}
                </h4>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-red-500 hover:text-red-600 font-bold flex items-center gap-1 hover:underline cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-body-sm font-semibold">Chưa có thông báo nào</p>
                    <p className="text-[11px] mt-0.5">Các thông báo lỗi & thành công sẽ xuất hiện tại đây.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 flex gap-3 items-start transition-colors border-b border-slate-50 ${
                        n.read ? 'bg-white' : 'bg-[#00288e]/5'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {n.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />}
                        {n.type === 'error' && <AlertCircle className="w-4.5 h-4.5 text-red-500" />}
                        {n.type === 'info' && <Info className="w-4.5 h-4.5 text-blue-500" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-body-xs font-semibold text-slate-700 leading-normal break-words">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOASTS CONTAINER (Rectangular, modern style at top-right corner) */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-lg shadow-xl flex items-start gap-3 transform transition-all duration-300 ease-out animate-in slide-in-from-top-5 fade-in text-white ${
              t.type === 'success' 
                ? 'bg-emerald-600 border border-emerald-700' 
                : t.type === 'error'
                  ? 'bg-red-600 border border-red-700'
                  : 'bg-blue-600 border border-blue-700'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-white" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-white" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-white" />}
            </div>
            
            <div className="flex-grow min-w-0">
              <p className="text-body-sm font-bold leading-normal text-left break-words">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-white/80 hover:text-white p-0.5 rounded-full hover:bg-white/10 cursor-pointer transition-colors border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 1s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </>
  );
}
