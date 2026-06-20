'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Star, MapPin, 
  ShoppingBag, Heart, ShoppingCart, Loader2, Ban, CheckCircle
} from 'lucide-react'
import { getCustomerById, updateCustomerStatus } from '@/util/api'

export default function CustomerDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await getCustomerById(Number(id))
        if (response.data?.success && response.data?.data) {
          setCustomer(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch customer', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCustomer()
    }
  }, [id])

  const handleToggleStatus = async () => {
    if (!customer) return
    const newStatus = customer.status === 'active' ? 'banned' : 'active'
    try {
      await updateCustomerStatus(customer.id, newStatus)
      setCustomer({ ...customer, status: newStatus })
    } catch (error) {
      console.error('Failed to update status', error)
    }
  }

  const formatPrice = (priceStr: string | number) => {
    const price = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getInitial = (name: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const getBgColor = (id: number) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'
    ]
    return colors[id % colors.length]
  }

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)] text-slate-500"><Loader2 className="animate-spin size-6 mr-2" /> Loading customer profile...</div>
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-slate-500">
        <User className="size-16 mb-4 text-slate-300" />
        <p className="text-lg font-medium text-slate-600">Customer not found</p>
        <Link href="/dashboard/customers" className="mt-4 text-blue-600 hover:underline">Return to Customers</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/customers" className="p-2 rounded-md hover:bg-slate-100 transition-colors bg-white border border-slate-200 shadow-sm">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full ${getBgColor(customer.id)} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
              {getInitial(customer.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {customer.name}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                Customer #{customer.id} • Joined {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {customer.status === 'active' ? (
            <button 
              onClick={handleToggleStatus}
              className="flex items-center gap-2 rounded-md bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-100 shadow-sm"
            >
              <Ban className="size-4" /> Ban User
            </button>
          ) : (
            <button 
              onClick={handleToggleStatus}
              className="flex items-center gap-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-100 shadow-sm"
            >
              <CheckCircle className="size-4" /> Activate User
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sidebar - Personal Info */}
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="size-4 text-slate-500" /> Personal Information
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="size-4 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{customer.email}</div>
                  <div className="text-xs text-slate-500">Email Address</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-4 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{customer.phone || 'N/A'}</div>
                  <div className="text-xs text-slate-500">Phone Number</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="size-4 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{customer.birth_date && customer.birth_date !== '0000-00-00' ? customer.birth_date : 'N/A'}</div>
                  <div className="text-xs text-slate-500">Date of Birth</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="size-4 text-amber-500 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-600">{customer.level_points}</div>
                  <div className="text-xs text-slate-500">Reward Points</div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Status</span>
                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {customer.status}
                  </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Last Login</span>
                 <span className="font-medium text-slate-900">{customer.last_login_at ? formatDate(customer.last_login_at) : 'Never'}</span>
               </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="size-4 text-slate-500" /> Saved Addresses
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              {customer.user_addresses && customer.user_addresses.length > 0 ? (
                customer.user_addresses.map((address: any) => (
                  <div key={address.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 relative">
                    {address.is_default && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Default</span>
                    )}
                    <p className="font-medium text-slate-900 text-sm">{address.receiver_name}</p>
                    <p className="text-xs text-slate-600 mt-1">{address.phone}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {address.address_line}, {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">No saved addresses.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Orders, Wishlist, Cart */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Order History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">Order History</h2>
              </div>
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-md font-bold">
                {customer.Orders?.length || 0} Orders
              </span>
            </div>
            
            {(!customer.Orders || customer.Orders.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <ShoppingBag className="size-12 mb-3 text-slate-300" />
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-6 font-medium">Order Code</th>
                      <th className="py-3 px-6 font-medium">Date</th>
                      <th className="py-3 px-6 font-medium text-right">Total</th>
                      <th className="py-3 px-6 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customer.Orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-blue-600">
                          <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                            {order.order_code}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-slate-600">{formatDate(order.created_at)}</td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-right">{formatPrice(order.final_amount)}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getOrderStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wishlists */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Heart className="size-4 text-slate-500" />
                  <h2 className="font-semibold text-slate-800">Wishlist</h2>
                </div>
                <span className="text-slate-500 text-xs font-medium">{customer.Wishlists?.length || 0} items</span>
              </div>
              <div className="p-5">
                {(!customer.Wishlists || customer.Wishlists.length === 0) ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Wishlist is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {customer.Wishlists.map((w: any) => (
                      <div key={w.id} className="flex gap-3 items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                         <div className="flex-1">
                           <p className="text-sm font-medium text-slate-900 line-clamp-1">{w.Product?.name}</p>
                           <p className="text-xs font-medium text-blue-600 mt-0.5">{formatPrice(w.Product?.base_price)}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-4 text-slate-500" />
                  <h2 className="font-semibold text-slate-800">Active Cart</h2>
                </div>
                <span className="text-slate-500 text-xs font-medium">{customer.Cart?.CartItems?.length || 0} items</span>
              </div>
              <div className="p-5">
                {(!customer.Cart?.CartItems || customer.Cart.CartItems.length === 0) ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {customer.Cart.CartItems.map((ci: any) => (
                      <div key={ci.id} className="flex gap-3 items-center p-2 rounded-lg border border-slate-100 bg-slate-50">
                         <div className="flex-1">
                           <p className="text-sm font-medium text-slate-900 line-clamp-1">{ci.ProductVariant?.Product?.name}</p>
                           <p className="text-xs text-slate-500 mt-0.5">SKU: {ci.ProductVariant?.sku}</p>
                         </div>
                         <div className="text-right flex-shrink-0">
                           <p className="text-xs font-medium text-slate-900">x{ci.quantity}</p>
                           <p className="text-xs font-bold text-blue-600 mt-0.5">{formatPrice(ci.ProductVariant?.price)}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
