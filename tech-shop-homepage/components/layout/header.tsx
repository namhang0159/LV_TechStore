"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Heart, Search, ShoppingCart, User, ChevronDown, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/hooks/useCategory";

export const Header = () => {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { categories: category } = useCategory();
  const [userName, setUserName] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch (e) {}
    }
  }, []);

  const categoryOrder = [
    "điện thoại",
    "tablet",
    "laptop",
    "pc",
    "linh kiện pc",
    "phụ kiện",
    "hàng cũ"
  ];

  const sortedCategories = category ? [...category].sort((a: any, b: any) => {
    const aIndex = categoryOrder.findIndex(c => a.name.toLowerCase().includes(c));
    const bIndex = categoryOrder.findIndex(c => b.name.toLowerCase().includes(c));

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  }) : [];

  const visibleCategories = sortedCategories.slice(0, 6);
  const hiddenCategories = sortedCategories.slice(6);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { fetchMe } = await import('@/util/api');
        const res: any = await fetchMe();
        if (res) {
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(res));
          setUserName(res.name);
        }
      } catch (error) {
        console.error(error);
      }
    }
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData();
    }
  }, []);
  return (
    <div>
      {/* Top Announcement Bar */}
      <div className="bg-[#020202] text-white text-xs py-2 px-4 text-center">
        <p>
          Dự kiến hàng hóa - Nhanh 9:30 - 9:30PM • Mua gì cũng khuyến mãi • Hàng
          Việt Nam chất lượng cao • Bảo hành toàn quốc
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6 mb-3">
            <div className="flex items-center gap-8">
              <div
                className="text-2xl font-bold text-primary cursor-pointer"
                onClick={() => route.push("/")}
              >
                RIU
              </div>
              <nav className="flex gap-8 border-gray-200 overflow-visible relative">
                {visibleCategories.map((item: any) => (
                  <button
                    key={item.id || item._id || item.slug}
                    onClick={() => {
                      route.push(
                        `/category/${item.slug}`,
                      );
                    }}
                    className="whitespace-nowrap text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </button>
                ))}

                {hiddenCategories.length > 0 && (
                  <div className="relative group flex items-center">
                    <button className="whitespace-nowrap text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 pb-2 -mb-2">
                      Xem thêm <ChevronDown className="w-4 h-4" />
                    </button>
                    {/* Dropdown menu hiện khi hover */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {hiddenCategories.map((item: any) => (
                        <button
                          key={item.id || item._id || item.slug}
                          onClick={() => {
                            route.push(`/category/${item.slug}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>

            {showSearchInput && (
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm..."
                    className="pl-10 bg-gray-100 text-foreground border-gray-300 rounded"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        route.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      }
                    }}
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <button
                className="flex items-center gap-1 text-sm hover:text-primary"
                onClick={() => setShowSearchInput(!showSearchInput)}
              >
                <Search className="w-5 h-5" />
              </button>

              {mounted && isLoggedIn ? (
                <>
                  <button
                    className="flex items-center gap-1 text-sm hover:text-primary"
                    onClick={() => route.push("/khuyen-mai")}
                    title="Khuyến mãi"
                  >
                    <Ticket className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    className="flex items-center gap-1 text-sm hover:text-primary"
                    onClick={() => route.push("/wishlist")}
                    title="Yêu thích"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    className="flex items-center gap-1 text-sm hover:text-primary"
                    onClick={() => route.push("/cart")}
                    title="Giỏ hàng"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button
                    className="flex items-center gap-2 text-sm hover:text-primary font-medium bg-gray-100 px-3 py-1.5 rounded-full"
                    onClick={() => route.push("/profile")}
                  >
                    <User className="w-4 h-4" />
                    {userName && <span>{userName}</span>}
                  </button>
                </>
              ) : mounted ? (
                <>
                  <button
                    className="flex items-center gap-1 text-sm hover:text-primary"
                    onClick={() => route.push("/khuyen-mai")}
                    title="Khuyến mãi"
                  >
                    <Ticket className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors"
                    onClick={() => route.push("/login")}
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <div className="w-24 h-9"></div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
