'use client'

import { useState, useEffect } from 'react'
import { Search, Warehouse, AlertCircle, TrendingDown, TrendingUp, Filter, MapPin, Loader2, ListOrdered, ArrowRightLeft, Package, Eye } from 'lucide-react'
import { getAllWarehouses, getWarehouseById } from '@/util/api'
import Link from 'next/link'
import { TransactionModal } from './TransactionModal'
import { TransactionDetailModal } from './TransactionDetailModal'

export default function InventoryPage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('')
  
  const [warehouseDetail, setWarehouseDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('inventory')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null)

  const handleTransactionSuccess = () => {
    if (selectedWarehouseId) {
      setIsDetailLoading(true)
      getWarehouseById(Number(selectedWarehouseId))
        .then(res => {
          if (res.data?.success && res.data?.data) {
            setWarehouseDetail(res.data.data)
          }
        })
        .finally(() => setIsDetailLoading(false))
    }
  }

  // 1. Fetch all warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await getAllWarehouses()
        if (res.data?.success && res.data?.data) {
          setWarehouses(res.data.data)
          if (res.data.data.length > 0) {
            setSelectedWarehouseId(res.data.data[0].id.toString())
          }
        }
      } catch (error) {
        console.error('Failed to fetch warehouses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWarehouses()
  }, [])

  // 2. Fetch warehouse detail when selectedWarehouseId changes
  useEffect(() => {
    const fetchWarehouseDetail = async () => {
      if (!selectedWarehouseId) return
      setIsDetailLoading(true)
      try {
        const res = await getWarehouseById(Number(selectedWarehouseId))
        if (res.data?.success && res.data?.data) {
          setWarehouseDetail(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch warehouse detail:', error)
      } finally {
        setIsDetailLoading(false)
      }
    }
    fetchWarehouseDetail()
  }, [selectedWarehouseId])

  const inventories = warehouseDetail?.Inventories || []
  const orders = warehouseDetail?.Orders || []
  const transactions = warehouseDetail?.InventoryTransactions || []
  
  // Filter by search query
  const filteredInventories = inventories.filter((item: any) => {
    if (!searchQuery) return true
    const sku = item.ProductVariant?.sku?.toLowerCase() || ''
    const name = item.ProductVariant?.Product?.name?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()
    return sku.includes(q) || name.includes(q)
  })

  // Calculate stats
  const totalItems = inventories.reduce((acc: number, item: any) => acc + item.quantity, 0)
  const lowStockCount = inventories.filter((item: any) => item.quantity > 0 && item.quantity <= 5).length
  const outOfStockCount = inventories.filter((item: any) => item.quantity === 0).length

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-700 border-red-200' }
    if (quantity <= 5) return { label: 'Low Stock', class: 'bg-orange-100 text-orange-700 border-orange-200' }
    return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
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

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'unpaid': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)] text-slate-500"><Loader2 className="animate-spin size-6 mr-2" /> Loading inventory...</div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage stock levels across all branches.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            Export Report
          </button>
          <button 
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Manage Stock
          </button>
        </div>
      </div>

      {/* Stats & Select Branch */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="size-4" /> Select Branch
          </h3>
          <div className="relative">
            <select 
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              disabled={isDetailLoading}
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <Warehouse className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
          </div>
          {warehouseDetail?.location && (
            <p className="text-xs text-slate-500 mt-3 line-clamp-1 truncate" title={warehouseDetail.location}>
              {warehouseDetail.location}
            </p>
          )}
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-medium text-slate-500">Total Items in Stock</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <Warehouse className="size-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-4 relative z-10">
            {isDetailLoading ? '-' : totalItems}
          </h3>
          <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2 relative z-10 font-medium">
            <TrendingUp className="size-4" /> Available for sale
          </p>
          <div className="absolute -right-6 -bottom-6 size-24 bg-blue-50 rounded-full opacity-50 z-0 pointer-events-none"></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-medium text-slate-500">Low Stock Items</span>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-4 relative z-10">
            {isDetailLoading ? '-' : lowStockCount}
          </h3>
          <p className="text-sm text-slate-500 mt-2 relative z-10">&le; 5 units remaining</p>
          <div className="absolute -right-6 -bottom-6 size-24 bg-orange-50 rounded-full opacity-50 z-0 pointer-events-none"></div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-medium text-slate-500">Out of Stock</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600 border border-red-100">
              <TrendingDown className="size-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-4 relative z-10">
            {isDetailLoading ? '-' : outOfStockCount}
          </h3>
          <p className="text-sm text-slate-500 mt-2 relative z-10">0 units remaining</p>
          <div className="absolute -right-6 -bottom-6 size-24 bg-red-50 rounded-full opacity-50 z-0 pointer-events-none"></div>
        </div>
      </div>

      {/* Custom Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'inventory' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Package className="size-4" /> Inventory Stock
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'orders' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ListOrdered className="size-4" /> Order History
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-1">{orders.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'transactions' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ArrowRightLeft className="size-4" /> Import / Export Logs
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-1">{transactions.length}</span>
        </button>
      </div>

      {/* Tabs Content */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[500px]">
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 gap-4 bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search SKU or product name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm whitespace-nowrap">
                <Filter className="size-4" />
                Filter Status
              </button>
            </div>
            <div className="flex-1 overflow-x-auto">
              {isDetailLoading ? (
                 <div className="flex items-center justify-center h-64 text-slate-500">
                   <Loader2 className="animate-spin size-6 mr-2" /> Loading branch inventory...
                 </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6 font-medium">SKU</th>
                      <th className="py-4 px-6 font-medium">Product Name</th>
                      <th className="py-4 px-6 font-medium text-right">Stock Level</th>
                      <th className="py-4 px-6 font-medium text-center">Status</th>
                      <th className="py-4 px-6 font-medium text-right">Reserved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventories.length > 0 ? filteredInventories.map((item: any) => {
                      const status = getStockStatus(item.quantity)
                      return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-700 bg-slate-50/50 m-2 rounded">{item.ProductVariant?.sku}</td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-900 line-clamp-1">{item.ProductVariant?.Product?.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.ProductVariant?.Product?.description_short}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-bold text-slate-800 text-base">{item.quantity}</span> <span className="text-slate-500 text-xs">units</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-right font-medium">
                          {item.reserved_quantity} <span className="text-xs font-normal">units</span>
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-500">
                            <Warehouse className="size-10 mb-3 text-slate-300" />
                            <p className="font-medium text-slate-600">No inventory data found</p>
                            <p className="text-sm mt-1">Try adjusting your search or select a different branch.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-x-auto">
            {isDetailLoading ? (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <Loader2 className="animate-spin size-6 mr-2" /> Loading orders...
              </div>
            ) : orders.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 font-medium">Order Code</th>
                    <th className="py-4 px-6 font-medium">Date</th>
                    <th className="py-4 px-6 font-medium text-right">Total Amount</th>
                    <th className="py-4 px-6 font-medium text-center">Payment Status</th>
                    <th className="py-4 px-6 font-medium text-center">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-blue-600">
                        <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                          {order.order_code}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{formatDate(order.created_at)}</td>
                      <td className="py-4 px-6 text-right font-medium text-slate-900">{formatPrice(order.final_amount)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getOrderStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <ListOrdered className="size-12 mb-3 text-slate-300" />
                <p>No orders fulfilled by this warehouse yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="flex-1 overflow-x-auto">
            {isDetailLoading ? (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <Loader2 className="animate-spin size-6 mr-2" /> Loading transactions...
              </div>
            ) : transactions.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 font-medium">Date</th>
                    <th className="py-4 px-6 font-medium">Type</th>
                    <th className="py-4 px-6 font-medium">Reference</th>
                    <th className="py-4 px-6 font-medium">Note</th>
                    <th className="py-4 px-6 font-medium">Handled By</th>
                    <th className="py-4 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider ${
                          tx.transaction_type === 'import' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900 capitalize font-medium">{tx.reference_type}</p>
                        <p className="text-xs text-slate-500">ID: {tx.reference_id}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-700 italic text-sm">{tx.note || 'No notes provided'}</td>
                      <td className="py-4 px-6 text-slate-500">User ID: {tx.created_by}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => {
                            setSelectedTxId(tx.id)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <ArrowRightLeft className="size-12 mb-3 text-slate-300" />
                <p>No inventory transactions recorded yet.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {selectedWarehouseId && (
        <TransactionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleTransactionSuccess}
          warehouseId={selectedWarehouseId}
        />
      )}

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transactionId={selectedTxId}
      />
    </div>
  )
}
