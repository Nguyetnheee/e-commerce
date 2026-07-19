'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import Footer from '../../components/Footer';
import { ChevronLeft, ChevronRight, Filter, LayoutGrid, Award, Shield, Tag } from 'lucide-react';
import { productApi, cartApi, getAuthToken } from '../../lib/api';

export default function CategoryPage() {
  const router = useRouter();
  const [activeHash, setActiveHash] = useState('river');

  // Track the window hash on client side
  useEffect(() => {
    const handleHashChange = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      if (hash === 'sea' || hash === 'river' || hash === 'lake' || hash === 'camping') {
        setActiveHash(hash);
      } else {
        setActiveHash('river');
      }
    };

    handleHashChange();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  // DB dynamic products loading
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  const mapBackendProduct = (p: any) => {
    const firstVariant = p.variants?.[0];
    const rawPrice = firstVariant ? (firstVariant.basePrice ?? firstVariant.price) : (p.basePrice ?? p.price);
    const basePrice = rawPrice !== undefined && rawPrice !== null ? Number(rawPrice) : 5000;
    const discountPrice = firstVariant && firstVariant.discountPrice ? Number(firstVariant.discountPrice) : null;
    const priceVal = discountPrice !== null && discountPrice > 0 && discountPrice < basePrice ? discountPrice : basePrice;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVal);

    return {
      id: String(p.id),
      variantId: firstVariant ? firstVariant.id : Number(p.id),
      brand: p.brandName || 'WildStream',
      brandKey: (p.brandName || 'wildstream').toLowerCase(),
      title: p.name,
      description: p.description || '',
      price: formattedPrice,
      priceVal: priceVal,
      imageUrl: p.image || '/images/product-buggy.png',
      badge: p.tags?.includes('Bán chạy') ? 'Bán chạy' : p.tags?.includes('Mới') ? 'Mới' : '',
      badgeType: p.tags?.includes('Bán chạy') ? 'default' as const : 'premium' as const,
      action: p.description?.includes('Moderate') ? 'Moderate' : p.description?.includes('Slow') ? 'Slow' : 'Fast',
      material: p.material || (p.description?.includes('Titan') ? 'Titan' : 'Carbon'),
      type: p.categoryName || 'Sông',
      usageType: p.usageType || '',
      categoryName: p.categoryName || '',
      parentCategoryName: p.parentCategoryName || '',
      menuType: 'all',
    };
  };

  const handleAddToCart = async (product: any) => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản khách hàng để thêm sản phẩm vào giỏ hàng và thực hiện mua hàng!');
      router.push('/login');
      return;
    }

    try {
      if (isNaN(Number(product.id))) {
        alert('Đây là sản phẩm dùng thử (Mock). Vui lòng chọn sản phẩm thực tế từ Cơ sở dữ liệu để mua hàng!');
        return;
      }
      
      const vId = product.variantId || Number(product.id);
      await cartApi.addItem({ variantId: Number(vId), quantity: 1 });
      alert(`Đã thêm sản phẩm "${product.title}" vào giỏ hàng thành công!`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        setLoadingDb(true);
        const data = await productApi.getProducts();
        const productsList = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
        setDbProducts(productsList.map(mapBackendProduct));
      } catch (err) {
        console.log('Backend API listing not available yet. Falling back to mock data.', err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchDbProducts();
  }, []);

  // Shared state filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]); // For River action (Fast/Moderate/Slow)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]); // For Sea materials
  const [activeMenuType, setActiveMenuType] = useState<string>('all'); // For Sea menu items
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // For Lake fishing types (Câu Lục, Câu Đài, Câu Lăng Xê)
  const [sortBy, setSortBy] = useState<string>('newest');

  // Reset/Set initial filters when changing active hash
  useEffect(() => {
    setSelectedBrands([]);
    setSelectedPrices([]);
    setSelectedActions([]);
    setSelectedMaterials([]);
    setActiveMenuType('all');
    
    if (activeHash === 'lake') {
      // By default in mockup, "Câu Lục" is checked!
      setSelectedTypes(['Câu Lục']);
    } else {
      setSelectedTypes([]);
    }
  }, [activeHash]);

  // Original mockup products list for River Fishing
  const riverProducts = useMemo(() => [
    {
      id: 'river-1',
      brand: 'SHIMANO',
      title: 'Cần câu suối Carbon River Master UL',
      description: 'Dòng cần siêu nhẹ tối ưu cho môi trường nước chảy mạnh suối tự nhiên.',
      price: '1.250.000 ₫',
      priceVal: 1250000,
      imageUrl: '/images/product-buggy.png',
      badge: 'Bán chạy',
      badgeType: 'default' as const,
      action: 'Fast',
    },
    {
      id: 'river-2',
      brand: 'DAIWA',
      title: 'Cần câu Daiwa Presso Air AGS Ultralight',
      description: 'Trang bị khoen AGS siêu nhẹ, cảm giác dòng cá tuyệt đỉnh trong khe suối.',
      price: '8.400.000 ₫',
      priceVal: 8400000,
      imageUrl: '/images/product-keitruck.png',
      badge: 'Premium',
      badgeType: 'premium' as const,
      action: 'Moderate',
    },
    {
      id: 'river-3',
      brand: 'ABU GARCIA',
      title: 'Abu Garcia Troutin Marquis Nano Stream',
      description: 'Sử dụng công nghệ Nano carbon tăng độ bền và giảm trọng lượng cần tối đa.',
      price: '3.200.000 ₫',
      priceVal: 3200000,
      imageUrl: '/images/product-yellowfish.png',
      action: 'Slow',
    },
  ], []);

  // Original mockup products list for Sea Fishing
  const seaProducts = useMemo(() => [
    {
      id: 'sea-1',
      brand: 'SHIMANO',
      title: 'Máy câu Shimano bạo lực Stella SW',
      description: 'Dòng máy cao cấp nhất cho câu biển, chịu lực cực đại...',
      price: '18.500.000 ₫',
      priceVal: 18500000,
      imageUrl: '/images/product-stella.png',
      badge: 'Bán chạy',
      badgeType: 'default' as const,
      material: 'Titan',
      brandKey: 'Shimano',
      ratingCount: 53,
      menuType: 'gear',
    },
    {
      id: 'sea-2',
      brand: 'DAIWA',
      title: 'Cần Câu Carbon Daiwa Saltiga',
      description: 'Phôi Carbon mật độ cao, cực nhẹ và dẻo dai cho những c...',
      price: '12.200.000 ₫',
      priceVal: 12200000,
      imageUrl: '/images/product-saltiga.png',
      material: 'Carbon',
      brandKey: 'Daiwa',
      ratingCount: 32,
      menuType: 'gear',
    },
    {
      id: 'sea-3',
      brand: 'ABU GARCIA',
      title: 'Bộ Lưỡi Câu Titan Chống Gỉ',
      description: 'Vật liệu Titan tinh khiết, sắc bén vĩnh viễn, chống ăn...',
      price: '850.000 ₫',
      priceVal: 850000,
      imageUrl: '/images/product-titan-hook.png',
      badge: 'Mới về',
      badgeType: 'accent' as const,
      material: 'Titan',
      brandKey: 'Abu Garcia',
      ratingCount: 50,
      menuType: 'gear',
    },
    {
      id: 'sea-4',
      brand: 'PENN',
      title: 'Máy Câu Penn Senator 9/0',
      description: 'Huyền thoại cho những chuyến săn cá ngừ đại dương...',
      price: '5.800.000 ₫',
      priceVal: 5800000,
      imageUrl: '/images/product-penn.png',
      material: 'Thép không gỉ',
      brandKey: 'Penn',
      ratingCount: 45,
      menuType: 'gear',
    },
    {
      id: 'sea-5',
      brand: 'PENN',
      title: 'Dây Câu Braid X8 Super',
      description: 'Độ bền vượt trội, siêu mịn giúp giảm ma sát khi quăng...',
      price: '1.250.000 ₫',
      priceVal: 1250000,
      imageUrl: '/images/product-braid.png',
      material: 'Carbon',
      brandKey: 'Penn',
      ratingCount: 71,
      menuType: 'gear',
    },
    {
      id: 'sea-6',
      brand: 'WILDSTREAM',
      title: 'Áo Câu Biển Chống Tia UV',
      description: 'Vải thun lạnh cao cấp, thoát mồ hôi cực nhanh, chỉ số U...',
      price: '1.800.000 ₫',
      priceVal: 1800000,
      imageUrl: '/images/product-shirt.png',
      material: 'Vải',
      brandKey: 'Wildstream',
      ratingCount: 60,
      menuType: 'clothing',
    },
  ], []);

  // Original mockup products list for Lake Fishing
  const lakeProducts = useMemo(() => [
    {
      id: 'lake-1',
      brand: 'Shimano',
      title: 'Cần Câu Lục Shimano Holiday Spin',
      price: '3.450.000đ',
      priceVal: 3450000,
      imageUrl: '/images/product-holiday-spin.png',
      badge: 'Bán chạy',
      badgeType: 'default' as const,
      types: ['Câu Lục'],
      brandKey: 'Shimano',
    },
    {
      id: 'lake-2',
      brand: 'Handing',
      title: 'Cần Câu Đài Handing Long Vân',
      price: '1.280.000đ',
      priceVal: 1280000,
      imageUrl: '/images/product-long-van.png',
      types: ['Câu Lục', 'Câu Đài'],
      brandKey: 'Handing',
    },
    {
      id: 'lake-3',
      brand: 'Kaiwo',
      title: 'Phao Câu Hồ Titan X-Series',
      price: '450.000đ',
      priceVal: 450000,
      imageUrl: '/images/product-titan-float.png',
      badge: 'Mới về',
      badgeType: 'premium' as const,
      types: ['Câu Lục', 'Câu Đài'],
      brandKey: 'Kaiwo',
    },
    {
      id: 'lake-4',
      brand: 'WildStream',
      title: 'Ghế Câu Địa Hình WildStream Pro',
      price: '2.150.000đ',
      priceVal: 2150000,
      imageUrl: '/images/product-chair-terrain.png',
      types: ['Câu Lục', 'Câu Đài', 'Câu Lăng Xê'],
      brandKey: 'WildStream',
    },
    {
      id: 'lake-5',
      brand: 'Shimano',
      title: 'Máy Câu Shimano Stradic FM',
      price: '4.890.000đ',
      priceVal: 4890000,
      imageUrl: '/images/product-stradic-reel.png',
      types: ['Câu Lục', 'Câu Lăng Xê'],
      brandKey: 'Shimano',
    },
    {
      id: 'lake-6',
      brand: 'WildStream',
      title: 'Thùng Câu Cá Đa Năng 36L',
      price: '1.550.000đ',
      priceVal: 1550000,
      imageUrl: '/images/product-box-tackle.png',
      types: ['Câu Lục', 'Câu Đài', 'Câu Lăng Xê'],
      brandKey: 'WildStream',
    },
  ], []);

  // Original mockup products list for Camping
  const campingProducts = useMemo(() => [
    {
      id: 'camping-1',
      brand: 'Naturehike',
      title: 'Lều Cắm Trại 4 Người Peak-4',
      price: '5.800.000đ',
      priceVal: 5800000,
      imageUrl: '/images/product-tent.png',
      badge: 'Bán chạy',
      badgeType: 'default' as const,
      type: 'Lều trại',
      brandKey: 'Naturehike',
    },
    {
      id: 'camping-2',
      brand: 'WildStream',
      title: 'Ghế Dã Ngoại Xếp Gọn WildStream',
      price: '2.150.000đ',
      priceVal: 2150000,
      imageUrl: '/images/product-chair-terrain.png',
      type: 'Ghế & Thảm',
      brandKey: 'WildStream',
    },
    {
      id: 'camping-3',
      brand: 'WildStream',
      title: 'Thùng Đựng Đồ Dã Ngoại Đa Năng 36L',
      price: '1.550.000đ',
      priceVal: 1550000,
      imageUrl: '/images/product-box-tackle.png',
      type: 'Phụ kiện',
      brandKey: 'WildStream',
    },
    {
      id: 'camping-4',
      brand: 'WildStream',
      title: 'Áo Khoác Dã Ngoại Chống Tia UV',
      price: '1.800.000đ',
      priceVal: 1800000,
      imageUrl: '/images/product-shirt.png',
      badge: 'Mới về',
      badgeType: 'premium' as const,
      type: 'Trang phục',
      brandKey: 'WildStream',
    },
  ], []);

  // Filter handlers
  const handleToggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleTogglePrice = (range: string) => {
    if (activeHash === 'lake') {
      // Radio button choice behavior for Lake
      setSelectedPrices(prev => prev.includes(range) ? [] : [range]);
    } else {
      setSelectedPrices(prev =>
        prev.includes(range) ? prev.filter(p => p !== range) : [...prev, range]
      );
    }
  };

  const handleToggleAction = (action: string) => {
    setSelectedActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const handleToggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const activeProducts = useMemo(() => {
    if (dbProducts.length > 0) {
      if (activeHash === 'sea') {
        return dbProducts.filter(p => 
          p.usageType === 'BIEN' || 
          p.type === 'Biển' || 
          p.type === 'sea' || 
          p.categoryName?.toLowerCase().includes('biển') || 
          p.parentCategoryName?.toLowerCase().includes('biển')
        );
      } else if (activeHash === 'lake') {
        return dbProducts.filter(p => 
          p.usageType === 'HO' || 
          p.type === 'Hồ' || 
          p.type === 'lake' || 
          p.categoryName?.toLowerCase().includes('hồ') || 
          p.parentCategoryName?.toLowerCase().includes('hồ')
        );
      } else if (activeHash === 'camping') {
        return dbProducts.filter(p => 
          p.usageType === 'CAM_TRAI' || 
          p.type === 'Dã ngoại' || 
          p.type === 'camping' || 
          p.categoryName?.toLowerCase().includes('dã ngoại') || 
          p.categoryName?.toLowerCase().includes('cắm trại') || 
          p.parentCategoryName?.toLowerCase().includes('dã ngoại') || 
          p.parentCategoryName?.toLowerCase().includes('cắm trại')
        );
      } else {
        return dbProducts.filter(p => 
          p.usageType === 'SONG' || 
          p.type === 'Sông' || 
          p.type === 'river' || 
          p.categoryName?.toLowerCase().includes('sông') || 
          p.parentCategoryName?.toLowerCase().includes('sông')
        );
      }
    }
    return []; // No mock fallback
  }, [dbProducts, activeHash]);

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    if (activeHash === 'sea') {
      let result = activeProducts.filter(product => {
        if (activeMenuType !== 'all' && product.menuType !== activeMenuType) return false;
        if (selectedBrands.length > 0 && !selectedBrands.some(b => b.toLowerCase() === product.brandKey.toLowerCase())) return false;
        if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) return false;
        
        if (selectedPrices.length > 0) {
          const matchesPrice = selectedPrices.some(priceRange => {
            if (priceRange === 'under1m') return product.priceVal < 1000000;
            if (priceRange === '1m-5m') return product.priceVal >= 1000000 && product.priceVal <= 5000000;
            if (priceRange === 'over5m') return product.priceVal > 5000000;
            return false;
          });
          if (!matchesPrice) return false;
        }
        return true;
      });

      if (sortBy === 'price-low') result.sort((a, b) => a.priceVal - b.priceVal);
      else if (sortBy === 'price-high') result.sort((a, b) => b.priceVal - a.priceVal);
      return result;

    } else if (activeHash === 'lake') {
      let result = activeProducts.filter(product => {
        // Fishing type checkbox filter
        if (selectedTypes.length > 0 && product.types && !product.types.some((t: any) => selectedTypes.includes(t))) return false;

        // Brand checkbox filter
        if (selectedBrands.length > 0 && !selectedBrands.some(b => b.toLowerCase() === product.brandKey.toLowerCase())) return false;

        // Price radio filter
        if (selectedPrices.length > 0) {
          const matchesPrice = selectedPrices.some(priceRange => {
            if (priceRange === 'under1m') return product.priceVal < 1000000;
            if (priceRange === '1m-5m') return product.priceVal >= 1000000 && product.priceVal <= 5000000;
            if (priceRange === 'over5m') return product.priceVal > 5000000;
            return false;
          });
          if (!matchesPrice) return false;
        }
        return true;
      });

      if (sortBy === 'price-low') result.sort((a, b) => a.priceVal - b.priceVal);
      else if (sortBy === 'price-high') result.sort((a, b) => b.priceVal - a.priceVal);
      return result;

    } else if (activeHash === 'camping') {
      let result = activeProducts.filter(product => {
        // Camping type checkbox filter
        if (selectedTypes.length > 0 && !selectedTypes.includes(product.type)) return false;

        // Brand checkbox filter
        if (selectedBrands.length > 0 && !selectedBrands.some(b => b.toLowerCase() === product.brandKey.toLowerCase())) return false;

        // Price checkbox filter
        if (selectedPrices.length > 0) {
          const matchesPrice = selectedPrices.some(priceRange => {
            if (priceRange === 'under1m') return product.priceVal < 1000000;
            if (priceRange === '1m-5m') return product.priceVal >= 1000000 && product.priceVal <= 5000000;
            if (priceRange === 'over5m') return product.priceVal > 5000000;
            return false;
          });
          if (!matchesPrice) return false;
        }
        return true;
      });

      if (sortBy === 'price-low') result.sort((a, b) => a.priceVal - b.priceVal);
      else if (sortBy === 'price-high') result.sort((a, b) => b.priceVal - a.priceVal);
      return result;

    } else {
      // River filtering logic
      return activeProducts.filter(product => {
        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
        if (selectedActions.length > 0 && !selectedActions.includes(product.action)) return false;

        if (selectedPrices.length > 0) {
          const matchesPrice = selectedPrices.some(priceRange => {
            if (priceRange === 'under1m') return product.priceVal < 1000000;
            if (priceRange === '1m-3m') return product.priceVal >= 1000000 && product.priceVal <= 3000000;
            if (priceRange === 'over3m') return product.priceVal > 3000000;
            return false;
          });
          if (!matchesPrice) return false;
        }
        return true;
      });
    }
  }, [activeHash, activeProducts, selectedBrands, selectedPrices, selectedActions, selectedMaterials, activeMenuType, selectedTypes, sortBy]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Global Header Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-sm md:py-md">
        
        {/* BANNER SECTION */}
        <section className="mb-lg rounded-2xl overflow-hidden relative h-64 md:h-72 bg-gradient-to-r from-black/75 to-transparent flex items-center shadow-ambient">
          {/* Banner Graphic Backdrop based on active hash */}
          <img 
            src={
              activeHash === 'sea' 
                ? '/images/sea-hero-banner.png' 
                : activeHash === 'lake'
                ? '/images/lake-hero-banner.png'
                : activeHash === 'camping'
                ? '/images/camping.png'
                : '/images/river-hero-banner.png'
            } 
            alt="Fishing Category Banner" 
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />

          {/* Banner Content (Left Aligned) */}
          <div className="relative pl-sm md:pl-lg pr-sm max-w-2xl text-left z-10 text-white">
            <h1 className="text-[28px] md:text-headline-xl font-bold tracking-tight mb-xs">
              {activeHash === 'sea' ? 'Câu Cá Biển' : activeHash === 'lake' ? 'Đồ câu Hồ' : activeHash === 'camping' ? 'Đồ Cắm Trại' : 'Cần Câu Sông Suối'}
            </h1>
            <p className="text-[13px] md:text-body-md text-surface-dim leading-relaxed font-sans font-light max-w-xl">
              {activeHash === 'sea' 
                ? 'Khám phá sức mạnh của đại dương với những trang bị bạo lực và bền bỉ nhất cho các chuyên viên chinh chiến trên sóng nước.'
                : activeHash === 'lake'
                ? 'Trang bị chuyên dụng cho các cần thủ đam mê câu lục, câu đài tại các hồ đập và khu vực nước tĩnh lặng.'
                : activeHash === 'camping'
                ? 'Trang bị lều trại dã ngoại, túi ngủ, và dụng cụ sinh tồn chuyên dụng cho những hành trình hòa mình cùng thiên nhiên.'
                : 'Khám phá nghệ thuật câu cá suối với trang bị fly fishing và ultra-light chuyên nghiệp. Thiết kế cho những dòng nước tinh khiết và không gian hẹp.'}
            </p>
          </div>
        </section>

        {/* BREADCRUMBS & SECTION TITLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-md">
          <div className="text-left">
            {/* Breadcrumbs (Sea vs Lake vs River vs Camping layout) */}
            {(activeHash === 'sea' || activeHash === 'river' || activeHash === 'camping') && (
              <span className="text-label-sm text-outline font-sans mb-1 block">
                {activeHash === 'sea' 
                  ? 'Trang chủ > Hồ câu > Câu cá biển'
                  : activeHash === 'camping'
                  ? 'Trang chủ / Cắm trại'
                  : 'Trang chủ / Sông suối'}
              </span>
            )}
            <h2 className="text-[24px] md:text-headline-lg font-bold tracking-tight text-on-surface">
              {activeHash === 'lake' ? '' : 'Danh sách sản phẩm'}
            </h2>
          </div>
          
          {/* Right Header Controls */}
          <div className="flex items-center justify-between md:justify-end gap-md mt-xs md:mt-0 w-full md:w-auto">
            <span className="text-label-sm text-on-surface-variant font-sans">
              Hiển thị {
                activeHash === 'lake' && 
                selectedTypes.includes('Câu Lục') && 
                selectedTypes.length === 1 && 
                selectedBrands.length === 0 && 
                selectedPrices.length === 0
                  ? 24 
                  : filteredProducts.length
              } sản phẩm
            </span>
            
            {/* Sort dropdown */}
            <div className="flex items-center gap-xs">
              <span className="text-label-sm text-on-surface-variant font-sans hidden md:inline">Sắp xếp:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-md py-1 px-3 text-label-sm text-on-surface focus:outline-none focus:border-primary font-sans cursor-pointer"
              >
                {activeHash === 'lake' || activeHash === 'camping' ? (
                  <>
                    <option value="newest">Phổ biến nhất</option>
                    <option value="price-low">Giá: Thấp đến Cao</option>
                    <option value="price-high">Giá: Cao đến Thấp</option>
                  </>
                ) : (
                  <>
                    <option value="newest">Mới nhất</option>
                    <option value="price-low">Giá: Thấp đến Cao</option>
                    <option value="price-high">Giá: Cao đến Thấp</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* FILTER SIDEBAR & PRODUCTS GRID */}
        <div className="flex flex-col md:flex-row gap-gutter">
          
          {/* Left Column: Sidebar Filters (3/12 equivalent) */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-sm">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-sm md:p-md text-left shadow-ambient">
                
                {/* Header "Bộ Lọc" */}
                {activeHash !== 'lake' && (
                  <div className="flex items-center gap-xs pb-sm border-b border-outline-variant/20 mb-sm">
                    <Filter className="w-4 h-4 text-primary" />
                    <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider">
                      Bộ Lọc
                    </h3>
                  </div>
                )}

                {/* Filter section for Lake: LOẠI HÌNH CÂU */}
                {activeHash === 'lake' && (
                  <div className="mb-md border-b border-outline-variant/20 pb-sm">
                    <h4 className="text-label-sm font-bold text-on-surface uppercase mb-xs font-sans tracking-wide">
                      Loại hình câu
                    </h4>
                    <div className="flex flex-col gap-xs font-sans text-label-sm text-on-surface-variant">
                      <label className="flex items-center gap-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes('Câu Lục')}
                          onChange={() => handleToggleType('Câu Lục')}
                          className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                        />
                        <span>Câu Lục</span>
                      </label>
                      <label className="flex items-center gap-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes('Câu Đài')}
                          onChange={() => handleToggleType('Câu Đài')}
                          className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                        />
                        <span>Câu Đài</span>
                      </label>
                      <label className="flex items-center gap-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes('Câu Lăng Xê')}
                          onChange={() => handleToggleType('Câu Lăng Xê')}
                          className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                        />
                        <span>Câu Lăng Xê</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Filter section for Camping: LOẠI SẢN PHẨM */}
                {activeHash === 'camping' && (
                  <div className="mb-md border-b border-outline-variant/20 pb-sm">
                    <h4 className="text-label-sm font-bold text-on-surface uppercase mb-xs font-sans tracking-wide">
                      Loại sản phẩm
                    </h4>
                    <div className="flex flex-col gap-xs font-sans text-label-sm text-on-surface-variant">
                      {['Lều trại', 'Ghế & Thảm', 'Phụ kiện', 'Trang phục'].map((type) => (
                        <label key={type} className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedTypes.includes(type)}
                            onChange={() => handleToggleType(type)}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter 1: KHOẢNG GIÁ (VND) */}
                <div className="mb-md border-b border-outline-variant/20 pb-sm">
                  <h4 className="text-label-sm font-bold text-on-surface uppercase mb-xs font-sans tracking-wide">
                    Khoảng giá (VND)
                  </h4>
                  <div className="flex flex-col gap-xs font-sans text-label-sm text-on-surface-variant">
                    {activeHash === 'lake' ? (
                      /* Radio button visual for Lake */
                      <>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="lake-price"
                            checked={selectedPrices.includes('under1m')}
                            onChange={() => handleTogglePrice('under1m')}
                            className="w-4 h-4 border-outline-variant text-primary focus:ring-primary/45"
                          />
                          <span>Dưới 1tr</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="lake-price"
                            checked={selectedPrices.includes('1m-5m')}
                            onChange={() => handleTogglePrice('1m-5m')}
                            className="w-4 h-4 border-outline-variant text-primary focus:ring-primary/45"
                          />
                          <span>1tr - 5tr</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="lake-price"
                            checked={selectedPrices.includes('over5m')}
                            onChange={() => handleTogglePrice('over5m')}
                            className="w-4 h-4 border-outline-variant text-primary focus:ring-primary/45"
                          />
                          <span>Trên 5tr</span>
                        </label>
                      </>
                    ) : activeHash === 'sea' || activeHash === 'camping' ? (
                      <>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedPrices.includes('under1m')}
                            onChange={() => handleTogglePrice('under1m')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Dưới 1.000.000đ</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedPrices.includes('1m-5m')}
                            onChange={() => handleTogglePrice('1m-5m')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>1tr - 5tr</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedPrices.includes('over5m')}
                            onChange={() => handleTogglePrice('over5m')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Trên 5.000.000đ</span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedPrices.includes('under1m')}
                            onChange={() => handleTogglePrice('under1m')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Dưới 1.000.000đ</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedPrices.includes('1m-3m')}
                            onChange={() => handleTogglePrice('1m-3m')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>1.000.000đ - 3.000.000đ</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedPrices.includes('over3m')}
                            onChange={() => handleTogglePrice('over3m')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Trên 3.000.000đ</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Filter 2: Thương hiệu (Brand list matches mockup options) */}
                <div>
                  <h4 className="text-label-sm font-bold text-on-surface uppercase mb-xs font-sans tracking-wide">
                    Thương hiệu
                  </h4>
                  <div className="flex flex-col gap-xs font-sans text-label-sm text-on-surface-variant">
                    {activeHash === 'camping' ? (
                      <>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes('WILDSTREAM')}
                            onChange={() => handleToggleBrand('WILDSTREAM')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>WildStream</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes('NATUREHIKE')}
                            onChange={() => handleToggleBrand('NATUREHIKE')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Naturehike</span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes('SHIMANO')}
                            onChange={() => handleToggleBrand('SHIMANO')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Shimano</span>
                        </label>
                        <label className="flex items-center gap-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes('DAIWA')}
                            onChange={() => handleToggleBrand('DAIWA')}
                            className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                          />
                          <span>Daiwa</span>
                        </label>
                        {activeHash === 'lake' ? (
                          <>
                            <label className="flex items-center gap-sm cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={selectedBrands.includes('HANDING')}
                                onChange={() => handleToggleBrand('HANDING')}
                                className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                              />
                              <span>Handing</span>
                            </label>
                            <label className="flex items-center gap-sm cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={selectedBrands.includes('KAIWO')}
                                onChange={() => handleToggleBrand('KAIWO')}
                                className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                              />
                              <span>Kaiwo</span>
                            </label>
                          </>
                        ) : activeHash === 'sea' ? (
                          <label className="flex items-center gap-sm cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={selectedBrands.includes('PENN')}
                              onChange={() => handleToggleBrand('PENN')}
                              className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                            />
                            <span>Penn</span>
                          </label>
                        ) : (
                          <label className="flex items-center gap-sm cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={selectedBrands.includes('ABU GARCIA')}
                              onChange={() => handleToggleBrand('ABU GARCIA')}
                              className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                            />
                            <span>Abu Garcia</span>
                          </label>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Filter 3: CONDITIONAL SECTION FOR SEA OR RIVER (Skip for Lake) */}
                {activeHash === 'sea' ? (
                  <div className="mt-md">
                    <h4 className="text-label-sm font-bold text-on-surface uppercase mb-xs font-sans tracking-wide">
                      Chất liệu
                    </h4>
                    <div className="flex flex-wrap gap-xs font-sans mt-xs">
                      {['Titan', 'Carbon', 'Thép không gỉ'].map((material) => {
                        const isSelected = selectedMaterials.includes(material);
                        return (
                          <button
                            key={material}
                            type="button"
                            onClick={() => handleToggleMaterial(material)}
                            className={`text-label-sm px-3 py-1 rounded-full border transition-all duration-200 focus:outline-none ${
                              isSelected 
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/50'
                            }`}
                          >
                            {material}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : activeHash === 'river' ? (
                  <div className="mt-md">
                    <h4 className="text-label-sm font-bold text-on-surface uppercase mb-xs font-sans tracking-wide">
                      Độ cứng (Action)
                    </h4>
                    <div className="flex flex-col gap-xs font-sans text-label-sm text-on-surface-variant">
                      <label className="flex items-center gap-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedActions.includes('Fast')}
                          onChange={() => handleToggleAction('Fast')}
                          className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                        />
                        <span>Fast (Nhanh)</span>
                      </label>
                      <label className="flex items-center gap-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedActions.includes('Moderate')}
                          onChange={() => handleToggleAction('Moderate')}
                          className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                        />
                        <span>Moderate (Vừa)</span>
                      </label>
                      <label className="flex items-center gap-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedActions.includes('Slow')}
                          onChange={() => handleToggleAction('Slow')}
                          className="w-4 h-4 border-outline-variant text-primary rounded focus:ring-primary/45"
                        />
                        <span>Slow (Chậm)</span>
                      </label>
                    </div>
                  </div>
                ) : null}

              </div>

              {/* SECONDARY SIDEBAR MENU ITEMS FOR SEA ONLY */}
              {activeHash === 'sea' && (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-xs text-left shadow-ambient flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenuType('all')}
                    className={`flex items-center gap-sm text-label-sm font-semibold py-2.5 px-sm rounded-xl w-full text-left transition-all ${
                      activeMenuType === 'all' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Tất cả trang bị</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenuType('gear')}
                    className={`flex items-center gap-sm text-label-sm font-semibold py-2.5 px-sm rounded-xl w-full text-left transition-all ${
                      activeMenuType === 'gear' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Cần & Máy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenuType('clothing')}
                    className={`flex items-center gap-sm text-label-sm font-semibold py-2.5 px-sm rounded-xl w-full text-left transition-all ${
                      activeMenuType === 'clothing' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Trang phục</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenuType('promo')}
                    className={`flex items-center gap-sm text-label-sm font-semibold py-2.5 px-sm rounded-xl w-full text-left transition-all ${
                      activeMenuType === 'promo' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span>Khuyến mãi</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: Dynamic Product Grid (9/12 equivalent) */}
          <div className="flex-grow flex flex-col justify-between">
            {loadingDb ? (
              <div className="flex flex-col items-center justify-center p-xl my-auto">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-sm"></div>
                <p className="text-body-md text-on-surface-variant/80 font-sans">Đang tải sản phẩm...</p>
              </div>
            ) : dbProducts.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-xl text-center shadow-ambient my-auto max-w-lg mx-auto">
                <span className="text-headline-md font-bold text-primary font-sans block mb-sm">
                  Chưa có sản phẩm nào
                </span>
                <p className="text-body-md text-on-surface-variant font-sans mb-lg leading-relaxed">
                  Hiện tại chưa có sản phẩm nào được bổ sung lên website. Bạn có thể xem các bài blog khám phá khác và quay lại sau!
                </p>
                <button 
                  onClick={() => router.push('/blog')}
                  className="bg-primary hover:bg-[#1e40af] text-white font-sans text-label-sm font-bold rounded-full py-3 px-xl transition-all shadow-md active:scale-98"
                >
                  Khám phá bài viết Blog
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-sm md:gap-gutter">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    cardStyle={activeHash === 'lake' ? 'lake' : (activeHash === 'sea' || activeHash === 'camping') ? 'detailed' : 'minimal'}
                    brand={product.brand}
                    title={product.title}
                    description={(product as any).description}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    badge={product.badge}
                    badgeType={product.badgeType}
                    ratingCount={(product as any).ratingCount}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-xl text-center shadow-ambient my-auto">
                <span className="text-headline-md font-bold text-outline-variant font-sans block mb-sm">
                  Không tìm thấy sản phẩm
                </span>
                <p className="text-body-md text-on-surface-variant font-sans mb-sm">
                  Vui lòng điều chỉnh lại bộ lọc để tìm sản phẩm mong muốn.
                </p>
                <button 
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedPrices([]);
                    setSelectedActions([]);
                    setSelectedMaterials([]);
                    setActiveMenuType('all');
                    setSelectedTypes(activeHash === 'lake' ? ['Câu Lục'] : []);
                  }}
                  className="bg-primary text-white font-sans text-label-sm font-semibold rounded-md py-2 px-md hover:bg-primary-container transition-all"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center justify-center gap-xs mt-xl mb-md">
              <button className="w-8 h-8 rounded border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container text-outline hover:text-primary transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-sans text-label-sm font-bold">
                1
              </button>
              {activeHash !== 'lake' && activeHash !== 'camping' && (
                <>
                  <button className="w-8 h-8 rounded border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all font-sans text-label-sm">
                    2
                  </button>
                  {activeHash === 'sea' && (
                    <button className="w-8 h-8 rounded border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all font-sans text-label-sm">
                      3
                    </button>
                  )}
                </>
              )}
              <button className="w-8 h-8 rounded border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container text-outline hover:text-primary transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Redesigned Footer complying with Ministry of Industry and Trade regulations */}
      <Footer />
    </div>
  );
}
