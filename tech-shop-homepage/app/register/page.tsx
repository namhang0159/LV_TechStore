"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/util/api";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await register(name, email, password, phone, birthDate);
      if (res.success || res.message === "User registered successfully") {
        alert("Đăng ký thành công, vui lòng đăng nhập");
        router.push("/login");
      } else {
        setError(res.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600" onClick={(e) => { e.preventDefault(); router.push("/"); }}>
              Home
            </a>{" "}
            {" / "}
            <span className="text-gray-900">Đăng ký</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Tạo tài khoản mới</h1>

        <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
          <p className="text-sm text-gray-600 mb-6 text-center">
            Vui lòng điền thông tin bên dưới để tạo tài khoản mới.
          </p>

          {error && <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">{error}</div>}

          <form className="space-y-6 max-w-2xl mx-auto" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Họ <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Họ của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tên của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số điện thoại <span className="text-red-600">*</span>
                </label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngày sinh <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Xác nhận mật khẩu <span className="text-red-600">*</span>
              </label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              <Button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-2 rounded-full w-full md:w-auto">
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <span
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                  onClick={() => router.push("/login")}
                >
                  Đăng nhập tại đây
                </span>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Chat Widgets */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
