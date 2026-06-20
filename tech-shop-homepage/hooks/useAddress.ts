import { useState, useEffect, useCallback } from 'react';
import { getUserAddresses } from '@/util/api';

export interface Address {
  id: number;
  user_id: number;
  receiver_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address_line: string;
  is_default: boolean;
  created_at: string;
}

export const useAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("token")) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await getUserAddresses();
      if (res.success) {
        setAddresses(res.data);
      } else {
        throw new Error(res.message || "Lỗi khi lấy danh sách địa chỉ");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi lấy danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return { addresses, loading, error, refetch: fetchAddresses };
};
