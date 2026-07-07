'use client'

import { useEffect, useState } from 'react'
import { Activity, Clock, MousePointer2, Eye, TrendingUp, Sparkles, AlertCircle, Calendar, Users, Briefcase, Target, Box, Megaphone, Lightbulb, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { getAllBehavioralAnalysis } from '@/util/api'

export default function BehavioralAnalysisPage() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = async (generate: boolean = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getAllBehavioralAnalysis(generate);
      console.log(res);
      if (res.data.success) {
        setAnalysis(res.data.analysis)
      } else {
        setError(res.data.message || 'Lỗi khi tải dữ liệu phân tích')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis(false)
  }, [])

  const metrics = [
    { title: 'Avg. Session Duration', value: '04:12', trend: '+12%', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Bounce Rate', value: '42.3%', trend: '-5%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Click-Through Rate', value: '8.7%', trend: '+2.1%', icon: MousePointer2, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Page Views', value: '1.2M', trend: '+15%', icon: Eye, color: 'text-orange-500', bg: 'bg-orange-100' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* AI Analysis Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-6 text-indigo-500" />
            Phân Tích & Đề Xuất Từ Trí Tuệ Nhân Tạo
          </h2>
          <button
            onClick={() => fetchAnalysis(true)}
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Tạo mới phân tích
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6 animate-pulse pt-2">
            <div className="h-24 bg-slate-100 rounded-xl w-full border border-slate-200"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-slate-100 rounded-xl w-full border border-slate-200"></div>
              <div className="h-48 bg-slate-100 rounded-xl w-full border border-slate-200"></div>
            </div>
            <div className="h-64 bg-slate-100 rounded-xl w-full border border-slate-200 mt-6"></div>

            <div className="mt-8 flex items-center justify-center gap-3 py-10">
              <Sparkles className="size-6 text-indigo-400 animate-spin" />
              <p className="text-slate-500 font-medium">AI đang tổng hợp và phân tích dữ liệu mua sắm, vui lòng đợi...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
            <AlertCircle className="size-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">Đã xảy ra lỗi khi phân tích dữ liệu</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-8 animate-in fade-in duration-500">

            {/* Overview */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-xl text-indigo-950 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 mb-3 text-lg"><Lightbulb className="size-5 text-amber-500" /> Tổng quan báo cáo</h3>
              <p className="text-indigo-900/80 leading-relaxed text-[15px]">{analysis.overview}</p>
            </div>

            {/* 1. Seasonality & 2. Customer Preferences in a Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seasonality */}
              <div className="border border-slate-200 p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Calendar className="size-5 text-blue-500 group-hover:text-white" />
                  </div>
                  Hành vi mua hàng theo mùa
                </h3>
                <ul className="space-y-3 mb-6">
                  {analysis.seasonality?.insights?.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-600 text-sm items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-blue-50/50 p-4 rounded-lg text-sm text-blue-900 border border-blue-100">
                  <span className="font-semibold block mb-1">Kết luận:</span> {analysis.seasonality?.conclusion}
                </div>
              </div>

              {/* Preferences */}
              <div className="border border-slate-200 p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Users className="size-5 text-emerald-500 group-hover:text-white" />
                  </div>
                  Sở thích của khách hàng
                </h3>
                <ul className="space-y-3 mb-6">
                  {analysis.customerPreferences?.insights?.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-600 text-sm items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-emerald-50/50 p-4 rounded-lg text-sm text-emerald-900 border border-emerald-100">
                  <span className="font-semibold block mb-1">Kết luận:</span> {analysis.customerPreferences?.conclusion}
                </div>
              </div>
            </div>

            {/* 3. Market Evaluation */}
            <div className="border border-slate-200 p-6 md:p-8 rounded-xl bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Briefcase className="size-32" />
              </div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 relative z-10">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="size-6 text-purple-600" />
                </div>
                Đánh giá thị trường
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
                <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 hover:bg-emerald-50/80 transition-colors">
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-500" /> Điểm mạnh & Tiềm năng
                  </h4>
                  <ul className="space-y-3">
                    {analysis.marketEvaluation?.strengths?.map((item: string, i: number) => (
                      <li key={i} className="flex gap-2 text-slate-700 text-sm items-start">
                        <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50/30 p-5 rounded-xl border border-rose-100 hover:bg-rose-50/80 transition-colors">
                  <h4 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
                    <XCircle className="size-5 text-rose-500" /> Thách thức & Hạn chế
                  </h4>
                  <ul className="space-y-3">
                    {analysis.marketEvaluation?.weaknesses?.map((item: string, i: number) => (
                      <li key={i} className="flex gap-2 text-slate-700 text-sm items-start">
                        <span className="text-rose-500 shrink-0 mt-0.5">✕</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-purple-50/80 p-5 rounded-xl text-sm text-purple-900 border border-purple-100 relative z-10">
                <span className="font-bold block mb-1">Đánh giá chung:</span> {analysis.marketEvaluation?.conclusion}
              </div>
            </div>

            {/* 4. Actionable Suggestions */}
            <div className="pt-4">
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-8 text-slate-900">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <Target className="size-7 text-amber-600" />
                </div>
                Đề xuất hành động cụ thể
              </h3>

              <div className="space-y-10">
                {/* Promotions */}
                <section>
                  <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-l-4 border-pink-500 pl-3">
                    <Box className="size-5 text-pink-500" /> Các chương trình khuyến mãi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {analysis.actionableSuggestions?.promotions?.map((promo: any, i: number) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl hover:border-pink-300 hover:shadow-md transition-all group">
                        <h5 className="font-bold text-slate-900 mb-3 text-base group-hover:text-pink-600 transition-colors">{promo.name}</h5>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Mục tiêu:</span> {promo.objective}</p>
                          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Thực hiện:</span> {promo.execution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Inventory */}
                <section>
                  <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-l-4 border-orange-500 pl-3">
                    <Box className="size-5 text-orange-500" /> Quản lý kho hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {analysis.actionableSuggestions?.inventory?.map((inv: any, i: number) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl hover:border-orange-300 hover:shadow-md transition-all group">
                        <h5 className="font-bold text-slate-900 mb-3 text-base group-hover:text-orange-600 transition-colors">{inv.name}</h5>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Hành động:</span> {inv.action}</p>
                          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Chi tiết:</span> {inv.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Marketing */}
                <section>
                  <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-l-4 border-sky-500 pl-3">
                    <Megaphone className="size-5 text-sky-500" /> Chiến lược Marketing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {analysis.actionableSuggestions?.marketing?.map((mkt: any, i: number) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl hover:border-sky-300 hover:shadow-md transition-all group">
                        <h5 className="font-bold text-slate-900 mb-3 text-base group-hover:text-sky-600 transition-colors">{mkt.name}</h5>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Chiến lược:</span> {mkt.strategy}</p>
                          <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Chi tiết:</span> {mkt.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Advice */}
              <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 md:p-8 rounded-2xl text-amber-950 flex flex-col md:flex-row gap-5 items-start md:items-center shadow-sm">
                <div className="p-4 bg-white rounded-full shadow-sm shrink-0">
                  <Lightbulb className="size-8 text-amber-500" />
                </div>
                <div>
                  <h5 className="font-bold text-lg mb-2">Lời khuyên từ chuyên gia AI</h5>
                  <p className="text-[15px] leading-relaxed opacity-90">{analysis.actionableSuggestions?.advice}</p>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  )
}
