'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authApi, setSession } from '../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Floating label active states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Auto-redirect if already logged in as staff
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('user_session');
      if (session) {
        try {
          const user = JSON.parse(session);
          if (user.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (user.role === 'kho') {
            router.push('/kho/dashboard');
          } else if (user.role === 'shipper') {
            router.push('/shipper/dashboard');
          }
        } catch (e) {
          localStorage.removeItem('user_session');
        }
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailOrPhone || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin đăng nhập!');
      return;
    }

    setLoading(true);

    authApi.adminLogin({
      email: emailOrPhone,
      password,
    })
      .then((data) => {
        setLoading(false);
        
        const normalizedEmail = emailOrPhone.trim().toLowerCase();
        let role = '';
        let displayRoleName = '';
        let redirectUrl = '';

        if (normalizedEmail.includes('kho') || normalizedEmail.includes('warehouse') || data.role === 'MANAGER') {
          role = 'kho';
          displayRoleName = 'Quản lý Kho';
          redirectUrl = '/kho/dashboard';
        } else if (normalizedEmail.includes('shipper') || normalizedEmail.includes('delivery') || data.role === 'USER') {
          role = 'shipper';
          displayRoleName = 'Nhân viên Giao hàng';
          redirectUrl = '/shipper/dashboard';
        } else {
          role = 'admin';
          displayRoleName = 'Quản trị viên';
          redirectUrl = '/admin/dashboard';
        }

        setSuccessMsg(`Đăng nhập thành công với vai trò: ${displayRoleName}! Đang chuyển hướng...`);
        setSession(data.email, data.token, role);

        // Redirect to the corresponding dashboard after a short delay
        setTimeout(() => {
          router.push(redirectUrl);
        }, 800);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMsg(error.message || 'Tài khoản không thuộc quyền quản trị của nhân sự hệ thống!');
      });
  };

  return (
    <div className="min-h-screen flex bg-background text-on-surface font-sans">
      {/* LEFT COLUMN: Beautiful Scenic Misty Mountain Forest Background Image */}
      <div
        className="hidden lg:block lg:w-1/2 relative bg-cover bg-center min-h-screen"
        style={{ backgroundImage: `url('/images/login_banner.png')` }}
      >
        {/* Dark overlay for rich depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00288e]/20 to-black/30 pointer-events-none" />

        {/* Subtle decorative bottom badge */}
        <div className="absolute bottom-12 left-12 right-12 text-white bg-black/30 backdrop-blur-md p-md rounded-xl border border-white/10">
          <p className="text-label-sm uppercase tracking-widest text-[#a8b8ff] font-semibold mb-1">
            WildStream Gear
          </p>
          <h3 className="text-headline-md font-bold leading-tight">
            "Hành trình vạn dặm khởi đầu từ trang bị hoàn hảo."
          </h3>
        </div>
      </div>

      {/* RIGHT COLUMN: Pure White container with Staff Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-sm md:p-lg bg-white min-h-screen relative z-10">
        {/* Spacer for vertical centering */}
        <div className="hidden md:block" />

        {/* Center Card */}
        <div className="w-full max-w-md mx-auto py-md flex flex-col justify-center">

          {/* LOGO SECTION: SVG circle logo matching mockup */}
          <div className="flex items-center gap-xs mb-md justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-full bg-[#00288e] flex items-center justify-center text-white shadow-md relative overflow-hidden">
              <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 68 L42 38 L54 54 L68 32 L82 68 Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M42 38 L50 49 L46 51 Z" fill="#d1d5db" opacity="0.4" />
              </svg>
            </div>
            <div className="flex items-baseline font-sans text-headline-md tracking-tight font-extrabold select-none">
              <span className="text-[#00288e]">WildStream</span>
              <span className="text-[#1f6c3a] ml-1 font-medium text-body-lg">Gear</span>
            </div>
          </div>

          {/* HEADINGS */}
          <div className="text-center lg:text-left mb-md">
            <h1 className="text-headline-md font-bold text-[#00288e] tracking-tight leading-tight mb-2">
              Đăng nhập Nhân viên Hệ thống
            </h1>
            <p className="text-body-md text-on-surface-variant/80 tracking-wide leading-relaxed font-sans">
              Trang đăng nhập dành riêng cho Admin, Bộ phận Kho và Đối tác vận chuyển. Vui lòng nhập tài khoản nhân sự được cấp để tiếp tục.
            </p>
          </div>

          {/* Error and Success Notifications */}
          {errorMsg && (
            <div className="mb-md bg-error-container text-on-error-container border border-error/20 p-xs rounded-md text-label-sm flex items-start gap-xs animate-shake">
              <span className="w-2.5 h-2.5 bg-error rounded-full mt-1.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-md bg-secondary-container text-on-secondary-container border border-secondary/20 p-xs rounded-md text-label-sm flex items-start gap-xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-md">

            {/* Input 1: Tên đăng nhập / Email */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="emailOrPhone"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Tên đăng nhập / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`block w-full px-4 py-3 text-body-md text-on-surface bg-white rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#00288e] ${emailFocused
                    ? 'border-[#00288e] ring-1 ring-[#00288e]'
                    : 'border-outline-variant/60 hover:border-outline'
                    }`}
                  required
                />
                <div className="absolute right-3.5 top-3 text-outline-variant">
                  <UserIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Input 2: Mật khẩu */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`block w-full px-4 py-3 text-body-md text-on-surface bg-white rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#00288e] ${passwordFocused
                    ? 'border-[#00288e] ring-1 ring-[#00288e]'
                    : 'border-outline-variant/60 hover:border-outline'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-outline-variant hover:text-[#00288e] transition-colors cursor-pointer border-none bg-transparent"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Actions: Remember Me */}
            <div className="flex items-center justify-between pt-xs text-label-sm">
              <label className="flex items-center gap-xs cursor-pointer select-none text-on-surface-variant/80 hover:text-on-surface">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00288e] border-outline-variant focus:ring-[#00288e] transition-colors cursor-pointer"
                />
                <span className="font-semibold">Duy trì đăng nhập</span>
              </label>
            </div>

            {/* Submit Button (Ocean Blue with Right Arrow) */}
            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-lg py-3.5 px-md flex items-center justify-center gap-xs shadow-ambient hover:shadow-ambient-hover transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00288e]/40 active:scale-[0.99]"
              >
                <span>{loading ? 'ĐANG XỬ LÝ...' : 'Đăng nhập'}</span>
                {!loading && <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />}
              </button>
            </div>

          </form>



        </div>

        {/* COPYRIGHT FOOTER */}
        <div className="py-xs text-center text-label-sm text-on-surface-variant/60 font-sans mt-md">
          Copyright &copy; WildStream Gear. All rights reserved.
        </div>
      </div>
    </div>
  );
}
