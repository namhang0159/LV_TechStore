'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings2, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, Activity } from 'lucide-react'
import { getReport } from '@/util/api'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthorized(true)
      fetchReport()
    } else {
      router.push('/')
    }
  }, [router])

  const fetchReport = async () => {
    try {
      const res = await getReport();
      if (res.data && res.data.data) {
        setReportData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard report", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) return null

  // Process charts data
  const ordersData = reportData?.last7DaysLabels?.map((label: string, i: number) => ({
    name: label,
    orders: reportData.ordersOverTime[i]
  })).reverse() || [];

  const salesData = reportData?.last7DaysLabels?.map((label: string, i: number) => ({
    name: label,
    sales: reportData.last7DaysSales[i]
  })).reverse() || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  const kpis = reportData?.kpiCards || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <button className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100">
          <Settings2 className="size-4" />
          Manage
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-slate-900">{formatPrice(kpis.revenue?.value || 0)}</div>
              <div className="text-xs text-slate-500 mt-1">Total Revenue</div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${kpis.revenue?.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.abs(kpis.revenue?.growth || 0).toFixed(2)}% {kpis.revenue?.growth >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              </div>
            </div>
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <DollarSign className="size-4" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-slate-900">{kpis.orders?.value || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Orders</div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${kpis.orders?.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.abs(kpis.orders?.growth || 0).toFixed(2)}% {kpis.orders?.growth >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              </div>
            </div>
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <ShoppingCart className="size-4" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-bold text-slate-900">{kpis.existingUsers?.value || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Total Users</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                <Users className="size-3" />
              </div>
            </div>
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <Users className="size-4" />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-bold text-slate-900">{kpis.newUsers?.value || 0}</div>
              <div className="text-xs text-slate-500 mt-1">New Users</div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${kpis.newUsers?.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.abs(kpis.newUsers?.growth || 0).toFixed(2)}% {kpis.newUsers?.growth >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              </div>
            </div>
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <Activity className="size-4" />
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-bold text-slate-900">{reportData?.averageOrderValue?.thisMonth || '0'}</div>
              <div className="text-xs text-slate-500 mt-1">AOV</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                <Activity className="size-3" />
              </div>
            </div>
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <DollarSign className="size-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Orders Over Time (Last 7 Days)</h2>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Last 7 Days Sales</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={60} tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(val)} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium text-center">Orders</th>
                  <th className="pb-3 font-medium text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.topCustomers?.map((customer: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${customer.bg || 'bg-blue-500'}`}>
                        {customer.initial}
                      </div>
                      {customer.name}
                    </td>
                    <td className="py-4 text-slate-500 text-center">{customer.orders}</td>
                    <td className="py-4 text-emerald-600 font-medium text-right">{customer.spent}</td>
                  </tr>
                ))}
                {(!reportData?.topCustomers || reportData.topCustomers.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Products by Units Sold</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.topProducts?.map((product: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-md ${product.color}`}></div>
                        <span className="font-medium text-slate-900 line-clamp-1" title={product.name}>{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-900 font-medium text-right">{product.units}</td>
                  </tr>
                ))}
                {(!reportData?.topProducts || reportData.topProducts.length === 0) && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-500">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
