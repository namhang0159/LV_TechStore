'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ArrowUpRight, ArrowDownRight, Monitor, Smartphone, Tablet, MonitorIcon, Loader2 } from 'lucide-react'
import { getReport } from '@/util/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReport()
        if (res.data?.success) {
          setData(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch reports', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-20 text-slate-500">Failed to load report data.</div>
  }

  // --- Transformation for Recharts ---
  const customerGrowthData = data.customerGrowth?.labels.map((label: string, index: number) => ({
    name: label,
    Returning: data.customerGrowth.returningCustomers[index] || 0,
    New: data.customerGrowth.newCustomers[index] || 0,
  })) || []

  const renderGrowthIndicator = (growth: string | number) => {
    const val = parseFloat(String(growth))
    if (isNaN(val) || val === 0) return <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-400">0%</div>
    if (val > 0) return <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">{val}% <ArrowUpRight className="size-3" /></div>
    return <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">{Math.abs(val)}% <ArrowDownRight className="size-3" /></div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Export
        </button>
      </div>

      {/* Customer Growth Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Customer Growth</h2>
          <div className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
            Last 12 Months <ChevronDown className="size-4" />
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
              <Bar dataKey="Returning" stackId="a" fill="#e2e8f0" radius={[0, 0, 4, 4]} barSize={12} />
              <Bar dataKey="New" stackId="a" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Existing Users', key: 'existingUsers' },
          { label: 'New Users', key: 'newUsers' },
          { label: 'Total Visits', key: 'totalVisits' },
          { label: 'Unique Visits', key: 'uniqueVisits' },
        ].map((kpi) => {
          const item = data.kpiCards?.[kpi.key] || { value: 0, growth: 0 }
          return (
            <div key={kpi.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">{kpi.label}</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{item.value.toLocaleString()}</div>
              {renderGrowthIndicator(item.growth)}
            </div>
          )
        })}
      </div>

      {/* Row 3: Circular Charts and Line Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sales Goal */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Sales Goal</h2>
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#facc15" strokeWidth="12" strokeDasharray={`${(data.salesGoal?.percentage || 0) * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <span className="absolute text-2xl font-bold text-slate-900">{data.salesGoal?.percentage || 0}%</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Sold for:</span>
              <span className="font-bold text-slate-900">{data.salesGoal?.soldFor?.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly goal:</span>
              <span className="font-bold text-slate-900">{data.salesGoal?.monthlyGoal?.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Left:</span>
              <span className="font-bold text-slate-900">{data.salesGoal?.left?.toLocaleString()} ₫</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Conversion Rate</h2>
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={`${(data.conversionRate?.purchase || 0) * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <span className="absolute text-2xl font-bold text-slate-900">{data.conversionRate?.purchase || 0}%</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Cart:</span>
              <span className="font-bold text-slate-900">{data.conversionRate?.cart || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Checkout:</span>
              <span className="font-bold text-slate-900">{data.conversionRate?.checkout || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase:</span>
              <span className="font-bold text-slate-900">{data.conversionRate?.purchase || 0}%</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Average Order Value</h2>
          <div className="flex items-center gap-4 text-sm mb-8">
            <div className="text-slate-500">This Month: <span className="font-bold text-slate-900">{data.averageOrderValue?.thisMonth || '0'}</span></div>
            <div className="text-slate-500">Previous Month: <span className="font-bold text-slate-900">{data.averageOrderValue?.previousMonth || '0'}</span></div>
          </div>
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-100 text-sm">
             [Line Chart Data N/A in API payload]
          </div>
        </div>
      </div>

      {/* Row 4: Map and Devices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Demographics */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Customer Demographics</h2>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              {(data.customerDemographics || []).map((demo: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${demo.color?.split(' ')[0] || 'bg-blue-600'}`}></div>
                    <span className="text-xs text-slate-500">{demo.region}</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{demo.users.toLocaleString()}</div>
                </div>
              ))}
              {(!data.customerDemographics || data.customerDemographics.length === 0) && (
                <p className="text-sm text-slate-500 italic">No demographics data.</p>
              )}
            </div>
            <div className="w-full md:w-2/3 h-48 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 relative">
               <div className="absolute inset-0 opacity-50 flex items-center justify-center text-slate-300">
                  [World Map Visualization]
               </div>
            </div>
          </div>
        </div>

        {/* Right column small cards */}
        <div className="flex flex-col gap-6">
          {/* Visits by Device */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
            <h2 className="text-sm font-bold text-slate-900 mb-6">Visits by Device</h2>
            <div className="space-y-4 text-sm">
              {data.visitsByDevice && data.visitsByDevice.length > 0 ? (
                data.visitsByDevice.map((dev: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Monitor className="size-4" /> {dev.name}
                    </div>
                    <div className="font-bold text-slate-900">{dev.percentage}%</div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No device data available.</p>
              )}
            </div>
          </div>
          
          {/* Online Sessions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Online Sessions</h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{data.onlineSessions || 0}</span>
              <ArrowUpRight className="size-5 text-emerald-500 mb-1" />
            </div>
            <div className="text-sm text-slate-500 mt-1">Active Users</div>
          </div>
        </div>
      </div>

      {/* Row 5: Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Orders</th>
                  <th className="pb-3 font-medium">Spent</th>
                </tr>
              </thead>
              <tbody>
                {(data.topCustomers || []).map((row: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full ${row.bg?.split(' ')[0] || 'bg-blue-500'} text-white flex items-center justify-center font-medium text-xs`}>
                          {row.initial || row.name.charAt(0)}
                        </div>
                        <span className="text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{row.orders}</td>
                    <td className="py-3 text-slate-600">{row.spent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Top Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Clicks</th>
                  <th className="pb-3 font-medium">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {(data.topProducts || []).map((product: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-md ${product.color?.split(' ')[0] || 'bg-slate-200'}`}></div>
                        <span className="text-slate-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{product.clicks}</td>
                    <td className="py-3 text-slate-600">{product.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 6: Funnel and Age */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Store Funnel */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Store Funnel</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">Conversion Rate <strong>{data.storeFunnel?.conversionRate || 0}%</strong></span>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-600">{data.storeFunnel?.increase || 0}% Increase</span>
              </div>
            </div>
            <div className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
              Last 7 Days <ChevronDown className="size-4" />
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 border-l border-b border-slate-100 pl-4 pb-2 relative mt-4">
             {/* Y-axis labels */}
             <div className="absolute left-[-24px] bottom-2 flex flex-col justify-between h-full text-xs text-slate-400 py-1">
               <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
             </div>
             
             {data.storeFunnel?.steps && data.storeFunnel.steps.length > 0 ? (
               data.storeFunnel.steps.map((step: any, i: number) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full max-w-[60px] bg-blue-600 rounded-t-md relative transition-all duration-500" style={{ height: `${step.height || 0}%` }}>
                    {step.value && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded z-10 whitespace-nowrap">
                        {step.value}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 mt-2 text-center h-8 leading-tight">{step.label}</span>
                </div>
              ))
             ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 italic">No funnel data available</div>
             )}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Age Distribution</h2>
          <div className="flex justify-center h-48 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ageDistribution || []}
                  dataKey="percentage"
                  nameKey="ageGroup"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  stroke="none"
                >
                  {(data.ageDistribution || []).map((entry: any, index: number) => {
                    const colorMap: Record<string, string> = {
                      'bg-blue-500': '#3b82f6',
                      'bg-yellow-400': '#facc15',
                      'bg-slate-300': '#cbd5e1',
                      'bg-emerald-500': '#10b981',
                    }
                    const fill = entry.color?.split(' ')[0]
                    return <Cell key={`cell-${index}`} fill={colorMap[fill] || '#94a3b8'} />
                  })}
                </Pie>
                <RechartsTooltip formatter={(val: number) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3 text-sm px-2">
            {(data.ageDistribution || []).map((age: any, i: number) => {
              const bgClass = age.color?.split(' ')[0] || 'bg-slate-400'
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${bgClass}`}></div> {age.ageGroup}
                  </div>
                  <div className="font-bold text-slate-900">{age.percentage}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
