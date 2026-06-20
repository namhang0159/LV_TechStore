import React from "react";
import { Monitor, Users, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const stats = [
    { label: "Khách hàng hài lòng", value: "10K+" },
    { label: "Sản phẩm chính hãng", value: "5000+" },
    { label: "Đối tác thương hiệu", value: "50+" },
    { label: "Năm kinh nghiệm", value: "5+" },
  ];

  const features = [
    {
      icon: <Monitor className="w-6 h-6 text-blue-600" />,
      title: "Sản phẩm đa dạng",
      description: "Cung cấp đầy đủ các thiết bị công nghệ từ điện thoại, laptop đến linh kiện PC cao cấp.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: "Chất lượng đảm bảo",
      description: "100% sản phẩm chính hãng, đầy đủ giấy tờ, bảo hành theo tiêu chuẩn của nhà sản xuất.",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Hỗ trợ tận tâm",
      description: "Đội ngũ nhân viên giàu kinh nghiệm, sẵn sàng tư vấn giải pháp tối ưu nhất cho bạn.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Giao hàng siêu tốc",
      description: "Nhận hàng nhanh chóng trong vòng 2h tại nội thành và 24-48h trên toàn quốc.",
    },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 pb-16">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Về RIU Tech Store
          </h1>
          <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
            Chúng tôi khao khát mang đến những thiết bị công nghệ tiên tiến nhất, 
            giúp bạn nâng tầm trải nghiệm và tối ưu hóa hiệu suất làm việc cũng như giải trí.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-xl shadow-xl grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border border-gray-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-8 text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
              <span className="text-8xl">🚀</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Được thành lập vào năm 2021, RIU Tech Store bắt đầu từ một cửa hàng nhỏ với niềm đam mê 
                công nghệ mãnh liệt. Mục tiêu của chúng tôi không chỉ là bán sản phẩm, mà còn là chia sẻ 
                kiến thức và trải nghiệm tuyệt vời nhất đến với cộng đồng.
              </p>
              <p>
                Qua nhiều năm phát triển, RIU đã trở thành một trong những điểm đến tin cậy của giới trẻ, 
                game thủ, người làm sáng tạo và các doanh nghiệp trong việc cung cấp các thiết bị điện tử, 
                linh kiện PC, và giải pháp công nghệ toàn diện.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-50 py-20 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600">
              Tại RIU, mọi quyết định và hành động đều xoay quanh trải nghiệm của khách hàng 
              và chất lượng của sản phẩm.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
