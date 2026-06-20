"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getOrders } from '@/util/api';

const getStatusText = (status: string) => {
    switch (status) {
        case 'pending': return 'Chờ xác nhận';
        case 'confirmed': return 'Đã xác nhận';
        case 'shipping': return 'Đang giao hàng';
        case 'delivered': return 'Đã giao hàng';
        case 'returned': return 'Đã trả hàng';
        case 'cancel': return 'Đã hủy';
        case 'completed': return 'Hoàn thành';
        default: return status;
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'text-yellow-600 bg-yellow-50';
        case 'confirmed': return 'text-blue-600 bg-blue-50';
        case 'shipping': return 'text-purple-600 bg-purple-50';
        case 'delivered': return 'text-green-600 bg-green-50';
        case 'returned': return 'text-red-600 bg-red-50';
        case 'cancel': return 'text-gray-600 bg-gray-50';
        case 'completed': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getOrders();
                setOrders(res.data || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="bg-white rounded-lg p-8 flex justify-center"><p>Đang tải đơn hàng...</p></div>;
    }

    return (
        <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
            {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Bạn chưa có đơn hàng nào.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Mã đơn hàng</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Ngày đặt</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Tổng tiền</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const itemCount = order.OrderItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                                const dateStr = new Date(order.created_at).toLocaleDateString('vi-VN');
                                const totalStr = parseInt(order.final_amount).toLocaleString('vi-VN') + 'đ';

                                return (
                                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4 text-sm font-medium text-blue-600">#{order.order_code}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{dateStr}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600">{itemCount} sản phẩm</td>
                                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">{totalStr}</td>
                                        <td className="py-4 px-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                                {getStatusText(order.order_status)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm">
                                            <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                                                Xem chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
