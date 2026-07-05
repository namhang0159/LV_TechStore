"use client";
import { useState, useEffect } from 'react';
import { getProductReviews } from '@/util/api';
import { Star } from 'lucide-react';

export default function ProductFeedbackSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getProductReviews(productId);
        setReviews(res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Đang tải đánh giá...</div>;
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percent };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Đánh giá khách hàng</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 border-b border-gray-200 pb-10">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
          <div className="flex items-center justify-center md:justify-start text-yellow-400 mb-2">
            {'★★★★★'.split('').map((star, i) => <span key={i} className={`text-xl ${i < Math.round(Number(averageRating)) ? '' : 'text-gray-300'}`}>{star}</span>)}
          </div>
          <p className="text-sm text-gray-500">Dựa trên {totalReviews} đánh giá</p>
        </div>
        <div className="md:col-span-2 space-y-3">
          {ratingCounts.map((row) => (
            <div key={row.stars} className="flex items-center text-sm">
              <span className="w-12 text-gray-600 font-medium">{row.stars} Sao</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${row.percent}%` }}></div>
              </div>
              <span className="w-10 text-right text-gray-500">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                  {review.User?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.User?.name || 'Người dùng ẩn danh'}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm mt-3 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
