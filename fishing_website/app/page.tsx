'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { productApi } from '../lib/api';

export default function LandingPage() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    productApi.getProducts({ page: 0, size: 3 })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
        setDbProducts(list);
      })
      .catch((err) => {
        console.error('Error fetching products for landing page:', err);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  const displayProducts = dbProducts.length > 0 ? dbProducts.slice(0, 3).map(p => {
    const firstVariant = p.variants?.[0];
    const basePrice = firstVariant ? Number(firstVariant.basePrice) : 0;
    const discountPrice = firstVariant && firstVariant.discountPrice ? Number(firstVariant.discountPrice) : null;
    const priceVal = discountPrice !== null && discountPrice < basePrice ? discountPrice : basePrice;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVal);

    return {
      title: p.name,
      price: formattedPrice,
      imageUrl: p.image || '/images/product-rod.png',
    };
  }) : [];

  // Mockup Hero Terrain Grid Data with Exact Image and Badge Specs
  const terrains = [
    {
      title: 'Biển',
      subtitle: 'Sea Fishing',
      badge: 'Professional',
      badgeClass: 'bg-[#00288e]', // Primary Ocean Blue
      imageUrl: '/images/sea-fishing.png',
      href: '/category#sea',
    },
    {
      title: 'Sông suối',
      subtitle: 'River Fishing',
      badge: 'Technique',
      badgeClass: 'bg-[#1f6c3a]', // Secondary Forest Green
      imageUrl: '/images/river-fishing.png',
      href: '/category#river',
    },
    {
      title: 'Hồ cá',
      subtitle: 'Lake Fishing',
      badge: 'Patience',
      badgeClass: 'bg-[#7f3500]', // Tertiary Container Rust
      imageUrl: '/images/lake-fishing.png',
      href: '/category#lake',
    },
    {
      title: 'Cắm trại',
      subtitle: 'Camping',
      badge: 'Adventure',
      badgeClass: 'bg-[#2e3132]', // Inverse Surface Grey
      imageUrl: '/images/camping.png',
      href: '/category#camping',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xs md:py-md">

        {/* HERO SECTION: Title & Description */}
        <section className="py-lg text-left md:text-center max-w-4xl mx-auto">
          {/* Centered large Headline with exact mockup text and break */}
          <h1 className="text-[36px] md:text-headline-xl text-primary font-bold tracking-tight leading-tight mb-sm md:text-center text-left">
            Chinh phục mọi địa hình,<br className="hidden md:inline" />Trải nghiệm trọn vẹn thiên nhiên.
          </h1>

          {/* Subtitle */}
          <p className="text-body-md md:text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed md:text-center text-left">
            WildStream Gear mang đến những trang bị câu cá và cắm trại chuyên nghiệp, giúp bạn tự tin khám phá những vùng đất mới lạ từ đại dương sâu thẳm đến đại ngàn hùng vĩ.
          </p>
        </section>

        {/* HERO LOCATION GRID (4-Column Terrain Picker) */}
        <section className="pb-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-sm md:gap-gutter">
            {terrains.map((terrain) => (
              <a
                key={terrain.title}
                href={terrain.href}
                className="group h-[480px] rounded-2xl overflow-hidden relative shadow-ambient hover:shadow-ambient-hover transition-all duration-300 cursor-pointer block"
              >
                {/* Background Image */}
                <img
                  src={terrain.imageUrl}
                  alt={terrain.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Dark Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Card Content at bottom-left */}
                <div className="absolute inset-0 p-md flex flex-col justify-end text-left z-10">
                  {/* Category Pill Tag */}
                  <div className="flex mb-xs">
                    <span className={`${terrain.badgeClass} text-white text-[10px] px-2.5 py-0.5 rounded-full font-sans font-semibold tracking-wider`}>
                      {terrain.badge}
                    </span>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-headline-md font-bold text-white tracking-tight leading-tight">
                    {terrain.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-label-sm text-surface-dim font-sans opacity-80 mb-sm">
                    {terrain.subtitle}
                  </p>

                  {/* Visual Button mimicking design: Khám phá ngay → */}
                  <div className="w-full bg-white text-on-surface rounded-full py-2.5 px-md text-label-sm font-semibold flex items-center justify-between shadow-sm group-hover:bg-surface-bright transition-colors duration-200">
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-4 h-4 text-on-surface" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US SECTION (Split grid layout) */}
        <section className="py-lg border-t border-outline-variant/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg md:gap-xl items-center">
            {/* Left Column: Reel Detail Image */}
            <div className="rounded-2xl overflow-hidden shadow-ambient border border-outline-variant/10 aspect-[4/3] bg-surface-container">
              <img
                src="/images/reel-detail.png"
                alt="WildStream Gear Technology"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Column: Copy & Badges */}
            <div className="text-left">
              <span className="text-label-sm text-primary tracking-widest uppercase font-bold block mb-xs">
                Tại sao chọn chúng tôi?
              </span>
              <h2 className="text-[28px] md:text-headline-lg font-bold text-on-surface tracking-tight leading-snug mb-sm">
                Công nghệ dẫn đầu hành trình của bạn
              </h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed mb-md">
                Mỗi sản phẩm tại WildStream Gear đều trải qua quy trình kiểm tra khắc nghiệt trong các điều kiện môi trường thực tế. Chúng tôi tin rằng trang bị tốt không chỉ mang lại hiệu quả mà còn là sự an tâm tuyệt đối.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                {/* Feature 1 */}
                <div className="flex items-center gap-sm bg-surface-container-low p-sm rounded-xl border border-outline-variant/20 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Chất lượng cao</h4>
                    <p className="text-[11px] text-on-surface-variant font-sans">Vật liệu siêu bền từ Nhật Bản</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-sm bg-surface-container-low p-sm rounded-xl border border-outline-variant/20 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">Bền vững</h4>
                    <p className="text-[11px] text-on-surface-variant font-sans">Cam kết bảo vệ thiên nhiên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS SECTION: 3 Products Centered */}
        <section className="py-xl border-t border-outline-variant/20">
          <div className="text-center mb-lg">
            <h2 className="text-headline-lg font-bold text-on-surface tracking-tight">
              Sản phẩm tiêu biểu
            </h2>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center items-center py-md">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : displayProducts.length > 0 ? (
            /* 3-Column Grid centered */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-sm md:gap-gutter max-w-5xl mx-auto">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.title}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.imageUrl}
                />
              ))}
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant/80 font-sans text-center">
              Hiện tại chưa có sản phẩm tiêu biểu nào được bổ sung lên website.
            </p>
          )}
        </section>

      </main>

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
