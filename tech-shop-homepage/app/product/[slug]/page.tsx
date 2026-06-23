"use client";

import ProductActionBar from "@/components/product/ProductActionBar";
import ProductDetailsSection from "@/components/product/ProductDetailsSection";
import ProductHighlights from "@/components/product/ProductHighlights";
import ProductFeedbackSection from "@/components/product/ProductFeedbackSection";
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
        <ProductFeedbackSection productId={product.id} />
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
