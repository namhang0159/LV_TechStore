'use client'

import { useState } from 'react'
import { Search, Heart, ShoppingCart, User, Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        setFormData({ name: '', email: '', phone: '', message: '' })
    }

    return (
        <div className="min-h-screen bg-white text-foreground">


            {/* Breadcrumb */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="text-sm text-gray-600">
                        <a href="/" className="hover:text-blue-600">Home</a> {' / '}
                        <span className="text-gray-900">Contact Us</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="bg-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h1>

                    <p className="text-gray-700 mb-8 max-w-3xl">
                        Chúng tôi rất vui khi nhận được phản hồi từ quý khách hàng. Vui lòng liên hệ với chúng tôi và chúng tôi sẽ cố gắng trả lời bạn sớm nhất có thể.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Your Name <span className="text-red-600">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Tên của bạn"
                                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Your Email <span className="text-red-600">*</span>
                                        </label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email của bạn"
                                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Your Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Số của bạn"
                                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        What's on your mind? <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Hãy để lại nhân xét của chúng tôi sẽ liên lạc lại với bạn trong thời gian sớm nhất."
                                        rows={8}
                                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold"
                                >
                                    Gửi
                                </Button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-blue-50 rounded-lg p-8 h-fit">
                            <h2 className="text-xl font-bold mb-6">Contact Information</h2>

                            <div className="space-y-6">
                                {/* Address */}
                                <div className="flex gap-4">
                                    <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">Address:</h3>
                                        <p className="text-sm text-gray-700">1234 Street Address City Address, 1234</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex gap-4">
                                    <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">Phone:</h3>
                                        <p className="text-sm text-gray-700">(00)1234 5678</p>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex gap-4">
                                    <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">We are open:</h3>
                                        <p className="text-sm text-gray-700">Monday - Thursday: 8:00 AM - 5:30 PM</p>
                                        <p className="text-sm text-gray-700">Friday: 9:00 AM - 6:00 PM</p>
                                        <p className="text-sm text-gray-700">Saturday: 10:00 AM - 5:00 PM</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex gap-4">
                                    <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">E-mail:</h3>
                                        <a href="mailto:shop@email.com" className="text-sm text-blue-600 hover:underline">shop@email.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-100 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold mb-2 text-sm">Product Support</h3>
                            <p className="text-xs text-gray-700">Chúng tôi cung cấp cáp bảo hành tái chủ lên đến 3 năm để bạn yên tâm sử dụng</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold mb-2 text-sm">Tài khoản cá nhân</h3>
                            <p className="text-xs text-gray-700">Vui mực giảm giá lên, giao hàng miễn phí và chuyên viên hỗ trợ tận tâm.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold mb-2 text-sm">Tiết kiệm tuyệt vời</h3>
                            <p className="text-xs text-gray-700">Giảm giá đến 70% cho các sản phẩm môi, bạn hoàn toàn yên tâm về giá tốt nhất.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chat Widgets */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                </button>
                <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div>


        </div>
    )
}
