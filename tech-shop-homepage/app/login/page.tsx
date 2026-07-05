"use client";

import { Search, Heart, ShoppingCart, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { login } from "@/util/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);

      const token = res.token || res.data?.token;
      const refreshToken = res.refreshToken || res.data?.refreshToken;
      const user = res.user || res.data?.user || res.data;

      if (token) {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        // Redirect to home or profile
        window.location.href = "/";
      } else {
        setError(res.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập");
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>{" "}
            {" / "}
            <span className="text-gray-900">Login</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Đăng nhập khách hàng</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Login Form */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-xl font-bold mb-2">Khách hàng đã đăng ký</h2>
            <p className="text-sm text-gray-600 mb-6">
              Nếu bạn đã có tài khoản, hãy đăng nhập bằng địa chỉ email của
              mình.
            </p>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Password <span className="text-red-600">*</span>
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full">
                  Đăng nhập
                </Button>
                <a href="#" className="text-blue-600 hover:underline text-sm">
                  Quên mật khẩu?
                </a>
              </div>
            </form>
          </div>

          {/* Right Column - Signup CTA */}
          <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold mb-4">Khách hàng mới?</h2>

            <div className="text-left mb-6 space-y-2 text-sm text-gray-700 w-full">
              <p className="font-semibold">
                Việc tạo tài khoản mang lại nhiều lợi ích:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Thanh toán nhanh hơn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Lưu trữ nhiều địa chỉ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Theo dõi đơn hàng và nhiều hơn nữa</span>
                </li>
              </ul>
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full"
              onClick={() => window.location.href = '/register'}
            >
              Tạo một tài khoản
            </Button>
          </div>
        </div>
      </main>

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
  );
}
