"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center transform transition-all animate-in fade-in zoom-in duration-500">
        
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-green-100 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Đặt hàng thành công!
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
          Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100 shadow-inner">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-slate-800">Trạng thái đơn hàng:</span>
            <span className="text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full text-sm border border-indigo-100">Đang xử lý</span>
          </div>
          <p className="text-sm text-slate-500 ml-8">Bạn có thể theo dõi tiến trình đơn hàng trong phần quản lý hồ sơ.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile/orders" className="w-full sm:w-auto">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-base">
              Xem đơn hàng
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-12 px-8 rounded-xl font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 text-base">
              <Home className="w-4 h-4" />
              Trở về trang chủ
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
