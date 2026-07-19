'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { CreditCard, Truck, ShieldCheck, ArrowRight, User, Phone, MapPin, Building } from 'lucide-react';
import { cartApi, orderApi, couponApi, getAuthToken } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Load cart items on mount & check authentication
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản khách hàng để tiến hành thanh toán đơn hàng!');
      router.push('/login');
      return;
    }

    cartApi.getCart()
      .then((data) => {
        if (Array.isArray(data)) {
          setCartItems(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching cart:', err);
      });
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price || item.soldPrice || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  // Fetch dynamic shipping fee when city/cart changes
  useEffect(() => {
    if (!city.trim() || cartItems.length === 0) {
      setShippingFee(0);
      return;
    }

    const payloadItems = cartItems.map((item) => ({
      variantId: item.variantId || Number(item.id),
      quantity: item.quantity,
    }));

    const delayDebounceFn = setTimeout(() => {
      setCalculatingFee(true);
      orderApi.getShippingFee({ province: city.trim(), items: payloadItems })
        .then((res) => {
          if (res && typeof res.shippingFee === 'number') {
            setShippingFee(res.shippingFee);
          }
        })
        .catch((err) => {
          console.error('Error fetching shipping fee:', err);
          // Fallback to client logic
          setShippingFee(subtotal > 3000000 ? 0 : 50000);
        })
        .finally(() => {
          setCalculatingFee(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [city, cartItems, subtotal]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage(null);

    couponApi.validateCoupon(couponCode.trim(), subtotal)
      .then((res) => {
        if (res && res.valid) {
          setDiscountAmount(res.discountAmount || 0);
          setCouponMessage({ text: res.message || 'Áp dụng mã thành công!', isError: false });
        } else {
          setDiscountAmount(0);
          setCouponMessage({ text: res.message || 'Mã giảm giá không hợp lệ!', isError: true });
        }
      })
      .catch((err) => {
        console.error('Error validating coupon:', err);
        if (couponCode.trim().toUpperCase() === 'WILD15') {
          const discount = Math.round(subtotal * 0.15);
          setDiscountAmount(discount);
          setCouponMessage({ text: 'Áp dụng mã WILD15 thành công (Giảm 15% - offline fallback)', isError: false });
        } else {
          setDiscountAmount(0);
          setCouponMessage({ text: 'Lỗi kiểm tra mã giảm giá. Vui lòng thử lại!', isError: true });
        }
      })
      .finally(() => {
        setApplyingCoupon(false);
      });
  };

  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !phone || !address) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống! Vui lòng chọn mua sản phẩm trước.');
      return;
    }

    setLoading(true);

    const orderItemsPayload = cartItems.map((item) => ({
      variantId: item.variantId || Number(item.id),
      quantity: item.quantity,
    }));

    const orderPayload = {
      recipientName: fullname,
      recipientPhone: phone,
      shippingAddress: `${address}, ${city || 'Hà Nội'}`,
      paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
      couponCode: couponCode.trim() || undefined,
      items: orderItemsPayload,
    };

    orderApi.createOrder(orderPayload)
      .then((data) => {
        setLoading(false);
        // Clear cart after placing order
        const token = getAuthToken();
        if (!token) {
          localStorage.removeItem('cart');
        }
        // Save order data in sessionStorage for success page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastOrder', JSON.stringify({
            fullname,
            phone,
            address: orderPayload.shippingAddress,
            paymentMethod: paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản Ngân hàng',
            total,
            orderId: data.orderCode || 'WSG-' + data.id,
            date: new Date().toLocaleDateString('vi-VN'),
            items: cartItems.map((item) => ({
              productName: item.productName || item.title || 'Sản phẩm dã ngoại',
              productImage: item.image || item.imageUrl || '/images/product-tent.png',
              variantName: item.variantName || item.variant || 'Mặc định',
              quantity: item.quantity,
              soldPrice: item.price || item.soldPrice || 0
            }))
          }));
        }
        if (paymentMethod === 'bank' && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          router.push('/order-success');
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message || 'Đặt hàng thất bại. Vui lòng thử lại sau!');
      });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Checkout Form Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        
        {/* Title */}
        <div className="mb-md text-left">
          <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface tracking-tight">
            Thanh toán đơn hàng
          </h1>
          <p className="text-label-sm text-on-surface-variant font-medium mt-1">
            Vui lòng nhập thông tin giao hàng và chọn phương thức thanh toán phù hợp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg items-start">
          
          {/* LEFT COLUMN: Checkout Form (8 columns) */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md md:p-lg space-y-md text-left">
              
              {/* SECTION: Delivery Address Info */}
              <div>
                <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-md border-b border-outline-variant/10 pb-xs">
                  Thông tin giao hàng
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {/* Fullname input field */}
                  <div className="flex flex-col gap-xs">
                    <label className="text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                      <User className="w-4 h-4 text-outline" /> HỌ TÊN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-md py-2.5 px-3 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Phone input field */}
                  <div className="flex flex-col gap-xs">
                    <label className="text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-4 h-4 text-outline" /> SĐT <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-md py-2.5 px-3 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Address input field (Full width span) */}
                  <div className="sm:col-span-2 flex flex-col gap-xs">
                    <label className="text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-outline" /> ĐỊA CHỈ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Số 10, ngõ 123 đường Xuân Thủy"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-md py-2.5 px-3 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      required
                    />
                  </div>

                  {/* City Selection input field */}
                  <div className="sm:col-span-2 flex flex-col gap-xs">
                    <label className="text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                      <Building className="w-4 h-4 text-outline" /> TỈNH / THÀNH PHỐ
                    </label>
                    <input
                      type="text"
                      placeholder="Hà Nội (hoặc Tp. Hồ Chí Minh...)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-md py-2.5 px-3 text-body-md text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Payment Method choice */}
              <div className="pt-sm">
                <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-md border-b border-outline-variant/10 pb-xs">
                  Phương thức thanh toán
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                  {/* COD Payment Method */}
                  <label
                    className={`border rounded-xl p-md flex items-start gap-sm cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-[#e5e7eb] hover:bg-surface-container-low'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                    />
                    <div className="-mt-0.5">
                      <span className="text-label-md font-bold text-on-surface block">COD</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Thanh toán bằng tiền mặt trực tiếp khi nhận hàng.
                      </span>
                    </div>
                  </label>

                  {/* Bank Transfer Payment Method */}
                  <label
                    className={`border rounded-xl p-md flex items-start gap-sm cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'bank'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-[#e5e7eb] hover:bg-surface-container-low'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="mt-1 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                    />
                    <div className="-mt-0.5">
                      <span className="text-label-md font-bold text-on-surface block">Chuyển khoản Ngân hàng</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Thanh toán qua mã QR/tài khoản ngân hàng của WildStream.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Ocean Blue confirmation CTA button */}
              <div className="pt-md">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00288e] hover:bg-[#1e40af] disabled:bg-primary/50 text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center gap-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:outline-none"
                >
                  <span>{loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}</span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: Order Summary Card (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-sm sticky top-24">
            
            {/* White card layout summary */}
            <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md text-left">
              <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-sm pb-xs border-b border-outline-variant/10">
                Đơn hàng của bạn
              </h3>

              {/* Items summary */}
              <div className="space-y-sm py-xs border-b border-outline-variant/10 mb-sm max-h-60 overflow-y-auto">
                {cartItems.map((item, idx) => {
                  const name = item.productName || item.title || 'Sản phẩm dã ngoại';
                  const img = item.image || item.imageUrl || '/images/product-tent.png';
                  const variant = item.variantName || item.variant || 'Mặc định';
                  const price = item.price || item.soldPrice || 0;
                  const qty = item.quantity || 1;
                  return (
                    <div key={idx} className="flex gap-xs items-center justify-between">
                      <div className="flex gap-xs items-center min-w-0">
                        <div className="w-10 h-10 bg-surface-container rounded-md overflow-hidden flex-shrink-0">
                          <img src={img} alt={name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-label-sm font-bold text-on-surface block line-clamp-1 truncate" title={name}>{name}</span>
                          <span className="text-[10px] text-on-surface-variant font-medium block">SL: {qty} | {variant}</span>
                        </div>
                      </div>
                      <span className="text-label-sm font-bold text-on-surface font-sans flex-shrink-0">{formatPrice(price * qty)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon code input field */}
              <div className="py-sm border-b border-outline-variant/10 mb-sm">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-xs">
                  Mã giảm giá
                </label>
                <div className="flex gap-xs">
                  <input
                    type="text"
                    placeholder="Nhập mã (Ví dụ: WILD15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-md py-1.5 px-3 text-label-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary flex-grow"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode}
                    className="bg-primary hover:bg-[#1e40af] text-white text-[11px] font-bold rounded-md px-md transition-all active:scale-98"
                  >
                    {applyingCoupon ? '...' : 'ÁP DỤNG'}
                  </button>
                </div>
                {couponMessage && (
                  <span className={`text-[11px] block mt-xs font-medium ${couponMessage.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                    {couponMessage.text}
                  </span>
                )}
              </div>

              {/* Calculation Summary details */}
              <div className="space-y-sm py-xs">
                <div className="flex justify-between text-label-sm text-on-surface-variant font-medium">
                  <span>Tạm tính</span>
                  <span className="font-sans font-bold text-on-surface">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-label-sm text-on-surface-variant font-medium">
                  <span>Phí giao hàng</span>
                  <span className="font-sans font-bold text-secondary">
                    {calculatingFee ? 'Đang tính...' : shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-label-sm text-emerald-600 font-medium">
                    <span>Giảm giá</span>
                    <span className="font-sans font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-end border-t border-outline-variant/10 pt-sm mt-xs">
                  <span className="text-label-md font-bold text-on-surface">Tổng cộng</span>
                  <span className="text-headline-md font-extrabold text-primary font-sans leading-none block">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center gap-xs mt-md pt-xs border-t border-outline-variant/10 text-outline text-[11px]">
                <ShieldCheck className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                <span>Thanh toán an toàn bảo mật tuyệt đối</span>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-md text-left flex items-start gap-xs">
              <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-label-sm font-bold text-on-surface">Vận chuyển nhanh chóng</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Đơn hàng của bạn sẽ được xử lý đóng gói và bàn giao cho đối tác vận chuyển trong 24 giờ.
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
