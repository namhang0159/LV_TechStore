"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FeaturesSection } from "../common/FeaturesSection";

const features = [
  {
    icon: "🔧",
    title: "Intel Core i7 10th Generation",
    description:
      "Intel Core i7 10th một vi xử lý lý tưởng cho các game thủ chuyên nghiệp",
  },
  {
    icon: "🎮",
    title: "Dòng card đồ họa GeForce RTX Super",
    description: "Ưu tiên công nghệ high-end nâng cao hiệu suất máy tính",
  },
  {
    icon: "⚡",
    title: "Ổn định với công nghệ SSD NVMe",
    description: "Trang bị công nghệ NVMe Express, Nhanh như SSD mới nhất",
  },
  {
    icon: "💾",
    title: "Tối ưu hóa với RAM mới Core RAM",
    description: "Để cải cao hơn hiệu năng và tăng tốc độ xử lý",
  },
];

const footerSections = [
  {
    title: "Thông tin",
    links: ["About Us", "About ZP", "Careers", "Blog"],
  },
  {
    title: "Build PC",
    links: ["CPUs", "Audio Cards", "Graphic Cards", "Memory"],
  },
  {
    title: "PC",
    links: ["Custom PCs", "Ryzen PC", "Optane PC"],
  },
  {
    title: "Laptops",
    links: ["Laptops", "Tablets", "Netbooks"],
  },
  {
    title: "Address",
    links: ["1234 Street Address City, Address, 1234"],
  },
];

export default function ProductHighlights() {
  return (
    <>
      {/* Support Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between gap-8 items-center">
            <div className="space-y-6">
              <div className="border border-gray-200 rounded bg-white">
                <button className="w-full px-6 py-4 text-left font-semibold text-sm hover:bg-gray-50 flex items-center justify-between">
                  Product Support
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="border border-gray-200 rounded bg-white">
                <button className="w-full px-6 py-4 text-left font-semibold text-sm hover:bg-gray-50 flex items-center justify-between">
                  FAQ
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="border border-gray-200 rounded bg-white">
                <button className="w-full px-6 py-4 text-left font-semibold text-sm hover:bg-gray-50 flex items-center justify-between">
                  Our Buyer Guide
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Support Image */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden">
                <Image
                  height={200}
                  width={600}
                  src="https://pinetree.vn/wp-content/uploads/2020/10/1766-scaled.jpg"
                  alt="Support"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeaturesSection />

      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          type="button"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <button
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          type="button"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
