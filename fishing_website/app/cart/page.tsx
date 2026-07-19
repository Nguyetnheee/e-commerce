'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { cartApi, getAuthToken } from '../../lib/api';

import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  variantId?: number;
  title: string;
  variant: string;
  price: number;
  imageUrl: string;
  quantity: number;
  category: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const handleProceedToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản khách hàng để tiến hành thanh toán đơn hàng!');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  const loadCart = () => {
    const token = getAuthToken();
    if (token) {
      cartApi.getCart()
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped = data.map((item: any) => ({
              id: item.id.toString(),
              variantId: item.variantId,
              title: item.productName || 'Sản phẩm dã ngoại',
              variant: item.variantName || 'Mặc định',
              price: item.price || 0,
              imageUrl: item.image || '/images/product-tent.png',
              quantity: item.quantity,
              category: 'Trang bị'
            }));
            setCartItems(mapped);
          }
        })
        .catch((err) => {
          console.error('Error fetching cart from API:', err);
        });
    } else {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('cart');
        if (local) {
          try {
            setCartItems(JSON.parse(local));
          } catch (e) {
            localStorage.removeItem('cart');
          }
        }
      }
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Update item quantity
  const updateQuantity = (id: string, delta: number) => {
    const token = getAuthToken();
    if (token) {
      const target = cartItems.find(it => it.id === id);
      if (target) {
        const newQty = target.quantity + delta;
        if (newQty > 0) {
          cartApi.updateQuantity(Number(id), newQty)
            .then(() => loadCart())
            .catch(err => alert(err.message || 'Không thể cập nhật số lượng!'));
        }
      }
    } else {
      setCartItems((prevItems) => {
        const updated = prevItems.map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty > 0 ? newQty : 1 };
          }
          return item;
        });
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    const token = getAuthToken();
    if (token) {
      cartApi.deleteItem(Number(id))
        .then(() => loadCart())
        .catch(err => alert(err.message || 'Không thể xóa sản phẩm khỏi giỏ hàng!'));
    } else {
      setCartItems((prevItems) => {
        const updated = prevItems.filter((item) => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const total = subtotal;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', '₫');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface flex flex-col font-sans">
      {/* Unified Navigation Header */}
      <Header />

      {/* Cart Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        
        {/* Title & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-xs mb-md text-left">
          <div>
            <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface tracking-tight">
              Giỏ hàng của bạn
            </h1>
            <p className="text-label-sm text-on-surface-variant font-medium mt-1">
              Bạn có <span className="text-primary font-bold">{cartItems.length}</span> sản phẩm trong giỏ hàng
            </p>
          </div>
          <a
            href="/"
            className="text-label-sm text-primary font-bold hover:underline flex items-center gap-xs cursor-pointer focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </a>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/10 p-xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-lg">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-md text-outline">
              <ShoppingBag className="w-10 h-10 text-on-surface-variant/40" />
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-sm">
              Giỏ hàng đang trống!
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-md mb-md">
              Có vẻ như bạn chưa chọn được trang bị dã ngoại ưng ý. Hãy khám phá các bộ sưu tập của WildStream Gear để bắt đầu hành trình của bạn.
            </p>
            <a
              href="/"
              className="bg-primary hover:bg-[#1e40af] text-white text-label-md font-bold rounded-md py-3 px-lg shadow-sm hover:shadow transition-all duration-200"
            >
              KHÁM PHÁ CỬA HÀNG
            </a>
          </div>
        ) : (
          /* Normal Cart Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg items-start">
            
            {/* LEFT SIDE: List of Cart Items (8 columns) */}
            <div className="lg:col-span-8 flex flex-col gap-sm">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md flex flex-col sm:flex-row items-center gap-md transition-all duration-300 hover:shadow-ambient-hover text-left"
                >
                  {/* Product Thumbnail (1:1 aspect ratio) */}
                  <div className="w-24 h-24 bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/10">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Description Info */}
                  <div className="flex-grow flex flex-col justify-between w-full">
                    <div>
                      {/* Category Badge */}
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-0.5 opacity-90">
                        {item.category}
                      </span>
                      
                      {/* Title */}
                      <h3 className="text-body-md font-bold text-on-surface leading-tight hover:text-primary transition-colors duration-200">
                        {item.title}
                      </h3>

                      {/* Variant */}
                      <p className="text-[11px] text-on-surface-variant font-medium mt-1">
                        {item.variant}
                      </p>
                    </div>

                    {/* Price and Action row */}
                    <div className="flex items-center justify-between mt-sm">
                      <span className="text-body-md font-bold text-primary font-sans">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-[11px] text-on-surface-variant/75 font-sans hidden sm:inline">
                        Tổng: <span className="font-bold text-on-surface">{formatPrice(item.price * item.quantity)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Divider line for Mobile */}
                  <div className="w-full h-px bg-outline-variant/20 sm:hidden" />

                  {/* Quantity Control & Trash Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-md w-full sm:w-auto">
                    {/* Quantity Control (Pill-shaped background) */}
                    <div className="flex items-center border border-outline-variant/40 rounded-full bg-surface-container-low overflow-hidden p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-4.5 h-4.5" />
                      </button>
                      <span className="w-8 text-center font-sans text-label-md font-bold text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Trash bin icon (outline style, low contrast) */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-full text-outline-variant hover:text-red-500 hover:bg-red-50/70 border border-transparent hover:border-red-100 transition-all duration-200 cursor-pointer"
                      aria-label="Xóa sản phẩm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

            </div>

            {/* RIGHT SIDE: Summary Card (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-sm sticky top-24">
              <div className="bg-white rounded-2xl shadow-ambient border border-outline-variant/5 p-md text-left">
                <h3 className="text-label-md font-extrabold text-on-surface uppercase tracking-wider mb-sm pb-xs border-b border-outline-variant/10">
                  Tóm tắt đơn hàng
                </h3>

                {/* Subtotal & Shipping summary */}
                <div className="space-y-sm py-xs">
                  <div className="flex justify-between text-body-md text-on-surface-variant font-medium">
                    <span>Tạm tính ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} món)</span>
                    <span className="font-sans font-semibold text-on-surface">{formatPrice(subtotal)}</span>
                  </div>

                </div>

                {/* Total Payment Price */}
                <div className="flex justify-between items-end border-t border-outline-variant/10 pt-sm mt-xs mb-md">
                  <span className="text-label-md font-bold text-on-surface">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-headline-md font-extrabold text-primary font-sans block leading-tight">
                      {formatPrice(total)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-sans opacity-70">
                      (Đã bao gồm VAT nếu có)
                    </span>
                  </div>
                </div>

                {/* Prominent Checkout Button using Warm Orange */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#e05600] hover:bg-[#c84d00] text-white text-label-md font-bold rounded-md py-3.5 px-md flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none select-none text-center cursor-pointer"
                >
                  TIẾN HÀNH THANH TOÁN
                </button>

                {/* Safe badge info */}
                <div className="flex items-center gap-xs mt-sm pt-xs border-t border-outline-variant/10 text-outline text-[11px] leading-relaxed">
                  <ShieldCheck className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                  <span>Cam kết giao dịch bảo mật & an toàn 100%</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
