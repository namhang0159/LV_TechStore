'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllWarehouses, getAllProducts, createDirectOrder, getAvailableSerials, getAllAdmins, getAllCustomers, applyVoucher } from '@/util/api'
import { Search, Plus, Minus, Trash2, Box, User, CreditCard, X, AlertCircle, CheckCircle, Tag } from 'lucide-react'
import Link from 'next/link'

interface Warehouse {
  id: number
  name: string
  location: string
}

interface ProductVariant {
  id: number
  price: number
  sku: string
  AttributeValues: { Attribute: { name: string }, value: string }[]
}

interface Product {
  id: number
  name: string
  ProductVariants: ProductVariant[]
  requires_serial?: boolean
}

interface CartItem {
  variant_id: number
  product_id: number
  product_name_snapshot: string
  variant_name_snapshot: string
  price_at_purchase: number
  quantity: number
  total_price: number
}

export default function CreateDirectOrderPage() {
  const router = useRouter()

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('')

  const [products, setProducts] = useState<Product[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')

  const [cart, setCart] = useState<CartItem[]>([])

  // Staff Info
  const [admins, setAdmins] = useState<any[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('')

  // Customer Info
  const [customers, setCustomers] = useState<any[]>([])
  const [isGuest, setIsGuest] = useState(true)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [note, setNote] = useState('')

  // Voucher
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string, discount_amount: number } | null>(null)
  const [voucherError, setVoucherError] = useState('')

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Serials
  const [serialNumbers, setSerialNumbers] = useState<Record<number, number[]>>({}) // variant_id -> array of serial_ids
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false)
  const [currentSerialVariantId, setCurrentSerialVariantId] = useState<number | null>(null)
  const [availableSerials, setAvailableSerials] = useState<any[]>([])
  const [selectedSerialsTemp, setSelectedSerialsTemp] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, productRes, adminRes, customerRes] = await Promise.all([
          getAllWarehouses(),
          getAllProducts(),
          getAllAdmins(),
          getAllCustomers()
        ])
        console.log("warehouseRes", warehouseRes)
        console.log("productRes", productRes)
        console.log("adminRes", adminRes)
        console.log("customerRes", customerRes)
        if (warehouseRes.data?.data) {
          setWarehouses(warehouseRes.data.data)
          if (warehouseRes.data.data.length > 0) setSelectedWarehouseId(warehouseRes.data.data[0].id)
        }
        if (productRes.data?.data) setProducts(productRes.data.data)
        if (adminRes.data?.data) setAdmins(adminRes.data.data)
        if (customerRes.data?.data) setCustomers(customerRes.data.data)
      } catch (err) {
        console.error('Error fetching data', err)
        setError('Failed to load initial data.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getVariantName = (variant: ProductVariant) => {
    if (!variant.AttributeValues || variant.AttributeValues.length === 0) return 'Default'
    return variant.AttributeValues.map(av => av.value).join(' / ')
  }

  const addToCart = (product: Product, variant: ProductVariant) => {
    setCart(prev => {
      const existing = prev.find(item => item.variant_id === variant.id)
      if (existing) {
        return prev.map(item =>
          item.variant_id === variant.id
            ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.price_at_purchase }
            : item
        )
      }
      return [...prev, {
        variant_id: variant.id,
        product_id: product.id,
        product_name_snapshot: product.name,
        variant_name_snapshot: getVariantName(variant),
        price_at_purchase: variant.price,
        quantity: 1,
        total_price: variant.price
      }]
    })
  }

  const updateQuantity = (variant_id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variant_id === variant_id) {
        const newQuantity = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQuantity, total_price: newQuantity * item.price_at_purchase }
      }
      return item
    }))
  }

  const removeFromCart = (variant_id: number) => {
    setCart(prev => prev.filter(item => item.variant_id !== variant_id))
    // Also remove serials if any
    setSerialNumbers(prev => {
      const updated = { ...prev }
      delete updated[variant_id]
      return updated
    })
  }

  const openSerialModal = async (variant_id: number) => {
    if (!selectedWarehouseId) {
      alert("Vui lòng chọn kho hàng trước")
      return
    }
    setCurrentSerialVariantId(variant_id)
    setIsSerialModalOpen(true)
    setAvailableSerials([])
    setSelectedSerialsTemp(serialNumbers[variant_id] || [])

    try {
      const res = await getAvailableSerials(variant_id, Number(selectedWarehouseId))
      if (res.data && res.data.data) {
        setAvailableSerials(res.data.data)
        console.log("availableSerials", res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch serials", err)
    }
  }

  const toggleSerialSelection = (serialId: number) => {
    setSelectedSerialsTemp(prev => {
      if (prev.includes(serialId)) return prev.filter(id => id !== serialId)

      // Check if exceeding quantity
      const cartItem = cart.find(i => i.variant_id === currentSerialVariantId)
      if (cartItem && prev.length >= cartItem.quantity) {
        alert(`Bạn chỉ được chọn tối đa ${cartItem.quantity} IMEI/Serial cho sản phẩm này.`)
        return prev
      }
      return [...prev, serialId]
    })
  }

  const saveSerialSelection = () => {
    if (currentSerialVariantId) {
      setSerialNumbers(prev => ({
        ...prev,
        [currentSerialVariantId]: selectedSerialsTemp
      }))
    }
    setIsSerialModalOpen(false)
  }

  const totalBasePrice = cart.reduce((sum, item) => sum + item.total_price, 0)
  const totalDiscount = appliedVoucher ? appliedVoucher.discount_amount : 0
  const shippingFee = 0
  const finalAmount = Math.max(0, totalBasePrice - totalDiscount + shippingFee)

  const handleApplyVoucher = async () => {
    setVoucherError('')
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá')
      return
    }
    if (isGuest) {
      setVoucherError('Mã giảm giá chỉ dành cho khách hàng thành viên. Vui lòng hướng dẫn khách hàng đăng ký hoặc đổi sang Khách thành viên.')
      return
    }
    if (!selectedCustomerId) {
      setVoucherError('Vui lòng chọn khách hàng thành viên trước khi áp dụng mã.')
      return
    }
    if (cart.length === 0) {
      setVoucherError('Giỏ hàng trống.')
      return
    }

    try {
      const res = await applyVoucher({
        code: voucherCode,
        orderTotal: totalBasePrice,
        userId: Number(selectedCustomerId)
      })
      if (res.data && res.data.data) {
        setAppliedVoucher(res.data.data)
      }
    } catch (err: any) {
      console.error(err)
      setVoucherError(err.response?.data?.message || err.message || 'Lỗi áp dụng mã giảm giá')
      setAppliedVoucher(null)
    }
  }

  const removeVoucher = () => {
    setVoucherCode('')
    setAppliedVoucher(null)
    setVoucherError('')
  }

  const handleSubmit = async () => {
    if (!selectedWarehouseId) {
      setError("Vui lòng chọn kho hàng.")
      return
    }
    if (!selectedStaffId) {
      setError("Vui lòng chọn nhân viên tư vấn.")
      return
    }
    if (!isGuest && !selectedCustomerId) {
      setError("Vui lòng chọn khách hàng thành viên.")
      return
    }
    if (cart.length === 0) {
      setError("Giỏ hàng đang trống.")
      return
    }

    const formattedSerials = Object.entries(serialNumbers).map(([vId, sIds]) => ({
      variant_id: parseInt(vId),
      serial_ids: sIds
    })).filter(s => s.serial_ids.length > 0)

    const payload = {
      user_id: !isGuest ? Number(selectedCustomerId) : undefined,
      customer_name: isGuest ? customerName : undefined,
      customer_phone: isGuest ? customerPhone : undefined,
      warehouse_id: Number(selectedWarehouseId),
      staff_id: Number(selectedStaffId),
      items: cart.map(item => ({
        variant_id: item.variant_id,
        product_name_snapshot: item.product_name_snapshot,
        variant_name_snapshot: item.variant_name_snapshot,
        price_at_purchase: item.price_at_purchase,
        quantity: item.quantity,
        total_price: item.total_price
      })),
      serial_numbers: formattedSerials,
      total_base_price: totalBasePrice,
      total_discount: totalDiscount,
      shipping_fee: shippingFee,
      final_amount: finalAmount,
      voucher_code: appliedVoucher ? appliedVoucher.code : undefined,
      payment_method: paymentMethod,
      note: note
    }

    setIsSubmitting(true)
    setError('')
    try {
      const res = await createDirectOrder(payload)
      if (res.data) {
        alert("Tạo đơn hàng thành công!")
        if (paymentMethod === 'vnpay' && res.data.paymentUrl) {
          // Mở link VNPay ở tab mới cho khách tự quét (nếu có màn hình phụ) hoặc admin tự quét hộ
          window.open(res.data.paymentUrl, '_blank')
        }
        router.push('/dashboard/orders')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo đơn hàng.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading POS...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tạo Đơn Hàng Tại Quầy (POS)</h1>
        <Link href="/dashboard/orders" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          Quay lại danh sách
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="size-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Products & Cart */}
        <div className="lg:col-span-2 space-y-6">

          {/* Products Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Box className="size-5 text-blue-500" />
                Sản phẩm
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="border border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-colors">
                  <h3 className="font-medium text-sm text-slate-900 mb-2 truncate" title={product.name}>{product.name}</h3>
                  <div className="space-y-2">
                    {product.ProductVariants?.map(variant => (
                      <div key={variant.id} className="flex flex-col gap-1 text-xs p-2 bg-slate-50 rounded cursor-pointer hover:bg-blue-50" onClick={() => addToCart(product, variant)}>
                        <div className="flex justify-between text-slate-700">
                          <span className="truncate mr-2">{getVariantName(variant)}</span>
                          <span className="font-semibold text-blue-600">{formatPrice(variant.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Giỏ hàng</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Chưa có sản phẩm nào trong giỏ.</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.variant_id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.product_name_snapshot}</p>
                      <p className="text-xs text-slate-500">{item.variant_name_snapshot}</p>
                      <button
                        onClick={() => openSerialModal(item.variant_id)}
                        className="text-xs mt-1 text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Chọn Serial/IMEI {serialNumbers[item.variant_id]?.length ? `(${serialNumbers[item.variant_id].length}/${item.quantity})` : ''}
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.variant_id, -1)} className="p-1 hover:bg-white rounded text-slate-600"><Minus className="size-3" /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variant_id, 1)} className="p-1 hover:bg-white rounded text-slate-600"><Plus className="size-3" /></button>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-sm font-semibold text-slate-900">{formatPrice(item.total_price)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.variant_id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Info & Checkout */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="size-5 text-emerald-500" />
              Khách hàng
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Cửa hàng xuất bán <span className="text-red-500">*</span></label>
                <select
                  value={selectedWarehouseId}
                  onChange={e => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Chọn cửa hàng --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nhân viên tư vấn <span className="text-red-500">*</span></label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {admins.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setIsGuest(true)
                    setVoucherCode('')
                    setAppliedVoucher(null)
                    setVoucherError('')
                  }}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${isGuest ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >Khách mới / Khách vãng lai</button>
                <button
                  onClick={() => setIsGuest(false)}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${!isGuest ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >Khách thành viên</button>
              </div>

              {isGuest ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tên khách hàng</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="09..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Khách hàng thành viên <span className="text-red-500">*</span></label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ghi chú đơn hàng..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {!isGuest && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="size-5 text-orange-500" />
                Mã giảm giá
              </h2>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher..."
                    disabled={appliedVoucher !== null}
                    className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 uppercase"
                  />
                  {!appliedVoucher ? (
                    <button onClick={handleApplyVoucher} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Áp dụng</button>
                  ) : (
                    <button onClick={removeVoucher} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">Gỡ bỏ</button>
                  )}
                </div>
                {voucherError && <p className="text-xs text-red-500 font-medium">{voucherError}</p>}
                {appliedVoucher && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    <CheckCircle className="size-4" />
                    <span>Áp dụng thành công. Giảm {formatPrice(appliedVoucher.discount_amount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="size-5 text-purple-500" />
              Thanh toán
            </h2>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={e => setPaymentMethod(e.target.value)} className="text-blue-600" />
                <span className="text-sm font-medium">Tiền mặt</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={e => setPaymentMethod(e.target.value)} className="text-blue-600" />
                <span className="text-sm font-medium">VNPay</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={e => setPaymentMethod(e.target.value)} className="text-blue-600" />
                <span className="text-sm font-medium">MoMo</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tạm tính</span>
                <span>{formatPrice(totalBasePrice)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Mã giảm giá</span>
                  <span>-{formatPrice(appliedVoucher.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Khách cần trả</span>
                <span className="text-blue-600">{formatPrice(finalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Tạo Đơn Hàng'}
            </button>
          </div>
        </div>
      </div>

      {/* Serial Number Modal */}
      {isSerialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-900">Chọn Serial/IMEI</h3>
              <button onClick={() => setIsSerialModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {availableSerials.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Không có Serial/IMEI khả dụng trong kho này.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSerials.map(serial => (
                    <label key={serial.id} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${selectedSerialsTemp.includes(serial.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                      <input
                        type="checkbox"
                        checked={selectedSerialsTemp.includes(serial.id)}
                        onChange={() => toggleSerialSelection(serial.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{serial.imei_or_serial_number}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsSerialModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
              <button onClick={saveSerialSelection} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
