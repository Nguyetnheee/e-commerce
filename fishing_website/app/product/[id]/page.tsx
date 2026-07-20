'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import ProductCard from '../../../components/ProductCard';
import Footer from '../../../components/Footer';
import { Star, Heart, ShoppingCart, ShieldCheck, Compass, Info, ArrowLeft, ArrowRight, Share2, Edit2, Trash2 } from 'lucide-react';
import { reviewApi, cartApi, productApi, getAuthToken } from '../../../lib/api';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      const fetchProduct = async () => {
        try {
          const res = await productApi.getProductById(id as string);
          setDbProduct(res);
          setSelectedVariantId(res?.variants?.[0]?.id ? Number(res.variants[0].id) : null);
          if (res?.categoryId) {
            const related = await productApi.getProducts({
              categoryId: res.categoryId,
              isVisible: true,
              size: 4,
              sort: ['id,desc'],
            });
            const list = Array.isArray(related) ? related : related?.content || [];
            setRelatedProducts(list.filter((item: any) => Number(item.id) !== Number(id)).slice(0, 3));
          }
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
      if (!dbProduct || !selectedVariantId) {
        alert('Sản phẩm hoặc lựa chọn bán hàng không còn tồn tại trong cơ sở dữ liệu.');
        return;
      }
      
      await cartApi.addItem({ variantId: selectedVariantId, quantity });
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
      if (!dbProduct || !selectedVariantId) {
        alert('Sản phẩm hoặc lựa chọn bán hàng không còn tồn tại trong cơ sở dữ liệu.');
        return;
      }
      
      await cartApi.addItem({ variantId: selectedVariantId, quantity });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
      router.push('/cart');
    } catch (err: any) {
      alert(err.message || 'Không thể thực hiện mua ngay.');
    }
  };

  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const [reviews, setReviews] = useState<any[]>([]);
  const [myReviewIds, setMyReviewIds] = useState<Set<number>>(new Set());
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
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
      if (getAuthToken()) {
        const mine = await reviewApi.getMyReviews();
        setMyReviewIds(new Set((Array.isArray(mine) ? mine : []).map((review: any) => Number(review.id))));
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

  const saveReviewEdit = async () => {
    if (!editingReview) return;
    try {
      await reviewApi.updateReview(editingReview.id, {
        orderId: editingReview.orderId,
        productId: editingReview.productId,
        rating: editRating,
        text: editText.trim(),
        images: editingReview.images || [],
      });
      setEditingReview(null);
      await loadReviews();
    } catch (error: any) {
      alert(error.message || 'Không thể sửa đánh giá');
    }
  };

  const deleteOwnReview = async (review: any) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await reviewApi.deleteReview(review.id);
      await loadReviews();
    } catch (error: any) {
      alert(error.message || 'Không thể xóa đánh giá');
    }
  };

  const selectedVariant = dbProduct?.variants?.find(
    (variant: any) => Number(variant.id) === selectedVariantId
  ) || dbProduct?.variants?.[0];
  const selectedBasePrice = Number(selectedVariant?.basePrice || 0);
  const selectedDiscountPrice = Number(selectedVariant?.discountPrice || 0);
  const selectedPrice = selectedDiscountPrice > 0 && selectedDiscountPrice < selectedBasePrice
    ? selectedDiscountPrice
    : selectedBasePrice;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const specs = dbProduct ? [
    { name: 'Mã sản phẩm', value: dbProduct.code || '—' },
    { name: 'Loại sản phẩm', value: dbProduct.categoryName || '—' },
    { name: 'Thương hiệu', value: dbProduct.brandName || '—' },
    { name: 'Nhà cung cấp', value: dbProduct.supplierName || '—' },
    { name: 'Chất liệu', value: dbProduct.material || '—' },
    { name: 'Tồn kho', value: `${selectedVariant?.stockQuantity ?? 0} sản phẩm` },
  ] : [];

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
          <span className="text-on-surface font-semibold line-clamp-1">{dbProduct?.name || 'Đang tải sản phẩm...'}</span>
        </nav>

        {loadingDb ? (
          <div className="flex flex-col items-center justify-center p-xl min-h-[50vh]">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-sm"></div>
            <p className="text-body-md text-on-surface-variant/80 font-sans">Đang tải thông tin sản phẩm...</p>
          </div>
        ) : !dbProduct ? (
          <div className="py-xl text-center">
            <h1 className="text-headline-md font-bold">Không tìm thấy sản phẩm</h1>
            <button onClick={() => router.push('/category')} className="mt-md text-primary font-bold">
              Quay lại danh sách sản phẩm
            </button>
          </div>
        ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg mb-xl">
          
          {/* LEFT SIDE: Hero Image + Thumbnails */}
          <div className="lg:col-span-7 flex flex-col gap-sm">
            
            {/* Hero Main Image Container */}
            <div className="relative aspect-[4/3] bg-surface-container-low rounded-2xl overflow-hidden shadow-ambient group border border-outline-variant/10">
              <img
                src={dbProduct.image || '/images/product-rod.png'}
                alt={dbProduct.name}
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

          </div>

          {/* RIGHT SIDE: Product Info */}
          <div className="lg:col-span-5 flex flex-col justify-between text-left">
            <div>
              {/* Pill-shaped status badge */}
              <div className="flex items-center mb-xs">
                <span className="bg-[#a4f1b2] text-[#24703e] text-[10px] px-3.5 py-1 rounded-full font-sans font-bold tracking-wider uppercase shadow-sm select-none">
                  {dbProduct.isVisible ? 'Đang bán' : 'Tạm ẩn'}
                </span>
              </div>

              {/* Bold headline */}
              <h1 className="text-headline-md md:text-headline-lg font-bold text-on-surface tracking-tight leading-tight mb-sm">
                {dbProduct.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-xs mb-md border-b border-outline-variant/10 pb-sm">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4.5 h-4.5 ${i < Math.round(averageRating) ? 'fill-current text-amber-500' : 'text-slate-300'}`} />
                  ))}
                </div>
                <span className="text-label-sm text-on-surface-variant font-medium">
                  {averageRating.toFixed(1)} ({reviews.length} đánh giá)
                </span>
              </div>

              {/* Price in Ocean Blue (#00288e) */}
              <div className="mb-md">
                <span className="text-headline-lg font-extrabold text-[#00288e] tracking-tight">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPrice)}
                </span>
                {selectedDiscountPrice > 0 && selectedDiscountPrice < selectedBasePrice && (
                  <span className="text-label-sm text-on-surface-variant line-through ml-sm font-normal">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBasePrice)}
                  </span>
                )}
              </div>

              {/* Short promo description */}
              <p className="text-body-md text-on-surface-variant leading-relaxed mb-md">
                {dbProduct.description || 'Sản phẩm chưa có mô tả.'}
              </p>

              {/* Sellable variants come directly from the database. */}
              <div className="mb-md border-t border-outline-variant/10 pt-sm">
                <span className="text-label-md text-on-surface font-bold block mb-xs">
                  Lựa chọn sản phẩm
                </span>
                <select
                  value={selectedVariantId || ''}
                  onChange={(event) => setSelectedVariantId(Number(event.target.value))}
                  className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-white"
                >
                  {(dbProduct.variants || []).map((variant: any) => (
                    <option key={variant.id} value={variant.id} disabled={Number(variant.stockQuantity) <= 0}>
                      {variant.variantName || variant.sku} — Còn {variant.stockQuantity || 0}
                    </option>
                  ))}
                </select>
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
                      <p>{dbProduct?.description || 'Sản phẩm chưa có mô tả chi tiết.'}</p>
                      {dbProduct?.material && <p><strong>Chất liệu:</strong> {dbProduct.material}</p>}
                      {dbProduct?.action && <p><strong>Thông tin:</strong> {dbProduct.action}</p>}
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
                              {myReviewIds.has(Number(rev.id)) && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => { setEditingReview(rev); setEditRating(rev.rating); setEditText(rev.text || ''); }}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" /> Sửa
                                  </button>
                                  <button onClick={() => deleteOwnReview(rev)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline">
                                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                                  </button>
                                </div>
                              )}
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
                      <p className="text-[11px] text-on-surface-variant">Hỗ trợ thông tin sử dụng và chính sách sau bán hàng.</p>
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
                  <span className="text-body-lg text-secondary font-bold">{selectedVariant?.stockQuantity ?? 0}</span>
                  <span className="text-[9px] text-on-surface-variant font-sans font-bold">Còn trong kho</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-xs flex flex-col items-center justify-center text-center">
                  <span className="text-body-lg text-accent-orange font-bold">DB</span>
                  <span className="text-[9px] text-on-surface-variant font-sans font-bold">Giá trực tiếp</span>
                </div>
              </div>
            </div>

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
                key={p.id || idx}
                id={p.id}
                title={p.name}
                price={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Number(p.variants?.[0]?.discountPrice || p.variants?.[0]?.basePrice || 0)
                )}
                imageUrl={p.image || '/images/product-rod.png'}
                cardStyle="minimal"
                brand={p.brandName}
                onClick={() => router.push(`/product/${p.id}`)}
              />
            ))}
          </div>
        </section>

      </main>

      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-left">
            <h2 className="text-xl font-bold">Sửa đánh giá của bạn</h2>
            <div className="flex gap-1 my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setEditRating(star)}>
                  <Star className={`w-8 h-8 ${star <= editRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={4} className="w-full border rounded-xl p-3" />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditingReview(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-semibold">Hủy</button>
              <button onClick={saveReviewEdit} className="px-4 py-2 bg-primary text-white rounded-lg font-semibold">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
