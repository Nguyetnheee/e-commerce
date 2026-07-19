'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import ProductCard from '../../../components/ProductCard';
import Footer from '../../../components/Footer';
import { Star, Heart, ShoppingCart, ShieldCheck, Compass, Info, ArrowLeft, ArrowRight, Check, Share2 } from 'lucide-react';
import { reviewApi, cartApi, productApi, getAuthToken } from '../../../lib/api';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      const fetchProduct = async () => {
        try {
          const res = await productApi.getProductById(id as string);
          setDbProduct(res);
        } catch (err) {
          console.error('Lỗi khi tải chi tiết sản phẩm:', err);
        } finally {
          setLoadingDb(false);
        }
      };
      fetchProduct();
    } else {
      setLoadingDb(false);
    }
  }, [id]);

  const handleAddToCart = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản khách hàng để thêm sản phẩm vào giỏ hàng và thực hiện mua hàng!');
      router.push('/login');
      return;
    }

    try {
      if (!dbProduct && isNaN(Number(id))) {
        alert('Đây là sản phẩm dùng thử (Mock). Vui lòng chọn sản phẩm thực tế từ Cơ sở dữ liệu để mua hàng!');
        return;
      }
      
      const vId = dbProduct?.variants?.[0]?.id || Number(id);
      await cartApi.addItem({ variantId: Number(vId), quantity });
      alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  const handleBuyNow = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản khách hàng để thực hiện mua hàng!');
      router.push('/login');
      return;
    }

    try {
      if (!dbProduct && isNaN(Number(id))) {
        alert('Đây là sản phẩm dùng thử (Mock). Vui lòng chọn sản phẩm thực tế từ Cơ sở dữ liệu để mua hàng!');
        return;
      }
      
      const vId = dbProduct?.variants?.[0]?.id || Number(id);
      await cartApi.addItem({ variantId: Number(vId), quantity });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
      router.push('/cart');
    } catch (err: any) {
      alert(err.message || 'Không thể thực hiện mua ngay.');
    }
  };

  const [selectedColor, setSelectedColor] = useState<'green' | 'orange'>('green');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const loadReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const res = await reviewApi.getReviews(id as string);
      if (res && Array.isArray(res.content)) {
        setReviews(res.content);
      } else if (Array.isArray(res)) {
        setReviews(res);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id]);

  // List of images for product display
  const productImages = [
    '/images/product-tent.png',
    '/images/camping.png',
    '/images/product-chair-terrain.png',
    '/images/reel-detail.png',
  ];

  // Specific color options matching requirements
  const colors = [
    { id: 'green', name: 'Forest Green', hex: '#1f6c3a', bgClass: 'bg-[#1f6c3a]' },
    { id: 'orange', name: 'Warm Orange', hex: '#e05600', bgClass: 'bg-[#e05600]' },
  ];

  // Specifications
  const specs = [
    { name: 'Kích thước sử dụng', value: '240 x 210 x 140 cm' },
    { name: 'Trọng lượng', value: '4.5 kg' },
    { name: 'Chất liệu vải', value: 'Polyester 190T chống nước PU3000mm' },
    { name: 'Khung lều', value: 'Sợi thủy tinh dẻo dai 8.5mm' },
    { name: 'Sức chứa', value: '3 - 4 người' },
    { name: 'Chỉ số chống nắng', value: 'UPF 50+' },
  ];

  // Feature highlight blocks with dark image backgrounds
  const features = [
    {
      title: 'Chống thấm 3000mm',
      subtitle: 'Khô ráo vượt trội',
      description: 'Lớp phủ PU cao cấp chống nước tuyệt đối, bảo vệ gia đình bạn trong mọi điều kiện giông bão.',
      bgImage: '/images/camping.png',
    },
    {
      title: 'Thông gió 360',
      subtitle: 'Thoáng mát tuyệt đối',
      description: 'Hệ thống lưu thông không khí 2 cửa đối xứng kết hợp lưới mesh chống muỗi giữ lều luôn khô thoáng.',
      bgImage: '/images/river-fishing.png',
    },
    {
      title: 'Tự bung thông minh',
      subtitle: 'Lắp đặt dưới 60 giây',
      description: 'Cơ chế trục xoay thuỷ lực thế hệ mới giúp dựng lều chỉ với một thao tác đẩy nhẹ nhàng.',
      bgImage: '/images/sea-fishing.png',
    },
  ];

  // Related products under the fold
  const relatedProducts = [
    {
      title: 'Cần câu suối Carbon River Master UL',
      price: '1.250.000 ₫',
      imageUrl: '/images/product-buggy.png',
      cardStyle: 'minimal' as const,
      badge: 'Bán chạy',
      badgeType: 'default' as const,
    },
    {
      title: 'Ghế dã ngoại xếp gọn Naturehike',
      price: '750.000 ₫',
      imageUrl: '/images/product-chair-terrain.png',
      cardStyle: 'detailed' as const,
      badge: 'Mới về',
      badgeType: 'accent' as const,
    },
    {
      title: 'Hòm đựng đồ dã ngoại 36L WildStream',
      price: '1.150.000 ₫',
      imageUrl: '/images/product-box-tackle.png',
      cardStyle: 'lake' as const,
      brand: 'WildStream',
    },
  ];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép đường dẫn sản phẩm vào bộ nhớ tạm!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Main PDP Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        
        {/* BREADCRUMBS: Small label-sm text */}
        <nav className="mb-sm text-label-sm text-on-surface-variant/70 flex items-center gap-xs flex-wrap">
          <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
          <span>&gt;</span>
          <a href="/category" className="hover:text-primary transition-colors">{dbProduct?.categoryName || 'Sản phẩm'}</a>
          <span>&gt;</span>
          <span className="text-on-surface font-semibold line-clamp-1">{dbProduct?.name || 'Lều Horizon 4 người'}</span>
        </nav>

        {loadingDb ? (
          <div className="flex flex-col items-center justify-center p-xl min-h-[50vh]">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-sm"></div>
            <p className="text-body-md text-on-surface-variant/80 font-sans">Đang tải thông tin sản phẩm...</p>
          </div>
        ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg mb-xl">
          
          {/* LEFT SIDE: Hero Image + Thumbnails */}
          <div className="lg:col-span-7 flex flex-col gap-sm">
            
            {/* Hero Main Image Container */}
            <div className="relative aspect-[4/3] bg-surface-container-low rounded-2xl overflow-hidden shadow-ambient group border border-outline-variant/10">
              <img
                src={dbProduct?.image || productImages[selectedImageIndex]}
                alt={dbProduct?.name || "Lều cắm trại Horizon"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Heart Wishlist Overlay Top-Right */}
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-md right-md w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-outline hover:text-red-500 hover:scale-105 active:scale-95 transition-all duration-200 z-10"
                aria-label="Thêm vào danh sách yêu thích"
              >
                <Heart
                  className={`w-5.5 h-5.5 transition-colors ${
                    isLiked ? 'fill-red-500 text-red-500' : 'text-outline-variant'
                  }`}
                />
              </button>

              {/* Share button next to wishlist */}
              <button
                type="button"
                onClick={handleShare}
                className="absolute top-md right-16 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-outline hover:text-primary hover:scale-105 active:scale-95 transition-all duration-200 z-10"
                aria-label="Chia sẻ sản phẩm"
              >
                <Share2 className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="grid grid-cols-4 gap-xs sm:gap-sm">
              {productImages.map((img, idx) => {
                const isActive = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden bg-surface-container border-2 transition-all duration-200 ${
                      isActive ? 'border-primary shadow-sm scale-[0.98]' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Lều Horizon ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Product Info */}
          <div className="lg:col-span-5 flex flex-col justify-between text-left">
            <div>
              {/* Pill-shaped status badge */}
              <div className="flex items-center mb-xs">
                <span className="bg-[#a4f1b2] text-[#24703e] text-[10px] px-3.5 py-1 rounded-full font-sans font-bold tracking-wider uppercase shadow-sm select-none">
                  Bán chạy nhất
                </span>
              </div>

              {/* Bold headline */}
              <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface tracking-tight leading-tight mb-sm">
                {dbProduct?.name || 'Lều cắm trại 4 người Horizon'}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-xs mb-md border-b border-outline-variant/10 pb-sm">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current text-amber-500" />
                  ))}
                </div>
                <span className="text-label-sm text-on-surface-variant font-medium">
                  5.0 (128 đánh giá)
                </span>
                <span className="text-outline-variant">|</span>
                <span className="text-label-sm text-secondary font-semibold">Đã bán 450+</span>
              </div>

              {/* Price in Ocean Blue (#00288e) */}
              <div className="mb-md">
                <span className="text-headline-lg font-extrabold text-[#00288e] tracking-tight">
                  {dbProduct ? (
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      dbProduct?.variants?.[0]?.discountPrice > 0 ? dbProduct.variants[0].discountPrice : (dbProduct?.variants?.[0]?.basePrice ?? dbProduct?.variants?.[0]?.price ?? dbProduct.basePrice ?? dbProduct.price ?? 5000)
                    )
                  ) : '3.450.000 ₫'}
                </span>
                {(!dbProduct || (dbProduct?.variants?.[0]?.discountPrice > 0 && dbProduct?.variants?.[0]?.discountPrice < (dbProduct?.variants?.[0]?.basePrice ?? dbProduct?.variants?.[0]?.price))) && (
                  <span className="text-label-sm text-on-surface-variant line-through ml-sm font-normal">
                    {dbProduct ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dbProduct?.variants?.[0]?.basePrice ?? dbProduct?.variants?.[0]?.price ?? dbProduct.basePrice ?? dbProduct.price ?? 5000) : '4.200.000 ₫'}
                  </span>
                )}
              </div>

              {/* Short promo description */}
              <p className="text-body-md text-on-surface-variant leading-relaxed mb-md">
                {dbProduct?.description || 'Horizon 4 là sự kết hợp hoàn hảo giữa thiết kế tự bung thông minh, khả năng thông gió 360 độ và chống thấm vượt trội lên đến 3000mm. Sự lựa chọn lý tưởng cho các buổi dã ngoại gia đình hay dã ngoại nhóm ngoài trời.'}
              </p>

              {/* Variants: Visual circular swatches for colors */}
              <div className="mb-md border-t border-outline-variant/10 pt-sm">
                <span className="text-label-md text-on-surface font-bold block mb-xs">
                  Màu sắc: <span className="font-semibold text-on-surface-variant">{colors.find(c => c.id === selectedColor)?.name}</span>
                </span>
                <div className="flex items-center gap-sm">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id as 'green' | 'orange')}
                        className={`w-9 h-9 rounded-full ${color.bgClass} flex items-center justify-center relative cursor-pointer focus:outline-none transition-transform active:scale-95`}
                        title={color.name}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 rounded-full border-2 border-white flex items-center justify-center">
                            <Check className="w-4 h-4 text-white font-bold" />
                          </span>
                        )}
                        <span className={`absolute inset-[-4px] rounded-full border-2 transition-colors duration-200 ${
                          isSelected ? 'border-primary' : 'border-transparent'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mb-md flex items-center gap-md">
                <span className="text-label-md text-on-surface font-bold">Số lượng:</span>
                <div className="flex items-center border border-outline-variant/40 rounded-md bg-surface-container-low overflow-hidden">
                  <button
                    type="button"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3.5 py-1.5 hover:bg-surface-container text-on-surface transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 font-sans text-label-md font-bold text-on-surface">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-1.5 hover:bg-surface-container text-on-surface transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* TWO BUTTONS SIDE-BY-SIDE */}
            <div className="flex flex-col sm:flex-row gap-xs sm:gap-sm mt-sm pt-sm border-t border-outline-variant/10">
              
              {/* Left button: Add to Cart (Forest Green) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#1f6c3a] hover:bg-[#1a5b31] text-white text-label-md font-bold rounded-md py-3.5 px-sm flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none active:scale-[0.98] cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>THÊM VÀO GIỎ</span>
              </button>

              {/* Right button: Buy Now (Warm Orange CTA) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 bg-[#e05600] hover:bg-[#c84d00] text-white text-label-md font-bold rounded-md py-3.5 px-sm flex items-center justify-center gap-xs shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none active:scale-[0.98] cursor-pointer"
              >
                <span>MUA NGAY</span>
              </button>
            </div>
          </div>
        </section>
        )}

        {/* BELOW THE FOLD SECTION */}
        <section className="border-t border-outline-variant/20 pt-lg mb-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            
            {/* Left Col: Specs (7 columns) */}
            <div className="lg:col-span-7">
              <h2 className="text-headline-md font-bold text-on-surface tracking-tight mb-md flex items-center gap-xs text-left">
                <Info className="w-6 h-6 text-primary" />
                Thông số kỹ thuật
              </h2>

              {/* Clean white cards with subtle outlines (#e5e7eb) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className="bg-surface-container-lowest border border-[#e5e7eb] rounded-xl p-sm shadow-sm flex flex-col justify-between text-left"
                  >
                    <span className="text-label-sm text-on-surface-variant/80 font-medium block">
                      {spec.name}
                    </span>
                    <span className="text-body-md font-bold text-on-surface mt-1 block">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Tabs for detail description */}
              <div className="mt-lg">
                <div className="flex border-b border-outline-variant/20 mb-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-md font-sans text-label-md font-bold border-b-2 transition-all duration-200 ${
                      activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                    }`}
                  >
                    Mô tả chi tiết
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`py-2 px-md font-sans text-label-md font-bold border-b-2 transition-all duration-200 ${
                      activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                    }`}
                  >
                    Đánh giá từ khách hàng
                  </button>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-md shadow-sm text-left">
                  {activeTab === 'details' ? (
                    <article className="prose prose-sm text-on-surface-variant max-w-none leading-relaxed space-y-sm">
                      <p>
                        Lều dã ngoại tự bung Horizon là giải pháp lý tưởng dành cho những ai yêu thích việc cắm trại dã ngoại nhưng không muốn tốn nhiều thời gian cho công đoạn lắp đặt. Với công nghệ tự động lò xo áp lực thế hệ mới, bạn có thể tự mình dựng lều chỉ trong vài chục giây.
                      </p>
                      <p className="font-semibold text-on-surface">Các ưu điểm nổi bật:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Lớp vải phủ Polyester phủ keo bạc nâng cao hệ số cản tia UV hại da đến 99%.</li>
                        <li>Đường may được ép keo nhiệt chống rò rỉ nước ở các vị trí khớp nối.</li>
                        <li>Chân đế thiết kế gia cường giúp cố định lều vững vàng trên cát biển hay đất bùn lầy.</li>
                      </ul>
                    </article>
                  ) : (
                    <div className="space-y-md">
                      {loadingReviews ? (
                        <p className="text-label-sm text-on-surface-variant animate-pulse">Đang tải đánh giá...</p>
                      ) : reviews.length > 0 ? (
                        reviews.map((rev) => (
                          <div key={rev.id} className="flex items-start gap-sm border-b border-outline-variant/10 pb-sm">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {rev.userName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-on-surface text-label-md">{rev.userName || 'Ẩn danh'}</span>
                                <span className="text-[11px] text-on-surface-variant">
                                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                                </span>
                              </div>
                              <div className="flex text-amber-500 my-1">
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                              <p className="text-[13px] text-on-surface-variant">{rev.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-label-sm text-on-surface-variant">Chưa có đánh giá nào cho sản phẩm này.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Safe purchase indicators (5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-sm">
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-md text-left">
                <h3 className="text-label-md font-bold text-on-surface uppercase mb-sm tracking-wider">
                  Chính sách bảo hành & Cam kết
                </h3>
                <div className="space-y-sm">
                  <div className="flex items-start gap-xs">
                    <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-label-sm font-bold text-on-surface">Bảo hành 1 đổi 1</h4>
                      <p className="text-[11px] text-on-surface-variant">Lỗi sản xuất đổi mới hoàn toàn miễn phí trong vòng 7 ngày đầu.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-xs">
                    <Compass className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-label-sm font-bold text-on-surface">Hỗ trợ trọn đời</h4>
                      <p className="text-[11px] text-on-surface-variant">Hỗ trợ sửa chữa thay thế linh kiện khung sườn lều ưu đãi lâu dài.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge Visual Grid */}
              <div className="grid grid-cols-3 gap-xs">
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-xs flex flex-col items-center justify-center text-center">
                  <span className="text-body-lg text-primary font-bold">100%</span>
                  <span className="text-[9px] text-on-surface-variant font-sans font-bold">Chính Hãng</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-xs flex flex-col items-center justify-center text-center">
                  <span className="text-body-lg text-secondary font-bold">PU3000</span>
                  <span className="text-[9px] text-on-surface-variant font-sans font-bold">Chống Nước</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-xs flex flex-col items-center justify-center text-center">
                  <span className="text-body-lg text-accent-orange font-bold">UPF50+</span>
                  <span className="text-[9px] text-on-surface-variant font-sans font-bold">Chống Nắng</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* TÍNH NĂNG NỔI BẬT SECTION: Dark Image Background cards */}
        <section className="border-t border-outline-variant/20 pt-lg mb-xl text-left">
          <h2 className="text-headline-md font-bold text-on-surface tracking-tight mb-md">
            Tính năng nổi bật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-sm md:gap-gutter">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group h-[320px] rounded-2xl overflow-hidden relative shadow-ambient hover:shadow-ambient-hover transition-all duration-300 block"
              >
                {/* Background Image */}
                <img
                  src={feature.bgImage}
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Dark Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Card Content at bottom */}
                <div className="absolute inset-0 p-md flex flex-col justify-end text-left z-10">
                  <span className="text-[10px] text-accent-orange font-bold uppercase tracking-wider mb-xs">
                    {feature.subtitle}
                  </span>
                  <h3 className="text-headline-md font-bold text-white tracking-tight leading-tight mb-xs">
                    {feature.title}
                  </h3>
                  <p className="text-label-sm text-surface-dim font-sans opacity-85">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        <section className="border-t border-outline-variant/20 pt-lg pb-lg text-left">
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-headline-md font-bold text-on-surface tracking-tight">
              Sản phẩm thường được mua cùng
            </h2>
            <a href="/category#camping" className="text-label-sm text-primary font-bold hover:underline flex items-center gap-xs">
              Xem tất cả đồ cắm trại <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-sm md:gap-gutter">
            {relatedProducts.map((p, idx) => (
              <ProductCard
                key={idx}
                title={p.title}
                price={p.price}
                imageUrl={p.imageUrl}
                cardStyle={p.cardStyle}
                badge={p.badge}
                badgeType={p.badgeType}
                brand={p.brand}
              />
            ))}
          </div>
        </section>

      </main>

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
