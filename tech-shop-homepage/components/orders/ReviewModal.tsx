import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { createReview } from '@/util/api';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: number;
    orderId: number;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, productName, productId, orderId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá");
            return;
        }

        setIsSubmitting(true);
        try {
            await createReview(productId, orderId, rating, comment);
            toast.success("Đánh giá của bạn đã được gửi và đang chờ duyệt!");
            setComment('');
            setRating(5);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-2">Sản phẩm</p>
                        <p className="font-medium text-gray-900 line-clamp-2">{productName}</p>
                    </div>

                    <div className="mb-6 flex flex-col items-center">
                        <p className="text-sm font-medium text-gray-700 mb-3">Chất lượng sản phẩm</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Nhận xét của bạn
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Trở lại
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Hoàn thành'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
