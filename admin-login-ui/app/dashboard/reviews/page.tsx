'use client'

import { Search, Star, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react'

export default function ReviewsPage() {
  const reviews = [
    { id: 'REV-001', customer: 'Alice Johnson', product: 'Premium Wireless Headphones', rating: 5, comment: 'Excellent sound quality and very comfortable!', status: 'Approved', date: 'May 22, 2024', checked: true },
    { id: 'REV-002', customer: 'Bob Smith', product: 'Smart Watch Series 5', rating: 4, comment: 'Good features but battery life could be better.', status: 'Pending', date: 'May 21, 2024', checked: false },
    { id: 'REV-003', customer: 'Charlie Davis', product: 'Ergonomic Office Chair', rating: 2, comment: 'Not as comfortable as advertised.', status: 'Rejected', date: 'May 19, 2024', checked: false },
  ]

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
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-4 pl-4 pr-2 font-medium w-12">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4" />
                </th>
                <th className="py-4 px-4 font-medium">Customer</th>
                <th className="py-4 px-4 font-medium">Product</th>
                <th className="py-4 px-4 font-medium">Rating</th>
                <th className="py-4 px-4 font-medium w-1/3">Comment</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors items-start">
                  <td className="py-4 pl-4 pr-2 align-top">
                    <input 
                      type="checkbox" 
                      checked={review.checked}
                      readOnly
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer mt-1" 
                    />
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="font-medium text-slate-900">{review.customer}</div>
                    <div className="text-xs text-slate-500 mt-1">{review.date}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 align-top">{review.product}</td>
                  <td className="py-4 px-4 align-top">{renderStars(review.rating)}</td>
                  <td className="py-4 px-4 align-top">
                    <div className="flex gap-2">
                      <MessageSquare className="size-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-600 italic line-clamp-2">{review.comment}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium
                      ${review.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                        review.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 
                        'bg-red-100 text-red-600'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors" title="Approve">
                        <CheckCircle2 className="size-4" />
                      </button>
                      <button className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
