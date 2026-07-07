'use client'

import { Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAllWarranties } from '@/util/api'

interface Warranty {
  id: number;
  purchase_date: string;
  expiry_date: string;
  status: string;
  SerialNumber: {
    imei_or_serial_number: string;
    ProductVariant?: {
      Product?: {
        name: string;
      }
    }
  };
  User?: {
    name: string;
    email: string;
    phone?: string;
  };
  Order?: {
    order_code: string;
  };
}

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWarranties = async () => {
      try {
        const response = await getAllWarranties()
        if (response.data && response.data.data) {
          setWarranties(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch warranties', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWarranties()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  const getStatusDisplay = (status: string, expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr);
    const now = new Date();
    const isExpired = expiryDate < now;

    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-600">
          <XCircle className="size-3" /> Hết hạn
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-600">
        <CheckCircle className="size-3" /> Còn hạn
      </span>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý bảo hành</h1>
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
                placeholder="Tìm kiếm Serial/IMEI..." 
                className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Đang tải danh sách bảo hành...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-4 px-4 font-medium">Serial / IMEI</th>
                  <th className="py-4 px-4 font-medium">Sản phẩm</th>
                  <th className="py-4 px-4 font-medium">Khách hàng</th>
                  <th className="py-4 px-4 font-medium">Đơn hàng</th>
                  <th className="py-4 px-4 font-medium">Ngày kích hoạt</th>
                  <th className="py-4 px-4 font-medium">Ngày hết hạn</th>
                  <th className="py-4 px-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {warranties.map((warranty) => (
                  <tr key={warranty.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {warranty.SerialNumber?.imei_or_serial_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={warranty.SerialNumber?.ProductVariant?.Product?.name}>
                      {warranty.SerialNumber?.ProductVariant?.Product?.name || 'Sản phẩm không xác định'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {warranty.User ? (
                        <div>
                          <p className="font-medium text-slate-900">{warranty.User.name}</p>
                          <p className="text-xs text-slate-500">{warranty.User.phone || warranty.User.email}</p>
                        </div>
                      ) : (
                        'Khách lẻ'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {warranty.Order?.order_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(warranty.purchase_date)}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(warranty.expiry_date)}</td>
                    <td className="py-3 px-4">
                      {getStatusDisplay(warranty.status, warranty.expiry_date)}
                    </td>
                  </tr>
                ))}
                {warranties.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Chưa có thông tin bảo hành nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
