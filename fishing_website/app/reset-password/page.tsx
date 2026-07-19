'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle2, Compass } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Read email from search params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);
  
  // Password strength states
  const [strength, setStrength] = useState<0 | 1 | 2 | 3>(0); // 0: None, 1: Weak, 2: Medium, 3: Strong

  // Calculate password strength dynamically
  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }
    
    let score = 0;
    if (password.length >= 6) score += 1; // Length check
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score += 1; // Alpha-numeric check
    if (/[^a-zA-Z0-9]/.test(password) && password.length >= 8) score += 1; // Special char & long length check

    setStrength(score as 0 | 1 | 2 | 3);
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu!');
      return;
    }
    if (password !== confirmPassword) {
      alert('Mật khẩu mới và Xác nhận mật khẩu không khớp!');
      return;
    }
    if (strength < 2) {
      alert('Mật khẩu của bạn quá yếu! Vui lòng chọn mật khẩu mạnh hơn.');
      return;
    }
    if (!email) {
      alert('Không tìm thấy thông tin email hợp lệ. Vui lòng quay lại bước quên mật khẩu!');
      return;
    }

    setLoading(true);
    authApi.changePassword({
      email,
      newPassword: password
    })
      .then(() => {
        setLoading(false);
        alert('Đổi mật khẩu thành công! Bạn sẽ được đưa về trang Đăng nhập.');
        window.location.href = '/login';
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau!');
      });
  };

  const getStrengthLabel = () => {
    switch (strength) {
      case 1:
        return { label: 'Yếu', colorClass: 'text-red-500', barClass: 'bg-red-500' };
      case 2:
        return { label: 'Trung bình', colorClass: 'text-yellow-500', barClass: 'bg-yellow-500' };
      case 3:
        return { label: 'Mạnh', colorClass: 'text-[#1f6c3a]', barClass: 'bg-[#1f6c3a]' };
      default:
        return { label: 'Không có', colorClass: 'text-outline', barClass: 'bg-outline-variant/30' };
    }
  };

  const strengthDetails = getStrengthLabel();

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Main Container - Centering Card */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile py-lg">
        
        {/* RESET PASSWORD CARD: White, rounded-2xl, shadow-ambient */}
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
              Tạo mật khẩu mới
            </h1>
            <p className="text-[13px] text-[#444653] leading-relaxed mt-2 text-center">
              Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây.
            </p>
          </div>

          {/* FORM FIELDS */}
          <form onSubmit={handleSubmit} className="space-y-md">
            
            {/* Input 1: Mật khẩu mới */}
            <div className="flex flex-col gap-xs relative">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <Lock className="w-4 h-4 text-outline" /> Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2.5 pl-3.5 pr-10 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-[#00288e] focus:ring-1 focus:ring-[#00288e] transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-outline hover:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-xs">
                <div className="flex justify-between items-center text-[11px] font-sans font-semibold mb-1">
                  <span className="text-on-surface-variant/80">Độ mạnh mật khẩu:</span>
                  <span className={strengthDetails.colorClass}>{strengthDetails.label}</span>
                </div>
                
                {/* 3 Segments Bar Indicator */}
                <div className="grid grid-cols-3 gap-xs h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-l-full transition-colors duration-300 ${strength >= 1 ? strengthDetails.barClass : 'bg-outline-variant/30'}`} />
                  <div className={`h-full transition-colors duration-300 ${strength >= 2 ? strengthDetails.barClass : 'bg-outline-variant/30'}`} />
                  <div className={`h-full rounded-r-full transition-colors duration-300 ${strength >= 3 ? strengthDetails.barClass : 'bg-outline-variant/30'}`} />
                </div>
                <p className="text-[10px] text-on-surface-variant/60 leading-normal mt-1 font-sans">
                  * Yêu cầu tối thiểu 6 ký tự gồm cả chữ viết và chữ số.
                </p>
              </div>
            </div>

            {/* Input 2: Xác nhận mật khẩu mới */}
            <div className="flex flex-col gap-xs relative">
              <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <CheckCircle2 className="w-4 h-4 text-outline" /> Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2.5 pl-3.5 pr-10 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-[#00288e] focus:ring-1 focus:ring-[#00288e] transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-outline hover:text-primary transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Button: 'Lưu mật khẩu mới' (Ocean Blue) */}
            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none active:scale-[0.98]"
              >
                <span>{loading ? 'ĐANG LƯU...' : 'LƯU MẬT KHẨU MỚI'}</span>
              </button>
            </div>

          </form>

          {/* FOOTER: Quay lại đăng nhập link */}
          <div className="text-center mt-md pt-sm border-t border-outline-variant/10">
            <a
              href="/login"
              className="text-label-sm text-on-surface-variant hover:text-primary font-semibold flex items-center justify-center gap-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </a>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
