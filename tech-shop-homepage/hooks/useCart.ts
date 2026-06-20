import { getCart } from "@/util/api";
import { useState, useEffect } from "react";

export const useCart = () => {
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          setLoading(false);
          return;
      }
      setLoading(true);
      const res = await getCart();
      setCart(res.data || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, loading, error, refetch: fetchCart };
};
