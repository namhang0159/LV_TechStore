'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Package, CreditCard, User, MapPin,
  Calendar, FileText, Truck, Store, ShieldCheck,
  Tag, Printer, Phone, X
} from 'lucide-react'
import { getOrderById, updateOrderStatus, getAvailableSerials } from '@/util/api'

export default function OrderDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [isFetchingSerials, setIsFetchingSerials] = useState(false)
  const [availableSerialsByItem, setAvailableSerialsByItem] = useState<Record<number, any[]>>({})
  const [selectedSerialsByItem, setSelectedSerialsByItem] = useState<Record<number, number[]>>({})

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(Number(id))
        if (response.data && response.data.data) {
          setOrder(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch order', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id])

  const handleStatusChange = async (type: 'order_status' | 'payment_status', value: string) => {
    if (type === 'order_status' && value === 'shipping') {
      setIsShippingModalOpen(true)
      setIsFetchingSerials(true)
      try {
        const serialsMap: Record<number, any[]> = {}
        const selectedMap: Record<number, number[]> = {}
        for (const item of order.OrderItems) {
          const res = await getAvailableSerials(item.variant_id, order.warehouse_id)
          serialsMap[item.id] = res.data?.data || []
          selectedMap[item.id] = []
        }
        setAvailableSerialsByItem(serialsMap)
        setSelectedSerialsByItem(selectedMap)
      } catch (error) {
        console.error('Failed to fetch serials', error)
        alert('Có lỗi khi tải danh sách Serial/IMEI')
      } finally {
        setIsFetchingSerials(false)
      }
      return
    }

    try {
      const response = await updateOrderStatus(Number(id), { [type]: value })
      if (response.data && response.data.data) {
        setOrder(response.data.data)
      }
    } catch (error: any) {
      console.error(`Failed to update ${type}`, error)
      const errorMessage = error.response?.data?.message || `Failed to update ${type.replace('_', ' ')}. Please try again.`
      alert(errorMessage)
    }
  }

  const handleShippingSubmit = async () => {
    // Validate if all serials are selected
    for (const item of order.OrderItems) {
      const selected = selectedSerialsByItem[item.id] || []
      if (selected.length !== item.quantity) {
        alert(`Vui lòng chọn đủ ${item.quantity} mã Serial/IMEI cho sản phẩm ${item.product_name_snapshot}`)
        return
      }
    }

    const serial_numbers = order.OrderItems.map((item: any) => ({
      order_item_id: item.id,
      serial_ids: selectedSerialsByItem[item.id] || []
    }))

    try {
      const response = await updateOrderStatus(Number(id), { 
        order_status: 'shipping',
        serial_numbers 
      })
      if (response.data && response.data.data) {
        setOrder(response.data.data)
        setIsShippingModalOpen(false)
      }
    } catch (error: any) {
      console.error('Failed to update shipping status', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại.'
      alert(errorMessage)
    }
  }

  const formatPrice = (priceStr: string | number) => {
    const price = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'unpaid': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'confirmed': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'shipping':
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'cancel':
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'returned': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getCustomerInfo = (shippingJson: any) => {
    if (!shippingJson) return {}
    let parsed = shippingJson
    if (typeof shippingJson === 'string') {
      try {
        parsed = JSON.parse(shippingJson)
      } catch (e) {
        return {}
      }
    }
    return parsed
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)] text-slate-500">Loading order details...</div>
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-slate-500">
        <Package className="size-16 mb-4 text-slate-300" />
        <p className="text-lg font-medium text-slate-600">Order not found</p>
        <Link href="/dashboard/orders" className="mt-4 text-blue-600 hover:underline">Return to Orders</Link>
      </div>
    )
  }

  const customerInfo = getCustomerInfo(order.shipping_address_json)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-md hover:bg-slate-100 transition-colors bg-white border border-slate-200 shadow-sm">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Order {order.order_code}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Calendar className="size-3.5" /> {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.order_status?.toLowerCase() || 'pending'}
            onChange={(e) => handleStatusChange('order_status', e.target.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize outline-none cursor-pointer ${getOrderStatusColor(order.order_status)}`}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancel">Cancel</option>

            <option value="returned">Returned</option>
          </select>

          <select
            value={order.payment_status?.toLowerCase() || 'unpaid'}
            onChange={(e) => handleStatusChange('payment_status', e.target.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize outline-none cursor-pointer ${getPaymentStatusColor(order.payment_status)}`}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="flex items-center gap-2 rounded-md bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <Printer className="size-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">Order Items</h2>
              </div>
              <span className="text-sm text-slate-500">{order.OrderItems?.length || 0} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6 font-medium">Product</th>
                    <th className="py-3 px-6 font-medium text-center">Qty</th>
                    <th className="py-3 px-6 font-medium text-right">Price</th>
                    <th className="py-3 px-6 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.OrderItems?.map((item: any) => {
                    const imageUrl = item.ProductVariant?.ProductVariantImages?.[0]?.image_url;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-4">
                            <div className="size-16 rounded-md border border-slate-200 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                              {imageUrl ? (
                                <img src={imageUrl} alt={item.product_name_snapshot} className="w-full h-full object-contain" />
                              ) : (
                                <Package className="size-8 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.product_name_snapshot}</p>
                              <p className="text-xs text-slate-500 mt-1">{item.variant_name_snapshot}</p>
                              <p className="text-xs text-slate-500 mt-0.5">SKU: {item.ProductVariant?.sku}</p>
                              {item.OrderItemSerials?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.OrderItemSerials.map((serial: any) => (
                                    <span key={serial.id} className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 mr-1 mb-1">
                                      IMEI: {serial.SerialNumber?.imei_or_serial_number}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-slate-700">
                          x{item.quantity}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          {formatPrice(item.price_at_purchase)}
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-slate-900">
                          {formatPrice(item.total_price)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
              <div className="flex flex-col gap-3 sm:max-w-xs sm:ml-auto w-full">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total_base_price)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Discount</span>
                  <span className="text-red-600">-{formatPrice(order.total_discount)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span>{parseFloat(order.shipping_fee) === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">{formatPrice(order.final_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <CreditCard className="size-4 text-slate-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Payment Info</h3>
              </div>
              <div className="p-5 space-y-4 text-sm flex-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium text-slate-900">{order.payment_method || 'N/A'}</span>
                </div>
                {order.Payments?.map((payment: any) => (
                  <div key={payment.id} className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Gateway</span>
                      <span className="font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded text-xs">{payment.payment_gateway}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Transaction ID</span>
                      <span className="font-mono text-xs text-slate-600">{payment.transaction_id || 'N/A'}</span>
                    </div>
                    {payment.paid_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Paid At</span>
                        <span className="text-slate-900 text-xs">{formatDate(payment.paid_at)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Truck className="size-4 text-slate-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Shipping Info</h3>
              </div>
              <div className="p-5 space-y-4 text-sm flex-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium text-slate-900">{order.delivery_method || 'Standard Delivery'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping Fee</span>
                  <span className="font-medium text-slate-900">{parseFloat(order.shipping_fee) === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <User className="size-4 text-slate-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Customer</h3>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {customerInfo.receiver_name?.charAt(0) || customerInfo.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{customerInfo.receiver_name || customerInfo.name || order.name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500 mt-0.5">Account ID: #{order.user_id}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-slate-900 leading-relaxed">{customerInfo.address || 'No address provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-slate-400 flex-shrink-0" />
                  <p className="text-sm text-slate-900">{customerInfo.phone || 'No phone provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {order.note && (
            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-100 flex items-center gap-2 bg-amber-50">
                <FileText className="size-4 text-amber-600" />
                <h3 className="font-semibold text-amber-800 text-sm">Order Note</h3>
              </div>
              <div className="p-5 bg-amber-50/30">
                <p className="text-sm text-slate-800 italic">
                  "{order.note}"
                </p>
              </div>
            </div>
          )}

          {/* Warehouse Card */}
          {order.Warehouse && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Store className="size-4 text-slate-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Fulfillment Center</h3>
              </div>
              <div className="p-5 space-y-2 text-sm">
                <p className="font-medium text-slate-900">{order.Warehouse.name}</p>
                <p className="text-slate-600 leading-relaxed">{order.Warehouse.location}</p>
              </div>
            </div>
          )}

          {/* Vouchers Card */}
          {order.Vouchers && order.Vouchers.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Tag className="size-4 text-slate-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Applied Vouchers</h3>
              </div>
              <div className="p-5 space-y-3">
                {order.Vouchers.map((voucher: any) => (
                  <div key={voucher.id} className="flex justify-between items-center text-sm border border-slate-200 p-3 rounded-lg border-dashed bg-slate-50/50">
                    <div className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider">
                      {voucher.code}
                    </div>
                    <span className="text-red-600 font-medium">-{formatPrice(voucher.order_vouchers?.discount_amount || voucher.discount_value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty Card */}
          {order.warranties && order.warranties.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <ShieldCheck className="size-4 text-slate-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Warranties</h3>
              </div>
              <div className="p-5 space-y-4">
                {order.warranties.map((warranty: any, index: number) => (
                  <div key={warranty.id} className={`text-sm space-y-2 ${index > 0 ? 'pt-4 border-t border-slate-100' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status</span>
                      <span className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${warranty.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{warranty.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Expires</span>
                      <span className="text-slate-900 font-medium text-xs">{formatDate(warranty.expiry_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Shipping Modal */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Truck className="size-5 text-indigo-600" />
                Chuẩn bị xuất kho (Shipping)
              </h3>
              <button 
                onClick={() => setIsShippingModalOpen(false)}
                className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-indigo-50 text-indigo-700 p-4 rounded-lg text-sm flex gap-3">
                <ShieldCheck className="size-5 flex-shrink-0" />
                <p>Vui lòng chọn chính xác mã Serial/IMEI cho từng sản phẩm trước khi xuất kho. Thao tác này sẽ tự động trừ hàng trong kho và kích hoạt bảo hành điện tử (nếu có).</p>
              </div>

              {isFetchingSerials ? (
                <div className="py-10 text-center text-slate-500">Đang tải danh sách mã Serial/IMEI...</div>
              ) : (
                <div className="space-y-6">
                  {order.OrderItems?.map((item: any) => {
                    const availableSerials = availableSerialsByItem[item.id] || []
                    const selectedIds = selectedSerialsByItem[item.id] || []
                    
                    const handleSelectSerial = (serialId: number) => {
                      setSelectedSerialsByItem(prev => {
                        const current = prev[item.id] || []
                        if (current.includes(serialId)) {
                          return { ...prev, [item.id]: current.filter(id => id !== serialId) }
                        }
                        if (current.length >= item.quantity) {
                          alert(`Bạn chỉ cần chọn ${item.quantity} mã cho sản phẩm này.`)
                          return prev
                        }
                        return { ...prev, [item.id]: [...current, serialId] }
                      })
                    }

                    return (
                      <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-800">{item.product_name_snapshot}</p>
                            <p className="text-sm text-slate-500">{item.variant_name_snapshot}</p>
                          </div>
                          <div className="text-sm font-medium text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200">
                            Cần xuất: <span className="text-indigo-600 font-bold">{item.quantity}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-slate-600 mb-3">Chọn mã Serial/IMEI tương ứng:</p>
                          {availableSerials.length === 0 ? (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                              Không có mã Serial/IMEI khả dụng trong kho này!
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableSerials.map((serial: any) => {
                                const isSelected = selectedIds.includes(serial.id)
                                return (
                                  <label 
                                    key={serial.id} 
                                    className={`
                                      flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-sm
                                      ${isSelected 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                      }
                                    `}
                                  >
                                    <input 
                                      type="checkbox" 
                                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                      checked={isSelected}
                                      onChange={() => handleSelectSerial(serial.id)}
                                      disabled={!isSelected && selectedIds.length >= item.quantity}
                                    />
                                    <span className="truncate" title={serial.imei_or_serial_number}>{serial.imei_or_serial_number}</span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                          <div className="mt-3 text-sm text-right">
                            <span className="text-slate-500">Đã chọn: </span>
                            <span className={`font-bold ${selectedIds.length === item.quantity ? 'text-emerald-600' : 'text-orange-600'}`}>
                              {selectedIds.length} / {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setIsShippingModalOpen(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleShippingSubmit}
                disabled={isFetchingSerials}
                className="px-6 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Xác nhận Xuất kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
