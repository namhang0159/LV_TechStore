'use client'

import { useEffect, useState } from 'react'
import { Users, Target, Zap, Crown, Loader2, Sparkles, AlertCircle, ShoppingBag, Activity, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, BarChart3, Presentation, ShieldAlert } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview')

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

  const fetchAiInsights = async (generate: boolean = false) => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await getCustomerBehaviorAnalysisAI(generate)
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
    fetchAiInsights(false)
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
          {activeTab === 'ai' ? (
            <button
              onClick={() => fetchAiInsights(true)}
              disabled={aiLoading}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Tạo mới AI Insight
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Tổng quan & Phân cụm
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'ai' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Sparkles className="size-4" />
          AI Phân tích hành vi
        </button>
      </div>

      {/* AI Error */}
      {aiError && activeTab === 'ai' && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm font-medium">{aiError}</p>
        </div>
      )}

      {/* AI Insights Panel */}
      {activeTab === 'ai' && aiInsights && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 mb-10 mt-6">

          {/* Executive Summary & Business Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Presentation className="size-32" /></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                  <Sparkles className="size-6 text-amber-400" /> Executive Summary
                </h2>
                <p className="text-indigo-100 leading-relaxed text-lg">{aiInsights.executiveSummary}</p>

                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <h3 className="font-semibold text-amber-300 flex items-center gap-2 mb-2"><Lightbulb className="size-5" /> Final Recommendation</h3>
                  <p className="text-sm text-indigo-50 leading-relaxed">{aiInsights.finalRecommendation}</p>
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center relative">
              <h3 className="text-slate-500 font-medium mb-4 flex items-center gap-2"><Activity className="size-5" /> Business Health</h3>
              <div className="relative mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * (aiInsights.businessHealth?.score || 0)) / 100}
                    className={`${(aiInsights.businessHealth?.score || 0) >= 75 ? 'text-emerald-500' : (aiInsights.businessHealth?.score || 0) >= 60 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{aiInsights.businessHealth?.score}</span>
                </div>
              </div>
              <div className={`px-4 py-1 rounded-full text-sm font-bold mb-4 ${(aiInsights.businessHealth?.level || '').includes('Excellent') || (aiInsights.businessHealth?.score || 0) >= 90 ? 'bg-emerald-100 text-emerald-700' :
                  (aiInsights.businessHealth?.level || '').includes('Good') || (aiInsights.businessHealth?.score || 0) >= 75 ? 'bg-blue-100 text-blue-700' :
                    (aiInsights.businessHealth?.level || '').includes('Fair') || (aiInsights.businessHealth?.score || 0) >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                }`}>
                {aiInsights.businessHealth?.level || 'N/A'}
              </div>
              <div className="text-left w-full space-y-2 mt-2">
                {aiInsights.businessHealth?.reasons?.map((reason: string, idx: number) => (
                  <p key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">•</span> <span>{reason}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Key Findings & Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Target className="size-5 text-blue-500" /> Key Findings</h3>
              <ul className="space-y-3">
                {aiInsights.keyFindings?.map((finding: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-700 items-start">
                    <CheckCircle2 className="size-5 text-blue-500 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="size-5 text-purple-500" /> Predictions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Customer Trend</p>
                  <p className="text-sm font-medium text-slate-800">{aiInsights.predictions?.customerTrend}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Revenue Trend</p>
                  <p className="text-sm font-medium text-slate-800">{aiInsights.predictions?.revenueTrend}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Churn Risk & Notes</p>
                  <p className="text-sm font-medium text-slate-800">Risk: <span className={(aiInsights.predictions?.churnRisk || '').toLowerCase().includes('cao') || (aiInsights.predictions?.churnRisk || '').toLowerCase().includes('high') ? 'text-red-500' : 'text-emerald-500'}>{aiInsights.predictions?.churnRisk}</span></p>
                  <p className="text-xs text-slate-600 mt-1 italic">{aiInsights.predictions?.notes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risks & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2"><ShieldAlert className="size-5 text-red-500" /> Risks</h3>
              <div className="space-y-4">
                {aiInsights.risks?.map((risk: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{risk.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${(risk.severity || '').toLowerCase() === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{risk.severity}</span>
                    </div>
                    <p className="text-xs text-slate-600">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2"><Sparkles className="size-5 text-emerald-500" /> Opportunities</h3>
              <div className="space-y-4">
                {aiInsights.opportunities?.map((opp: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{opp.title}</h4>
                    <p className="text-xs text-slate-600 mb-2">{opp.description}</p>
                    <div className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-medium">Impact: {opp.expectedImpact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Segments Analysis */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="size-6 text-indigo-500" /> Customer Segment Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {aiInsights.customerSegments?.map((seg: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col h-full">
                  <h4 className="font-bold text-indigo-900 text-base mb-3 pb-2 border-b border-slate-100">{seg.clusterName}</h4>
                  <div className="space-y-3 flex-grow">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Hành vi</p>
                      <p className="text-xs text-slate-700">{seg.behavior}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Giá trị</p>
                      <p className="text-xs text-emerald-700 font-medium">{seg.businessValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Rủi ro</p>
                      <p className="text-xs text-red-600 font-medium">{seg.risk}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Cơ hội</p>
                      <p className="text-xs text-blue-600">{seg.opportunity}</p>
                    </div>
                  </div>
                  <div className="pt-2 mt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Chiến lược</p>
                    <p className="text-sm font-medium text-slate-800">{seg.strategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing & Priority Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="size-5 text-sky-500" /> Marketing Recommendations</h3>
              <div className="space-y-4">
                {aiInsights.marketingRecommendations?.map((mkt: any, idx: number) => (
                  <div key={idx} className="p-4 bg-sky-50/50 rounded-lg border border-sky-100 relative">
                    <div className="absolute top-4 right-4 bg-white px-2 py-0.5 rounded text-xs font-semibold text-sky-600 shadow-sm">{mkt.targetCustomer}</div>
                    <h4 className="font-bold text-slate-800 text-sm pr-20 mb-2">{mkt.title}</h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li><span className="font-medium text-slate-700">Mục tiêu:</span> {mkt.objective}</li>
                      <li><span className="font-medium text-slate-700">Thực thi:</span> {mkt.execution}</li>
                      <li><span className="font-medium text-emerald-600">Kỳ vọng:</span> {mkt.expectedImpact}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="size-5 text-orange-500" /> Priority Action Plan</h3>
              <div className="space-y-3">
                {aiInsights.priorityActionPlan?.sort((a: any, b: any) => a.priority - b.priority).map((action: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      {action.priority}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{action.title}</h4>
                      <div className="flex gap-3 mb-2">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Impact: {action.impact}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Diff: {action.difficulty}</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-medium">Result: {action.expectedResult}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Overview & Clustering Panel */}
      {activeTab === 'overview' && (
        <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-4">
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
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${u.riskScore === 'High' ? 'bg-red-100 text-red-600' :
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
      )}
    </div>
  )
}
