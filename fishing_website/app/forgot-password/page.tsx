'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, ArrowLeft, Key, HelpCircle } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      alert('Vui lòng nhập Email hoặc Số điện thoại!');
      return;
    }

    setLoading(true);
    authApi.sendOTP(emailOrPhone)
      .then(() => {
        setLoading(false);
        alert('Mã OTP xác thực đã được gửi đến email của bạn.');
        router.push(`/verify-otp?email=${encodeURIComponent(emailOrPhone)}`);
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email!');
      });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Main Container - Centering Card */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile py-lg">
        
        {/* FORGOT PASSWORD CARD: White, rounded-2xl, shadow-ambient */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-md sm:p-lg text-left">
          
          {!submitted ? (
            /* STEP 1: Enter email or phone form */
            <>
              {/* HEADER: Padlock icon & headline */}
              <div className="text-center mb-md">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-xs">
                  <Key className="w-6 h-6 text-[#00288e]" />
                </div>
                <h1 className="text-headline-md font-bold text-[#00288e] tracking-tight mt-1">
                  Quên mật khẩu?
                </h1>
                <p className="text-[13px] text-[#444653] leading-relaxed mt-2 text-center">
                  Vui lòng nhập Email hoặc Số điện thoại đã đăng ký, chúng tôi sẽ gửi mã xác nhận cho bạn.
                </p>
              </div>

              {/* INPUT: Email/Phone */}
              <form onSubmit={handleSubmit} className="space-y-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                    <Mail className="w-4 h-4 text-outline" /> Email hoặc Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="email@example.com hoặc 09xxxxxxxx"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2.5 px-3.5 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-[#00288e] focus:ring-1 focus:ring-[#00288e] transition-all duration-200"
                    required
                  />
                </div>

                {/* Primary Button: 'Gửi mã xác nhận' (Ocean Blue #00288e) */}
                <div className="pt-xs">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none active:scale-[0.98]"
                  >
                    <span>{loading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* STEP 2: Sent confirmation layout */
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-xs">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h1 className="text-headline-md font-bold text-on-surface tracking-tight mt-1">
                Đã gửi mã xác nhận!
              </h1>
              <p className="text-[13px] text-[#444653] leading-relaxed mt-2">
                Chúng tôi đã gửi một liên kết đặt lại mật khẩu và mã OTP đến địa chỉ của bạn:{' '}
                <span className="font-bold text-on-surface">{emailOrPhone}</span>.
              </p>
              <p className="text-[12px] text-on-surface-variant mt-sm">
                Vui lòng kiểm tra hộp thư đến (hoặc hộp thư rác/spam) của bạn để thực hiện các bước tiếp theo.
              </p>

              <div className="pt-md">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-primary hover:bg-[#1e40af] text-white text-label-md font-bold rounded-md py-3 px-md shadow-sm transition-all duration-200"
                >
                  GỬI LẠI MÃ XÁC NHẬN
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS: Ghost/text button 'Quay lại đăng nhập' (with a left arrow icon) */}
          <div className="text-center mt-md pt-sm border-t border-outline-variant/10">
            <a
              href="/login"
              className="text-label-sm text-on-surface-variant hover:text-primary font-semibold flex items-center justify-center gap-xs transition-colors duration-200 focus-visible:outline-none"
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
