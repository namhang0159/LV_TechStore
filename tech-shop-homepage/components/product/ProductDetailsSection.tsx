"use client";

import { ChevronRight, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { addCart } from "@/util/api";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductDetailsSectionProps {
  product: any;
  currentImageIndex: number;
  onImageSelect: (index: number) => void;
}

export default function ProductDetailsSection({
  product,
  currentImageIndex,
  onImageSelect,
}: ProductDetailsSectionProps) {
  const router = useRouter();
  const variants = product?.ProductVariants || [];
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Extract and group attributes from variants
  const attributeMap: Record<number, { name: string; values: any[] }> = {};
  variants.forEach((variant: any) => {
    variant.AttributeValues?.forEach((attrVal: any) => {
      const attrId = attrVal.Attribute.id;
      if (!attributeMap[attrId]) {
        attributeMap[attrId] = {
          name: attrVal.Attribute.name,
          values: []
        };
      }
      if (!attributeMap[attrId].values.find((v: any) => v.id === attrVal.id)) {
        attributeMap[attrId].values.push({
          id: attrVal.id,
          value: attrVal.value
        });
      }
    });
  });

  const attributes = Object.keys(attributeMap).map(key => ({
    id: parseInt(key),
    name: attributeMap[parseInt(key)].name,
    values: attributeMap[parseInt(key)].values
  }));

  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  // Initialize selected options to match the first available variant
  useEffect(() => {
    if (variants.length > 0 && Object.keys(selectedOptions).length === 0) {
      const initialSelection: Record<number, number> = {};
      variants[0].AttributeValues?.forEach((attrVal: any) => {
        initialSelection[attrVal.Attribute.id] = attrVal.id;
      });
      setSelectedOptions(initialSelection);
    }
  }, [variants]);

  const handleOptionSelect = (attributeId: number, valueId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attributeId]: valueId
    }));
  };

  const selectedVariant = useMemo(() => {
    if (Object.keys(selectedOptions).length === 0) return null;
    
    return variants.find((variant: any) => {
      const variantAttrIds = variant.AttributeValues?.map((av: any) => av.id) || [];
      return Object.values(selectedOptions).every((valId) => 
        variantAttrIds.includes(valId)
      );
    });
  }, [selectedOptions, variants]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    try {
      setIsAddingToCart(true);
      await addCart(selectedVariant.id, 1);
      alert("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error?.response?.status === 401) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        router.push("/login");
      } else {
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    
    try {
      setIsAddingToCart(true);
      await addCart(selectedVariant.id, 1);
      router.push("/cart");
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error?.response?.status === 401) {
        alert("Vui lòng đăng nhập để mua hàng.");
        router.push("/login");
      } else {
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.");
      }
      setIsAddingToCart(false);
    }
  };

  // Extract images from variants
  let productImages: { image_url: string; label?: string }[] = [];
  if (variants.length > 0) {
    variants.forEach((variant: any) => {
      if (variant.ProductVariantImages) {
        variant.ProductVariantImages.forEach((img: any) => {
          productImages.push({
            image_url: img.image_url,
            label: variant.sku,
          });
        });
      }
    });
  }

  // Fallback if no images
  if (productImages.length === 0) {
    productImages = [{ image_url: "https://via.placeholder.com/400?text=No+Image" }];
  }

  const displayImage = productImages[currentImageIndex]?.image_url || productImages[0].image_url;
  
  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.ProductVariantImages?.length > 0) {
      const variantImgUrl = selectedVariant.ProductVariantImages[0].image_url;
      const idx = productImages.findIndex(img => img.image_url === variantImgUrl);
      if (idx !== -1 && idx !== currentImageIndex) {
        onImageSelect(idx);
      }
    }
  }, [selectedVariant]);

  const displayPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice);

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* Images Gallery */}
          <div className="order-1 lg:order-2">
            <div className="bg-white border border-gray-100 aspect-square rounded flex items-center justify-center mb-6 relative overflow-hidden">
              <img src={displayImage} alt={product.name} className="max-w-full max-h-full object-contain p-4" />

              {productImages.length > 1 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onImageSelect(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        idx === currentImageIndex
                          ? "bg-blue-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="flex justify-center gap-3 overflow-x-auto p-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onImageSelect(idx)}
                    className={`w-16 h-16 border-2 transition-colors rounded overflow-hidden flex-shrink-0 ${
                      idx === currentImageIndex
                        ? "border-blue-600"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img.image_url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Variants */}
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl text-red-600 font-bold mb-6">{price}</p>
            
            {/* Variant Selectors */}
            {attributes.length > 0 && (
              <div className="mb-8 space-y-5">
                {attributes.map(attr => (
                  <div key={attr.id}>
                    <p className="font-semibold text-gray-800 mb-2">{attr.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map(val => (
                        <button
                          key={val.id}
                          onClick={() => handleOptionSelect(attr.id, val.id)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            selectedOptions[attr.id] === val.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                          }`}
                        >
                          {val.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {attributes.length > 0 && !selectedVariant && (
               <p className="text-red-500 text-sm mb-4 font-medium">Phiên bản bạn chọn hiện không có sẵn, vui lòng chọn cấu hình khác.</p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
               <button 
                 disabled={(attributes.length > 0 && !selectedVariant) || isAddingToCart}
                 onClick={handleAddToCart}
                 className="w-full sm:flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                 <ShoppingCart className="w-5 h-5" />
                 {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
               </button>
               <button 
                 disabled={(attributes.length > 0 && !selectedVariant) || isAddingToCart}
                 onClick={handleBuyNow}
                 className="w-full sm:flex-[2] bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
               >
                 Mua ngay
               </button>
               <button 
                 onClick={() => toggleWishlist(product.id)}
                 className={`w-full sm:flex-1 border-2 py-3 px-0 rounded-lg transition-colors flex items-center justify-center ${isInWishlist(product.id) ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-400"}`}
                 aria-label="Thêm vào yêu thích"
               >
                 <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
               </button>
            </div>

            {product.description_short && (
              <p className="text-gray-700 mb-6 bg-gray-50 p-4 rounded-lg">{product.description_short}</p>
            )}

            {product.ProductSpecs && product.ProductSpecs.length > 0 && (
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                {product.ProductSpecs.slice(0, 5).map((spec: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                     <span className="text-blue-600 mt-1">•</span>
                     <span><strong>{spec.label}:</strong> {spec.value}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-gray-200 pt-6 text-sm">
               <p className="mb-2"><span className="font-semibold text-gray-600 w-24 inline-block">Danh mục:</span> {product.Category?.name}</p>
               <p className="mb-2"><span className="font-semibold text-gray-600 w-24 inline-block">Thương hiệu:</span> {product.Brand?.name}</p>
               <p className="mb-2"><span className="font-semibold text-gray-600 w-24 inline-block">Trạng thái:</span> {product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}</p>
               <p className="mb-2"><span className="font-semibold text-gray-600 w-24 inline-block">Bảo hành:</span> {product.warranty_months} tháng</p>
               {product.Tags && product.Tags.length > 0 && (
                 <div className="mt-4 flex flex-wrap gap-2">
                   <span className="font-semibold text-gray-600 w-24 inline-block mt-1">Tags:</span>
                   {product.Tags.map((tag: any) => (
                     <span key={tag.id} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                       {tag.name}
                     </span>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
