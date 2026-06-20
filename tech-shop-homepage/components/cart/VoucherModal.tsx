import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Ticket } from 'lucide-react';
import { getMyVouchers, getAllVouchers } from '@/util/api';

export interface Voucher {
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

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher: (voucher: Voucher | null) => void;
  currentCode?: string;
  subtotal: number;
}

export default function VoucherModal({
  isOpen,
  onClose,
  onApplyVoucher,
  currentCode = "",
  subtotal
}: VoucherModalProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState(currentCode);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(currentCode);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setManualCode(currentCode);
      setSelectedVoucherCode(currentCode);
      setErrorMsg("");
      const fetchData = async () => {
        try {
          setLoading(true);
          const [myRes, allRes] = await Promise.all([
            getMyVouchers().catch(() => ({ success: false, data: [] })),
            getAllVouchers().catch(() => ({ success: false, data: [] }))
          ]);
          
          if (myRes.success && myRes.data) {
            const formatted = myRes.data.map((item: any) => item.Voucher || item);
            setVouchers(formatted.filter(Boolean));
          }
          if (allRes.success && allRes.data) {
            setAllVouchers(allRes.data);
          }
        } catch (error) {
          console.error("Failed to fetch vouchers", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, currentCode]);

  const handleApply = () => {
    setErrorMsg("");
    const codeToApply = manualCode.trim() || selectedVoucherCode;
    if (!codeToApply) return;

    // Find the voucher in our lists
    let foundVoucher = vouchers.find(v => v.code === codeToApply) || allVouchers.find(v => v.code === codeToApply);
    
    if (!foundVoucher) {
      setErrorMsg("Mã giảm giá không tồn tại hoặc đã hết hạn.");
      return;
    }

    if (subtotal < Number(foundVoucher.min_order_value)) {
      setErrorMsg(`Đơn hàng cần tối thiểu ${formatCurrency(foundVoucher.min_order_value)} để sử dụng mã này.`);
      return;
    }

    onApplyVoucher(foundVoucher);
    onClose();
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative flex flex-col max-h-[80vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-600" /> Chọn mã giảm giá
        </h2>

        {/* Manual Input */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Nhập mã giảm giá..." 
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value);
                setSelectedVoucherCode(""); 
                setErrorMsg("");
              }}
              className="flex-1"
            />
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleApply}
              disabled={!manualCode.trim()}
            >
              Áp dụng
            </Button>
          </div>
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        </div>

        {/* Voucher List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải mã giảm giá của bạn...</div>
          ) : vouchers.length > 0 ? (
            [...vouchers].sort((a, b) => {
              const aEligible = subtotal >= Number(a.min_order_value);
              const bEligible = subtotal >= Number(b.min_order_value);
              if (aEligible && !bEligible) return -1;
              if (!aEligible && bEligible) return 1;
              return 0;
            }).map((v) => {
              const isSelected = selectedVoucherCode === v.code;
              const isEligible = subtotal >= Number(v.min_order_value);
              
              return (
                <div 
                  key={v.id}
                  onClick={() => {
                    if (!isEligible) return;
                    setSelectedVoucherCode(v.code);
                    setManualCode("");
                    setErrorMsg("");
                  }}
                  className={`border rounded-lg p-4 transition-colors flex items-center gap-4 
                    ${!isEligible ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'}
                    ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                  `}
                >
                  <div className={`text-white w-16 h-16 rounded flex flex-col items-center justify-center flex-shrink-0 ${isEligible ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-400'}`}>
                    <span className="text-xs opacity-90">MÃ</span>
                    <span className="font-bold text-sm truncate w-full text-center px-1">{v.code}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isEligible ? 'text-gray-900' : 'text-gray-600'}`}>
                      {v.discount_type === "percent" 
                        ? `Giảm ${Number(v.discount_value)}%` 
                        : `Giảm ${formatCurrency(v.discount_value)}`}
                    </h4>
                    <p className={`text-xs mt-1 ${isEligible ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
                      Đơn tối thiểu {formatCurrency(v.min_order_value)}
                    </p>
                    {v.end_date && (
                      <p className="text-xs text-gray-500 mt-1">HSD: {new Date(v.end_date).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-300'} ${!isEligible && 'bg-gray-100'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              Bạn chưa lưu mã giảm giá nào.
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleApply}
            disabled={!selectedVoucherCode && !manualCode.trim()}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
