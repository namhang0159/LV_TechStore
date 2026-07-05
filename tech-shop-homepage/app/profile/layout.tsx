'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturesSection } from '@/components/common/FeaturesSection'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const menuItems = [
        { id: '/profile', label: 'Quản lý tài khoản', icon: '👤' },
        { id: '/profile/info', label: 'Quản lý thông tin', icon: '📋' },
        { id: '/profile/address', label: 'Sổ địa chỉ', icon: '📍' },
        { id: '/profile/orders', label: 'Đơn hàng của tôi', icon: '📦' },
        { id: '/profile/downloads', label: 'Sản phẩm có thể lấy xuống của tôi', icon: '⬇️' },
        { id: '/profile/payments', label: 'Phương thức thanh toán đã lưu', icon: '💳' },
        { id: '/profile/agreements', label: 'Thỏa thuận thanh toán', icon: '❤️' },
        { id: '/profile/wishlist', label: 'Danh sách mong muốn của tôi', icon: '⭐' },
        { id: '/profile/reviews', label: 'Đánh giá sản phẩm của tôi', icon: '💬' },
        { id: '/profile/newsletter', label: 'Đăng ký nhận bản tin', icon: '📧' },
        { id: '/profile/warranty-check', label: 'Kiểm tra bảo hành', icon: '🔧' },
    ]

    const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const points = user?.level_points || user?.points || 0;

    const getRank = (p: number) => {
        if (p >= 1000) return "Nguyên Anh";
        if (p >= 300) return "Kim Đan";
        if (p >= 100) return "Trúc Cơ";
        if (p >= 10) return "Luyện Khí";
        return "Phàm Nhân";
    };

    const getProgress = (p: number) => {
        if (p >= 1000) return 100;
        if (p >= 300) return ((p - 300) / 700) * 100;
        if (p >= 100) return ((p - 100) / 200) * 100;
        if (p >= 10) return ((p - 10) / 90) * 100;
        return (p / 10) * 100;
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white text-foreground">
                {/* Breadcrumb */}
                <section className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="text-sm text-gray-600">
                            <Link href="/" className="hover:text-blue-600">Home</Link> {' / '}
                            <span className="text-gray-900">My Dashboard</span>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="bg-gray-50 py-12 px-4 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">Trang cá nhân</h1>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Left Sidebar */}
                            <div className="md:col-span-1">
                                <div className="bg-white rounded-lg overflow-hidden">
                                    {/* Menu Items */}
                                    <div className="flex flex-col">
                                        {menuItems.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={item.id}
                                                className={`w-full text-left px-6 py-3 text-sm transition-colors border-l-4 ${pathname === item.id
                                                    ? 'bg-blue-50 text-blue-600 border-blue-600 font-semibold'
                                                    : 'text-gray-700 border-transparent hover:bg-gray-50'
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* User Profile Section */}
                                    <div className="border-t border-gray-200 p-6 mt-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{user?.name || "Tài khoản"}</p>
                                                <p className="text-xs text-blue-600 font-semibold mt-0.5">{getRank(points)} ({points} điểm)</p>
                                            </div>
                                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center ml-auto">
                                                <span className="text-xs">👑</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${getProgress(points)}%` }}></div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                localStorage.removeItem("token");
                                                localStorage.removeItem("user");
                                                window.location.href = "/";
                                            }}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-full font-semibold text-sm"
                                        >
                                            ĐĂNG XUẤT
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content */}
                            <div className="md:col-span-3">
                                {children}
                            </div>
                        </div>
                    </div>
                </section>

                <FeaturesSection />


            </div>
        </ProtectedRoute>
    )
}
