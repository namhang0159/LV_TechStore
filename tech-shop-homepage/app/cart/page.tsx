"use client";

import { useState, useEffect } from "react";
import { Trash2, Heart, Search, User, MessageCircle, ChevronDown, X, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { updateCartItem, removeFromCart, clearCart } from "@/util/api";
import ChangeVariantModal from "@/components/cart/ChangeVariantModal";
import VoucherModal, { Voucher } from "@/components/cart/VoucherModal";
import { FeaturesSection } from "@/components/common/FeaturesSection";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  productSlug?: string;
  variantId?: number;
  attributes?: any[];
  availableStock?: number;
}

export default function ShoppingCart() {
  const route = useRouter();
  const { cart, loading, error, refetch } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    itemId: number;
    productSlug: string;
    currentVariantId: number;
  }>({
    isOpen: false,
    itemId: 0,
    productSlug: "",
    currentVariantId: 0,
  });

  useEffect(() => {
    if (cart && cart.CartItems) {
      const formattedItems = cart.CartItems.map((item: any) => {
        let availableStock = 0;
        if (item.ProductVariant?.Inventories) {
          availableStock = item.ProductVariant.Inventories.reduce((total: number, inv: any) => {
            const qty = parseInt(inv.quantity) || 0;
            const reserved = parseInt(inv.reserved_quantity) || 0;
            return total + Math.max(0, qty - reserved);
          }, 0);
        }

        return {
          id: item.id,
          name: item.ProductVariant?.Product?.name || "Unknown Product",
          price: parseFloat(item.ProductVariant?.price || "0"),
          quantity: item.quantity,
          image: item.ProductVariant?.ProductVariantImages?.[0]?.image_url || "No image",
          productSlug: item.ProductVariant?.Product?.slug,
          variantId: item.ProductVariant?.id,
          attributes: item.ProductVariant?.AttributeValues || [],
          availableStock: availableStock,
        };
      });
      setCartItems(formattedItems);
    } else {
      setCartItems([]);
    }
  }, [cart]);

  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      // Optimistic update
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item,
        ),
      );

      try {
        setIsUpdating(true);
        await updateCartItem(id, newQuantity);
        await refetch();
      } catch (error) {
        console.error("Lỗi khi cập nhật số lượng:", error);
        alert("Có lỗi xảy ra khi cập nhật số lượng.");
        await refetch(); // Revert optimistic update
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const removeItem = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      // Optimistic update
      setCartItems(cartItems.filter((item) => item.id !== id));

      try {
        setIsUpdating(true);
        await removeFromCart(id);
        await refetch();
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        alert("Có lỗi xảy ra khi xóa sản phẩm.");
        await refetch(); // Revert optimistic update
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleClearCart = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      try {
        setIsUpdating(true);
        await clearCart();
        await refetch();
      } catch (error) {
        console.error("Lỗi khi làm sạch giỏ hàng:", error);
        alert("Có lỗi xảy ra khi làm sạch giỏ hàng.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount_type === "percent") {
      discountAmount = subtotal * (Number(appliedVoucher.discount_value) / 100);
      if (appliedVoucher.max_discount) {
        discountAmount = Math.min(discountAmount, Number(appliedVoucher.max_discount));
      }
    } else {
      discountAmount = Number(appliedVoucher.discount_value);
    }
  }

  const shippingFee = subtotal > 0 ? 21000 : 0;
  const orderTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const hasInsufficientStock = cartItems.some(item => item.quantity > (item.availableStock || 0));

  if (loading && !cart) {
    return <div className="min-h-screen bg-white text-foreground flex items-center justify-center">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>{" "}
            {" / "}
            <span className="text-gray-900">Shopping Cart</span>
          </div>
        </div>
      </section>

      {/* Shopping Cart Section */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {error && <div className="mb-4 text-red-500 bg-red-50 p-3 rounded">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2">
              <div className={`border border-gray-200 rounded overflow-x-auto ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="min-w-[600px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 font-semibold text-sm text-gray-900 border-b border-gray-200">
                  <div className="col-span-2">Item</div>
                  <div className="text-right">Price</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Subtotal</div>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-200">
                  {cartItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Giỏ hàng của bạn đang trống</div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-5 gap-4 p-4 items-center"
                      >
                        {/* Product Info */}
                        <div className="col-span-2 flex gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.image.startsWith("data:image") || item.image.startsWith("http") ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {item.image}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.name}
                            </p>
                            {item.attributes && item.attributes.length > 0 && (
                              <div className="mt-1 flex items-center gap-2">
                                <p className="text-xs text-gray-500">
                                  {item.attributes.map((attr: any) => attr.value).join(', ')}
                                </p>
                                <button
                                  onClick={() => setModalState({
                                    isOpen: true,
                                    itemId: item.id,
                                    productSlug: item.productSlug || "",
                                    currentVariantId: item.variantId || 0,
                                  })}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"
                                >
                                  Thay đổi <ChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                              </div>
                            )}
                            {item.quantity > (item.availableStock || 0) && (
                              <p className="text-xs text-red-600 mt-2 font-semibold bg-red-50 p-1 rounded inline-block border border-red-200">
                                ⚠️ Vượt quá số lượng tồn kho (Còn lại: {item.availableStock || 0})
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                  onClick={() => route.push("/")}
                >
                  Continue Shopping
                </Button>
                {cartItems.length > 0 && (
                  <Button
                    className="bg-black hover:bg-gray-900 text-white"
                    onClick={handleClearCart}
                    disabled={isUpdating}
                  >
                    Clear Shopping Cart
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-6 text-gray-900">
                  Tóm tắt
                </h2>

                {/* Discount Section */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mã giảm giá
                  </label>

                  <div className="flex flex-col gap-2 mb-3">
                    {appliedVoucher ? (
                      <div className="flex items-center justify-between px-3 py-2 border border-blue-200 bg-blue-50 rounded text-sm">
                        <span className="font-semibold text-blue-700">{appliedVoucher.code}</span>
                        <button 
                          onClick={() => setAppliedVoucher(null)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="w-full justify-between text-gray-600 border-gray-300"
                      >
                        Chọn mã giảm giá <Ticket className="w-4 h-4 ml-2 opacity-50" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                    </span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">
                        -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderTotal)}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mt-6"
                    onClick={() => {
                      if (appliedVoucher) {
                        localStorage.setItem("appliedVoucher", JSON.stringify(appliedVoucher));
                      } else {
                        localStorage.removeItem("appliedVoucher");
                      }
                      route.push("/checkout");
                    }}
                    disabled={cartItems.length === 0 || hasInsufficientStock || isUpdating}
                  >
                    Tiếp tục thanh toán/tiếp tục
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-4xl font-bold">
          WPS Office
        </div>
      </div>

      <FeaturesSection />

      {/* Chat Widgets */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      <ChangeVariantModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        itemId={modalState.itemId}
        productSlug={modalState.productSlug}
        currentVariantId={modalState.currentVariantId}
        onVariantUpdated={async () => {
          await refetch();
        }}
      />
      
      <VoucherModal 
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        currentCode={appliedVoucher?.code || ""}
        subtotal={subtotal}
        onApplyVoucher={(voucher) => setAppliedVoucher(voucher)}
      />
    </div>
  );
}
