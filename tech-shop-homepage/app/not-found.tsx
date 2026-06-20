"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <h1 className="text-9xl font-black text-gray-100">404</h1>
            <div className="absolute inset-0 flex items-center justify-center text-blue-600 animate-bounce">
              <AlertCircle className="w-20 h-20" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
