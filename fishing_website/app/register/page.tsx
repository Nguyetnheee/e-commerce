'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Compass } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function RegisterPage() {
  const [fullname, setFullname] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullname.trim()) {
      newErrors.fullname = 'Họ và tên không được để trống';
    }
    
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email hoặc số điện thoại không được để trống';
    } else {
      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Basic phone validation regex (10 digits)
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      
      if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
        newErrors.emailOrPhone = 'Vui lòng nhập email hợp lệ hoặc số điện thoại đúng định dạng';
      }
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    authApi.register({
      fullname,
      email: emailOrPhone,
      password,
    })
      .then((data) => {
        setLoading(false);
        alert(data.message || 'Đăng ký tài khoản thành công! Một mã xác thực OTP đã được gửi đến email của bạn.');
        window.location.href = `/verify-otp?email=${encodeURIComponent(emailOrPhone)}`;
      })
      .catch((error) => {
        setLoading(false);
        const errorMsg = error.message || 'Có lỗi xảy ra trong quá trình đăng ký!';
        
        // Handle common backend error messages mapping
        if (errorMsg.toLowerCase().includes('email')) {
          setErrors({ emailOrPhone: errorMsg });
        } else if (errorMsg.toLowerCase().includes('password') || errorMsg.toLowerCase().includes('mật khẩu')) {
          setErrors({ password: errorMsg });
        } else {
          alert(errorMsg);
        }
      });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Main Container - Centering Card */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile py-lg">
        
        {/* REGISTER CARD: White, rounded-2xl, shadow-ambient */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md sm:p-lg text-left">
          
          {/* HEADER: Headline & Subtext */}
          <div className="text-center mb-md">
            {/* Custom Brand Icon / Logo */}
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-xs">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-body-lg font-extrabold text-on-surface-variant font-sans tracking-wide">
              WILDSTREAM GEAR
            </h2>
            <h1 className="text-headline-md font-bold text-[#00288e] tracking-tight mt-1">
              Tạo tài khoản mới
            </h1>
            <p className="text-[12px] text-on-surface-variant mt-1">
              Bắt đầu hành trình khám phá của bạn
            </p>
          </div>

          {/* FORM FIELDS */}
          <form onSubmit={handleSubmit} className="space-y-sm">
            
            {/* Input 1: Họ và tên */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <User className="w-4 h-4 text-outline" /> Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className={`bg-[#f8f9fa] border ${errors.fullname ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#e5e7eb] focus:border-[#00288e] focus:ring-[#00288e]'} rounded-lg py-2 pl-3 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 transition-all duration-200`}
                required
              />
              {errors.fullname && <p className="text-red-500 text-[11px] font-medium">{errors.fullname}</p>}
            </div>

            {/* Input 2: Email hoặc Số điện thoại */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <Mail className="w-4 h-4 text-outline" /> Email hoặc Số điện thoại
              </label>
              <input
                type="text"
                placeholder="email@example.com hoặc 09xxxxxxxx"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className={`bg-[#f8f9fa] border ${errors.emailOrPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#e5e7eb] focus:border-[#00288e] focus:ring-[#00288e]'} rounded-lg py-2 pl-3 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 transition-all duration-200`}
                required
              />
              {errors.emailOrPhone && <p className="text-red-500 text-[11px] font-medium">{errors.emailOrPhone}</p>}
            </div>

            {/* Input 3: Mật khẩu */}
            <div className="flex flex-col gap-xs relative">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <Lock className="w-4 h-4 text-outline" /> Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#f8f9fa] border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#e5e7eb] focus:border-[#00288e] focus:ring-[#00288e]'} rounded-lg py-2 pl-3 pr-10 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 transition-all duration-200`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[11px] font-medium">{errors.password}</p>}
            </div>

            {/* Input 4: Xác nhận mật khẩu */}
            <div className="flex flex-col gap-xs relative">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <ShieldCheck className="w-4 h-4 text-outline" /> Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-[#f8f9fa] border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#e5e7eb] focus:border-[#00288e] focus:ring-[#00288e]'} rounded-lg py-2 pl-3 pr-10 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 transition-all duration-200`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[11px] font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* Checkbox: Agreement checkbox */}
            <div className="pt-xs flex flex-col gap-xs">
              <div className="flex items-start gap-xs">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className={`mt-1 text-primary focus:ring-primary cursor-pointer w-4 h-4 rounded ${errors.agreeTerms ? 'border-red-500' : ''}`}
                />
                <label
                  htmlFor="terms-checkbox"
                  className="text-[11px] text-on-surface-variant leading-relaxed font-sans font-medium select-none cursor-pointer"
                >
                  Tôi đồng ý với{' '}
                  <a href="/terms-of-service" className="text-[#00288e] hover:underline font-bold">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href="/privacy-policy" className="text-[#00288e] hover:underline font-bold">
                    Chính sách bảo mật
                  </a>{' '}
                  của WildStream Gear
                </label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-[11px] font-medium ml-5">{errors.agreeTerms}</p>}
            </div>

            {/* Primary Action Button (Ocean Blue, full-width, bold) */}
            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none active:scale-[0.98]"
              >
                <span>{loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}</span>
                {!loading && <ArrowRight className="w-4.5 h-4.5" />}
              </button>
            </div>

          </form>

          {/* FOOTER: Already have an account link */}
          <div className="text-center mt-md pt-sm border-t border-outline-variant/10 text-label-sm text-on-surface-variant/80">
            <span>Đã có tài khoản? </span>
            <a
              href="/login"
              className="text-[#00288e] hover:underline font-bold"
            >
              Đăng nhập
            </a>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
