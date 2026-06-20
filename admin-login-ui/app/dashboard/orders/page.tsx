'use client'

import { Search, ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllOrders } from '@/util/api'

interface Order {
  id: number;
  order_code: string;
  created_at: string;
  shipping_address_json: any;
  payment_status: string;
  order_status: string;
  final_amount: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders()
        if (response.data && response.data.data) {
          setOrders(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch orders', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr)
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getCustomerName = (shippingJson: any) => {
    if (!shippingJson) return 'Unknown'
    
    let parsed = shippingJson
    if (typeof shippingJson === 'string') {
      try {
        parsed = JSON.parse(shippingJson)
      } catch (e) {
        return 'Unknown'
      }
    }

    return parsed.name || parsed.receiver_name || 'Unknown Customer'
  }

  const getPaymentStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-600'
      case 'unpaid': return 'bg-red-100 text-red-600'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const getOrderStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-500 text-white'
      case 'pending': return 'bg-orange-400 text-white'
      case 'shipped': return 'bg-slate-500 text-white'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Export
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            + Add Order
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select className="appearance-none rounded-md border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Filter</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md border border-slate-200 text-blue-500 hover:bg-slate-50">
              <Edit2 className="size-4" />
            </button>
            <button className="p-2 rounded-md border border-slate-200 text-blue-500 hover:bg-slate-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading orders...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-4 pl-4 pr-2 font-medium w-12">
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4" />
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium">Order</th>
                  <th className="py-4 px-4 font-medium">Date</th>
                  <th className="py-4 px-4 font-medium">Customer</th>
                  <th className="py-4 px-4 font-medium">Payment status</th>
                  <th className="py-4 px-4 font-medium">Order Status</th>
                  <th className="py-4 px-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer" 
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:text-blue-600 hover:underline">
                        {order.order_code}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4 text-slate-600">{getCustomerName(order.shipping_address_json)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getPaymentStatusClass(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getOrderStatusClass(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{formatPrice(order.final_amount)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white rounded-b-xl">
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="size-5" />
            </button>
            <button className="w-8 h-8 rounded text-sm font-medium flex items-center justify-center bg-blue-100 text-blue-600">
              1
            </button>
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="text-sm text-slate-500">
            {orders.length} Results
          </div>
        </div>
      </div>
    </div>
  )
}
