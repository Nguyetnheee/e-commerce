'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { adminApi } from '../../../lib/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getReviews()
      .then((response) => setReviews(Array.isArray(response?.content) ? response.content : []))
      .catch((err) => setError(err.message || 'Không thể tải danh sách đánh giá'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">WildStream CMS</p>
        <h1 className="text-3xl font-black">Đánh giá sản phẩm</h1>
        <p className="text-slate-500 mt-1">Feedback thực tế của khách sau khi xác nhận đã nhận hàng.</p>
      </div>
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-slate-500">Đang tải đánh giá...</p>
        ) : error ? (
          <p className="p-8 text-red-600">{error}</p>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            Chưa có đánh giá nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="p-4">Đơn hàng</th><th className="p-4">Khách hàng</th><th className="p-4">Sản phẩm</th><th className="p-4">Số sao</th><th className="p-4">Bình luận</th><th className="p-4">Ngày tạo</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="p-4 font-bold text-blue-800">#{review.orderId}</td>
                    <td className="p-4"><div className="font-semibold">{review.userName}</div><div className="text-xs text-slate-400">User #{review.userId}</div></td>
                    <td className="p-4">Sản phẩm #{review.productId}</td>
                    <td className="p-4"><span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star className="w-4 h-4 fill-current" />{review.rating}/5</span></td>
                    <td className="p-4 max-w-md whitespace-pre-wrap">{review.text || 'Không có bình luận'}</td>
                    <td className="p-4 text-sm text-slate-500">{review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
