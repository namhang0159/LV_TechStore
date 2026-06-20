'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, Eye, Loader2, Ban, CheckCircle } from 'lucide-react'
import { getAllCustomers, updateCustomerStatus } from '@/util/api'
import Link from 'next/link'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const res = await getAllCustomers()
      if (res.data?.success && res.data?.data) {
        setCustomers(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active'
    try {
      await updateCustomerStatus(id, newStatus)
      // refresh customers
      fetchCustomers()
    } catch (error) {
      console.error('Failed to update status', error)
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all registered users, view their history, and update status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[calc(100vh-15rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name, email, phone..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            Total: {filteredCustomers.length} Customers
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin size-6 mr-2" /> Loading customers...
            </div>
          ) : filteredCustomers.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 font-medium">Customer</th>
                  <th className="py-4 px-6 font-medium">Contact</th>
                  <th className="py-4 px-6 font-medium">Points</th>
                  <th className="py-4 px-6 font-medium">Last Login</th>
                  <th className="py-4 px-6 font-medium text-center">Status</th>
                  <th className="py-4 px-6 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${getBgColor(customer.id)} flex items-center justify-center text-white font-bold shadow-sm`}>
                          {getInitial(customer.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 line-clamp-1">{customer.name}</span>
                          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">Joined: {formatDate(customer.created_at)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-700 font-medium">{customer.phone || 'N/A'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{customer.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs">
                        {customer.level_points} pts
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {customer.last_login_at ? formatDate(customer.last_login_at) : 'Never'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider ${
                        customer.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/dashboard/customers/${customer.id}`}
                          className="flex items-center justify-center size-8 bg-white text-slate-700 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors tooltip"
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </Link>
                        {customer.status === 'active' ? (
                          <button 
                            onClick={() => handleToggleStatus(customer.id, customer.status)}
                            className="flex items-center justify-center size-8 bg-white text-red-600 rounded-full shadow-sm border border-slate-200 hover:bg-red-50 transition-colors tooltip"
                            title="Ban Customer"
                          >
                            <Ban className="size-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleStatus(customer.id, customer.status)}
                            className="flex items-center justify-center size-8 bg-white text-emerald-600 rounded-full shadow-sm border border-slate-200 hover:bg-emerald-50 transition-colors tooltip"
                            title="Unban/Activate Customer"
                          >
                            <CheckCircle className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Search className="size-12 mb-3 text-slate-300" />
              <p>No customers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
