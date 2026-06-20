"use client";

import React from "react";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart }: any = useCart();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Đang tải danh sách yêu thích...</div>;
  }

  const handleAddToCart = async (product: any) => {
    if (product.ProductVariants && product.ProductVariants.length > 0) {
      await addToCart(product.ProductVariants[0].id, 1);
      alert("Đã thêm vào giỏ hàng");
    } else {
      alert("Sản phẩm chưa có biến thể");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
          </div>

          {wishlist.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-blue-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Chưa có sản phẩm nào</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy dạo quanh cửa hàng và lưu lại những món đồ bạn ưng ý nhé!
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-lg font-medium inline-flex items-center gap-2"
              >
                Tiếp tục mua sắm <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const product = item.Product;
                if (!product) return null;

                let imageUrl = "https://via.placeholder.com/200?text=No+Image";
                let inStock = product.status === "active";
                if (product.ProductVariants && product.ProductVariants.length > 0) {
                  const firstVariant = product.ProductVariants[0];
                  if (firstVariant.ProductVariantImages && firstVariant.ProductVariantImages.length > 0) {
                    imageUrl = firstVariant.ProductVariantImages[0].image_url;
                  }
                }

                const priceNum = product.base_price ? parseFloat(product.base_price) : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/product/${product.slug}`)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      {!inStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">Tạm hết hàng</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {product.Category?.name || "Sản phẩm"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-blue-600" onClick={() => router.push(`/product/${product.slug}`)}>
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum)}
                      </span>

                      <Button
                        disabled={!inStock}
                        onClick={() => handleAddToCart(product)}
                        className={`p-3 rounded-lg flex items-center gap-2 ${inStock
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
