"use client";

import { useState, useEffect } from "react";

import { ShoppingCart, Heart, Search, User, ChevronRight, Star, MessageCircle, Headphones, Tag, Bot, BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { useRouter } from "next/navigation";
import { useProduct } from "@/hooks/useProduct";
import { useCategory } from "@/hooks/useCategory";
import { useWishlist } from "@/hooks/useWishlist";
import Link from "next/link";
import { FeaturesSection } from "@/components/common/FeaturesSection";

const DEFAULT_BANNERS = [
  {
    id: 'default_1',
    link: "#",
    image_url: "/fake_banner.png",
  },
  {
    id: 'default_2',
    link: "#",
    image_url: "/fake_banner2.png",
  },
];

const ProductCard = ({ product, route, isWishlisted, onToggleWishlist }: { product: any, route: any, isWishlisted: boolean, onToggleWishlist: (id: number) => void }) => {
  // Lấy ảnh đầu tiên từ danh sách variants, nếu không có thì hiển thị ảnh mặc định
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
      onClick={() => route.push(`/product/${product.slug}`)}
      className="relative bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col h-full"
    >
      <div className="absolute top-2 left-2 bg-green-100 rounded-full px-2 py-0.5 flex items-center z-10">
        <i className="fa-solid fa-circle-check text-green-500 text-[10px]" aria-hidden="true"></i>
        <span className="text-green-600 text-[10px] ml-1 font-medium">
          {product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
        </span>
      </div>
      <div className="aspect-square bg-white border-b border-gray-100 overflow-hidden relative flex items-center justify-center p-4">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-xs line-clamp-2 mb-2 text-gray-800 flex-1 hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 fill-orange-400 text-orange-400`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">(0)</span>
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            {oldPrice && (
              <div className="text-[10px] text-gray-400 line-through">
                {oldPrice}
              </div>
            )}
            <div className="text-sm font-bold text-red-600">
              {displayPrice}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
      </div>
    </Card>
  );
};

const getCategoryStyle = (index: number) => {
  const styles = [
    { bg: 'from-gray-900 to-black', text: 'text-cyan-400' },
    { bg: 'from-red-900 to-black', text: 'text-red-500' },
    { bg: 'from-gray-800 to-gray-900', text: 'text-white' },
    { bg: 'from-blue-900 to-black', text: 'text-blue-400' },
  ];
  return styles[index % styles.length];
};

export default function Home() {
  const route = useRouter();
  const { products, loading: loadingProd } = useProduct();
  const { categories, loading: loadingCat } = useCategory();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getAllBlog, getActiveBanners } = await import('@/util/api');
        
        const resBlog = await getAllBlog();
        if (resBlog.data) {
          const published = resBlog.data.filter((b: any) => b.status === "published");
          published.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setBlogs(published.slice(0, 4));
        }

        const resBanner = await getActiveBanners();
        if (resBanner.success && resBanner.data) {
          setBanners(resBanner.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (loadingProd || loadingCat) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Đang tải dữ liệu...</p></div>;

  const newProducts = products?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <section className="py-8 px-4">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showIndicators={true}
          showArrows={true}
          interval={3000}
          renderArrowPrev={(onClickHandler, hasPrev) =>
            hasPrev && (
              <button
                onClick={onClickHandler}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full"
              >
                {"<"}
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext) =>
            hasNext && (
              <button
                onClick={onClickHandler}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full"
              >
                {">"}
              </button>
            )
          }
        >
          {(banners.length > 0 ? banners : DEFAULT_BANNERS).map((item) => (
            <div key={item.id} className="max-w-7xl mx-auto cursor-pointer" onClick={() => item.link && item.link !== '#' ? route.push(item.link) : null}>
              <img
                src={item.image_url.startsWith('http') ? item.image_url : (item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`)}
                alt="Banner"
                className="w-full h-auto max-h-[400px] object-cover rounded"
              />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Product Sections */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* New Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">New Products</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm">
              Xem tất cả hàng hóa <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {newProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                route={route}
                isWishlisted={isInWishlist(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </section>

        {/* Dynamic Categories */}
        {(categories || []).slice().sort((a: any, b: any) => a.id - b.id).map((category: any, index: number) => {
          if (!category.Products || category.Products.length === 0) return null;
          const displayProducts = category.Products.slice(0, 4);
          const style = getCategoryStyle(index);

          return (
            <div key={category.id}>
              <div className="bg-blue-50 py-3 px-4 mb-6 flex items-center justify-center gap-3 rounded-lg shadow-sm">
                <span className="text-blue-600 font-black text-2xl tracking-tighter">RIU</span>
                <span className="text-blue-300 text-xl">|</span>
                <span className="text-blue-600 font-bold text-lg">{category.name}</span>
              </div>

              <section className="mb-12">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4">
                  <div className={`col-span-2 md:col-span-2 bg-gradient-to-br ${style.bg} relative overflow-hidden rounded-lg min-h-[150px] sm:min-h-[300px] flex items-center justify-center group cursor-pointer`}>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                    <div className="relative z-20 text-center transform group-hover:scale-105 transition-transform p-4">
                      <h3 className={`font-black text-3xl mb-1 ${style.text} tracking-wider`}>{category.name}</h3>
                      <p className="text-gray-300 mt-2 text-sm font-semibold">{category.description_short || 'Sản phẩm nổi bật'}</p>
                    </div>
                  </div>
                  {displayProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      route={route}
                      isWishlisted={isInWishlist(product.id)}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>
              </section>
            </div>
          );
        })}
      </main>

      {/* Brand Logos */}
      <section className="bg-white py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {[
              "Apple",
              "MSI",
              "Razer",
              "Samsung",
              "ADATA",
              "Xiaomi",
              "Gigabyte",
            ].map((brand) => (
              <div
                key={brand}
                className="text-gray-900 font-black text-2xl md:text-3xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110 duration-200"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-gray-50 py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Bài viết mới nhất
            </h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700" onClick={() => route.push('/blog')}>
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col group cursor-pointer hover:shadow-md transition-shadow" onClick={() => route.push(`/blog/${blog.id}`)}>
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative flex items-center justify-center">
                  {blog.thumbnail_url ? (
                    <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-gray-400 font-medium">No Image</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{blog.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-1" dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]+>/g, '') }} />
                  <div className="text-xs text-gray-400 mt-auto">
                    {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-white py-16 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl text-gray-300 font-serif mb-2 leading-none h-8">"</div>
          <p className="text-lg md:text-xl text-gray-800 font-medium italic mb-8 px-4 md:px-12 leading-relaxed">
            Bạn hàng đến đây có thể đã cần một người bạn đồng hành hoàn hảo. Từ lúc tôi gọi nhau hỗ trợ
            bán hàng, rất là hoàn lại thanh toán, quy trình đặt mua ổn và giá cả phải chăng. Công ty Tech
            Shop chắc chắn là nơi tôi sẽ tiếp tục mua sắm và sẽ giới thiệu nhiều người mua sắm trên trang
            web của các bạn trong tương lai. Rất khuyên khích mọi người sử dụng dịch vụ này!
          </p>
          <div className="text-right text-gray-500 text-sm italic pr-12 mb-8">- Mike</div>
          <div className="flex justify-center items-center gap-2 mb-8">
            <button className="border border-blue-600 text-blue-600 px-6 py-1.5 rounded-full font-semibold text-sm hover:bg-blue-50 transition-colors mr-4">
              Xem thêm đánh giá
            </button>
            <div className="w-8 h-2 rounded-full bg-blue-600"></div>
            <div className="w-2 h-2 rounded-full bg-blue-200"></div>
            <div className="w-2 h-2 rounded-full bg-blue-200"></div>
            <div className="w-2 h-2 rounded-full bg-blue-200"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
    </div>
  );
}
