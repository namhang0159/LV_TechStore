import { getAllCategory, getCategoryBySlug } from "@/util/api";
import { useState, useEffect } from "react";

// Hook để lấy danh sách tất cả danh mục
export const useCategory = (page = 1, limit = 10) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategory(page, limit);
        setCategories(res.data || []);
        setPagination(res.pagination || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [page, limit]);

  return { categories, pagination, loading, error };
};

// Hook để lấy chi tiết 1 danh mục theo slug (kèm theo danh sách sản phẩm)
export const useCategoryBySlug = (slug: string) => {
  const [category, setCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await getCategoryBySlug(slug);
        setCategory(res.data || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch category details");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  return { category, loading, error };
};
