'use client'

import { useEffect, useState } from 'react'
import { Users, Target, Zap, Crown, Loader2, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react'
import { getCustomerClustering, getCustomerBehaviorAnalysisAI } from '@/util/api'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, PieChart, Pie, Legend } from 'recharts'

export default function CustomerClusteringPage() {
  const [clusters, setClusters] = useState<any[]>([])
  const [rfmData, setRfmData] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const fetchClustering = async () => {
    setLoading(true)
    try {
      const res = await getCustomerClustering()
      if (res.data.success) {
        setClusters(res.data.data.clusters)
        setRfmData(res.data.data.rfmData)
        setOverview(res.data.data.overview)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAiInsights = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await getCustomerBehaviorAnalysisAI()
      if (res.data.success) {
        setAiInsights(res.data.data)
      }
    } catch (error: any) {
      console.error(error)
      if (error.response?.status === 503 || error.status === 503 || error.response?.data?.message?.includes("503")) {
        setAiError("AI hiện đang bận (Google Server Overload), vui lòng thử lại sau.")
      } else {
        setAiError("Không thể tạo phân tích AI lúc này.")
      }
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    fetchClustering()
  }, [])

  const clusterConfig: any = {
    'VIP Customers': { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100', fill: '#eab308', desc: 'Mua thường xuyên, chi tiêu cao nhất' },
    'Loyal Shoppers': { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', fill: '#3b82f6', desc: 'Mua nhiều lần, giá trị trung bình/cao' },
    'Impulse Buyers': { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100', fill: '#f97316', desc: 'Ít mua nhưng giá trị mỗi lần mua cao' },
    'New/At-Risk': { icon: Target, color: 'text-slate-500', bg: 'bg-slate-100', fill: '#64748b', desc: 'Khách mới hoặc lâu không quay lại' },
  }

  const pieData = clusters.map(c => ({
    name: c.name,
    value: parseFloat(c.contributionPercentage || 0)
  })).filter(c => c.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Phân tích toàn diện giá trị vòng đời và hành vi khách hàng.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchAiInsights}
            disabled={aiLoading}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            AI Behavior Insight
          </button>
          <button 
            onClick={fetchClustering}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Run Analysis
          </button>
        </div>
      </div>

      {/* AI Error */}
      {aiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm font-medium">{aiError}</p>
        </div>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-purple-600" />
            <h2 className="text-lg font-bold text-purple-900">AI Behavior Insights</h2>
          </div>
          
          <div className="space-y-4">
            {aiInsights.clustersAnalysis?.map((c: any, i: number) => (
              <div key={i} className="bg-white/60 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">{c.clusterName}</h3>
                <p className="text-sm text-slate-700 mt-1"><span className="font-medium text-slate-900">Hành vi:</span> {c.behaviorInsight}</p>
                <p className="text-sm text-emerald-700 mt-1"><span className="font-medium">Đề xuất:</span> {c.recommendation}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-purple-200">
              <h3 className="font-semibold text-slate-900 text-sm">Kết luận tổng quan:</h3>
              <p className="text-sm text-slate-700 mt-1">{aiInsights.overallConclusion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">Tổng khách hàng (Total Customers)</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{overview.totalCustomers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">Tỷ lệ giữ chân (Retention Rate)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-blue-600">{overview.retentionRate}%</p>
              <p className="text-sm text-slate-500">(&gt;1 đơn hàng)</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">Giá trị trọn đời TB (Average CLV)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(overview.totalCustomers > 0 ? overview.totalRevenue / overview.totalCustomers : 0)}
            </p>
          </div>
        </div>
      )}

      {/* Cluster Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clusters.map((cluster, i) => {
          const config = clusterConfig[cluster.name] || clusterConfig['New/At-Risk']
          const Icon = config.icon
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-4 rounded-xl flex-shrink-0 ${config.bg}`}>
                  <Icon className={`size-8 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{cluster.name}</h3>
                    <span className="text-sm font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                      {cluster.count} users
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">{config.desc}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Chi tiêu trung bình / khách</p>
                  <p className="font-semibold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cluster.avgSpend || 0)}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Đóng góp doanh thu (%)</p>
                  <p className="font-semibold text-emerald-600">{cluster.contributionPercentage}%</p>
                </div>
              </div>

              {/* Favorite Products */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ShoppingBag className="size-3" /> Sản phẩm yêu thích (Top 3)
                </p>
                {cluster.topProductsArray?.length > 0 ? (
                  <ul className="space-y-2">
                    {cluster.topProductsArray.slice(0, 3).map((p: any, idx: number) => (
                      <li key={idx} className="text-sm text-slate-700 flex justify-between items-center">
                        <span className="truncate pr-4">{p.name}</span>
                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">{p.quantity} lượt</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">Chưa có dữ liệu mua hàng</p>
                )}
              </div>

              {/* Top Customers & Risk */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="size-3" /> Tiêu biểu & Dự đoán
                </p>
                {cluster.users?.length > 0 ? (
                  <div className="space-y-3">
                    {cluster.users.slice(0, 3).map((u: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 rounded p-2 text-sm border border-slate-100">
                        <div className="flex justify-between font-medium text-slate-800">
                          <span className="truncate pr-2">{u.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                            u.riskScore === 'High' ? 'bg-red-100 text-red-600' : 
                            u.riskScore === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {u.riskScore} Risk
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5 flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span>Chu kỳ mua: {u.purchaseFrequency ? `${u.purchaseFrequency} ngày` : 'Chưa rõ'}</span>
                            <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(u.clv || 0)}</span>
                          </div>
                          {u.nextPurchasePrediction && (
                            <span className={`italic ${u.nextPurchasePrediction.includes('trễ') ? 'text-red-500' : 'text-blue-500'}`}>
                              {u.nextPurchasePrediction}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Chưa có khách hàng</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contribution Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-[400px] flex flex-col lg:col-span-1">
          <h3 className="font-semibold text-slate-900 mb-4">Customer Contribution (Doanh thu %)</h3>
          <div className="flex-1 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Loader2 className="size-8 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={clusterConfig[entry.name]?.fill || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Scatter Plot */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-[400px] flex flex-col lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Customer Distribution (Recency vs Monetary)</h3>
          <div className="flex-1 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Loader2 className="size-8 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="r" name="Recency (Days)" unit="d" />
                  <YAxis type="number" dataKey="m" name="Monetary" unit="đ" />
                  <ZAxis type="number" dataKey="f" range={[50, 400]} name="Frequency" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Customers" data={rfmData.filter(d => d.f > 0)}>
                    {rfmData.filter(d => d.f > 0).map((entry, index) => {
                      const fill = clusterConfig[entry.cluster]?.fill || '#64748b'
                      return <Cell key={`cell-${index}`} fill={fill} />
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
