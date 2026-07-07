"use client";

import React, { Suspense, useState, useEffect } from "react";
import { FileText, Shield, Cookie, RefreshCw, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PoliciesContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "terms";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") as string);
    }
  }, [searchParams]);

  const tabs = [
    { id: "terms", name: "Điều khoản sử dụng", icon: <FileText className="w-5 h-5" /> },
    { id: "privacy", name: "Chính sách bảo mật", icon: <Shield className="w-5 h-5" /> },
    { id: "cookies", name: "Chính sách Cookies", icon: <Cookie className="w-5 h-5" /> },
    { id: "warranty", name: "Chính sách bảo hành", icon: <AlertCircle className="w-5 h-5" /> },
    { id: "returns", name: "Chính sách đổi trả", icon: <RefreshCw className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 text-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Chính sách & Quy định</h1>
          <p className="text-gray-500">Cập nhật lần cuối: 25/05/2026</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar Menu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-blue-600" : "text-gray-400"}>
                    {tab.icon}
                  </span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            
            {activeTab === "terms" && (
              <div className="prose max-w-none text-gray-600 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Điều khoản sử dụng</h2>
                <p>
                  Chào mừng bạn đến với RIU Tech Store. Khi sử dụng trang web của chúng tôi, 
                  bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Tài khoản của bạn</h3>
                <p>
                  Nếu bạn sử dụng trang web này, bạn có trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình, 
                  đồng thời hạn chế quyền truy cập vào máy tính của bạn. Bạn đồng ý chịu trách nhiệm cho mọi hoạt động diễn ra 
                  dưới tài khoản hoặc mật khẩu của bạn.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Quyền riêng tư</h3>
                <p>
                  Vui lòng xem lại Chính sách Bảo mật của chúng tôi, chính sách này cũng quản lý việc bạn truy cập trang web của chúng tôi, 
                  để hiểu thực tiễn của chúng tôi.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Bản quyền</h3>
                <p>
                  Tất cả nội dung bao gồm trên trang web này, chẳng hạn như văn bản, đồ họa, logo, biểu tượng nút, hình ảnh, 
                  kẹp âm thanh, tải xuống kỹ thuật số và phần mềm, là tài sản của RIU Tech Store hoặc các nhà cung cấp nội dung 
                  của RIU Tech Store và được bảo vệ bởi luật bản quyền quốc tế.
                </p>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="prose max-w-none text-gray-600 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chính sách bảo mật (Privacy Policy)</h2>
                <p>
                  RIU Tech Store cam kết bảo vệ thông tin cá nhân của bạn. Chính sách này mô tả cách chúng tôi thu thập, 
                  sử dụng và bảo vệ thông tin cá nhân của bạn.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Thu thập thông tin</h3>
                <p>
                  Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi khi tạo tài khoản, mua hàng, 
                  hoặc liên hệ với bộ phận hỗ trợ khách hàng. Thông tin này có thể bao gồm tên, địa chỉ email, 
                  số điện thoại, địa chỉ giao hàng và thông tin thanh toán.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Sử dụng thông tin</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Xử lý và hoàn thành đơn hàng của bạn.</li>
                  <li>Giao tiếp với bạn về đơn hàng, sản phẩm, dịch vụ và các khuyến mãi.</li>
                  <li>Cải thiện và cá nhân hóa trải nghiệm của bạn trên trang web của chúng tôi.</li>
                  <li>Bảo vệ chống lại các giao dịch gian lận và các hoạt động bất hợp pháp khác.</li>
                </ul>
              </div>
            )}

            {activeTab === "cookies" && (
              <div className="prose max-w-none text-gray-600 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chính sách Cookies</h2>
                <p>
                  Trang web của chúng tôi sử dụng cookies để nâng cao trải nghiệm của bạn. Cookie là các tệp văn bản nhỏ 
                  được lưu trữ trên thiết bị của bạn khi bạn truy cập một trang web.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Cách chúng tôi sử dụng Cookies</h3>
                <p>
                  Chúng tôi sử dụng cookies để ghi nhớ các tùy chọn của bạn, hiểu cách bạn tương tác với trang web 
                  của chúng tôi và điều chỉnh quảng cáo theo sở thích của bạn. 
                </p>
                <p>
                  Bạn có thể quản lý tùy chọn cookie của mình thông qua cài đặt trình duyệt, nhưng lưu ý rằng việc vô hiệu hóa 
                  cookie có thể ảnh hưởng đến chức năng của trang web của chúng tôi.
                </p>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="prose max-w-none text-gray-600 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chính sách bảo hành</h2>
                <p>
                  Tất cả sản phẩm công nghệ bán tại RIU Tech Store đều là hàng chính hãng và được áp dụng chính sách 
                  bảo hành của nhà sản xuất.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Thời hạn bảo hành:</strong> Từ 12 đến 36 tháng tùy theo từng loại linh kiện/sản phẩm (sẽ được ghi rõ trên tem và phiếu bảo hành).</li>
                  <li><strong>Điều kiện bảo hành:</strong> Sản phẩm còn trong thời hạn bảo hành, tem bảo hành còn nguyên vẹn, không có dấu hiệu rơi vỡ, vào nước hay chập cháy do sử dụng sai nguồn điện.</li>
                  <li><strong>Thời gian xử lý:</strong> Thông thường từ 3 đến 15 ngày làm việc, tùy thuộc vào tình trạng linh kiện thay thế của Hãng.</li>
                </ul>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="prose max-w-none text-gray-600 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chính sách đổi trả</h2>
                <p>
                  Chúng tôi hỗ trợ đổi trả sản phẩm để đảm bảo quyền lợi tối đa cho khách hàng.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Lỗi từ nhà sản xuất:</strong> Hỗ trợ 1 đổi 1 trong vòng 30 ngày đầu tiên hoàn toàn miễn phí.</li>
                  <li><strong>Đổi trả do nhu cầu (Sản phẩm không lỗi):</strong> 
                    <br />- Trong vòng 7 ngày: Trừ phí 10% giá trị sản phẩm.
                    <br />- Từ 8 đến 30 ngày: Trừ phí 20% giá trị sản phẩm.
                    <br />- Sau 30 ngày: Thu mua theo thỏa thuận dựa trên giá thị trường.
                  </li>
                  <li><strong>Yêu cầu:</strong> Sản phẩm đổi trả phải giữ nguyên tình trạng ngoại hình, không trầy xước, đầy đủ hộp, phụ kiện và quà tặng kèm theo.</li>
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}
