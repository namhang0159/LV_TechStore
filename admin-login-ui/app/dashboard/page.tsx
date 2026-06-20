'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings2, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, Activity } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthorized(true)
    } else {
      router.push('/')
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) return null

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
              <div className="text-2xl font-bold text-slate-900">$10.54</div>
              <div className="text-xs text-slate-500 mt-1">Total Revenue</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                22.45% <ArrowUpRight className="size-3" />
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
              <div className="text-2xl font-bold text-slate-900">1,056</div>
              <div className="text-xs text-slate-500 mt-1">Orders</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                15.34% <ArrowUpRight className="size-3" />
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
              <div className="text-xl font-bold text-slate-900">5,420</div>
              <div className="text-xs text-slate-500 mt-1">Unique Visits</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
                10.24% <ArrowDownRight className="size-3" />
              </div>
            </div>
            <div className="flex h-8 items-end gap-1">
              <div className="w-1.5 h-4 bg-yellow-200 rounded-t-sm"></div>
              <div className="w-1.5 h-6 bg-yellow-300 rounded-t-sm"></div>
              <div className="w-1.5 h-5 bg-yellow-200 rounded-t-sm"></div>
              <div className="w-1.5 h-8 bg-yellow-400 rounded-t-sm"></div>
              <div className="w-1.5 h-5 bg-yellow-200 rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-bold text-slate-900">1,650</div>
              <div className="text-xs text-slate-500 mt-1">New Users</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                15.34% <ArrowUpRight className="size-3" />
              </div>
            </div>
            <div className="flex h-8 items-end gap-1">
              <div className="w-1.5 h-3 bg-emerald-200 rounded-t-sm"></div>
              <div className="w-1.5 h-5 bg-emerald-300 rounded-t-sm"></div>
              <div className="w-1.5 h-4 bg-emerald-200 rounded-t-sm"></div>
              <div className="w-1.5 h-7 bg-emerald-400 rounded-t-sm"></div>
              <div className="w-1.5 h-5 bg-emerald-200 rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-bold text-slate-900">9,653</div>
              <div className="text-xs text-slate-500 mt-1">Existing User</div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                22.45% <ArrowUpRight className="size-3" />
              </div>
            </div>
            <div className="flex h-8 items-end gap-1">
              <div className="w-1.5 h-4 bg-blue-200 rounded-t-sm"></div>
              <div className="w-1.5 h-6 bg-blue-400 rounded-t-sm"></div>
              <div className="w-1.5 h-8 bg-blue-600 rounded-t-sm"></div>
              <div className="w-1.5 h-5 bg-blue-300 rounded-t-sm"></div>
              <div className="w-1.5 h-4 bg-blue-200 rounded-t-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart Placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Orders Over Time</h2>
            <select className="text-sm border-0 text-slate-500 bg-transparent focus:ring-0 cursor-pointer">
              <option>Last 12 Hours</option>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          
          <div className="flex gap-8 mb-6">
            <div>
              <div className="text-2xl font-bold text-slate-900">645</div>
              <div className="text-sm text-slate-500">Orders on May 22</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">472</div>
              <div className="text-sm text-slate-500">Orders on May 21</div>
            </div>
          </div>

          <div className="h-64 w-full relative flex items-end">
            {/* SVG Chart Placeholder to look similar to the image */}
            <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d">
              {/* Grid lines */}
              <line x1="0" y1="40" x2="800" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* May 21 Line (Light Blue) */}
              <path d="M0,80 L80,120 L160,130 L240,90 L320,60 L400,60 L480,40 L560,110 L640,60 L720,40 L800,20" 
                    fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    
              {/* May 22 Line (Blue) */}
              <path d="M0,130 L80,160 L160,130 L240,150 L320,80 L400,40 L480,60 L560,20 L640,40 L720,110 L800,110" 
                    fill="none" stroke="#2563eb" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* Bar Chart Placeholder */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Last 7 Days Sales</h2>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">1,259</div>
            <div className="text-sm text-slate-500">Items Sold</div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">$12,546</div>
            <div className="text-sm text-slate-500">Revenue</div>
          </div>

          <div className="mt-8 flex h-40 items-end justify-between gap-2">
            {[40, 60, 50, 70, 80, 100, 90].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-md ${i === 4 ? 'bg-slate-700' : 'bg-emerald-400'}`} 
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-xs text-slate-400">{12 + i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Jagarnath S.', date: '24.05.2023', amount: '$124.97', status: 'Paid', statusColor: 'bg-emerald-100 text-emerald-600' },
                  { name: 'Anand G.', date: '23.05.2023', amount: '$55.42', status: 'Pending', statusColor: 'bg-slate-100 text-slate-600' },
                  { name: 'Kartik S.', date: '23.05.2023', amount: '$89.90', status: 'Paid', statusColor: 'bg-emerald-100 text-emerald-600' },
                  { name: 'Rakesh S.', date: '22.05.2023', amount: '$144.94', status: 'Pending', statusColor: 'bg-slate-100 text-slate-600' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-4 font-medium text-slate-900">{row.name}</td>
                    <td className="py-4 text-slate-500">{row.date}</td>
                    <td className="py-4 text-slate-900">{row.amount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Men Grey Hoodie', price: '$49.90', units: '204', color: 'bg-slate-800' },
                  { name: 'Women Striped T-Shirt', price: '$34.90', units: '155', color: 'bg-slate-200' },
                  { name: 'Women White T-Shirt', price: '$40.90', units: '120', color: 'bg-white border' },
                  { name: 'Men White T-Shirt', price: '$49.90', units: '204', color: 'bg-orange-100' },
                ].map((product, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-md ${product.color}`}></div>
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500">{product.price}</td>
                    <td className="py-4 text-slate-900">{product.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
