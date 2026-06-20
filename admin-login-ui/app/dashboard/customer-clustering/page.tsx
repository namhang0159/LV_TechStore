'use client'

import { Users, Target, Zap, Crown } from 'lucide-react'

export default function CustomerClusteringPage() {
  const clusters = [
    { name: 'VIP Customers', count: '1,245', spend: '$12,450', desc: 'High frequency, high value purchasers', icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { name: 'Loyal Shoppers', count: '8,432', spend: '$4,120', desc: 'Regular purchasers, medium value', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Impulse Buyers', count: '15,200', spend: '$840', desc: 'Low frequency, high response to sales', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100' },
    { name: 'New/At-Risk', count: '24,100', spend: '$120', desc: 'One-time buyers or inactive for 90+ days', icon: Target, color: 'text-slate-500', bg: 'bg-slate-100' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Clustering</h1>
          <p className="text-slate-500 text-sm mt-1">AI-driven segmentation based on purchasing behavior (RFM model).</p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Run Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clusters.map((cluster, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-start gap-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className={`p-4 rounded-xl flex-shrink-0 ${cluster.bg}`}>
              <cluster.icon className={`size-8 ${cluster.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">{cluster.name}</h3>
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                  {cluster.count} users
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">{cluster.desc}</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Avg. Annual Spend</span>
                  <span className="font-semibold text-slate-900">{cluster.spend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-96 flex flex-col">
        <h3 className="font-semibold text-slate-900 mb-4">Cluster Distribution (RFM Scatter Plot)</h3>
        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400">
          Scatter Plot Visualization
        </div>
      </div>
    </div>
  )
}
