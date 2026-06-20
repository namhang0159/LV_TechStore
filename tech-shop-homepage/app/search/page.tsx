"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Star, Heart } from "lucide-react";
import { Suspense, useMemo } from "react";
import { useProduct } from "@/hooks/useProduct";
import { useWishlist } from "@/hooks/useWishlist";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const route = useRouter();
  const { products, loading } = useProduct();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      (p.description_short && p.description_short.toLowerCase().includes(query.toLowerCase()))
    );
  }, [products, query]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Đang tìm kiếm...</p></div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Kết quả tìm kiếm cho: &quot;{query}&quot;</h1>
      {filteredProducts.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredProducts.map((product: any) => {
            let imageUrl = "https://via.placeholder.com/200?text=No+Image";
            if (product.ProductVariants && product.ProductVariants.length > 0) {
              const firstVariant = product.ProductVariants[0];
              if (firstVariant.ProductVariantImages && firstVariant.ProductVariantImages.length > 0) {
                imageUrl = firstVariant.ProductVariantImages[0].image_url;
              }
            }

            const priceNum = product.base_price ? parseFloat(product.base_price) : 0;
            const displayPrice = priceNum > 0
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum)
              : "Liên hệ";
            const oldPrice = priceNum > 0
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum * 1.1)
              : "";

            return (
              <Card
                key={product.id}
                onClick={() => route.push(`/product/${product.slug}`)}
                className="relative bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col h-full"
              >
                <div className="absolute top-2 left-2 bg-green-100 rounded-full px-2 py-0.5 flex items-center z-10">
                  <i className="fa-solid fa-circle-check text-green-500 text-[10px]" aria-hidden="true"></i>
                  <span className="text-green-600 text-[10px] ml-1 font-medium">
                    {product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
                <div className="aspect-square bg-white border-b border-gray-100 overflow-hidden relative flex items-center justify-center p-4">
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-xs line-clamp-2 mb-2 text-gray-800 flex-1 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 fill-orange-400 text-orange-400`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">(0)</span>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      {oldPrice && (
                        <div className="text-[10px] text-gray-400 line-through">
                          {oldPrice}
                        </div>
                      )}
                      <div className="text-sm font-bold text-red-600">
                        {displayPrice}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Đang tải...</p></div>}>
      <SearchResults />
    </Suspense>
  );
}
