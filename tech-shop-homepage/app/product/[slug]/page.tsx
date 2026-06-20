"use client";

import ProductActionBar from "@/components/product/ProductActionBar";
import ProductDetailsSection from "@/components/product/ProductDetailsSection";
import ProductHighlights from "@/components/product/ProductHighlights";
import { useProductBySlug } from "@/hooks/useProduct";
import { useEffect, useState, use } from "react";

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { product, loading, error } = useProductBySlug(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500 text-lg">{error || "Không tìm thấy sản phẩm"}</p>
      </div>
    );
  }

  const descriptionHtml = product.ProductDescriptions?.find((d: any) => d.type === 'html')?.data_json?.content || "<p>Chưa có mô tả chi tiết.</p>";

  return (
    <div className="min-h-screen bg-white text-foreground">
      <ProductActionBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'about' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-6">Thông tin sản phẩm</h2>
          <div
            className="prose max-w-none text-gray-700 space-y-6"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>
      )}

      {activeTab === 'details' && (
        <>
          <ProductDetailsSection
            product={product}
            currentImageIndex={currentImageIndex}
            onImageSelect={setCurrentImageIndex}
          />
          <ProductHighlights />
        </>
      )}

      {activeTab === 'specs' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Thông số kỹ thuật</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <tbody className="divide-y divide-gray-200">
                {product.ProductSpecs && product.ProductSpecs.length > 0 ? (
                  product.ProductSpecs.sort((a: any, b: any) => a.sort_order - b.sort_order).map((spec: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-4 px-6 font-medium text-gray-900 w-1/3">
                        <span className="block text-xs text-gray-500 mb-1">{spec.group_name}</span>
                        {spec.label}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{spec.value}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-4 px-6 text-center text-gray-500">
                      Chưa có thông số kỹ thuật.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Đánh giá khách hàng</h2>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition">Viết đánh giá</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 border-b border-gray-200 pb-10">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900 mb-2">5.0</div>
              <div className="flex items-center justify-center md:justify-start text-yellow-400 mb-2">
                {'★★★★★'.split('').map((star, i) => <span key={i} className="text-xl">{star}</span>)}
              </div>
              <p className="text-sm text-gray-500">Dựa trên 0 đánh giá</p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {[
                { stars: 5, count: 0, percent: 0 },
                { stars: 4, count: 0, percent: 0 },
                { stars: 3, count: 0, percent: 0 },
                { stars: 2, count: 0, percent: 0 },
                { stars: 1, count: 0, percent: 0 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center text-sm">
                  <span className="w-12 text-gray-600">{row.stars} Sao</span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${row.percent}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-gray-500">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'more-info' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Thông tin thêm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo hành & Hỗ trợ</h3>
              <p className="text-sm text-gray-700 mb-4">
                Sản phẩm được bảo hành chính hãng {product.warranty_months} tháng.
                Hỗ trợ kỹ thuật trọn đời trong suốt quá trình sử dụng.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao hàng & Hoàn trả</h3>
              <p className="text-sm text-gray-700 mb-4">
                Giao hàng miễn phí toàn quốc.
                Đổi trả trong vòng 30 ngày nếu có lỗi từ nhà sản xuất.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
