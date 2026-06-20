import React from 'react';

interface InvoiceTemplateProps {
    order: any;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order }, ref) => {
    if (!order) return null;

    const dateStr = new Date(order.created_at).toLocaleDateString('vi-VN');
    let shippingAddress = { name: '', phone: '', address: '' };
    try {
        shippingAddress = JSON.parse(order.shipping_address_json || '{}');
    } catch (e) {}

    return (
        <div ref={ref} className="bg-white p-10 text-gray-900 font-sans" style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-wider text-blue-800 uppercase">TECH SHOP</h1>
                    <p className="text-sm mt-1 text-gray-600">Điện thoại - Máy tính - Phụ kiện chính hãng</p>
                    <p className="text-sm text-gray-600">Địa chỉ: 123 Lê Lợi, Quận 1, TP.HCM</p>
                    <p className="text-sm text-gray-600">Hotline: 1900 1234 | Email: cskh@techshop.vn</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase mb-2">Hóa Đơn Bán Hàng</h2>
                    <p className="text-sm"><span className="font-semibold">Mã ĐH:</span> {order.order_code}</p>
                    <p className="text-sm"><span className="font-semibold">Ngày in:</span> {new Date().toLocaleDateString('vi-VN')}</p>
                    <p className="text-sm"><span className="font-semibold">Phương thức TT:</span> <span className="uppercase">{order.payment_method}</span></p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
                <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-3 uppercase">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm mb-1"><span className="font-semibold inline-block w-24">Tên KH:</span> {shippingAddress.name || 'Khách hàng'}</p>
                        <p className="text-sm mb-1"><span className="font-semibold inline-block w-24">Số ĐT:</span> {shippingAddress.phone}</p>
                        <p className="text-sm mb-1 flex"><span className="font-semibold w-24 flex-shrink-0">Địa chỉ:</span> <span className="flex-1">{shippingAddress.address}</span></p>
                    </div>
                    <div>
                        <p className="text-sm mb-1"><span className="font-semibold inline-block w-24">Ngày đặt:</span> {dateStr}</p>
                        <p className="text-sm mb-1"><span className="font-semibold inline-block w-24">Trạng thái TT:</span> {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                        <p className="text-sm mb-1"><span className="font-semibold inline-block w-24">Chi nhánh:</span> {order.Warehouse?.name || 'Kho tổng'}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-gray-800 border-b-2 border-gray-800">
                        <th className="py-3 px-4 text-center text-sm font-bold w-12">STT</th>
                        <th className="py-3 px-4 text-left text-sm font-bold">Sản phẩm</th>
                        <th className="py-3 px-4 text-center text-sm font-bold w-20">SL</th>
                        <th className="py-3 px-4 text-right text-sm font-bold w-32">Đơn giá</th>
                        <th className="py-3 px-4 text-right text-sm font-bold w-32">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order.OrderItems?.map((item: any, index: number) => {
                        const productName = item.ProductVariant?.Product?.name || item.product_name_snapshot;
                        const variantName = item.ProductVariant?.AttributeValues?.length > 0 
                                            ? item.ProductVariant.AttributeValues.map((attr: any) => attr.value).join(' - ')
                                            : item.variant_name_snapshot;
                        return (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-center">{index + 1}</td>
                                <td className="py-3 px-4 text-sm">
                                    <div className="font-semibold">{productName}</div>
                                    <div className="text-xs text-gray-500 mt-1">{variantName}</div>
                                </td>
                                <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                                <td className="py-3 px-4 text-sm text-right">{parseInt(item.price_at_purchase).toLocaleString('vi-VN')}đ</td>
                                <td className="py-3 px-4 text-sm text-right font-semibold">{(parseInt(item.price_at_purchase) * item.quantity).toLocaleString('vi-VN')}đ</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2">
                    <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span className="font-semibold">{parseInt(order.total_base_price).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {parseInt(order.total_discount) > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="font-semibold text-green-600">-{parseInt(order.total_discount).toLocaleString('vi-VN')}đ</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-semibold">{parseInt(order.shipping_fee).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between py-3 border-b-2 border-gray-800">
                        <span className="text-lg font-bold text-gray-800">Tổng thanh toán:</span>
                        <span className="text-lg font-bold text-blue-700">{parseInt(order.final_amount).toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-12 pt-8">
                <div className="text-sm italic text-gray-500">
                    <p>Quý khách vui lòng kiểm tra kỹ hàng hóa trước khi nhận.</p>
                    <p>Chính sách đổi trả trong vòng 7 ngày nếu có lỗi từ NSX.</p>
                </div>
                <div className="text-center w-64">
                    <p className="font-bold text-sm mb-16">Người lập phiếu</p>
                    <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                </div>
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
