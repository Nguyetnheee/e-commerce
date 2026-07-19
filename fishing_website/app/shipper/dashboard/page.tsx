'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { shipperApi } from '../../../lib/api';
import { 
  LogOut, 
  Truck, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle, 
  DollarSign, 
  Award,
  ThumbsUp,
  Camera,
  UploadCloud,
  X
} from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dziemd19e';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'e-commerce';

export default function ShipperDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic statistics
  const [deliveredCount, setDeliveredCount] = useState(18);
  const [earnings, setEarnings] = useState(750000);
  
  // Interactive shipments list
  const [shipments, setShipments] = useState<any[]>([]);
  const [deliveryOrder, setDeliveryOrder] = useState<any | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [completingDelivery, setCompletingDelivery] = useState(false);

  const fetchShipments = async () => {
    try {
      const data = await shipperApi.getAssignedOrders();
      if (Array.isArray(data)) {
        const mapped = data.map((o: any) => ({
          id: `#${o.id}`,
          rawId: o.id,
          name: o.recipientName,
          phone: o.recipientPhone,
          address: o.shippingAddress,
          cod: o.totalAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount) : '0 ₫',
          rawCod: o.totalAmount || 0,
          items: o.items || [],
          status: 'Đang giao'
        }));
        setShipments(mapped);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng cho shipper:', err);
    }
  };

  // Authentication gate & initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('user_session');
      if (!session) {
        router.push('/admin-login');
        return;
      }
      try {
        const user = JSON.parse(session);
        if (user.role !== 'shipper') {
          if (user.role === 'admin') router.push('/admin/dashboard');
          else if (user.role === 'kho') router.push('/kho/dashboard');
          else router.push('/admin-login');
        } else {
          setUserEmail(user.email);
          setLoading(false);
          fetchShipments();
        }
      } catch (e) {
        localStorage.removeItem('user_session');
        router.push('/admin-login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/admin-login');
  };

  const handleDeliverySuccess = (shipment: any) => {
    setDeliveryOrder(shipment);
    setProofImageUrl('');
  };

  const handleProofFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn đúng tệp hình ảnh.');
      return;
    }
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Không thể tải ảnh xác nhận.');
      const data = await response.json();
      setProofImageUrl(data.secure_url);
    } catch (error: any) {
      alert(error.message || 'Tải ảnh xác nhận thất bại.');
    } finally {
      setUploadingProof(false);
    }
  };

  const confirmDeliverySuccess = async () => {
    if (!deliveryOrder || !proofImageUrl) {
      alert('Bắt buộc chụp hoặc tải ảnh xác nhận đã giao hàng.');
      return;
    }
    setCompletingDelivery(true);
    try {
      await shipperApi.completeDelivery(deliveryOrder.rawId, proofImageUrl);
      alert(`Đã cập nhật trạng thái đơn ${deliveryOrder.id}: GIAO THÀNH CÔNG.`);
      setDeliveredCount(prev => prev + 1);
      setEarnings(prev => prev + 45000 + (deliveryOrder.rawCod > 0 ? 10000 : 0));
      setDeliveryOrder(null);
      setProofImageUrl('');
      await fetchShipments();
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái: ' + (err.message || err));
    } finally {
      setCompletingDelivery(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto mb-md"></div>
          <p className="text-body-md text-on-surface-variant font-semibold">Đang tải lịch trình giao hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-surface font-sans flex flex-col">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div className="font-sans text-body-lg tracking-tight font-extrabold flex items-baseline">
            <span className="text-[#00288e]">WildStream</span>
            <span className="text-amber-600 ml-0.5 text-[13px] font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Giao Hàng</span>
          </div>
        </div>

        {/* User profile & logout */}
        <div className="flex items-center gap-sm">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-label-sm font-bold text-on-surface">{userEmail}</span>
            <span className="text-[10px] text-amber-600 uppercase font-bold tracking-widest">Shipper đối tác</span>
          </div>
          
          <div className="h-8 w-px bg-outline-variant/40 hidden sm:block" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-xs bg-error-container hover:bg-error/10 text-error text-label-sm font-bold px-3 py-1.5 rounded-lg border border-error/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-sm md:p-md space-y-md">
        
        {/* BANNER */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-md rounded-2xl shadow-ambient flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
          <div>
            <span className="text-label-sm text-amber-150 uppercase tracking-widest font-bold block mb-1">Cổng điều phối giao vận logistics</span>
            <h1 className="text-headline-lg-mobile md:text-headline-md font-bold tracking-tight">Khu vực Tài xế Giao hàng</h1>
            <p className="text-body-md text-white/80 mt-1">
              Bạn có <strong className="text-white">{shipments.filter(s => s.status === 'Đang giao').length} đơn hàng</strong> cần giao tiếp theo trong tuyến đường Quận 1 & Bình Thạnh.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-label-sm font-semibold flex items-center gap-xs">
            <Award className="w-4.5 h-4.5 text-[#fef3c7]" />
            <span>Xếp hạng: Tài xế 5 sao</span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
          
          {/* Card 1 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Đơn đang giao</span>
              <span className="text-headline-md font-bold text-amber-600 tracking-tight">
                {shipments.filter(s => s.status === 'Đang giao').length} đơn
              </span>
              <span className="text-[11px] text-on-surface-variant/60 block mt-1">
                Tải trọng: 8.5 kg
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Đã giao hôm nay</span>
              <span className="text-headline-md font-bold text-secondary tracking-tight">{deliveredCount} đơn</span>
              <span className="text-[11px] text-secondary font-bold block mt-1">
                +2 điểm thưởng tài xế
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Thu nhập ước tính</span>
              <span className="text-headline-md font-bold text-[#00288e] tracking-tight">{earnings.toLocaleString()} đ</span>
              <span className="text-[11px] text-secondary font-bold block mt-1">
                Đã tính phí COD
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-[#00288e] flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-label-sm font-bold text-on-surface-variant/70 uppercase tracking-wider block mb-1">Đánh giá khách hàng</span>
              <span className="text-headline-md font-bold text-[#1f6c3a] tracking-tight">4.9 / 5.0</span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-0.5 mt-1">
                <ThumbsUp className="w-3.5 h-3.5" /> 98% Hài lòng
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* SHIPMENT GRID AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          
          {/* LEFT: Active shipment list */}
          <div className="lg:col-span-2 space-y-sm">
            <h3 className="text-body-lg font-bold text-on-surface">Đơn hàng cần giao trong tuyến</h3>
            
            {shipments.length === 0 ? (
              <div className="bg-white p-md rounded-2xl border border-outline-variant/20 text-center py-xl">
                <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-sm" />
                <p className="text-body-md text-on-surface font-semibold">Tất cả đơn hàng đã được xử lý xong!</p>
              </div>
            ) : (
              <div className="space-y-xs">
                {shipments.map((ship) => (
                  <div 
                    key={ship.id} 
                    className={`bg-white p-sm rounded-xl border transition-all duration-200 shadow-sm ${
                      ship.status === 'Thành công'
                        ? 'border-secondary bg-secondary/5 opacity-70'
                        : ship.status === 'Thất bại'
                          ? 'border-error bg-error/5 opacity-70'
                          : 'border-outline-variant/30 hover:border-amber-600'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-xs mb-xs">
                      <div>
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-label-sm border border-amber-150">
                          {ship.id}
                        </span>
                        <span className="text-label-sm text-on-surface-variant font-bold ml-sm flex-shrink-0">
                          COD: <strong className="text-on-surface font-extrabold">{ship.cod}</strong>
                        </span>
                      </div>
                      
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        ship.status === 'Thành công'
                          ? 'bg-secondary/15 text-secondary border-secondary/30'
                          : ship.status === 'Thất bại'
                            ? 'bg-error-container text-on-error-container border-error/30'
                            : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                      }`}>
                        {ship.status}
                      </span>
                    </div>

                    <div className="space-y-1 font-sans text-label-sm mt-xs">
                      <div className="flex items-center gap-xs font-semibold text-on-surface">
                        <MapPin className="w-4.5 h-4.5 text-outline flex-shrink-0" />
                        <span>{ship.name} - <span className="text-on-surface-variant/80 font-normal">{ship.address}</span></span>
                      </div>
                      <div className="flex items-center gap-xs text-on-surface-variant/80 font-semibold">
                        <Phone className="w-4.5 h-4.5 text-outline flex-shrink-0" />
                        <span>Liên hệ: <a href={`tel:${ship.phone}`} className="text-[#00288e] hover:underline">{ship.phone}</a></span>
                      </div>
                    </div>

                    {/* Actions button */}
                    {ship.status === 'Đang giao' && (
                      <div className="mt-sm flex items-center gap-xs justify-end">
                        <button
                          onClick={() => alert(`Đang tìm chỉ đường tối ưu trên Google Maps tới địa chỉ: ${ship.address}`)}
                          className="flex items-center gap-1 border border-outline-variant hover:bg-surface-container-low text-on-surface font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-primary" />
                          <span>Đường đi</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeliverySuccess(ship)}
                          className="flex items-center gap-1 bg-secondary hover:bg-secondary/90 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Giao thành công</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT: Route and Maps */}
          <div>
            <h3 className="text-body-lg font-bold text-on-surface mb-sm">Bản đồ tuyến đường</h3>
            
            <div className="bg-white p-sm rounded-2xl border border-outline-variant/20 shadow-sm space-y-sm">
              
              {/* Premium Route Map Visualizer (SVG-based mockup map) */}
              <div className="w-full h-64 bg-[#e5e7eb] rounded-xl border border-outline-variant/20 p-xs relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 240">
                  <rect width="300" height="240" fill="#f0fdf4" opacity="0.5" />
                  
                  {/* Roads / Paths */}
                  <path d="M 30 40 Q 150 20 270 40 T 150 200 Z" fill="none" stroke="#d1d5db" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 30 40 Q 150 20 270 40 T 150 200 Z" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  
                  <path d="M 150 20 L 150 220" fill="none" stroke="#d1d5db" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 150 20 L 150 220" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  
                  <path d="M 10 120 L 290 120" fill="none" stroke="#d1d5db" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 10 120 L 290 120" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />

                  {/* Route Line highlight */}
                  <path d="M 30 40 L 150 20 L 150 120 L 270 40" fill="none" stroke="#3755c3" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,4" />

                  {/* Warehouse Node */}
                  <circle cx="30" cy="40" r="8" fill="#1f6c3a" stroke="white" strokeWidth="2" />
                  <text x="25" y="55" className="text-[9px] font-bold fill-on-surface">Kho hàng</text>

                  {/* Customer Nodes */}
                  <circle cx="150" cy="20" r="7" fill="#00288e" stroke="white" strokeWidth="1.5" />
                  <text x="145" y="32" className="text-[8px] font-bold fill-on-surface">Đơn 1</text>
                  
                  {/* Active Shipper Node */}
                  <circle cx="150" cy="120" r="8" fill="#d97706" stroke="white" strokeWidth="2" className="animate-ping" opacity="0.3" />
                  <circle cx="150" cy="120" r="5" fill="#d97706" stroke="white" strokeWidth="1.5" />
                  <text x="135" y="136" className="text-[9px] font-bold fill-[#d97706]">Vị trí của bạn</text>

                  {/* Next Node */}
                  <circle cx="270" cy="40" r="7" fill="#00288e" stroke="white" strokeWidth="1.5" />
                  <text x="260" y="52" className="text-[8px] font-bold fill-on-surface">Đơn 2</text>
                </svg>
              </div>

              {/* Route Info */}
              <div className="space-y-1 text-label-sm text-on-surface-variant font-sans">
                <div className="flex justify-between">
                  <span>Tổng quãng đường:</span>
                  <span className="font-bold text-on-surface">18.2 km</span>
                </div>
                <div className="flex justify-between">
                  <span>Ước lượng thời gian:</span>
                  <span className="font-bold text-on-surface">45 phút</span>
                </div>
                <div className="flex justify-between">
                  <span>Khu vực hoạt động:</span>
                  <span className="font-bold text-on-surface text-right">Quận 1 - Bình Thạnh</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-outline-variant/20 py-sm px-margin-mobile md:px-margin-desktop text-center text-label-sm text-on-surface-variant/60 font-sans mt-lg">
        WildStream Gear Logistics Delivery Portal &copy; 2026. Driver dispatch terminal.
      </footer>

      {deliveryOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-md md:p-lg shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-sm">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Xác nhận giao hàng</span>
                <h2 className="text-headline-sm font-black mt-1">Đơn {deliveryOrder.id}</h2>
              </div>
              <button type="button" onClick={() => setDeliveryOrder(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-outline">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-sm text-label-sm">
              <p className="font-bold">{deliveryOrder.name}</p>
              <p className="text-on-surface-variant">{deliveryOrder.address}</p>
            </div>

            <div className="border border-outline-variant/20 rounded-xl divide-y divide-outline-variant/10 mb-sm">
              {deliveryOrder.items?.map((item: any) => (
                <div key={item.id} className="p-xs flex justify-between text-label-sm">
                  <span>{item.productName} × {item.quantity}</span>
                  <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.soldPrice || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <label className="block border-2 border-dashed border-amber-300 hover:border-amber-600 rounded-2xl p-sm text-center cursor-pointer bg-amber-50/40">
              {proofImageUrl ? (
                <img src={proofImageUrl} alt="Ảnh xác nhận giao hàng" className="w-full max-h-64 object-contain rounded-xl" />
              ) : (
                <div className="py-md">
                  {uploadingProof ? <UploadCloud className="w-10 h-10 animate-bounce text-amber-600 mx-auto" /> : <Camera className="w-10 h-10 text-amber-600 mx-auto" />}
                  <p className="font-bold mt-xs">{uploadingProof ? 'Đang tải ảnh...' : 'Chụp ảnh hàng đã giao'}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Bắt buộc có ảnh trước khi xác nhận thành công</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={uploadingProof}
                onChange={(event) => handleProofFile(event.target.files?.[0])}
                className="hidden"
              />
            </label>

            <div className="flex justify-end gap-sm mt-md">
              <button type="button" onClick={() => setDeliveryOrder(null)} className="px-md py-2.5 bg-slate-100 rounded-xl font-bold">Hủy</button>
              <button
                type="button"
                onClick={confirmDeliverySuccess}
                disabled={!proofImageUrl || uploadingProof || completingDelivery}
                className="px-md py-2.5 bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                {completingDelivery ? 'ĐANG XÁC NHẬN...' : 'XÁC NHẬN ĐÃ GIAO'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
