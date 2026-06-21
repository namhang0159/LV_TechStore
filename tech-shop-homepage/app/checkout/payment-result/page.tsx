"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setStatus(searchParams.get("status"));
    setMethod(searchParams.get("method"));
    setOrderId(searchParams.get("orderId"));
  }, [searchParams]);

  if (!status) {
    return <div className="min-h-screen flex items-center justify-center">Đang xử lý kết quả...</div>;
  }

  const isSuccess = status === "success";

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center border border-slate-100">
        <div className="mb-6 flex justify-center">
          {isSuccess ? (
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h2>

        <p className="text-slate-500 mb-8">
          {isSuccess
            ? "Cảm ơn bạn đã mua sắm tại TechStore. Đơn hàng của bạn đang được xử lý."
            : "Rất tiếc, giao dịch của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại."}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left text-sm space-y-2">
          {orderId && (
            <div className="flex justify-between">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-bold text-slate-900">{orderId}</span>
            </div>
          )}
          {method && (
            <div className="flex justify-between">
              <span className="text-slate-500">Phương thức:</span>
              <span className="font-bold uppercase text-slate-900">{method}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/orders")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold"
          >
            Xem lịch sử đơn hàng
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl py-6 font-bold"
          >
            <Home className="w-4 h-4 mr-2" /> Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
