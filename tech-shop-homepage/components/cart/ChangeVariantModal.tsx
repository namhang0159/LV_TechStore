import React, { useState, useEffect, useMemo } from 'react';
import { useProductBySlug } from '@/hooks/useProduct';
import { updateVariantCart } from '@/util/api';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ChangeVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  productSlug: string;
  currentVariantId: number;
  onVariantUpdated: () => void;
}

export default function ChangeVariantModal({
  isOpen,
  onClose,
  itemId,
  productSlug,
  currentVariantId,
  onVariantUpdated,
}: ChangeVariantModalProps) {
  const { product, loading, error } = useProductBySlug(productSlug);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const variants = product?.ProductVariants || [];

  // Initialize selected options based on currentVariantId
  useEffect(() => {
    if (variants.length > 0 && isOpen) {
      const currentVariant = variants.find((v: any) => v.id === currentVariantId) || variants[0];
      const initialSelection: Record<number, number> = {};
      currentVariant.AttributeValues?.forEach((attrVal: any) => {
        initialSelection[attrVal.Attribute.id] = attrVal.id;
      });
      setSelectedOptions(initialSelection);
    }
  }, [variants, currentVariantId, isOpen]);

  // Extract and group attributes from variants
  const attributes = useMemo(() => {
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

    return Object.keys(attributeMap).map(key => ({
      id: parseInt(key),
      name: attributeMap[parseInt(key)].name,
      values: attributeMap[parseInt(key)].values
    }));
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

  const handleSave = async () => {
    if (!selectedVariant) return;
    if (selectedVariant.id === currentVariantId) {
      onClose();
      return;
    }

    try {
      setIsUpdating(true);
      await updateVariantCart(itemId, selectedVariant.id);
      onVariantUpdated();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật phiên bản:", err);
      alert("Có lỗi xảy ra khi cập nhật phiên bản.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Thay đổi tùy chọn</h2>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Đang tải thông tin...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">Lỗi: Không thể tải thông tin sản phẩm</div>
        ) : (
          <div>
            <p className="font-medium text-gray-900 mb-6">{product?.name}</p>

            {attributes.length > 0 ? (
              <div className="space-y-5 mb-6">
                {attributes.map(attr => (
                  <div key={attr.id}>
                    <p className="font-semibold text-gray-800 mb-2">{attr.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map(val => (
                        <button
                          key={val.id}
                          onClick={() => handleOptionSelect(attr.id, val.id)}
                          className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${
                            selectedOptions[attr.id] === val.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
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
            ) : (
              <p className="text-gray-500 mb-6">Sản phẩm này không có tùy chọn nào khác.</p>
            )}

            {!selectedVariant && attributes.length > 0 && (
              <p className="text-red-500 text-sm mb-4">Phiên bản bạn chọn hiện không có sẵn.</p>
            )}

            {selectedVariant && (
              <p className="text-lg font-bold text-red-600 mb-6">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVariant.price)}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                Hủy
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleSave}
                disabled={isUpdating || !selectedVariant}
              >
                {isUpdating ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
