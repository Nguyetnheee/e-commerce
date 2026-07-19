'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { adminApi, blogApi } from '@/lib/api';
import Footer from '@/components/Footer';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Send, 
  X,
  Star,
  CheckCircle,
  MapPin,
  Compass,
  AlertTriangle,
  ArrowLeft,
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  date: string;
  views: string;
  imageUrl: string;
  readTime: string;
  terrain: 'river' | 'sea' | 'lake' | 'camping';
}

interface ExploreProduct {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  terrain: 'river' | 'sea' | 'lake' | 'camping';
  category: 'new' | 'bestseller' | 'expert' | 'sale';
}

export default function BlogPage() {
  const [selectedTerrain, setSelectedTerrain] = useState<'river' | 'sea' | 'lake' | 'camping'>('river');
  const [selectedCategory, setSelectedCategory] = useState<'new' | 'bestseller' | 'expert' | 'sale'>('new');
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [visibleArticlesCount, setVisibleArticlesCount] = useState(3);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      let res;
      try {
        res = await blogApi.getPosts();
      } catch (err) {
        console.warn('Public blog API not available, trying Admin API...', err);
        res = await adminApi.getAllPosts();
      }
      if (Array.isArray(res)) {
        setDbPosts(res);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);
  
  // Navigation view state: null (overview) or specific terrain detail view
  const [activeTerrainView, setActiveTerrainView] = useState<'river' | 'sea' | 'lake' | 'camping' | null>(null);

  // Camping interactive checklist state
  const [campingChecklist, setCampingChecklist] = useState<Record<string, boolean>>({
    'lều': false,
    'túi-ngủ': false,
    'đèn-pin': false,
    'y-tế': false,
    'bếp-ga': false,
    'lọc-nước': false,
  });

  const toggleChecklist = (key: string) => {
    setCampingChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Explore Products List
  const exploreProducts: ExploreProduct[] = [
    {
      id: 'exp-prod-river-1',
      name: 'Cần câu suối Carbon River Master UL',
      price: '1.250.000₫',
      imageUrl: '/images/product-buggy.png',
      terrain: 'river',
      category: 'new'
    },
    {
      id: 'exp-prod-river-2',
      name: 'Abu Garcia Troutin Marquis Nano Stream',
      price: '3.200.000₫',
      imageUrl: '/images/product-yellowfish.png',
      terrain: 'river',
      category: 'bestseller'
    },
    {
      id: 'exp-prod-river-3',
      name: 'Ghế dã ngoại xếp gọn WildStream',
      price: '850.000₫',
      imageUrl: '/images/product-chair-terrain.png',
      terrain: 'river',
      category: 'expert'
    },
    {
      id: 'exp-prod-sea-1',
      name: 'Máy câu Shimano Stella SW bạo lực',
      price: '18.500.000₫',
      imageUrl: '/images/product-stella.png',
      terrain: 'sea',
      category: 'bestseller'
    },
    {
      id: 'exp-prod-sea-2',
      name: 'Cần câu Carbon Daiwa Saltiga',
      price: '12.200.000₫',
      imageUrl: '/images/product-saltiga.png',
      terrain: 'sea',
      category: 'new'
    },
    {
      id: 'exp-prod-sea-3',
      name: 'Áo thun dã ngoại chống nắng UV biển',
      price: '450.000₫',
      imageUrl: '/images/product-shirt.png',
      terrain: 'sea',
      category: 'sale'
    },
    {
      id: 'exp-prod-lake-1',
      name: 'Cần câu đài Handing Nhất Long',
      price: '1.150.000₫',
      imageUrl: '/images/product-holiday-spin.png',
      terrain: 'lake',
      category: 'expert'
    },
    {
      id: 'exp-prod-lake-2',
      name: 'Máy câu Shimano Stradic FM',
      price: '3.450.000₫',
      imageUrl: '/images/product-stradic-reel.png',
      terrain: 'lake',
      category: 'new'
    },
    {
      id: 'exp-prod-lake-3',
      name: 'Phao câu đài Titan Float',
      price: '180.000₫',
      imageUrl: '/images/product-titan-float.png',
      terrain: 'lake',
      category: 'sale'
    },
    {
      id: 'exp-prod-camp-1',
      name: 'Lều thám hiểm Peak-4',
      price: '5.800.000₫',
      imageUrl: '/images/product-tent.png',
      terrain: 'camping',
      category: 'new'
    },
    {
      id: 'exp-prod-camp-2',
      name: 'Bộ dụng cụ sinh tồn WildStream X1',
      price: '1.850.000₫',
      imageUrl: '/images/product-box-tackle.png',
      terrain: 'camping',
      category: 'bestseller'
    },
    {
      id: 'exp-prod-camp-3',
      name: 'Ghế dã ngoại xếp gọn WildStream',
      price: '850.000₫',
      imageUrl: '/images/product-chair-terrain.png',
      terrain: 'camping',
      category: 'sale'
    }
  ];

  // Blog Posts list
  const blogPosts: BlogPost[] = [
    {
      id: 'art-1',
      title: '10 vật dụng không thể thiếu cho người mới bắt đầu Hiking',
      category: 'Hiking & Trekking',
      summary: 'Trước khi bắt đầu hành trình chinh phục những đỉnh cao, hãy chắc chắn rằng bạn đã trang bị đủ những dụng cụ chống thấm, chống va đập và sinh tồn cơ bản này...',
      content: 'Chuyến đi hiking đầu tiên luôn đầy thử thách nhưng cũng vô cùng thú vị. Để chuyến đi diễn ra suôn sẻ, bạn cần chuẩn bị đầy đủ: 1. Giày hiking cổ cao chống trượt; 2. Ba lô trợ lực từ 30L-40L; 3. Bình nước giữ nhiệt; 4. Bộ sơ cứu y tế cá nhân; 5. Bản đồ hoặc GPS; 6. Đèn pin siêu sáng; 7. Dao đa năng; 8. Áo gió chống thấm nước; 9. Thức ăn khô giàu năng lượng; 10. Bộ dụng cụ nhóm lửa khẩn cấp. Hãy chắc chắn rằng bạn đã kiểm tra kỹ trước khi xuất phát!',
      date: '12 TH06, 2026',
      views: '1.2k',
      imageUrl: '/images/product-buggy.png',
      readTime: '5 phút',
      terrain: 'camping'
    },
    {
      id: 'art-2',
      title: 'Bí quyết bảo quản thiết bị điện tử khi đi du lịch sông nước',
      category: 'Bảo quản trang bị',
      summary: 'Nước và độ ẩm là kẻ thù số một của máy ảnh và điện thoại. Dưới đây là cách WildStream giúp bảo vệ tài sản của bạn bằng các loại hòm chống nước chuyên dụng...',
      content: 'Khi đi du lịch sông nước, việc bảo vệ điện thoại, máy ảnh là vô cùng quan trọng. Hãy áp dụng ngay các mẹo sau: 1. Sử dụng túi chống nước chuyên dụng chuẩn IP68; 2. Cất giữ trong hòm chống nước WildStream 36L kiên cố; 3. Chuẩn bị thêm các gói hút ẩm silicagel đặt chung với thiết bị; 4. Lau khô tay hoàn toàn trước khi thao tác máy; 5. Sử dụng dây đeo cổ chống chìm cho máy ảnh và điện thoại. Áp dụng đúng các quy tắc này sẽ giúp bạn thỏa sức ghi hình mà không sợ nước tàn phá.',
      date: '10 TH06, 2026',
      views: '860',
      imageUrl: '/images/product-box-tackle.png',
      readTime: '4 phút',
      terrain: 'river'
    },
    {
      id: 'art-3',
      title: 'Review: Bộ dụng cụ sinh tồn WildStream X1 thế hệ mới',
      category: 'Đánh giá trang bị',
      summary: 'Một cái nhìn chi tiết về bộ dụng cụ đa năng vừa ra mắt, được thiết kế riêng cho những chuyến đi khắc nghiệt nhất với 18 công cụ cứu sinh...',
      content: 'Bộ dụng cụ sinh tồn WildStream X1 là trợ thủ đắc lực cho những chuyến thám hiểm rừng sâu. Bộ sản phẩm bao gồm dao sinh tồn carbon, còi khẩn cấp, đá đánh lửa magnesium, cưa xích cầm tay, la bàn chống nhiễu, thẻ đa năng, và chăn cấp cứu phản nhiệt. Toàn bộ dụng cụ được sắp xếp gọn gàng trong hộp nhựa ABS chống va đập, chống nước tuyệt đối. Đây là trang bị thiết yếu giúp bạn tự tin xử lý mọi tình huống phát sinh nơi hoang dã.',
      date: '06 TH06, 2026',
      views: '2.4k',
      imageUrl: '/images/product-stella.png',
      readTime: '6 phút',
      terrain: 'camping'
    },
    {
      id: 'art-4',
      title: 'Chinh phục Đại dương: Kỹ năng chèo Kayak vượt sóng',
      category: 'Kỹ năng đi biển',
      summary: 'Làm thế nào để điều khiển chiếc Kayak vượt qua những con sóng lớn ngoài khơi xa? Hãy tìm hiểu ngay những quy tắc an toàn và kỹ thuật chèo kayak căn bản...',
      content: 'Chèo thuyền Kayak trên biển mang lại cảm giác phóng khoáng tột đỉnh nhưng cũng ẩn chứa nhiều rủi ro nếu thiếu kỹ năng. Hãy ghi nhớ: 1. Luôn mặc áo phao cứu sinh chuyên dụng; 2. Chèo vuông góc với hướng sóng để tránh lật thuyền; 3. Giữ tư thế ngồi thẳng lưng và thả lỏng hông để thích ứng với nhịp sóng; 4. Biết cách tự cứu hộ và lật lại thuyền khi bị chìm; 5. Kiểm tra dự báo thời tiết và hướng gió trước khi xuống nước. Luyện tập thuần thục kỹ năng chèo sẽ giúp chuyến viễn chinh đại dương của bạn trọn vẹn và an toàn.',
      date: '02 TH06, 2026',
      views: '3.1k',
      imageUrl: '/images/sea-fishing.png',
      readTime: '8 phút',
      terrain: 'sea'
    },
    {
      id: 'art-5',
      title: 'Sự tĩnh lặng của mặt hồ: Kỹ thuật câu cá thư giãn',
      category: 'Câu cá hồ',
      summary: 'Một bài viết chia sẻ về sự kiên nhẫn, cách chọn phao và mồi câu phù hợp cho từng loài cá nước tĩnh như cá chép, cá rô phi tại các hồ lớn tự nhiên...',
      content: 'Câu cá hồ tĩnh lặng yêu cầu kỹ năng và sự kiên nhẫn cao. Để câu cá chép hay cá rô phi thành công: 1. Sử dụng phao đài nhạy bén để phát hiện những cú đớp mồi nhẹ nhất; 2. Trộn mồi câu tự nhiên (như cám, giun đỏ, ngô ngọt) thơm dịu; 3. Đo độ sâu đáy hồ chính xác để đặt lưỡi câu ở vùng cá thường tìm mồi; 4. Giữ tĩnh lặng tuyệt đối trên bờ; 5. Chọn thời điểm sáng sớm hoặc chiều mát. Đây là khoảng thời gian lý tưởng để bạn vừa câu cá vừa tận hưởng sự tĩnh lặng của thiên nhiên.',
      date: '28 TH05, 2026',
      views: '1.9k',
      imageUrl: '/images/lake-fishing.png',
      readTime: '5 phút',
      terrain: 'lake'
    },
    {
      id: 'art-6',
      title: 'Nghệ thuật cắm trại mùa Thu: Trải nghiệm trọn vẹn',
      category: 'Cắm trại',
      summary: 'Mùa thu là thời điểm đẹp nhất để hòa mình vào thiên nhiên. Hãy lưu lại cẩm nang dựng lều chống sương mù, cách nhóm lửa trại ấm cúng và an toàn trong rừng sâu...',
      content: 'Cắm trại mùa thu mang lại không khí se lạnh lãng mạn. Để có trải nghiệm tuyệt vời: 1. Chọn lều có hai lớp để tránh đọng sương ban đêm; 2. Sử dụng túi ngủ có mức nhiệt độ thoải mái từ 10 độ C; 3. Chuẩn bị gỗ khô và nhóm lửa trại ở vị trí thông thoáng, cách xa lều ít nhất 5 mét; 4. Thưởng thức một tách trà nóng dưới bầu trời sao; 5. Dọn dẹp sạch sẽ rác thải trước khi ra về để bảo vệ rừng. Hãy tận hưởng kỳ nghỉ yên bình cùng WildStream Gear.',
      date: '22 TH05, 2026',
      views: '4.2k',
      imageUrl: '/images/camping.png',
      readTime: '7 phút',
      terrain: 'camping'
    }
  ];

  const displayPosts = dbPosts.length > 0 ? dbPosts.map(p => ({
    id: String(p.id),
    title: p.title,
    category: p.categoryName || 'Tin tức',
    summary: p.htmlContent ? p.htmlContent.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Không có tóm tắt.',
    content: p.htmlContent || '',
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Mới đây',
    views: '100',
    imageUrl: p.imageUrl || '/images/product-buggy.png',
    readTime: '5 phút',
    terrain: 'camping' as const
  })) : blogPosts;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans relative">
      {/* Header */}
      <Header />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-xs px-md py-sm rounded-xl shadow-lg border text-label-md font-semibold ${
            toast.type === 'success' ? 'bg-[#e6f4ea] text-[#137333] border-[#a8dab5]' :
            toast.type === 'error' ? 'bg-[#fce8e6] text-[#c5221f] border-[#f5b4ad]' :
            'bg-surface-tint/10 text-primary border-primary/20'
          }`}>
            <span className="text-left">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow py-md md:py-lg px-margin-mobile md:px-margin-desktop bg-background text-on-surface">
        <div className="max-w-7xl mx-auto space-y-lg">
          
          {/* Breadcrumb Navigation when viewing terrain */}
          {activeTerrainView && (
            <div className="flex items-center gap-xs text-[13px] text-on-surface-variant text-left">
              <button 
                onClick={() => setActiveTerrainView(null)} 
                className="hover:text-primary transition-colors font-medium flex items-center gap-[4px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Khám phá
              </button>
              <span className="opacity-40">/</span>
              <span className="text-primary font-bold">
                {activeTerrainView === 'river' ? 'Câu cá Sông' : 
                 activeTerrainView === 'sea' ? 'Câu cá Biển' : 
                 activeTerrainView === 'lake' ? 'Câu cá Hồ' : 
                 'Cắm trại dã ngoại'}
              </span>
            </div>
          )}

          {/* OVERVIEW VIEW (activeTerrainView === null) */}
          {activeTerrainView === null && (
            <div className="space-y-lg animate-in fade-in duration-300">
              {/* HERO BANNER */}
              <div className="relative rounded-2xl overflow-hidden h-[380px] flex items-center shadow-md">
                <img 
                  src="/images/lake-hero-banner.png" 
                  alt="Cẩm nang Trải nghiệm" 
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent"></div>
                
                <div className="relative z-10 px-md md:px-lg max-w-2xl text-left space-y-sm">
                  <span className="bg-secondary text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                    Wild & Water Premium Series
                  </span>
                  <h2 className="text-headline-md sm:text-headline-lg font-bold text-white leading-tight">
                    Cẩm nang Trải nghiệm - Khám phá thế giới cùng WildStream Gear
                  </h2>
                  <p className="text-body-md text-surface-dim leading-relaxed font-sans opacity-95">
                    Hành trình chuẩn bị kỹ lưỡng cho những chuyến đi không giới hạn. Từ những con sông dữ dội đến bầu trời sao tĩnh lặng.
                  </p>
                  <div className="flex gap-xs pt-xs">
                    <button
                      type="button"
                      onClick={() => showToast('Bắt đầu khám phá cẩm nang trải nghiệm!', 'info')}
                      className="bg-primary hover:bg-[#1e40af] text-white text-label-md font-bold px-5 py-2.5 rounded-md transition-colors shadow-sm"
                    >
                      Khám phá ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Đang phát video trải nghiệm thực tế...', 'info')}
                      className="border border-white/60 hover:border-white hover:bg-white/10 text-white text-label-md font-semibold px-5 py-2.5 rounded-md transition-all duration-200"
                    >
                      Video trải nghiệm
                    </button>
                  </div>
                </div>
              </div>

              {/* EXPERIENTIAL TERRAINS GRID */}
              <div className="space-y-sm text-left">
                <h3 className="text-headline-md font-bold text-primary tracking-tight">
                  Địa hình Trải nghiệm
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed mt-0.5">
                  Chọn hành trình phù hợp với bản lĩnh của bạn để khám phá kinh nghiệm thực tế & sản phẩm khuyên dùng
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm pt-xs">
                  {/* River Card */}
                  <div 
                    onClick={() => setActiveTerrainView('river')}
                    className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-secondary"
                  >
                    <img 
                      src="/images/river-fishing.png" 
                      alt="Sông suối" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                      <span className="text-[10px] text-white/95 font-bold uppercase tracking-widest bg-secondary px-2.5 py-0.5 rounded-full inline-block">
                        RIVER TRAILS
                      </span>
                      <h4 className="text-body-md font-bold text-white line-clamp-2">
                        Khám phá dòng chảy: 5 cung đường sông đẹp nhất Đông Nam Á
                      </h4>
                      <span className="text-label-sm text-secondary-container flex items-center gap-[4px] font-semibold tracking-wide pt-1">
                        Read More &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Camping Card */}
                  <div 
                    onClick={() => setActiveTerrainView('camping')}
                    className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary"
                  >
                    <img 
                      src="/images/camping.png" 
                      alt="Cắm trại" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                      <span className="text-[10px] text-white/95 font-bold uppercase tracking-widest bg-primary px-2.5 py-0.5 rounded-full inline-block">
                        PRIMITIVE LIVING
                      </span>
                      <h4 className="text-body-md font-bold text-white line-clamp-2">
                        Nghệ thuật cắm trại mùa Thu: Trải nghiệm trọn vẹn
                      </h4>
                      <span className="text-label-sm text-on-primary-container flex items-center gap-[4px] font-semibold tracking-wide pt-1">
                        Read More &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Sea Card */}
                  <div 
                    onClick={() => setActiveTerrainView('sea')}
                    className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary"
                  >
                    <img 
                      src="/images/sea-fishing.png" 
                      alt="Biển" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                      <span className="text-[10px] text-white/95 font-bold uppercase tracking-widest bg-primary px-2.5 py-0.5 rounded-full inline-block">
                        OCEAN EXPEDITION
                      </span>
                      <h4 className="text-body-md font-bold text-white line-clamp-2">
                        Chinh phục Đại dương: Kỹ năng chèo Kayak vượt sóng
                      </h4>
                      <span className="text-label-sm text-on-primary-container flex items-center gap-[4px] font-semibold tracking-wide pt-1">
                        Read More &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Lake Card */}
                  <div 
                    onClick={() => setActiveTerrainView('lake')}
                    className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-tertiary"
                  >
                    <img 
                      src="/images/lake-fishing.png" 
                      alt="Hồ" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                      <span className="text-[10px] text-white/95 font-bold uppercase tracking-widest bg-tertiary px-2.5 py-0.5 rounded-full inline-block">
                        STILL WATER
                      </span>
                      <h4 className="text-body-md font-bold text-white line-clamp-2">
                        Sự tĩnh lặng của mặt hồ: Kỹ thuật câu cá thư giãn
                      </h4>
                      <span className="text-label-sm text-on-tertiary-container flex items-center gap-[4px] font-semibold tracking-wide pt-1">
                        Read More &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LATEST ARTICLES & RECOMMENDED GEAR DUAL PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                
                {/* LEFT PANEL: RECOMMENDED GEAR */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-outline-variant/30 p-md space-y-sm text-left shadow-sm">
                  <div>
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      Recommended Gear
                    </h4>
                    <span className="text-[12px] text-on-surface-variant block font-sans opacity-85 mt-0.5">
                      Gợi ý trang bị cho địa hình: <strong className="text-secondary">{selectedTerrain === 'river' ? 'Sông suối' : selectedTerrain === 'sea' ? 'Biển khơi' : selectedTerrain === 'lake' ? 'Hồ nước' : 'Cắm trại'}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-xs py-1 border-b border-outline-variant/20">
                    {(['new', 'bestseller', 'expert', 'sale'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-all ${
                          selectedCategory === cat
                            ? 'bg-primary border-primary text-white shadow-sm'
                            : 'bg-white border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {cat === 'new' ? 'Mới về' : cat === 'bestseller' ? 'Bán chạy' : cat === 'expert' ? 'Gợi ý' : 'Giảm giá'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-sm">
                    {exploreProducts.filter(p => p.terrain === selectedTerrain && p.category === selectedCategory).map((prod) => (
                      <div 
                        key={prod.id} 
                        className="bg-white rounded-xl border border-outline-variant/20 p-xs flex gap-xs items-center shadow-xs transition-all hover:border-outline-variant/50"
                      >
                        <div className="w-14 h-16 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=256";
                            }}
                          />
                        </div>
                        <div className="flex-grow min-w-0 pr-1 flex flex-col justify-between py-1">
                          <h5 className="text-[13px] font-bold text-on-surface line-clamp-1 truncate">
                            {prod.name}
                          </h5>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[12px] font-extrabold text-[#e05600]">
                              {prod.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => showToast(`Đã thêm ${prod.name} vào giỏ hàng thành công!`, 'success')}
                              className="p-1 rounded-full bg-secondary/10 hover:bg-secondary text-secondary hover:text-white transition-colors"
                              title="Mua nhanh"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT PANEL: BLOG POSTS */}
                <div className="lg:col-span-8 space-y-md text-left">
                  <h4 className="text-headline-md font-bold text-primary tracking-tight">
                    Bài viết mới nhất
                  </h4>
                  
                  <div className="space-y-sm">
                    {loadingPosts ? (
                      <p className="text-label-sm text-on-surface-variant animate-pulse">Đang tải bài viết...</p>
                    ) : displayPosts.length > 0 ? (
                      displayPosts.slice(0, visibleArticlesCount).map((post) => (
                        <div 
                          key={post.id}
                          onClick={() => setSelectedArticle(post)}
                          className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm cursor-pointer transition-all duration-300 hover:border-outline-variant/60 hover:shadow-md group"
                        >
                          <div className="sm:w-44 h-36 bg-surface-container overflow-hidden flex-shrink-0 relative">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=256";
                              }}
                            />
                          </div>

                          <div className="p-sm flex-grow flex flex-col justify-between text-left">
                            <div className="space-y-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                                  {post.category}
                                </span>
                                <span className="text-[11px] text-on-surface-variant font-medium">
                                  Đọc: {post.readTime}
                                </span>
                              </div>
                              <h5 className="text-label-md font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                                {post.title}
                              </h5>
                              <p className="text-[13px] text-on-surface-variant line-clamp-2 leading-relaxed">
                                {post.summary}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-md text-[12px] text-on-surface-variant mt-xs opacity-80 border-t border-outline-variant/10 pt-xs">
                              <span>{post.date}</span>
                              <span>•</span>
                              <span>{post.views} lượt xem</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-label-sm text-on-surface-variant">Chưa có bài viết nào.</p>
                    )}
                  </div>

                  {visibleArticlesCount < displayPosts.length && (
                    <div className="text-center pt-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setVisibleArticlesCount(prev => prev + 3);
                          showToast('Đang tải thêm bài viết...', 'info');
                        }}
                        className="px-6 py-2.5 border border-outline-variant/60 hover:border-primary hover:bg-primary/5 rounded-full text-label-sm font-semibold text-on-surface-variant hover:text-primary transition-all duration-200"
                      >
                        Xem thêm bài viết +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* NEWSLETTER SIGNUP BANNER */}
              <div className="bg-[#00288e] rounded-2xl p-md sm:p-lg text-center text-white space-y-md shadow-md relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-xl"></div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-secondary/10 blur-xl"></div>

                <div className="max-w-xl mx-auto space-y-xs relative z-10">
                  <h4 className="text-headline-md font-bold leading-tight">
                    Gửi gắm cuộc phiêu lưu vào hộp thư của bạn
                  </h4>
                  <p className="text-body-md text-surface-dim font-sans opacity-90 leading-relaxed">
                    Nhận thông tin về các địa điểm mới, mẹo sinh tồn và ưu đãi đặc quyền hàng tuần.
                  </p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) {
                      showToast('Đăng ký nhận bản tin thành công!', 'success');
                      setNewsletterEmail('');
                    }
                  }}
                  className="max-w-md mx-auto flex flex-col sm:flex-row gap-xs relative z-10 pt-xs"
                >
                  <input 
                    type="email" 
                    placeholder="Địa chỉ email của bạn"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-grow bg-white/10 border border-white/20 rounded-md py-2.5 px-4 text-body-md text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-white hover:bg-surface-dim text-[#00288e] text-label-sm font-bold px-6 py-2.5 rounded-md transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-xs"
                  >
                    Đăng ký ngay
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* DEDICATED VIEW: CAMPING */}
          {activeTerrainView === 'camping' && (
            <div className="space-y-lg animate-in fade-in duration-300 text-left">
              {/* Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-[340px] flex items-center shadow-md">
                <img 
                  src="/images/camping.png" 
                  alt="Cẩm nang Cắm trại" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
                
                <div className="relative z-10 px-md md:px-lg max-w-2xl text-left space-y-sm text-white">
                  <span className="bg-[#1f6c3a] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                    PRIMITIVE LIVING
                  </span>
                  <h2 className="text-headline-md sm:text-headline-lg font-bold leading-tight">
                    Cẩm nang Cắm Trại - Kết nối tâm hồn với thiên nhiên
                  </h2>
                  <p className="text-body-md text-surface-dim leading-relaxed font-sans opacity-90">
                    Khám phá sự tĩnh lặng của rừng già và chuẩn bị cho những chuyến phiêu lưu không giới hạn cùng WildStream Gear.
                  </p>
                  <button
                    onClick={() => showToast('Bắt đầu khám phá cẩm nang cắm trại!', 'info')}
                    className="bg-[#1f6c3a] hover:bg-[#154a28] text-white text-label-md font-bold px-5 py-2.5 rounded-md transition-colors shadow-sm"
                  >
                    KHÁM PHÁ NGAY
                  </button>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Area - 8 Columns */}
                <div className="lg:col-span-8 space-y-lg">
                  
                  {/* Mẹo Cắm Trại Chuyên Nghiệp */}
                  <div className="space-y-sm">
                    <h3 className="text-headline-md font-bold text-primary flex items-center gap-xs">
                      <Flame className="w-5 h-5 text-secondary animate-pulse" />
                      Mẹo Cắm Trại Chuyên Nghiệp
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-sm shadow-xs flex flex-col justify-between">
                        <div>
                          <span className="text-[20px] font-bold text-secondary block mb-1">01</span>
                          <h4 className="text-label-md font-bold text-on-surface mb-2">Chọn Địa Điểm</h4>
                          <p className="text-[13px] text-on-surface-variant leading-relaxed">
                            Tìm khu vực bằng phẳng, cao ráo và cách nguồn nước ít nhất 60 mét để bảo vệ môi trường và tránh côn trùng.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-sm shadow-xs flex flex-col justify-between">
                        <div>
                          <span className="text-[20px] font-bold text-secondary block mb-1">02</span>
                          <h4 className="text-label-md font-bold text-on-surface mb-2">Kiểm Tra Thời Tiết</h4>
                          <p className="text-[13px] text-on-surface-variant leading-relaxed">
                            Luôn cập nhật dự báo thời tiết 24h trước khi khởi hành. Chuẩn bị bạt che nếu có khả năng mưa giông.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-sm shadow-xs flex flex-col justify-between">
                        <div>
                          <span className="text-[20px] font-bold text-secondary block mb-1">03</span>
                          <h4 className="text-label-md font-bold text-on-surface mb-2">Quản Lý Lửa Trại</h4>
                          <p className="text-[13px] text-on-surface-variant leading-relaxed">
                            Chỉ đốt lửa ở những nơi được phép. Luôn dập tắt hoàn toàn bằng nước và đất trước khi đi ngủ hoặc rời đi.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist & Bonfire Image */}
                  <div className="bg-white border border-outline-variant/30 rounded-2xl p-md shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-md items-center">
                    <div className="space-y-sm">
                      <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                        Danh Sách Đồ Thiết Yếu
                      </h4>
                      <div className="space-y-xs">
                        {[
                          { key: 'lều', label: 'Lều chống nước 4 mùa' },
                          { key: 'túi-ngủ', label: 'Túi ngủ chịu nhiệt -5°C' },
                          { key: 'đèn-pin', label: 'Đèn pin đội đầu LED' },
                          { key: 'y-tế', label: 'Bộ sơ cứu y tế (First Aid)' },
                          { key: 'bếp-ga', label: 'Bếp ga mini & Bộ nồi dã ngoại' },
                          { key: 'lọc-nước', label: 'Bình lọc nước cầm tay' }
                        ].map((item) => (
                          <div 
                            key={item.key} 
                            onClick={() => toggleChecklist(item.key)}
                            className="flex items-center gap-xs cursor-pointer select-none group"
                          >
                            {campingChecklist[item.key] ? (
                              <CheckSquare className="w-5 h-5 text-secondary" />
                            ) : (
                              <Square className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                            )}
                            <span className={`text-body-md font-sans transition-all ${
                              campingChecklist[item.key] ? 'line-through text-on-surface-variant/50' : 'text-on-surface'
                            }`}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-48 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/20">
                      <img 
                        src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600" 
                        alt="Đốt lửa trại dã ngoại" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Lưu Ý An Toàn (Red Alert Box) */}
                  <div className="bg-error-container/20 border border-error-container rounded-2xl p-md space-y-sm text-left">
                    <h4 className="text-label-md font-bold text-on-error-container uppercase tracking-wider flex items-center gap-xs">
                      <AlertTriangle className="w-4 h-4 text-error" />
                      Lưu Ý An Toàn
                    </h4>
                    <ul className="list-disc pl-md text-[13px] text-on-error-container font-sans space-y-xs leading-relaxed">
                      <li>Không bao giờ để thức ăn trong lều để tránh thú rừng.</li>
                      <li>Thông báo lộ trình cho người thân trước khi đi.</li>
                      <li>Luôn mang theo bản đồ giấy và la bàn dự phòng cho GPS.</li>
                      <li>Tránh xa các khu vực có vách đá dốc khi trời tối.</li>
                    </ul>
                  </div>

                </div>

                {/* Right Area - 4 Columns */}
                <div className="lg:col-span-4 space-y-sm text-left">
                  
                  {/* Recommended Gear */}
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-md space-y-sm shadow-sm">
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      Recommended Gear
                    </h4>
                    <span className="text-[12px] text-on-surface-variant block font-sans opacity-85">
                      Dựa trên kinh nghiệm thực tế của các chuyên gia dã ngoại
                    </span>
                    
                    <div className="space-y-sm pt-xs">
                      {[
                        { name: 'Lều Alpine Pro X4', price: '4.200.000₫', img: '/images/product-tent.png' },
                        { name: 'Túi ngủ Everest-10', price: '1.980.000₫', img: '/images/product-tent.png' },
                        { name: 'Bếp Titanium Solo', price: '950.000₫', img: '/images/product-box-tackle.png' }
                      ].map((prod, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-outline-variant/20 p-xs flex gap-xs items-center shadow-xs">
                          <div className="w-14 h-16 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={prod.img} alt={prod.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-grow min-w-0 pr-1 flex flex-col justify-between py-1">
                            <h5 className="text-[13px] font-bold text-on-surface line-clamp-1 truncate">{prod.name}</h5>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[12px] font-extrabold text-[#e05600]">{prod.price}</span>
                              <button 
                                onClick={() => showToast(`Đã thêm ${prod.name} vào giỏ hàng!`, 'success')}
                                className="p-1 rounded bg-[#00288e] text-white hover:bg-[#1e40af] text-[10px] font-bold transition-colors"
                              >
                                Mua ngay
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => showToast('Đang dẫn đến cửa hàng thiết bị dã ngoại...', 'info')}
                      className="w-full py-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white transition-all text-center rounded-lg text-label-sm font-bold mt-sm"
                    >
                      Xem tất cả sản phẩm
                    </button>
                  </div>

                  {/* Ưu đãi hôm nay */}
                  <div className="bg-[#fef3c7] rounded-2xl p-md border border-[#f59e0b]/20 text-left space-y-xs">
                    <span className="text-[10px] font-bold bg-[#f59e0b]/20 text-[#b45309] px-2 py-0.5 rounded-full inline-block">
                      ƯU ĐÃI HÔM NAY
                    </span>
                    <h5 className="text-label-md font-bold text-[#78350f]">
                      Giảm 15% cho đơn hàng Camping đầu tiên
                    </h5>
                    <div className="flex justify-between items-center bg-white/70 border border-[#f59e0b]/10 p-sm rounded-lg">
                      <span className="text-label-sm font-mono tracking-wider font-extrabold text-[#78350f]">MÃ: WILD15</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('WILD15');
                          showToast('Đã sao chép mã giảm giá WILD15!', 'success');
                        }}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        Sao chép
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* DEDICATED VIEW: SEA */}
          {activeTerrainView === 'sea' && (
            <div className="space-y-lg animate-in fade-in duration-300 text-left">
              {/* Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-[340px] flex items-center shadow-md">
                <img 
                  src="/images/sea-fishing.png" 
                  alt="Cẩm nang câu cá biển" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
                
                <div className="relative z-10 px-md md:px-lg max-w-2xl text-left space-y-sm text-white">
                  <span className="bg-primary text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                    OCEAN EXPEDITION
                  </span>
                  <h2 className="text-headline-md sm:text-headline-lg font-bold leading-tight">
                    Kinh nghiệm Câu Cá Biển - Hành trình chinh phục đại dương
                  </h2>
                  <p className="text-body-md text-surface-dim leading-relaxed font-sans opacity-90">
                    Câu cá biển không chỉ là một môn thể thao, mà còn là cuộc đối đầu đầy kịch tính với thiên nhiên hùng vĩ...
                  </p>
                  <button
                    onClick={() => showToast('Bắt đầu khám phá cẩm nang câu cá biển!', 'info')}
                    className="bg-primary hover:bg-[#1e40af] text-white text-label-md font-bold px-5 py-2.5 rounded-md transition-colors shadow-sm"
                  >
                    KHÁM PHÁ NGAY
                  </button>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Area - 8 Columns */}
                <div className="lg:col-span-8 space-y-lg text-left">
                  {/* Article content */}
                  <div className="bg-white border border-outline-variant/30 rounded-2xl p-md shadow-sm space-y-sm leading-relaxed font-sans text-on-surface-variant">
                    <p className="text-body-md text-on-surface font-sans leading-relaxed">
                      Câu cá biển không chỉ là một môn thể thao, mà còn là cuộc đối đầu đầy kịch tính với thiên nhiên hùng vĩ. Để thành công trên những con sóng dữ, người câu cần sự kiên nhẫn, am hiểu về con nước và trang bị kỹ thuật điêu luyện. Biển khơi luôn ẩn chứa những bất ngờ, từ những đợt thủy triều thay đổi đến thói quen săn mồi của các loài cá đại dương.
                    </p>
                    <p className="text-body-md text-on-surface font-sans leading-relaxed">
                      Nắm bắt thời điểm thủy triều là chìa khóa vàng. Cá biển thường hoạt động mạnh nhất vào lúc nước đang lên hoặc đang xuống (con nước ròng). Ngoài ra, việc theo dõi áp suất khí quyển và hướng gió sẽ giúp bạn xác định được khu vực tập trung của đàn cá, tối ưu hóa cơ hội đánh bắt của mình trong mỗi chuyến đi.
                    </p>
                  </div>

                  {/* Fish species tags */}
                  <div className="space-y-xs">
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      LOẠI CÁ THƯỜNG THẤY
                    </h4>
                    <div className="flex flex-wrap gap-xs">
                      {['Cá Thu', 'Cá Ngừ', 'Cá Mú', 'Cá Hồng', 'Cá Nhồng'].map((tag, idx) => (
                        <span key={idx} className="bg-primary/5 text-primary text-[12px] font-bold px-4 py-2 rounded-full border border-primary/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Địa hình & Lưu ý (Yellow/Gold alert box) */}
                  <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-md space-y-sm text-left">
                    <h4 className="text-label-md font-bold text-[#b45309] uppercase tracking-wider flex items-center gap-xs">
                      <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                      Địa hình & Lưu ý
                    </h4>
                    <ul className="list-disc pl-md text-[13px] text-[#78350f] font-sans space-y-xs leading-relaxed">
                      <li><strong>Kiểm tra thời tiết:</strong> Tuyệt đối không ra khơi khi có cảnh báo áp thấp nhiệt đới hoặc gió mạnh trên cấp 5.</li>
                      <li><strong>Thiết bị an toàn:</strong> Luôn mang theo áo phao, còi báo động và các thiết bị định vị GPS chuyên dụng cho hàng hải.</li>
                      <li><strong>Lựa chọn mồi:</strong> Sử dụng mồi giả (Lure) có độ phản quang cao cho nước trong và mồi sống cho các khu vực rạn san hô.</li>
                      <li><strong>Bảo vệ thiết bị:</strong> Nước muối có tính ăn mòn cao, hãy xả sạch dụng cụ bằng nước ngọt ngay sau mỗi chuyến đi.</li>
                    </ul>
                  </div>

                </div>

                {/* Right Area - 4 Columns */}
                <div className="lg:col-span-4 space-y-sm text-left">
                  {/* Recommended Gear */}
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-md space-y-sm shadow-sm">
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      DỤNG CỤ PHÙ HỢP
                    </h4>
                    <span className="text-[12px] text-on-surface-variant block font-sans opacity-85">
                      Gợi ý trang bị chuyên nghiệp hàng hải
                    </span>

                    <div className="space-y-sm pt-xs">
                      {[
                        { name: 'Shimano Stella SW', price: '24.500.000₫', img: '/images/product-stella.png' },
                        { name: 'Cần Daiwa Saltiga Jigging', price: '12.800.000₫', img: '/images/product-saltiga.png' },
                        { name: 'Bộ mồi giả Saltwater Pro', price: '1.450.000₫', img: '/images/product-box-tackle.png' }
                      ].map((prod, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-outline-variant/20 p-xs flex gap-xs items-center shadow-xs">
                          <div className="w-14 h-16 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={prod.img} alt={prod.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-grow min-w-0 pr-1 flex flex-col justify-between py-1">
                            <h5 className="text-[13px] font-bold text-on-surface line-clamp-1 truncate">{prod.name}</h5>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[12px] font-extrabold text-[#e05600]">{prod.price}</span>
                              <button 
                                onClick={() => showToast(`Đã thêm ${prod.name} vào giỏ hàng!`, 'success')}
                                className="px-3 py-1 rounded bg-[#00288e] text-white hover:bg-[#1e40af] text-[10px] font-bold transition-colors"
                              >
                                Mua ngay
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ưu đãi thành viên */}
                  <div className="bg-[#00288e] rounded-2xl p-md text-white text-left space-y-sm shadow-md relative overflow-hidden">
                    <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-white/5 blur-xl"></div>
                    <span className="text-[9px] font-bold bg-white/10 text-white/90 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                      Ưu đãi thành viên
                    </span>
                    <h5 className="text-label-md font-bold leading-tight">
                      Giảm ngay 15% cho đơn hàng đầu tiên
                    </h5>
                    <button 
                      onClick={() => showToast('Cảm ơn bạn đã tham gia chương trình thành viên!', 'success')}
                      className="w-full py-2 bg-white hover:bg-surface-dim text-[#00288e] transition-colors rounded-lg text-label-sm font-bold"
                    >
                      Tham gia ngay
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* DEDICATED VIEW: LAKE */}
          {activeTerrainView === 'lake' && (
            <div className="space-y-lg animate-in fade-in duration-300 text-left">
              {/* Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-[340px] flex items-center shadow-md">
                <img 
                  src="/images/lake-fishing.png" 
                  alt="Cẩm nang câu cá hồ" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
                
                <div className="relative z-10 px-md md:px-lg max-w-2xl text-left space-y-sm text-white">
                  <span className="bg-[#7f3500] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                    STILL WATER
                  </span>
                  <h2 className="text-headline-md sm:text-headline-lg font-bold leading-tight">
                    Kinh nghiệm Câu Cá Hồ - Thử thách tại các hồ dịch vụ
                  </h2>
                  <p className="text-body-md text-surface-dim leading-relaxed font-sans opacity-90">
                    Khám phá nghệ thuật chinh phục những "cụ" cá tinh khôn trong môi trường hồ tĩnh. Từ kỹ thuật chọn điểm đến cách pha mồi đặc thù.
                  </p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Area - 8 Columns */}
                <div className="lg:col-span-8 space-y-lg">
                  
                  {/* Tổng quan về Địa hình Hồ */}
                  <div className="space-y-sm">
                    <h3 className="text-headline-md font-bold text-primary">
                      Tổng quan về Địa hình Hồ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-md shadow-xs">
                        <h4 className="text-label-md font-bold text-on-surface mb-2 flex items-center gap-xs">
                          <MapPin className="w-4 h-4 text-primary" />
                          Cấu trúc lòng hồ
                        </h4>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          Các hồ dịch vụ thường có lòng hồ bằng phẳng nhưng lại có những "hố" sâu hoặc rãnh nước chảy ngầm. Việc xác định được các điểm này là chìa khóa để tìm nơi cá trú ngụ.
                        </p>
                      </div>

                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-md shadow-xs">
                        <h4 className="text-label-md font-bold text-on-surface mb-2 flex items-center gap-xs">
                          <Compass className="w-4 h-4 text-primary" />
                          Độ trong của nước
                        </h4>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          Nước hồ tĩnh lặng thường trong hơn sông. Điều này đòi hỏi cần thủ phải sử dụng dây thủ (leader) mảnh và tăng tính ngụy trang của thẻ câu, tránh làm cá nhát.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Các loài cá phổ biến */}
                  <div className="space-y-sm">
                    <h3 className="text-headline-md font-bold text-primary">
                      Các loài cá phổ biến
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                      {[
                        { title: 'Cá Trắm (Đen & Cỏ)', desc: 'Loài cá có sức mạnh đáng nể, thường ăn ở tầng đáy hoặc tầng lửng tùy mùa. Cần mồi thơm và béo.', tag: 'Mục tiêu chính' },
                        { title: 'Cá Mè', desc: 'Ưa thích mồi bột, vị chua nhẹ hoặc thơm nồng. Thường đi thành đàn kiếm ăn ở tầng mặt hoặc tầng giữa.', tag: 'Tương tác mạnh' },
                        { title: 'Cá Rô Phi', desc: 'Loài cá "quốc dân" tại các hồ dịch vụ. Rất phàm ăn nhưng cũng rất tinh ranh trong việc phát hiện lưỡi câu.', tag: 'Phổ thông' }
                      ].map((fish, idx) => (
                        <div key={idx} className="bg-white border border-outline-variant/30 rounded-2xl p-sm shadow-xs flex flex-col justify-between h-full">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold bg-[#dde1ff] text-primary px-2 py-0.5 rounded-full inline-block">
                              {fish.tag}
                            </span>
                            <h4 className="text-label-md font-bold text-on-surface">{fish.title}</h4>
                            <p className="text-[12px] text-on-surface-variant leading-relaxed">{fish.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mẹo hay cho cần thủ Hồ (Green box) */}
                  <div className="bg-[#e6f4ea] border border-[#a8dab5] rounded-2xl p-md space-y-sm text-left">
                    <h4 className="text-label-md font-bold text-[#137333] uppercase tracking-wider flex items-center gap-xs">
                      <Star className="w-4 h-4 text-[#137333] fill-current" />
                      Mẹo hay cho cần thủ Hồ
                    </h4>
                    <div className="space-y-xs font-sans text-[13px] text-[#137333] leading-relaxed">
                      <p><strong>1. Quan sát tăm cá:</strong> Hãy dành 10-15 phút đầu tiên để quan sát mặt hồ. Tăm cá Trắm thường to và đều, trong khi tăm cá Rô Phi li ti như bọt xà phòng.</p>
                      <p><strong>2. Xả ổ đúng cách:</strong> Không nên xả quá nhiều mồi một lúc. Hãy "nhử" từ từ để cá tập trung vào ổ mà không bị no quá nhanh.</p>
                      <p><strong>3. Thời điểm vàng:</strong> Sáng sớm (5h-8h) và chiều muộn (16h-19h) là lúc cá đi ăn mạnh nhất do nhiệt độ nước lý tưởng.</p>
                    </div>
                  </div>

                </div>

                {/* Right Area - 4 Columns */}
                <div className="lg:col-span-4 space-y-sm text-left">
                  
                  {/* Recommended Gear */}
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-md space-y-sm shadow-sm">
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      Recommended Gear
                    </h4>
                    <span className="text-[12px] text-on-surface-variant block font-sans opacity-85">
                      Dành riêng cho câu cá hồ
                    </span>

                    <div className="space-y-sm pt-xs">
                      {[
                        { name: 'Cần Carbon LakeMaster 4.5m', price: '2.450.000₫', img: '/images/product-holiday-spin.png' },
                        { name: 'Máy câu Shimano FM', price: '3.800.000₫', img: '/images/product-stradic-reel.png' },
                        { name: 'Bộ mồi thính chuyên Trắm', price: '150.000₫', img: '/images/product-box-tackle.png' }
                      ].map((prod, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-outline-variant/20 p-xs flex gap-xs items-center shadow-xs">
                          <div className="w-14 h-16 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={prod.img} alt={prod.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-grow min-w-0 pr-1 flex flex-col justify-between py-1">
                            <h5 className="text-[13px] font-bold text-on-surface line-clamp-1 truncate">{prod.name}</h5>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[12px] font-extrabold text-[#e05600]">{prod.price}</span>
                              <button 
                                onClick={() => showToast(`Đã thêm ${prod.name} vào giỏ hàng!`, 'success')}
                                className="px-3 py-1 rounded bg-[#7f3500] text-white hover:bg-black text-[10px] font-bold transition-colors"
                              >
                                Mua ngay
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => showToast('Đang mở trang danh sách trang bị câu hồ...', 'info')}
                      className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all text-center rounded-lg text-label-sm font-bold mt-sm"
                    >
                      Xem tất cả của hàng
                    </button>
                  </div>

                  {/* Nhận tin từ WildStream */}
                  <div className="bg-[#ffa677]/15 rounded-2xl p-md border border-[#ffa677]/30 text-left space-y-sm">
                    <div>
                      <h5 className="text-label-md font-bold text-[#5b2400]">
                        Nhận tin từ WildStream
                      </h5>
                      <p className="text-[12px] text-on-surface-variant font-sans mt-0.5 leading-relaxed">
                        Cập nhật những điểm câu hot nhất và khuyến mãi mới nhất.
                      </p>
                    </div>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newsletterEmail) {
                          showToast('Đăng ký nhận thông tin hồ thành công!', 'success');
                          setNewsletterEmail('');
                        }
                      }}
                      className="space-y-xs pt-xs"
                    >
                      <input 
                        type="email"
                        placeholder="Email của bạn"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full bg-white border border-[#ffa677]/20 rounded-md py-2 px-3 text-body-md placeholder-on-surface-variant/40 focus:outline-none focus:border-[#5b2400]"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-[#5b2400] hover:bg-black text-white text-label-sm font-bold py-2 rounded transition-colors"
                      >
                        Đăng ký ngay
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* DEDICATED VIEW: RIVER */}
          {activeTerrainView === 'river' && (
            <div className="space-y-lg animate-in fade-in duration-300 text-left">
              {/* Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-[340px] flex items-center shadow-md">
                <img 
                  src="/images/river-fishing.png" 
                  alt="Cẩm nang câu cá sông" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
                
                <div className="relative z-10 px-md md:px-lg max-w-2xl text-left space-y-sm text-white">
                  <span className="bg-[#1f6c3a] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                    KHÁM PHÁ SÔNG NGÒI
                  </span>
                  <h2 className="text-headline-md sm:text-headline-lg font-bold leading-tight">
                    Kinh nghiệm Câu Cá Sông - Nghệ thuật tĩnh lặng bên dòng nước
                  </h2>
                  <p className="text-body-md text-surface-dim leading-relaxed font-sans opacity-90">
                    Khám phá bí mật của những dòng chảy, nơi sự kiên nhẫn gặp gỡ với vẻ đẹp hoang sơ của thiên nhiên.
                  </p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Area - 8 Columns */}
                <div className="lg:col-span-8 space-y-lg">
                  
                  {/* Kỹ thuật Chinh phục Dòng chảy */}
                  <div className="space-y-sm">
                    <h3 className="text-headline-md font-bold text-primary">
                      Kỹ thuật Chinh phục Dòng chảy
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-md shadow-xs">
                        <h4 className="text-label-md font-bold text-on-surface mb-2 flex items-center gap-xs">
                          <Compass className="w-4 h-4 text-secondary" />
                          Đọc dòng nước
                        </h4>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          Hãy tìm những vùng nước xoáy, sau các tảng đá lớn hoặc gốc cây mục. Đó là nơi cá sông thường trú ẩn để tránh dòng chảy xiết và chờ đợi thức ăn trôi tới.
                        </p>
                      </div>

                      <div className="bg-white border border-outline-variant/30 rounded-2xl p-md shadow-xs">
                        <h4 className="text-label-md font-bold text-on-surface mb-2 flex items-center gap-xs">
                          <Star className="w-4 h-4 text-secondary" />
                          Thời điểm vàng
                        </h4>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          Sáng sớm khi sương còn chưa tan hoặc hoàng hôn buông xuống là lúc cá sông ra ngoài kiếm ăn mạnh nhất. Sự yên tĩnh lúc này giúp cá bớt cảnh giác.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Các loài cá sông phổ biến */}
                  <div className="space-y-sm">
                    <h3 className="text-headline-md font-bold text-primary">
                      Các loài cá sông phổ biến
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                      {[
                        { title: 'Cá Chép', tag: 'THÔNG MINH & THỬ THÁCH', desc: 'Có khả năng thích ứng cao, rất nhạy cảm với tiếng động và độ rung chấn xung quanh bờ.' },
                        { title: 'Cá Diếc', tag: 'NHẸ NHÀNG & TINH TẾ', desc: 'Thường di chuyển ở vùng nước chảy chậm, ưa chuộng các loại mồi nhỏ và nhạy.' },
                        { title: 'Cá Lăng', tag: 'SÁT THỦ DÒNG CHẢY XIẾT', desc: 'Thích cư ngụ dưới đáy sông rạn đá. Cần mồi sống hoặc mồi có mùi tanh đậm.' }
                      ].map((fish, idx) => (
                        <div key={idx} className="bg-white border border-outline-variant/30 rounded-2xl p-sm shadow-xs flex flex-col justify-between h-full">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold bg-[#a4f1b2]/30 text-secondary px-2.5 py-0.5 rounded-full inline-block">
                              {fish.tag}
                            </span>
                            <h4 className="text-label-md font-bold text-on-surface">{fish.title}</h4>
                            <p className="text-[12px] text-on-surface-variant leading-relaxed">{fish.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lưu ý về Địa hình */}
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-md space-y-sm text-left">
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      Lưu ý về Địa hình
                    </h4>
                    <div className="space-y-sm text-[13px] text-on-surface-variant font-sans leading-relaxed">
                      <div className="flex gap-xs items-start">
                        <span className="text-secondary font-bold">•</span>
                        <p><strong>Bờ dốc và nền đất yếu:</strong> Luôn kiểm tra độ ổn định của bờ sông trước khi dựng chỗ ngồi. Sông có thể gây xói lở ngầm mà mắt thường không thấy được.</p>
                      </div>
                      <div className="flex gap-xs items-start">
                        <span className="text-secondary font-bold">•</span>
                        <p><strong>Biến động mực nước:</strong> Mực nước sông có thể thay đổi nhanh chóng do thủy triều hoặc xả đập. Hãy quan sát các vệt nước trên cọc tre hoặc đá để nhận biết xu hướng.</p>
                      </div>
                      <div className="flex gap-xs items-start">
                        <span className="text-secondary font-bold">•</span>
                        <p><strong>Vật cản dưới nước:</strong> Lưới cũ, cành cây khô là kẻ thù của lưỡi câu. Nên sử dụng phao để giữ mồi ở độ cao hợp lý nếu đáy sông quá phức tạp.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Area - 4 Columns */}
                <div className="lg:col-span-4 space-y-sm text-left">
                  {/* Recommended Gear */}
                  <div className="bg-white rounded-2xl border border-outline-variant/30 p-md space-y-sm shadow-sm">
                    <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                      Recommended Gear
                    </h4>
                    <span className="text-[12px] text-on-surface-variant block font-sans opacity-85">
                      Based on your interests
                    </span>

                    <div className="space-y-sm pt-xs">
                      {[
                        { name: 'River Master Pro 2.7m', price: '2.450.000₫', img: '/images/product-rod.png', desc: 'Cần câu Carbon cao cấp' },
                        { name: 'Stream Lure Set v2', price: '480.000₫', img: '/images/product-box-tackle.png', desc: 'Bộ mồi giả chuyên dòng chảy' }
                      ].map((prod, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-outline-variant/20 p-xs flex gap-xs items-center shadow-xs">
                          <div className="w-14 h-16 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={prod.img} alt={prod.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-grow min-w-0 pr-1 flex flex-col justify-between py-1">
                            <h5 className="text-[13px] font-bold text-on-surface line-clamp-1 truncate">{prod.name}</h5>
                            <span className="text-[11px] text-on-surface-variant block truncate">{prod.desc}</span>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[12px] font-extrabold text-[#e05600]">{prod.price}</span>
                              <button 
                                onClick={() => showToast(`Đã thêm ${prod.name} vào giỏ hàng!`, 'success')}
                                className="px-2 py-0.5 rounded bg-primary text-white hover:bg-black text-[10px] font-bold transition-colors"
                              >
                                Mua
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => showToast('Đang mở trang danh sách trang bị câu sông...', 'info')}
                      className="w-full py-2 bg-[#00288e] text-white hover:bg-[#1e40af] transition-all text-center rounded-lg text-label-sm font-bold mt-sm"
                    >
                      Xem tất cả trang bị sông
                    </button>
                  </div>

                  {/* Promo Card */}
                  <div 
                    onClick={() => showToast('Mã giảm giá sông đã tự động được áp dụng tại Checkout!', 'success')}
                    className="bg-[#a4f1b2]/20 hover:bg-[#a4f1b2]/35 border border-[#1f6c3a]/20 rounded-2xl p-md text-left cursor-pointer transition-all shadow-sm flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[9px] font-bold bg-[#1f6c3a]/15 text-[#1f6c3a] px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                        Khuyến mãi mùa hè
                      </span>
                      <h5 className="text-label-md font-bold text-[#1f6c3a] mt-1">
                        Summer River Sale
                      </h5>
                      <p className="text-[12px] text-on-surface-variant font-sans mt-0.5">
                        Giảm đến 20% thiết bị sông
                      </p>
                    </div>
                    <span className="text-secondary font-bold text-[20px] transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* EXPLORE BLOG ARTICLE DETAIL MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-black/60 backdrop-blur-sm animate-in fade-in duration-250">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-250">
            <div className="relative h-56 bg-surface-container overflow-hidden flex-shrink-0">
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"></div>
              
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="bg-secondary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-xs">
                  {selectedArticle.category}
                </span>
                <h3 className="text-headline-md font-bold text-white leading-tight">
                  {selectedArticle.title}
                </h3>
              </div>
            </div>

            <div className="p-md sm:p-lg overflow-y-auto space-y-md text-left flex-grow">
              <div className="flex items-center gap-md text-[12px] text-on-surface-variant font-medium opacity-80 border-b border-outline-variant/20 pb-xs">
                <span>Ngày đăng: {selectedArticle.date}</span>
                <span>•</span>
                <span>Thời gian đọc: {selectedArticle.readTime}</span>
                <span>•</span>
                <span>{selectedArticle.views} lượt xem</span>
              </div>

              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line font-sans">
                {selectedArticle.content}
              </p>

              <div className="border-t border-outline-variant/20 pt-md mt-md space-y-sm">
                <h4 className="text-label-md font-bold text-primary uppercase tracking-wider">
                  Trang bị khuyên dùng cho hành trình này
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                  {exploreProducts.filter(p => p.terrain === selectedArticle.terrain).map((prod) => (
                    <div 
                      key={prod.id}
                      className="border border-outline-variant/20 rounded-xl p-xs flex gap-xs items-center bg-surface-container-low/30 hover:bg-white hover:border-outline-variant/50 transition-colors"
                    >
                      <div className="w-12 h-14 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=256";
                          }}
                        />
                      </div>
                      <div className="flex-grow min-w-0 pr-1 py-0.5 flex flex-col justify-between h-full">
                        <h5 className="text-[12px] font-bold text-on-surface line-clamp-1 truncate">
                          {prod.name}
                        </h5>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[12px] font-extrabold text-[#e05600]">
                            {prod.price}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Đã thêm ${prod.name} vào giỏ hàng thành công!`, 'success');
                            }}
                            className="text-[11px] font-bold bg-[#00288e] hover:bg-[#1e40af] text-white px-2 py-1 rounded transition-colors"
                          >
                            Mua ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low px-md py-sm border-t border-outline-variant/20 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="bg-primary hover:bg-[#1e40af] text-white text-label-sm font-bold px-5 py-2.5 rounded-md transition-colors shadow-sm"
              >
                Đóng cẩm nang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
