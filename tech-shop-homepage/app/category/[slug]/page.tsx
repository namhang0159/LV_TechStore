"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  ChevronRight,
  ChevronLeft,
  Star,
  Grid3x3,
  List,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";



import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCategoryBySlug } from "@/hooks/useCategory";
import { FeaturesSection } from "@/components/common/FeaturesSection";

const categoryFilterMap: Record<string, string[]> = {
  "dien-thoai": ["Thương hiệu", "Mức giá", "Chip xử lý (CPU)", "RAM", "Tính năng đặc biệt", "Camera", "Tần số màn hình"],
  "tablet": ["Thương hiệu", "Mức giá", "Chip xử lý (CPU)", "RAM", "Tính năng đặc biệt", "Camera", "Tần số màn hình"],
  "laptop": ["Thương hiệu", "Mức giá", "Chip xử lý (CPU)", "RAM", "Card đồ họa (VGA)", "Kích thước màn hình", "Độ phân giải", "Tần số hz"],
  "pc": ["Thương hiệu", "Mức giá", "Chip xử lý (CPU)", "RAM", "Card đồ họa (VGA)", "Kích thước màn hình", "Độ phân giải", "Tần số hz", "Nhu cầu"],
  "linh-kien": ["Thương hiệu", "Mức giá", "Loại linh kiện"],
  "phu-kien": ["Thương hiệu", "Mức giá", "Loại phụ kiện"],
  "hang-cu": ["Loại hàng cũ"],
  "dong-ho": ["Thương hiệu", "Mức giá", "Chất liệu", "Cỡ mặt đồng hồ"],
};

const filterLabelMapping: Record<string, string[]> = {
  "Chip xử lý (CPU)": ["Chip xử lý", "Công nghệ CPU", "Vi xử lý", "Dòng CPU", "CPU"],
  "CPU": ["Chip xử lý", "Công nghệ CPU", "Vi xử lý", "Dòng CPU", "CPU"],
  "RAM": ["Dung lượng RAM", "Bộ nhớ RAM", "RAM"],
  "ROM": ["Bộ nhớ trong", "Dung lượng ROM", "Dung lượng lưu trữ", "Ổ cứng", "ROM"],
  "Tính năng đặc biệt": ["Tính năng đặc", "Đặc biệt", "Nổi bật"],
  "Camera": ["Camera", "Độ phân giải camera"],
  "Tần số màn hình": ["Tần số quét", "Tần số hz", "Tần số màn hình"],
  "Tần số hz": ["Tần số quét", "Tần số hz", "Tần số màn hình"],
  "Card đồ họa (VGA)": ["Card đồ họa", "Card rời", "VGA"],
  "Kích thước màn hình": ["Kích thước màn hình", "Kích thước"],
  "Độ phân giải": ["Độ phân giải"],
  "Nhu cầu": ["Nhu cầu", "Mục đích"],
  "Loại linh kiện": ["Loại linh kiện", "Loại"],
  "Loại phụ kiện": ["Loại phụ kiện", "Loại"],
  "Loại hàng cũ": ["Loại máy", "Loại"],
  "Chất liệu": ["Chất liệu"],
  "Cỡ mặt đồng hồ": ["Cỡ mặt", "Kích thước mặt", "Đường kính"],
  "Bus RAM": ["Bus", "Tốc độ RAM"],
  "DPI": ["DPI", "Độ phân giải chuột"]
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = use(params);
  const slug = decodeURIComponent(rawSlug || "");
  const route = useRouter();

  const { category, loading } = useCategoryBySlug(slug);

  // Mapping filter configs based on slug
  const filterConfigs: Record<string, { title: string; options: string[] }[]> = {
    laptop: [
      { title: "Mức giá", options: ["Dưới 10 triệu", "10 - 15 triệu", "15 - 20 triệu", "20 - 30 triệu", "Trên 30 triệu"] },
      { title: "Thương hiệu", options: ["ASUS", "MSI", "DELL", "HP", "Apple", "Lenovo", "Acer"] },
      { title: "CPU", options: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1/M2/M3"] },
      { title: "RAM", options: ["4GB", "8GB", "16GB", "32GB"] },
      { title: "Màn hình", options: ["13 inch", "14 inch", "15.6 inch", "17 inch", "Màn hình cảm ứng"] },
    ],
    "điện-thoại": [
      { title: "Thương hiệu", options: ["Apple (iPhone)", "Samsung", "Xiaomi", "Oppo", "Vivo", "Nokia"] },
      { title: "Mức giá", options: ["Dưới 2 triệu", "2 - 4 triệu", "4 - 7 triệu", "7 - 13 triệu", "Trên 13 triệu"] },
      { title: "Dung lượng", options: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
      { title: "RAM", options: ["4GB", "6GB", "8GB", "12GB", "16GB"] },
      { title: "Tính năng", options: ["Sạc nhanh", "Chống nước", "Hỗ trợ 5G", "Bảo mật khuôn mặt (FaceID)"] },
    ],
    "màn-hình": [
      { title: "Thương hiệu", options: ["LG", "Samsung", "DELL", "ASUS", "MSI", "AOC", "ViewSonic"] },
      { title: "Kích thước", options: ["Dưới 24 inch", "24 inch", "27 inch", "32 inch", "Trên 32 inch"] },
      { title: "Độ phân giải", options: ["FHD (1920x1080)", "2K (2560x1440)", "4K (3840x2160)"] },
      { title: "Tần số quét", options: ["60Hz", "75Hz", "144Hz", "165Hz", "240Hz", "Trên 240Hz"] },
      { title: "Tấm nền", options: ["IPS", "VA", "TN", "OLED"] },
    ],
    "pc-cấu-hình": [
      { title: "Nhu cầu", options: ["PC Gaming", "PC Văn phòng", "PC Thiết kế đồ họa", "PC Render Video"] },
      { title: "Mức giá", options: ["Dưới 10 triệu", "10 - 20 triệu", "20 - 50 triệu", "Trên 50 triệu"] },
      { title: "CPU", options: ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"] },
      { title: "VGA (Card đồ họa)", options: ["NVIDIA RTX 3060", "NVIDIA RTX 4060", "NVIDIA RTX 4070", "AMD Radeon RX 6600", "Không VGA rời"] },
      { title: "RAM", options: ["8GB", "16GB", "32GB", "64GB"] },
    ],
    "phụ-kiện": [
      { title: "Loại phụ kiện", options: ["Bàn phím", "Chuột", "Tai nghe", "Lót chuột", "Balo/Túi xách", "Webcam", "Cáp sạc"] },
      { title: "Thương hiệu", options: ["Logitech", "Razer", "Corsair", "Akko", "DareU", "Apple", "Samsung"] },
      { title: "Kết nối", options: ["Có dây (Wired)", "Không dây (Bluetooth/Wireless)"] },
      { title: "Mức giá", options: ["Dưới 500k", "500k - 1 triệu", "1 - 2 triệu", "Trên 2 triệu"] },
    ],
    "máy-tính": [
      { title: "Loại", options: ["Máy tính để bàn", "Máy tính All-in-One"] },
      { title: "Thương hiệu", options: ["Apple", "Dell", "HP", "Lenovo", "ASUS"] },
      { title: "Mức giá", options: ["Dưới 10 triệu", "10 - 20 triệu", "20 - 50 triệu", "Trên 50 triệu"] },
    ],
    "build-pc": [
      { title: "Loại linh kiện", options: ["CPU (Bộ vi xử lý)", "Mainboard (Bo mạch chủ)", "RAM (Bộ nhớ trong)", "VGA (Card màn hình)", "Ổ cứng (HDD/SSD)", "Nguồn (PSU)", "Vỏ case", "Tản nhiệt"] },
      { title: "Thương hiệu", options: ["Intel", "AMD", "ASUS", "GIGABYTE", "MSI", "Corsair", "Kingston", "Samsung"] },
      { title: "Tầm giá", options: ["Giá rẻ", "Phổ thông", "Cao cấp"] },
    ],
  };

  const categoryName = category?.name || slug.replace(/-/g, ' ').toUpperCase();
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Position");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const isLabelMatch = (mappedLabels: string[], actualLabel: string) => {
    const al = actualLabel.toLowerCase();
    return mappedLabels.some(l => {
      const ml = l.toLowerCase();
      if (ml.length <= 3) return al === ml; // VD: "cpu", "ram", "rom" phải khớp chính xác để tránh "tốc độ cpu"
      return al.includes(ml);
    });
  };

  // Xây dựng bộ lọc tự động từ ProductSpecs và Attributes
  const currentFilters = useMemo(() => {
    if (!category || !category.Products) return [];

    const normalizeSlug = (s: string) => {
      const sl = s.toLowerCase();
      if (sl.includes("dien-thoai") || sl.includes("điện-thoại")) return "dien-thoai";
      if (sl.includes("tablet")) return "tablet";
      if (sl.includes("laptop")) return "laptop";
      if (sl.includes("pc") || sl.includes("máy-tính")) return "pc";
      if (sl.includes("linh-kien") || sl.includes("linh-kiện")) return "linh-kien";
      if (sl.includes("phu-kien") || sl.includes("phụ-kiện")) return "phu-kien";
      if (sl.includes("hang-cu") || sl.includes("hàng-cũ")) return "hang-cu";
      if (sl.includes("dong-ho") || sl.includes("đồng-hồ")) return "dong-ho";
      return "laptop"; // default
    };

    const baseSlug = normalizeSlug(slug);
    const requiredTitles = new Set<string>(categoryFilterMap[baseSlug] || []);

    // Điều kiện lồng nhau cho Linh kiện, Phụ kiện, Hàng cũ
    if (baseSlug === "linh-kien") {
      const selectedLoai = selectedFilters["Loại linh kiện"] || [];
      if (selectedLoai.some(l => l.toLowerCase().includes("ram"))) {
        requiredTitles.add("RAM");
        requiredTitles.add("Bus RAM");
      }
      if (selectedLoai.some(l => l.toLowerCase().includes("Chip xử lý (CPU)"))) {
        requiredTitles.add("Chip xử lý (CPU)");
      }
    }
    if (baseSlug === "phu-kien") {
      const selectedLoai = selectedFilters["Loại phụ kiện"] || [];
      if (selectedLoai.some(l => l.toLowerCase().includes("chuột"))) {
        requiredTitles.add("DPI");
      }
    }
    if (baseSlug === "hang-cu") {
      const selectedLoai = selectedFilters["Loại hàng cũ"] || [];
      if (selectedLoai.some(l => l.toLowerCase().includes("laptop"))) {
        categoryFilterMap["laptop"].forEach(t => requiredTitles.add(t));
      }
      if (selectedLoai.some(l => l.toLowerCase().includes("điện thoại"))) {
        categoryFilterMap["dien-thoai"].forEach(t => requiredTitles.add(t));
      }
    }

    const filters: { title: string; options: string[] }[] = [];

    // 1. Thương hiệu & Mức giá (Cố định ở đầu)
    if (requiredTitles.has("Thương hiệu")) {
      const brands = new Set<string>();
      category.Products.forEach((p: any) => {
        if (p.Brand?.name) brands.add(p.Brand.name);
      });
      if (brands.size > 0) {
        filters.push({ title: "Thương hiệu", options: Array.from(brands) });
      }
      requiredTitles.delete("Thương hiệu");
    }

    if (requiredTitles.has("Mức giá")) {
      filters.push({
        title: "Mức giá",
        options: ["Dưới 2 triệu", "2 - 5 triệu", "5 - 10 triệu", "10 - 20 triệu", "20 - 30 triệu", "Trên 30 triệu"]
      });
      requiredTitles.delete("Mức giá");
    }

    // 2. Lấy dữ liệu động từ Attributes & Specs cho các options còn lại
    const optionsMap: Record<string, Set<string>> = {};
    Array.from(requiredTitles).forEach(title => optionsMap[title] = new Set());

    category.Products.forEach((p: any) => {
      // Từ ProductVariants -> AttributeValues
      p.ProductVariants?.forEach((v: any) => {
        v.AttributeValues?.forEach((a: any) => {
          const attrName = a.Attribute?.name;
          const attrValue = a.value;
          if (attrName && attrValue) {
            requiredTitles.forEach(title => {
              const mappedLabels = filterLabelMapping[title] || [title];
              if (isLabelMatch(mappedLabels, attrName)) {
                optionsMap[title].add(attrValue);
              }
            });
          }
        });
      });

      // Từ ProductSpecs
      p.ProductSpecs?.forEach((s: any) => {
        const label = s.label;
        const value = s.value;
        if (label && value) {
          requiredTitles.forEach(title => {
            const mappedLabels = filterLabelMapping[title] || [title];
            if (isLabelMatch(mappedLabels, label)) {
              optionsMap[title].add(value);
            }
          });
        }
      });
    });

    for (const title of Array.from(requiredTitles)) {
      if (optionsMap[title] && optionsMap[title].size > 0) {
        filters.push({ title, options: Array.from(optionsMap[title]) });
      }
    }

    // Nếu không có thông số nào được tìm thấy và fallback
    if (filters.length <= 2 && filterConfigs[slug]) {
      return filterConfigs[slug];
    }

    return filters;
  }, [category, slug, selectedFilters]);
  const handleFilterChange = (filterGroupTitle: string, option: string) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[filterGroupTitle] || [];
      if (groupFilters.includes(option)) {
        return { ...prev, [filterGroupTitle]: groupFilters.filter(o => o !== option) };
      } else {
        return { ...prev, [filterGroupTitle]: [...groupFilters, option] };
      }
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setCurrentPage(1);
  };

  const removeFilter = (groupTitle: string, option: string) => {
    handleFilterChange(groupTitle, option);
  };

  const products = category?.Products || [];

  const parsePrice = (priceStr: string) => {
    if (priceStr.includes("triệu")) {
      const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
      return num * 1000000;
    }
    if (priceStr.includes("k") || priceStr.includes("K")) {
      const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
      return num * 1000;
    }
    return parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  };

  const filteredProducts = products.filter((product: any) => {
    for (const [groupTitle, selectedOptions] of Object.entries(selectedFilters)) {
      if (selectedOptions.length === 0) continue;

      let match = false;

      if (groupTitle === "Thương hiệu") {
        match = selectedOptions.some(opt => {
          const brandName = product.Brand?.name?.toLowerCase() || "";
          const filterBrand = opt.split(' ')[0].toLowerCase();
          return brandName.includes(filterBrand);
        });
      } else if (groupTitle === "Mức giá" || groupTitle === "Tầm giá") {
        const price = parseFloat(product.base_price) || (product.ProductVariants?.[0]?.price ? parseFloat(product.ProductVariants[0].price) : 0);
        match = selectedOptions.some(opt => {
          if (opt.includes("Dưới")) {
            return price < parsePrice(opt);
          }
          if (opt.includes("Trên")) {
            return price > parsePrice(opt);
          }
          if (opt.includes("-")) {
            const parts = opt.split("-").map(s => s.trim());
            let min = 0, max = 0;
            if (parts[1].includes("triệu")) {
              min = parseFloat(parts[0]) * (parts[0].includes("k") ? 1000 : 1000000);
              max = parseFloat(parts[1].replace(/[^0-9.]/g, "")) * 1000000;
            } else if (parts[1].includes("k")) {
              min = parseFloat(parts[0]) * 1000;
              max = parseFloat(parts[1].replace(/[^0-9.]/g, "")) * 1000;
            } else {
              min = parseFloat(parts[0]);
              max = parseFloat(parts[1]);
            }
            if (parts[0].includes("k") || parts[0].includes("triệu")) {
              min = parsePrice(parts[0]);
            }
            return price >= min && price <= max;
          }
          return true;
        });
      } else {
        // Khớp chính xác với cấu trúc động và mapping
        const mappedLabels = filterLabelMapping[groupTitle] || [groupTitle];

        match = selectedOptions.some(opt => {
          // 1. Kiểm tra trong ProductSpecs
          const specMatch = product.ProductSpecs?.some((s: any) =>
            s.label && isLabelMatch(mappedLabels, s.label) && s.value === opt
          );
          if (specMatch) return true;

          // 2. Kiểm tra trong AttributeValues
          const attrMatch = product.ProductVariants?.some((v: any) =>
            v.AttributeValues?.some((a: any) =>
              a.Attribute?.name && isLabelMatch(mappedLabels, a.Attribute.name) && a.value === opt
            )
          );
          if (attrMatch) return true;

          // 3. Fallback cho các trường hợp mang tính năng (chuỗi dài)
          if (groupTitle === "Tính năng đặc biệt" || groupTitle === "Nhu cầu") {
            const specBroadMatch = product.ProductSpecs?.some((s: any) => s.value?.toLowerCase().includes(opt.toLowerCase()));
            if (specBroadMatch) return true;
          }

          return false;
        });
      }

      if (!match) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.base_price) || (a.ProductVariants?.[0]?.price ? parseFloat(a.ProductVariants[0].price) : 0);
    const priceB = parseFloat(b.base_price) || (b.ProductVariants?.[0]?.price ? parseFloat(b.ProductVariants[0].price) : 0);

    if (sortBy === "Price: Low to High") return priceA - priceB;
    if (sortBy === "Price: High to Low") return priceB - priceA;
    if (sortBy === "Newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const itemsToShow = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Promotional Banner */}
      <section className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">LIMITED OFFER</p>
              <h2 className="text-2xl font-bold mb-2">ASUS TUF GAMING FX505</h2>
              <p className="text-sm text-gray-300">
                HIGH PERFORMANCE AT AN AFFORDABLE PRICE
              </p>
            </div>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              SHOP NOW
            </Button>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>
            <ChevronRight className="w-3 h-3" />
            <a href="#" className="hover:text-blue-600">
              Laptops
            </a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">MSI</span>
          </div>
        </div>
      </section>

      {/* Category Title and Controls */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => route.back()} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold">{categoryName} ({products.length})</h1>
            </div>
            <div className="text-xs text-gray-600">Items 1-{itemsToShow.length} of {products.length}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs text-gray-600">Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-xs bg-white">
                <option value="Position">Position</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600">Show</label>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 rounded px-3 py-2 text-xs bg-white">
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              </div>
              <div className="flex gap-2 sm:ml-4 sm:border-l sm:border-gray-300 sm:pl-4">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-1 rounded ${viewType === "grid" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-1 rounded ${viewType === "list" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="md:col-span-1">
              <div className="md:hidden mb-4">
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)} 
                  className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded font-semibold text-sm flex justify-between items-center"
                >
                  Bộ lọc sản phẩm
                  <span>{showMobileFilters ? "−" : "+"}</span>
                </button>
              </div>

              <div className={`${showMobileFilters ? "block" : "hidden"} md:block space-y-6`}>
                <div className="mb-6">
                <button onClick={clearFilters} className="w-full text-left py-3 px-4 border border-blue-600 rounded text-blue-600 font-semibold text-sm hover:bg-blue-50">
                  Clear Filter
                </button>
              </div>

              <div className="space-y-6">
                {/* Active Filters */}
                {Object.values(selectedFilters).some(opts => opts.length > 0) && (
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(selectedFilters).map(([groupTitle, options]) => (
                        options.map(option => (
                          <span key={`${groupTitle}-${option}`} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-xs">
                            {option}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(groupTitle, option)} />
                          </span>
                        ))
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Filters based on slug */}
                {currentFilters.map((filterGroup, index) => (
                  <div key={index} className="border-t border-gray-100 pt-4 mt-4">
                    <h3 className="font-bold text-sm mb-3">{filterGroup.title}</h3>
                    <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {filterGroup.options.map((option, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 group">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedFilters[filterGroup.title]?.includes(option) || false}
                              onChange={() => handleFilterChange(filterGroup.title, option)}
                            />
                            <span className="group-hover:text-blue-600">{option}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Products Grid */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {itemsToShow.map((product: any) => {
                  let imageUrl = "https://via.placeholder.com/200?text=No+Image";
                  if (product.ProductVariants && product.ProductVariants.length > 0) {
                    const firstVariant = product.ProductVariants[0];
                    if (firstVariant.ProductVariantImages && firstVariant.ProductVariantImages.length > 0) {
                      imageUrl = firstVariant.ProductVariantImages[0].image_url;
                    }
                  }

                  const priceNum = product.base_price ? parseFloat(product.base_price) : 0;
                  const displayPrice = priceNum > 0
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum)
                    : "Liên hệ";
                  const oldPrice = priceNum > 0
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum * 1.1)
                    : "";

                  return (
                    <Card
                      key={product.id}
                      onClick={() => route.push(`/product/${product.slug}`)}
                      className="bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden group cursor-pointer flex flex-col h-full"
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden p-4">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        {product.status === 'active' && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                            Còn hàng
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 fill-orange-400 text-orange-400`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            (0)
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold line-clamp-2 mb-2 text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                          {product.name}
                        </h3>
                        <div>
                          {oldPrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              {oldPrice}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-red-600">
                          {displayPrice}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Ad Section */}
              <div className="bg-gray-100 rounded-lg p-6 mb-8 flex gap-6">
                <div className="w-32 h-32 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                  <div className="text-white text-2xl">🪑</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-2">BeclacTheAirs</h3>
                  <p className="text-xs text-gray-600 mb-2">THE ICON SERIES</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    MSI cân cân cân mua mua mua mua cần cấp lợi tiết tiết bắc
                    báo báo báo báo báo báo báo báo báo báo báo báo báo báo báo
                    báo báo báo báo báo. Đáng khá nhất trong mua mua mua mua cần
                    cấp lợi tiết tiết bắc báo báo báo báo báo báo báo báo báo
                    báo báo báo báo báo báo báo báo báo.
                  </p>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded ${i + 1 === currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* More Info */}
              <div className="text-center mb-8">
                <button className="text-blue-600 font-semibold text-sm hover:underline">
                  More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

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
