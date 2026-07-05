'use client'

import { useState } from 'react'
import { Search, ShieldCheck, Calendar, Package, User } from 'lucide-react'
import { lookupWarrantyBySerialNumber } from '@/util/api'

interface WarrantyInfo {
  id: number;
  purchase_date: string;
  expiry_date: string;
  status: string;
  SerialNumber: {
    imei_or_serial_number: string;
    ProductVariant?: {
      Product?: {
        name: string;
        warranty_months: number;
      }
    }
  };
  User?: {
    name: string;
  };
}

export default function WarrantyCheckPage() {
  const [serial, setSerial] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warranty, setWarranty] = useState<WarrantyInfo | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serial.trim()) {
      setError('Vui lòng nhập số Serial/IMEI')
      return
    }

    setLoading(true)
    setError('')
    setWarranty(null)

    try {
      const response = await lookupWarrantyBySerialNumber(serial.trim())
      if (response.success && response.data) {
        setWarranty(response.data)
      } else {
        setError(response.message || 'Không tìm thấy thông tin bảo hành')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dateString))
  }

  const getStatusInfo = (expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr)
    const now = new Date()
    if (expiryDate < now) {
      return { text: 'Đã hết hạn', color: 'text-red-600', bg: 'bg-red-100', borderColor: 'border-red-200' }
    }
    return { text: 'Còn bảo hành', color: 'text-emerald-600', bg: 'bg-emerald-100', borderColor: 'border-emerald-200' }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full mb-2">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tra Cứu Thông Tin Bảo Hành</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Nhập số Serial hoặc IMEI trên sản phẩm của bạn để kiểm tra tình trạng bảo hành chính hãng.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập số Serial / IMEI..."
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-slate-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
            >
              {loading ? 'Đang kiểm tra...' : 'Kiểm Tra Ngay'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {warranty && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Kết quả tra cứu</h3>
                <p className="text-sm text-slate-500">Mã Serial/IMEI: <span className="font-medium text-slate-700">{warranty.SerialNumber.imei_or_serial_number}</span></p>
              </div>
              
              {(() => {
                const status = getStatusInfo(warranty.expiry_date)
                return (
                  <div className={`px-4 py-2 rounded-lg border ${status.bg} ${status.color} ${status.borderColor} font-medium flex items-center gap-2`}>
                    <ShieldCheck className="size-5" />
                    {status.text}
                  </div>
                )
              })()}
            </div>

            <div className="p-6 grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                  <Package className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tên sản phẩm</p>
                  <p className="font-medium text-slate-900 leading-snug">
                    {warranty.SerialNumber.ProductVariant?.Product?.name || 'Đang cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-900 leading-snug">
                    {warranty.User?.name || 'Khách vãng lai'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Ngày mua hàng (kích hoạt)</p>
                  <p className="font-medium text-slate-900 leading-snug">
                    {formatDate(warranty.purchase_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Thời hạn bảo hành đến</p>
                  <p className="font-medium text-slate-900 leading-snug">
                    {formatDate(warranty.expiry_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
