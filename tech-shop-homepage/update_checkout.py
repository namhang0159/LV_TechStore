import re

filepath = r"c:\hoc\luanvan\tech-shop-homepage\app\checkout\page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace everything from `  return (\n    <ProtectedRoute>` to the end of `  );`
start_marker = "  return (\n    <ProtectedRoute>"
end_marker = "    </ProtectedRoute>\n  );\n}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

new_jsx = """  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 font-sans pb-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <a href="/cart" className="hover:text-blue-600 transition-colors">Giỏ hàng</a>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-semibold">Thanh toán</span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Thanh toán an toàn</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Shipping Address Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setExpandedAddress(!expandedAddress)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
                    <span className="font-bold text-slate-900 text-lg">Thông tin nhận hàng</span>
                    {selectedAddressId && !expandedAddress && (
                      <span className="ml-2 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã chọn
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedAddress ? 'rotate-180' : ''}`} />
                </button>

                {expandedAddress && (
                  <div className="border-t border-slate-100 px-6 py-6 bg-white">
                    {addressLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 mb-4 font-medium">Bạn chưa có địa chỉ giao hàng nào.</p>
                        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                          <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          {addresses.map(address => (
                            <label
                              key={address.id}
                              className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                selectedAddressId === address.id
                                  ? 'border-blue-600 bg-blue-50/30 shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center h-5 mt-1">
                                <input
                                  type="radio"
                                  name="shipping_address"
                                  className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-600"
                                  checked={selectedAddressId === address.id}
                                  onChange={() => setSelectedAddressId(address.id)}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                  <span className="font-bold text-slate-900 text-base">{address.name}</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-slate-700 font-semibold">{address.phone}</span>
                                  {address.is_default && (
                                    <span className="ml-auto text-[10px] uppercase tracking-wider font-extrabold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 space-y-0.5 leading-relaxed">
                                  <p>{address.address_line}</p>
                                  <p>{`${address.ward}, ${address.district}, ${address.province}`}</p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => setModalOpen(true)}
                            className="text-blue-600 text-sm hover:text-blue-700 hover:underline flex items-center gap-1.5 font-semibold transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Thêm địa chỉ mới
                          </button>

                          {selectedAddressId && (
                            <Button
                              onClick={() => setExpandedAddress(false)}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-full font-semibold shadow-md transition-all"
                            >
                              Tiếp tục
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Method Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">2</div>
                  <h2 className="font-bold text-lg text-slate-900">Phương thức giao hàng</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pl-11">
                  <label className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDelivery === "standard" ? "border-indigo-600 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-300"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="delivery" value="standard" checked={selectedDelivery === "standard"} onChange={() => setSelectedDelivery("standard")} className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">Giao hàng tiêu chuẩn</span>
                      </div>
                      <span className="font-bold text-indigo-600">21.000đ</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">Nhận hàng trong vòng 2-4 ngày làm việc.</p>
                  </label>
                  
                  <label className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDelivery === "pickup" ? "border-indigo-600 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-300"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="delivery" value="pickup" checked={selectedDelivery === "pickup"} onChange={() => setSelectedDelivery("pickup")} className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">Nhận tại cửa hàng</span>
                      </div>
                      <span className="font-bold text-green-600">Miễn phí</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">Đến cửa hàng lấy hàng ngay trong ngày.</p>
                  </label>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">3</div>
                  <h2 className="font-bold text-lg text-slate-900">Phương thức thanh toán</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pl-11">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === "zalo" ? "border-violet-600 bg-violet-50/30 shadow-sm" : "border-slate-200 hover:border-violet-300"}`}>
                    <input type="radio" name="payment" value="zalo" checked={selectedPayment === "zalo"} onChange={() => setSelectedPayment("zalo")} className="w-4 h-4 text-violet-600" />
                    <Wallet className={`w-6 h-6 ${selectedPayment === "zalo" ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="font-bold text-slate-800">Ví ZaloPay</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === "momo" ? "border-violet-600 bg-violet-50/30 shadow-sm" : "border-slate-200 hover:border-violet-300"}`}>
                    <input type="radio" name="payment" value="momo" checked={selectedPayment === "momo"} onChange={() => setSelectedPayment("momo")} className="w-4 h-4 text-violet-600" />
                    <Wallet className={`w-6 h-6 ${selectedPayment === "momo" ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="font-bold text-slate-800">Ví MoMo</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === "vnpay" ? "border-violet-600 bg-violet-50/30 shadow-sm" : "border-slate-200 hover:border-violet-300"}`}>
                    <input type="radio" name="payment" value="vnpay" checked={selectedPayment === "vnpay"} onChange={() => setSelectedPayment("vnpay")} className="w-4 h-4 text-violet-600" />
                    <CreditCard className={`w-6 h-6 ${selectedPayment === "vnpay" ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="font-bold text-slate-800">Cổng VNPay</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === "cod" ? "border-violet-600 bg-violet-50/30 shadow-sm" : "border-slate-200 hover:border-violet-300"}`}>
                    <input type="radio" name="payment" value="cod" checked={selectedPayment === "cod"} onChange={() => setSelectedPayment("cod")} className="w-4 h-4 text-violet-600" />
                    <Banknote className={`w-6 h-6 ${selectedPayment === "cod" ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="font-bold text-slate-800">Thanh toán khi nhận hàng</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-6 sticky top-6">
                <h2 className="text-xl font-extrabold mb-6 text-slate-900 border-b border-slate-100 pb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 mb-6 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center p-2 group-hover:border-blue-200 transition-colors">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-1.5 font-medium">{item.variantName}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">SL: {item.quantity}</span>
                          <span className="text-sm font-bold text-red-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-xl p-5 space-y-3.5 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Phí giao hàng</span>
                    <span className="font-bold text-slate-900">{shippingFee > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee) : <span className="text-green-600">Miễn phí</span>}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">Giảm giá voucher</span>
                      <span className="font-bold text-green-600">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-900 font-bold">Tổng thanh toán</span>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-red-600 block leading-none">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderTotal)}</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">(Đã bao gồm VAT nếu có)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white py-6 text-lg rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        XÁC NHẬN ĐẶT HÀNG
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
                
                <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-500" /> Mua sắm an toàn & bảo mật 100%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          refetchAddresses();
          setModalOpen(false);
        }}
      />
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApply={(voucher: Voucher) => {
          setAppliedVoucher(voucher);
          setIsVoucherModalOpen(false);
          localStorage.setItem("appliedVoucher", JSON.stringify(voucher));
        }}
        subtotal={subtotal}
      />
    </ProtectedRoute>
  );
}"""

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content[:start_idx] + new_jsx)
print("Updated successfully!")
