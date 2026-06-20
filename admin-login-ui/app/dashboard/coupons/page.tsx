'use client'

import { Search, ChevronDown, Edit2, Trash2, Plus, TicketPercent } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAllVoucher, createVoucher, updateVoucher, deleteVoucher } from '@/util/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Voucher {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  min_order_value: string;
  max_discount: string;
  start_date: string;
  end_date: string;
  usage_limit: number;
  min_level_points: number;
  Orders: any[];
}

export default function CouponsPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'fixed',
    discount_value: '',
    min_order_value: '0',
    max_discount: '0',
    start_date: '',
    end_date: '',
    usage_limit: '0',
    min_level_points: '0'
  })

  const fetchVouchers = async () => {
    try {
      setIsLoading(true)
      const res = await getAllVoucher()
      if (res.data?.success) {
        setVouchers(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch vouchers', error)
      toast?.error('Không thể tải danh sách Voucher')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const handleOpenModal = (voucher?: Voucher) => {
    if (voucher) {
      setEditingId(voucher.id)
      setFormData({
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_value: parseFloat(voucher.discount_value).toString(),
        min_order_value: parseFloat(voucher.min_order_value).toString(),
        max_discount: parseFloat(voucher.max_discount).toString(),
        start_date: new Date(voucher.start_date).toISOString().slice(0, 16),
        end_date: new Date(voucher.end_date).toISOString().slice(0, 16),
        usage_limit: voucher.usage_limit.toString(),
        min_level_points: voucher.min_level_points.toString()
      })
    } else {
      setEditingId(null)
      // Default to start now, end after 30 days
      const now = new Date()
      const end = new Date()
      end.setDate(now.getDate() + 30)

      setFormData({
        code: '',
        discount_type: 'fixed',
        discount_value: '',
        min_order_value: '0',
        max_discount: '0',
        start_date: now.toISOString().slice(0, 16),
        end_date: end.toISOString().slice(0, 16),
        usage_limit: '0',
        min_level_points: '0'
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        discount_value: Number(formData.discount_value),
        min_order_value: Number(formData.min_order_value),
        max_discount: Number(formData.max_discount),
        usage_limit: Number(formData.usage_limit),
        min_level_points: Number(formData.min_level_points),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      }

      if (editingId) {
        await updateVoucher(editingId, payload)
        toast?.success('Cập nhật Voucher thành công')
      } else {
        await createVoucher(payload)
        toast?.success('Tạo Voucher thành công')
      }
      setIsModalOpen(false)
      fetchVouchers()
    } catch (error) {
      console.error(error)
      toast?.error('Có lỗi xảy ra khi lưu Voucher')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Voucher này?')) return
    try {
      await deleteVoucher(id)
      toast?.success('Xóa Voucher thành công')
      fetchVouchers()
    } catch (error) {
      console.error(error)
      toast?.error('Có lỗi xảy ra khi xóa Voucher')
    }
  }

  const formatCurrency = (val: string | number) => {
    const num = Number(val)
    if (isNaN(num)) return val
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  }

  const filteredVouchers = vouchers.filter(v => v.code.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Voucher</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="size-4" />
            Add Voucher
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm mã voucher..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Đang tải danh sách...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-4 pl-4 pr-2 font-medium w-12">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4" />
                  </th>
                  <th className="py-4 px-4 font-medium">Mã Coupon</th>
                  <th className="py-4 px-4 font-medium">Loại</th>
                  <th className="py-4 px-4 font-medium">Mức giảm</th>
                  <th className="py-4 px-4 font-medium">Đã dùng</th>
                  <th className="py-4 px-4 font-medium">Trạng thái</th>
                  <th className="py-4 px-4 font-medium">Hết hạn</th>
                  <th className="py-4 px-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((voucher) => {
                  const now = new Date()
                  const isExpired = new Date(voucher.end_date) < now
                  const status = isExpired ? 'Expired' : 'Active'
                  const usedCount = voucher.Orders?.length || 0
                  
                  return (
                    <tr key={voucher.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-4 pr-2">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer" 
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <TicketPercent className="size-4 text-orange-500" />
                        {voucher.code}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">{voucher.discount_type}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {voucher.discount_type === 'fixed' 
                          ? formatCurrency(voucher.discount_value) 
                          : `${Number(voucher.discount_value)}%`}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {usedCount}/{voucher.usage_limit === 0 ? '∞' : voucher.usage_limit}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium
                          ${status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(voucher.end_date)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(voucher)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(voucher.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Không tìm thấy voucher nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mã Voucher</label>
                <input 
                  required
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="VD: WELCOME10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Loại giảm giá</label>
                <select
                  value={formData.discount_type}
                  onChange={e => setFormData({...formData, discount_type: e.target.value as 'fixed'|'percent'})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="fixed">Số tiền (Fixed)</option>
                  <option value="percent">Phần trăm (%)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mức giảm</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  step="any"
                  value={formData.discount_value}
                  onChange={e => setFormData({...formData, discount_value: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Giá trị đơn tối thiểu</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.min_order_value}
                  onChange={e => setFormData({...formData, min_order_value: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {formData.discount_type === 'percent' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Giảm tối đa (Max Discount)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.max_discount}
                    onChange={e => setFormData({...formData, max_discount: e.target.value})}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Giới hạn sử dụng (0 = Vô hạn)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.usage_limit}
                  onChange={e => setFormData({...formData, usage_limit: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Từ ngày</label>
                <input 
                  required
                  type="datetime-local" 
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Đến ngày</label>
                <input 
                  required
                  type="datetime-local" 
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Điểm tối thiểu (Level Points)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.min_level_points}
                  onChange={e => setFormData({...formData, min_level_points: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Lưu Thay Đổi' : 'Thêm Mới'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
