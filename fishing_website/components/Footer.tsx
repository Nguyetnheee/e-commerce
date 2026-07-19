'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] text-on-surface py-lg border-t border-outline-variant/20 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
        
        {/* Column 1: Company Info & BCT Badge */}
        <div className="flex flex-col gap-sm text-left">
          <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
            WILDSTREAM GEAR
          </h4>
          <div className="text-[13px] text-on-surface-variant space-y-2 leading-relaxed font-sans">
            <p className="font-bold text-on-surface">Công ty TNHH WildStream Gear</p>
            <p>Địa chỉ: Tầng 5, Tòa nhà WildStream, 123 Đường Song Hành, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh</p>
            <p>Hotline: 1900 6886 - Email: support@wildstream.vn</p>
            <p className="text-[12px] opacity-90">
              Mã số doanh nghiệp: 0316888888 do Sở KH&ĐT TP.HCM cấp ngày 15/05/2021
            </p>
          </div>
          
          {/* Bộ Công Thương Notified Logo Placeholder SVG */}
          <div className="mt-xs">
            <a 
              href="http://online.gov.vn" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Đã thông báo Bộ Công Thương"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <svg width="130" height="42" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-sm">
                {/* Red background rectangle */}
                <rect x="1" y="1" width="148" height="48" rx="6" fill="#DA251D" stroke="#DA251D" strokeWidth="2"/>
                {/* Blue inner area */}
                <rect x="6" y="6" width="138" height="38" rx="4" fill="#00529C"/>
                {/* Left side gold emblem circle */}
                <circle cx="28" cy="25" r="14" fill="#FCE100"/>
                <circle cx="28" cy="25" r="12" fill="#DA251D"/>
                {/* Star in the center */}
                <polygon points="28,17 31,23 37,24 33,28 34,34 28,31 22,34 23,28 19,24 25,23" fill="#FCE100"/>
                {/* Text on the right */}
                <text x="48" y="20" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">ĐÃ THÔNG BÁO</text>
                <text x="48" y="32" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">BỘ CÔNG THƯƠNG</text>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Legal Policies */}
        <div className="flex flex-col gap-sm text-left">
          <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider">
            CHÍNH SÁCH
          </h4>
          <ul className="text-[13px] text-on-surface-variant space-y-2.5 font-sans font-medium">
            <li>
              <a href="/privacy-policy" className="hover:text-primary transition-colors duration-200">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="/return-refund-policy" className="hover:text-primary transition-colors duration-200">
                Chính sách đổi trả & hoàn tiền
              </a>
            </li>
            <li>
              <a href="/shipping-policy" className="hover:text-primary transition-colors duration-200">
                Chính sách vận chuyển
              </a>
            </li>
            <li>
              <a href="/payment-policy" className="hover:text-primary transition-colors duration-200">
                Chính sách thanh toán
              </a>
            </li>
            <li>
              <a href="/terms-of-service" className="hover:text-primary transition-colors duration-200">
                Điều khoản dịch vụ
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div className="flex flex-col gap-sm text-left">
          <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider">
            SẢN PHẨM
          </h4>
          <ul className="text-[13px] text-on-surface-variant space-y-2.5 font-sans font-medium">
            <li>
              <a href="/category#sea" className="hover:text-primary transition-colors duration-200">
                Đồ câu Biển
              </a>
            </li>
            <li>
              <a href="/category#river" className="hover:text-primary transition-colors duration-200">
                Đồ câu Suối
              </a>
            </li>
            <li>
              <a href="/category#lake" className="hover:text-primary transition-colors duration-200">
                Đồ câu Hồ
              </a>
            </li>
            <li>
              <a href="/category#camping" className="hover:text-primary transition-colors duration-200">
                Đồ Cắm trại
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Customer Support */}
        <div className="flex flex-col gap-sm text-left">
          <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider">
            HỖ TRỢ
          </h4>
          <ul className="text-[13px] text-on-surface-variant space-y-2.5 font-sans font-medium">
            <li>
              <a href="#help" className="hover:text-primary transition-colors duration-200">
                Trung tâm trợ giúp
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-primary transition-colors duration-200">
                Liên hệ
              </a>
            </li>
            <li>
              <a href="/order-tracking" className="hover:text-primary transition-colors duration-200">
                Theo dõi đơn hàng
              </a>
            </li>
            <li>
              <a href="#size-guide" className="hover:text-primary transition-colors duration-200">
                Hướng dẫn chọn size
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Copyright & Payment methods */}
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop border-t border-[#e1e3e4] mt-lg pt-sm flex flex-col sm:flex-row items-center justify-between gap-sm text-label-sm text-on-surface-variant/80">
        <div>
          <span>© 2026 WildStream Gear. Tất cả các quyền được bảo lưu.</span>
        </div>
        
        {/* Grayscale Payment Logo SVGs */}
        <div className="flex items-center gap-xs">
          {/* Visa */}
          <span title="Visa" className="text-gray-400 hover:text-on-surface opacity-60 hover:opacity-100 transition-all duration-200">
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill="none" strokeWidth="1"/>
              <text x="6" y="16" fill="currentColor" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="1">VISA</text>
            </svg>
          </span>

          {/* Mastercard */}
          <span title="Mastercard" className="text-gray-400 hover:text-on-surface opacity-60 hover:opacity-100 transition-all duration-200">
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill="none" strokeWidth="1"/>
              <circle cx="15" cy="12" r="5" fill="currentColor" fillOpacity="0.4"/>
              <circle cx="21" cy="12" r="5" fill="currentColor" fillOpacity="0.7"/>
            </svg>
          </span>

          {/* MoMo */}
          <span title="Ví MoMo" className="text-gray-400 hover:text-on-surface opacity-60 hover:opacity-100 transition-all duration-200">
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill="none" strokeWidth="1"/>
              <text x="6" y="15" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="sans-serif">MoMo</text>
            </svg>
          </span>

          {/* VNPay */}
          <span title="VNPay QR" className="text-gray-400 hover:text-on-surface opacity-60 hover:opacity-100 transition-all duration-200">
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill="none" strokeWidth="1"/>
              <text x="5" y="15" fill="currentColor" fontSize="7" fontWeight="bold" fontFamily="sans-serif">VNPay</text>
            </svg>
          </span>

          {/* COD */}
          <span title="Thanh toán khi nhận hàng (COD)" className="text-gray-400 hover:text-on-surface opacity-60 hover:opacity-100 transition-all duration-200">
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill="none" strokeWidth="1"/>
              <text x="8" y="15" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="sans-serif">COD</text>
            </svg>
          </span>
        </div>
      </div>
    </footer>
  );
}
