"use client";

import Link from 'next/link';
import { ChevronLeft, Package, Truck, CheckCircle, CreditCard, MapPin, Download, Clock, FileText, XCircle, ArrowLeftRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getOrderById } from '@/util/api';
import { useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { InvoiceTemplate } from '@/components/orders/InvoiceTemplate';
import ReviewModal from '@/components/orders/ReviewModal';
import { Star } from 'lucide-react';

const getStatusText = (status: string) => {
    switch (status) {
        case 'pending': return 'Chờ xác nhận';
        case 'confirmed': return 'Đã xác nhận';
        case 'shipping': return 'Đang giao hàng';
        case 'completed': return 'Đã giao hàng';
        case 'completed': return 'Hoàn thành';
        case 'cancel': return 'Đã hủy';
        case 'returned': return 'Đã trả hàng';
        default: return status;
    }
}

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef<HTMLDivElement>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewProduct, setReviewProduct] = useState<{ id: number, name: string } | null>(null);

    const handleOpenReview = (productId: number, productName: string) => {
        setReviewProduct({ id: productId, name: productName });
        setIsReviewModalOpen(true);
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Hoa-Don-${order?.order_code || id}`,
    });

    const fetchOrder = async () => {
        if (!id) return;
        try {
            const res = await getOrderById(id);
            setOrder(res.data);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center"><p>Đang tải chi tiết đơn hàng...</p></div>;
    }

    if (!order) {
        return <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center"><p>Không tìm thấy đơn hàng</p></div>;
    }

    const dateStr = new Date(order.created_at).toLocaleDateString('vi-VN');
    let shippingAddress = { name: '', phone: '', address: '' };
    try {
        shippingAddress = JSON.parse(order.shipping_address_json || '{}');
    } catch (e) { }

    // Format date time helper
    const formatDateTime = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Safely get history log and sort by created_at descending
    const rawHistories = order.order_status_histories || order.OrderStatusHistories || [];
    const historyLogs = [...rawHistories].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Helper icon/color for status
    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock className="w-3.5 h-3.5 text-orange-500" />;
            case 'confirmed': return <CheckCircle className="w-3.5 h-3.5 text-blue-500" />;
            case 'shipping': return <Truck className="w-3.5 h-3.5 text-blue-600" />;
            case 'completed':
            case 'delivered': return <Package className="w-3.5 h-3.5 text-green-500" />;
            case 'cancel': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
            case 'returned': return <ArrowLeftRight className="w-3.5 h-3.5 text-yellow-600" />;
            default: return <FileText className="w-3.5 h-3.5 text-gray-500" />;
        }
    };

    const subtotalStr = parseInt(order.total_base_price).toLocaleString('vi-VN') + 'đ';
    const shippingFeeStr = parseInt(order.shipping_fee).toLocaleString('vi-VN') + 'đ';
    const discountStr = parseInt(order.total_discount).toLocaleString('vi-VN') + 'đ';
    const totalStr = parseInt(order.final_amount).toLocaleString('vi-VN') + 'đ';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-6 print:hidden">
                    <Link href="/profile/orders" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Quay lại danh sách đơn hàng
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.order_code}</h1>
                            <p className="text-sm text-gray-500 mt-1">Đặt ngày {dateStr}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePrint()}
                                className="print:hidden px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold flex items-center transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                In Hóa Đơn
                            </button>
                            <span className="px-4 py-2 rounded-full text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 inline-flex items-center">
                                <Truck className="w-4 h-4 mr-2" />
                                {getStatusText(order.order_status)}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Items */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-gray-500" />
                                    Sản phẩm đã đặt
                                </h2>
                                <div className="space-y-4">
                                    {order.OrderItems?.map((item: any) => {
                                        const imageUrl = item.ProductVariant?.ProductVariantImages?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80"; // fallback
                                        return (
                                            <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                                                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                    <img src={imageUrl} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {item.ProductVariant?.Product?.name || item.product_name_snapshot}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.ProductVariant?.AttributeValues?.length > 0
                                                            ? item.ProductVariant.AttributeValues.map((attr: any) => attr.value).join(' - ')
                                                            : item.variant_name_snapshot}
                                                    </p>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-sm text-gray-500">SL: {item.quantity}</span>
                                                        <span className="text-sm font-semibold text-gray-900">{parseInt(item.price_at_purchase).toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                    {(() => {
                                                        if (order.order_status !== 'completed' || !item.ProductVariant?.product_id) return null;

                                                        const isReviewed = order.ProductReviews?.some((r: any) => r.product_id === item.ProductVariant.product_id);

                                                        if (isReviewed) {
                                                            return (
                                                                <span className="mt-3 inline-flex items-center text-xs font-medium text-green-600">
                                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                                    Đã đánh giá
                                                                </span>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                onClick={() => handleOpenReview(item.ProductVariant.product_id, item.ProductVariant.Product?.name || item.product_name_snapshot)}
                                                                className="mt-3 px-4 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center"
                                                            >
                                                                <Star className="w-3.5 h-3.5 mr-1.5" />
                                                                Đánh giá sản phẩm
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Right Column: Order Info */}
                            <div className="space-y-8">
                                {/* Shipping Info */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                                        Thông tin giao hàng
                                    </h2>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                                        <p className="font-semibold text-gray-900">{shippingAddress.name || 'Khách hàng'}</p>
                                        <p>Số điện thoại: {shippingAddress.phone}</p>
                                        <p>{shippingAddress.address}</p>
                                        {order.note && <p className="mt-2 italic">Ghi chú: {order.note}</p>}
                                    </div>
                                </div>

                                {/* Warehouse Info */}
                                {order.Warehouse && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <Package className="w-5 h-5 mr-2 text-gray-500" />
                                            Chi nhánh xử lý
                                        </h2>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                                            <p className="font-semibold text-gray-900">{order.Warehouse.name}</p>
                                            <p>{order.Warehouse.location}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                                        Tổng cộng
                                    </h2>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tạm tính:</span>
                                            <span>{subtotalStr}</span>
                                        </div>
                                        {parseInt(order.total_discount) > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá:</span>
                                                <span>-{discountStr}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-600">
                                            <span>Phí vận chuyển:</span>
                                            <span>{shippingFeeStr}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                                            <span>Tổng tiền:</span>
                                            <span className="text-blue-600">{totalStr}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 uppercase">
                                            Thanh toán bằng {order.payment_method}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline (Optional extra feature) */}
                        <div className="mt-10 pt-8 border-t border-gray-100 print:hidden">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
                            <div className="flex items-center justify-between relative mb-12">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 ${order.order_status === 'pending' ? 'w-1/4' : order.order_status === 'confirmed' ? 'w-2/4' : order.order_status === 'shipping' ? 'w-3/4' : order.order_status === 'completed' ? 'w-full' : 'w-0'}`}></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${['pending', 'confirmed', 'shipping', 'completed'].includes(order.order_status) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-medium ${['pending', 'confirmed', 'shipping', 'completed'].includes(order.order_status) ? 'text-gray-900' : 'text-gray-500'}`}>Chờ xác nhận</span>
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${['confirmed', 'shipping', 'completed'].includes(order.order_status) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-medium ${['confirmed', 'shipping', 'completed'].includes(order.order_status) ? 'text-gray-900' : 'text-gray-500'}`}>Đang xử lý</span>
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${['shipping', 'completed'].includes(order.order_status) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-medium ${['shipping', 'completed'].includes(order.order_status) ? 'text-blue-600' : 'text-gray-500'}`}>Đang giao hàng</span>
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.order_status === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-medium ${order.order_status === 'completed' ? 'text-gray-900' : 'text-gray-500'}`}>Đã nhận hàng</span>
                                </div>
                            </div>

                            {/* Order Status History Log */}
                            {historyLogs && historyLogs.length > 0 && (
                                <div className="mt-8 border border-gray-100 rounded-xl bg-gray-50/50 p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                        Lịch sử cập nhật
                                    </h3>
                                    <div className="relative pl-5 space-y-6">
                                        {/* Vertical line */}
                                        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-200"></div>

                                        {historyLogs.map((log: any, index: number) => (
                                            <div key={log.id || index} className="relative flex items-start gap-4">
                                                {/* Bullet Point */}
                                                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center z-10 shadow-sm">
                                                    {getStatusIcon(log.status)}
                                                </div>
                                                
                                                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gray-200">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                                                        <span className="font-semibold text-sm text-gray-900">
                                                            {getStatusText(log.status)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {formatDateTime(log.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {log.note || 'Không có ghi chú'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Invoice Template for Printing */}
            <div className="hidden">
                <InvoiceTemplate ref={componentRef} order={order} />
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                productName={reviewProduct?.name || ''}
                productId={reviewProduct?.id || 0}
                orderId={order.id}
                onSuccess={() => {
                    setIsReviewModalOpen(false);
                    fetchOrder();
                }}
            />
        </div>
    );
}
