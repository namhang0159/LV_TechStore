"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Sản phẩm của RIU Tech Store có phải hàng chính hãng không?",
      answer: "Có, 100% sản phẩm tại RIU Tech Store đều là hàng chính hãng, được phân phối trực tiếp từ các thương hiệu lớn như Apple, Samsung, ASUS, DELL, Logitech,... và đi kèm đầy đủ giấy tờ, hóa đơn VAT."
    },
    {
      question: "Chính sách bảo hành như thế nào?",
      answer: "Tất cả sản phẩm đều được bảo hành theo đúng tiêu chuẩn của nhà sản xuất (thường từ 12 - 36 tháng tùy linh kiện/sản phẩm). Đặc biệt, RIU hỗ trợ 1 đổi 1 trong vòng 30 ngày đầu tiên nếu có lỗi từ nhà sản xuất."
    },
    {
      question: "Cửa hàng có hỗ trợ trả góp không?",
      answer: "Chúng tôi hỗ trợ trả góp 0% qua thẻ tín dụng của hơn 25 ngân hàng, hoặc trả góp qua các công ty tài chính (Home Credit, HD Saison) với thủ tục đơn giản chỉ cần CCCD."
    },
    {
      question: "Thời gian giao hàng mất bao lâu?",
      answer: "Nội thành TP.HCM và Hà Nội: Giao hàng hỏa tốc trong 2 giờ. Các tỉnh thành khác: Giao hàng tiêu chuẩn từ 2-4 ngày làm việc. Quý khách có thể theo dõi mã vận đơn trong mục Lịch sử đơn hàng."
    },
    {
      question: "Tôi có thể đổi trả sản phẩm nếu không ưng ý không?",
      answer: "Đối với sản phẩm chưa qua sử dụng, nguyên seal, bạn có thể trả hàng trong 7 ngày. Phí nhập lại tùy thuộc vào tình trạng sản phẩm (chi tiết vui lòng xem tại Chính sách đổi trả)."
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-20 text-gray-900">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Trung tâm hỗ trợ (Help Center)</h1>
          <p className="text-blue-100 text-lg">
            Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn. Hãy xem các câu hỏi thường gặp bên dưới hoặc liên hệ trực tiếp với đội ngũ hỗ trợ.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          
          {/* FAQ Section */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-8">Câu hỏi thường gặp (FAQ)</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-lg overflow-hidden transition-colors ${openIndex === idx ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'}`}
                >
                  <button 
                    className="w-full text-left px-6 py-4 font-semibold flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  >
                    <span>{faq.question}</span>
                    {openIndex === idx ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {openIndex === idx && (
                    <div className="px-6 pb-5 text-gray-600 bg-white">
                      <div className="pt-2 border-t border-gray-100">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Section */}
          <div>
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold mb-6">Bạn cần hỗ trợ thêm?</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 text-blue-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Gọi Hotline</h4>
                    <p className="text-gray-600 text-sm mb-1">Miễn phí, 24/7</p>
                    <a href="tel:18001234" className="text-blue-600 font-bold hover:underline">1800 1234</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 text-blue-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Chat trực tuyến</h4>
                    <p className="text-gray-600 text-sm mb-2">Phản hồi trong 5 phút</p>
                    <Button variant="outline" className="text-sm">Bắt đầu chat</Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Gửi Email</h4>
                    <p className="text-gray-600 text-sm mb-1">Phản hồi trong 24h</p>
                    <a href="mailto:support@riutech.com" className="text-blue-600 font-bold hover:underline text-sm">support@riutech.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
