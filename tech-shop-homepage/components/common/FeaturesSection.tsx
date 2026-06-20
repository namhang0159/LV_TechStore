import { Headphones, User, Tag } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="bg-white py-16 px-4 border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg transform hover:-translate-y-1 transition-transform">
              <Headphones className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">Hỗ trợ sản phẩm</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">
              Chúng tôi cung cấp các sản phẩm chính hãng với đội ngũ hỗ trợ 24/7.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg transform hover:-translate-y-1 transition-transform">
              <User className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">Tài khoản cá nhân</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">
              Quản lý đơn hàng, theo dõi vận chuyển và nhận ưu đãi riêng.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg transform hover:-translate-y-1 transition-transform">
              <Tag className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">Trải nghiệm tuyệt vời</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">
              Cam kết mang đến cho bạn những trải nghiệm mua sắm tốt nhất.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
