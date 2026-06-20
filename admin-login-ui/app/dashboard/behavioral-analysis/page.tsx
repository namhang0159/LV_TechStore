'use client'

import { Activity, Clock, MousePointer2, Eye, TrendingUp } from 'lucide-react'

export default function BehavioralAnalysisPage() {
  const metrics = [
    { title: 'Avg. Session Duration', value: '04:12', trend: '+12%', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Bounce Rate', value: '42.3%', trend: '-5%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Click-Through Rate', value: '8.7%', trend: '+2.1%', icon: MousePointer2, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Page Views', value: '1.2M', trend: '+15%', icon: Eye, color: 'text-orange-500', bg: 'bg-orange-100' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Behavioral Analysis</h1>
        <select className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <metric.icon className={`size-6 ${metric.color}`} />
              </div>
              <span className={`text-sm font-medium ${metric.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'} flex items-center gap-1`}>
                <TrendingUp className="size-4" />
                {metric.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{metric.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-4">User Journey Drop-off</h3>
          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400">
            Chart Visualization
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-4">Heatmap Overview</h3>
          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400">
            Heatmap Visualization
          </div>
        </div>
      </div>
    </div>
  )
}
