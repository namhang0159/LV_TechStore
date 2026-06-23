'use client'

import { useState, useEffect } from 'react'
import { Search, Star, MessageSquare, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { getAllReviews, updateReviewStatus, deleteReview } from '@/util/api'
import { toast } from 'sonner'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await getAllReviews()
      if (res.data?.success) {
        setReviews(res.data.data)
      } else {
        toast.error('Failed to fetch reviews')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await updateReviewStatus(id, status)
      if (res.data?.success) {
        toast.success(`Review ${status} successfully`)
        fetchReviews()
      } else {
        toast.error('Failed to update review status')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating review status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      const res = await deleteReview(id)
      if (res.data?.success) {
        toast.success('Review deleted successfully')
        fetchReviews()
      } else {
        toast.error('Failed to delete review')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting review')
    }
  }

  const filteredReviews = reviews.filter(review =>
    review.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`size-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading reviews...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-4 px-4 font-medium">Customer</th>
                  <th className="py-4 px-4 font-medium">Product</th>
                  <th className="py-4 px-4 font-medium">Rating</th>
                  <th className="py-4 px-4 font-medium w-1/3">Comment</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No reviews found.</td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors items-start">
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-slate-900">{review.User?.name || 'Unknown User'}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 align-top max-w-[200px] truncate" title={review.Product?.name}>
                        {review.Product?.name || `Product ID: ${review.product_id}`}
                      </td>
                      <td className="py-4 px-4 align-top">{renderStars(review.rating)}</td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex gap-2">
                          <MessageSquare className="size-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-600 italic line-clamp-2" title={review.comment}>{review.comment}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize
                          ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                            review.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                              'bg-red-100 text-red-600'}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center justify-end gap-2">
                          {review.status !== 'approved' && (
                            <button onClick={() => handleUpdateStatus(review.id, 'approved')} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors" title="Approve">
                              <CheckCircle2 className="size-4" />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button onClick={() => handleUpdateStatus(review.id, 'rejected')} className="p-1.5 rounded-md text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Reject">
                              <XCircle className="size-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(review.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
