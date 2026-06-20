import { getAllProduct, getProductBySlug } from "@/util/api";
import { useState, useEffect } from "react";


// Hook để lấy danh sách tất cả sản phẩm
export const useProduct = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getAllProduct();
        setProducts(res.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Hook để lấy chi tiết 1 sản phẩm theo slug
export const useProductBySlug = (slug: string) => {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductBySlug(slug);
        console.log(res);
        setProduct(res.data || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  return { product, loading, error };
};
