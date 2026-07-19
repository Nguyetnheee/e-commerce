'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(42); // Countdown from 42 seconds as requested
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('user@gmail.com');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle OTP value change
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Keep last entered character
    setOtp(newOtp);

    // Auto-focus next input field
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace delete key focus return
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length !== 6 || isNaN(Number(pastedData))) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      alert('Vui lòng nhập đầy đủ 6 chữ số mã xác thực!');
      return;
    }

    setLoading(true);
    authApi.verifyOTP(email, otpCode)
      .then(() => {
        setLoading(false);
        alert('Xác thực OTP thành công! Đang chuyển đến trang đặt lại mật khẩu mới...');
        window.location.href = `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`;
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
      });
  };

  const handleResend = () => {
    if (timeLeft > 0) return;
    setLoading(true);
    authApi.sendOTP(email)
      .then(() => {
        setLoading(false);
        setOtp(new Array(6).fill(''));
        setTimeLeft(59); // Reset to 59s
        alert('Mã OTP mới đã được gửi lại vào email của bạn!');
        inputRefs.current[0]?.focus();
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau!');
      });
  };

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans relative">
      {/* Background Main Page Layer under modal */}
      <Header />

      {/* Main Container - Centered Modal Layout */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile py-lg relative">
        
        {/* Dark Transparent Overlay over layout to match "modal" requirement */}
        <div className="absolute inset-0 bg-[#191c1d]/35 backdrop-blur-xs z-10" />

        {/* MODAL CARD: White, rounded-2xl, soft level 2 shadow */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md sm:p-lg text-left relative z-20">
          
          {/* HEADER: Shield icon in soft blue circle & title */}
          <div className="text-center mb-md">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-xs">
              <Shield className="w-7 h-7 text-[#00288e]" />
            </div>
            <h1 className="text-headline-md font-bold text-[#00288e] tracking-tight mt-1">
              Xác thực Email
            </h1>
            <p className="text-[13px] text-[#444653] leading-relaxed mt-2 max-w-xs mx-auto">
              Chúng tôi vừa gửi mã 6 chữ số đến <span className="font-bold text-on-surface">user@gmail.com</span>
            </p>
          </div>

          {/* OTP INPUTS & FORM */}
          <form onSubmit={handleSubmit} className="space-y-md">
            
            {/* 6 Square Inputs */}
            <div className="flex justify-between gap-xs sm:gap-sm" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-headline-md font-extrabold text-on-surface bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#00288e] focus:ring-1 focus:ring-[#00288e] transition-all duration-200"
                />
              ))}
            </div>

            {/* Primary Action Button: 'Xác nhận mã' with right arrow icon */}
            <div className="pt-xs">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none active:scale-[0.98]"
              >
                <span>{loading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN MÃ'}</span>
                {!loading && <ArrowRight className="w-4.5 h-4.5" />}
              </button>
            </div>

          </form>

          {/* FOOTER: Timer in bold Ocean Blue */}
          <div className="text-center mt-md pt-sm border-t border-outline-variant/10 text-label-sm text-on-surface-variant/80">
            {timeLeft > 0 ? (
              <span>
                Không nhận được mã? Gửi lại sau:{' '}
                <span className="font-bold text-[#00288e] font-mono">{formatTimer(timeLeft)}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#00288e] hover:underline font-bold transition-all cursor-pointer focus:outline-none"
              >
                Gửi lại mã xác nhận ngay
              </button>
            )}
          </div>

          {/* Return link */}
          <div className="text-center mt-sm">
            <a
              href="/forgot-password"
              className="text-label-sm text-outline hover:text-primary font-semibold flex items-center justify-center gap-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại bước trước
            </a>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
