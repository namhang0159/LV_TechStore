'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getInventoryTransactionById } from '@/util/api'
import { Loader2, Package, Hash, Building2, User, Calendar, FileText } from 'lucide-react'

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: number | null
}

export function TransactionDetailModal({ isOpen, onClose, transactionId }: TransactionDetailModalProps) {
  const [detail, setDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchDetail()
    } else {
      setDetail(null)
    }
  }, [isOpen, transactionId])

  const fetchDetail = async () => {
    setIsLoading(true)
    try {
      const res = await getInventoryTransactionById(transactionId!)
      if (res.data?.success && res.data?.data) {
        setDetail(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch transaction details', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {detail?.transaction_type === 'IN' ? 'Chi Tiết Phiếu Nhập Kho' : 'Chi Tiết Phiếu Xuất Kho'} 
            {detail && <span className="text-slate-500 ml-2">#{detail.id}</span>}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin size-8 text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu chi tiết...</p>
          </div>
        ) : detail ? (
          <div className="space-y-6 py-4">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 h-fit">
                  <Calendar className="size-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Ngày giao dịch</p>
                  <p className="font-medium text-slate-900">{formatDate(detail.created_at)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 h-fit">
                  <Building2 className="size-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Tham chiếu</p>
                  <p className="font-medium text-slate-900 capitalize">{detail.reference_type}</p>
                  <p className="text-xs text-slate-500">ID: {detail.reference_id || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 h-fit">
                  <User className="size-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Người xử lý</p>
                  <p className="font-medium text-slate-900">{detail.admin?.name || detail.Admin?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">ID: {detail.created_by}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 h-fit">
                  <FileText className="size-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Ghi chú</p>
                  <p className="font-medium text-slate-900 text-sm italic">{detail.note || 'Không có ghi chú'}</p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="size-5 text-slate-500" /> Danh Sách Sản Phẩm
              </h3>
              
              <div className="space-y-4">
                {detail.InventoryTransactionItems?.map((item: any) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-700">
                            {item.ProductVariant?.sku}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 mt-2">
                          {item.ProductVariant?.Product?.name}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Số lượng</p>
                        <p className="text-lg font-bold text-slate-900">{item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Đơn giá</p>
                        <p className="font-medium text-slate-900">{formatPrice(Number(item.unit_cost))}</p>
                      </div>
                    </div>

                    {/* Serials / IMEIs */}
                    {item.InventoryTransactionSerials?.length > 0 && (
                      <div className="p-4 bg-white">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Hash className="size-4 text-slate-400" /> 
                          Mã IMEI/Serial ({item.InventoryTransactionSerials.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.InventoryTransactionSerials.map((ts: any) => (
                            <div 
                              key={ts.id} 
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 rounded-md text-sm font-mono text-slate-700 flex items-center gap-2"
                            >
                              {ts.SerialNumber?.imei_or_serial_number}
                              <span className={`size-2 rounded-full ${
                                ts.SerialNumber?.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'
                              }`} title={ts.SerialNumber?.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            Không tìm thấy thông tin giao dịch.
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
