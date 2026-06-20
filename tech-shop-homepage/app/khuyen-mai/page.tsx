"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getAllVouchers, saveVoucher, getMyVouchers } from "@/util/api";
import { Ticket, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { FeaturesSection } from "@/components/common/FeaturesSection";

interface Voucher {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: string;
  min_order_value: string;
  max_discount: string | null;
  start_date: string;
  end_date: string;
  usage_limit: number;
}

export default function PromotionsPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedVoucherIds, setSavedVoucherIds] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchVouchers = async () => {
      try {
        const response = await getAllVouchers();
        if (response.success && response.data) {
          setVouchers(response.data);
        }

        if (token) {
          const savedRes = await getMyVouchers();
          if (savedRes.success && savedRes.data) {
            // Assume savedRes.data is array of UserVoucher or Voucher objects
            const ids = savedRes.data.map((item: any) => item.voucher_id || item.id);
            setSavedVoucherIds(ids);
          }
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast({ title: "Lỗi", description: "Không thể tải danh sách khuyến mãi", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleSaveVoucher = async (voucherId: number) => {
    if (!isLoggedIn) {
      toast({ title: "Thông báo", description: "Vui lòng đăng nhập để lưu mã giảm giá", variant: "destructive" });
      router.push("/login");
      return;
    }

    try {
      setSavingId(voucherId);
      await saveVoucher(voucherId);
      setSavedVoucherIds((prev) => [...prev, voucherId]);
      toast({ title: "Thành công", description: "Lưu mã thành công! Bạn có thể sử dụng ở bước thanh toán." });
    } catch (error: any) {
      console.error("Error saving voucher:", error);
      const errorMsg = error.response?.data?.message || "Lưu mã thất bại";
      toast({ title: "Lỗi", description: errorMsg, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate).getTime() < new Date().getTime();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-red-500" />
            Mã Giảm Giá & Khuyến Mãi
          </h1>
          <p className="text-gray-600 mt-2">Lưu ngay các mã giảm giá hấp dẫn để mua sắm tiết kiệm hơn tại RIU STORE.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-white animate-pulse rounded-lg shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">Hiện tại chưa có khuyến mãi nào</h3>
            <p className="text-gray-500 mt-2">Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => {
              const expired = isExpired(voucher.end_date);

              return (
                <div
                  key={voucher.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border flex flex-col ${expired ? 'opacity-60 border-gray-200' : 'border-blue-100 hover:shadow-md transition-shadow'}`}
                >
                  <div className={`p-4 text-white flex justify-between items-center ${expired ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-blue-500'}`}>
                    <div>
                      <div className="text-sm font-medium opacity-90 mb-1">MÃ GIẢM GIÁ</div>
                      <div className="text-2xl font-bold tracking-wider">{voucher.code}</div>
                    </div>
                    <Ticket className="w-8 h-8 opacity-50" />
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {voucher.discount_type === "percent"
                          ? `Giảm ${Number(voucher.discount_value)}%`
                          : `Giảm ${formatCurrency(voucher.discount_value)}`
                        }
                      </h3>

                      <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                          <span>Đơn tối thiểu {formatCurrency(voucher.min_order_value)}</span>
                        </li>
                        {voucher.discount_type === "percent" && voucher.max_discount && (
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            <span>Giảm tối đa {formatCurrency(voucher.max_discount)}</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          HSD: {formatDate(voucher.end_date)}
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-dashed border-gray-200 flex justify-end">
                      {expired ? (
                        <button disabled className="px-5 py-2 bg-gray-100 text-gray-500 rounded-md font-medium text-sm cursor-not-allowed">
                          Đã hết hạn
                        </button>
                      ) : savedVoucherIds.includes(voucher.id) ? (
                        <button disabled className="px-5 py-2 bg-gray-100 text-gray-500 rounded-md font-medium text-sm cursor-not-allowed flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Đã lưu
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSaveVoucher(voucher.id)}
                          disabled={savingId === voucher.id}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {savingId === voucher.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Lưu mã"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <FeaturesSection />
    </div>
  );
}
