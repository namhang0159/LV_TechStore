"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Calendar, User, Search, Tag, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllBlog } from "@/util/api";

interface BlogAuthor {
  id: number;
  name: string;
  avatar_url: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  thumbnail_url: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  Author: BlogAuthor;
}

export default function BlogPage() {
  const categories = ["Tất cả", "Đánh giá sản phẩm", "Tin tức công nghệ", "Hướng dẫn", "Mẹo & Thủ thuật", "Khuyến mãi"];
  
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await getAllBlog();
        if (res.data) {
          const publishedPosts = res.data
            .filter((p: BlogPost) => p.status === "published")
            .sort((a: BlogPost, b: BlogPost) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setAllPosts(publishedPosts);
          setPosts(publishedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setPosts(allPosts);
      return;
    }
    const keyword = searchQuery.toLowerCase();
    const filtered = allPosts.filter(p => 
      p.title.toLowerCase().includes(keyword) || 
      stripHtml(p.content).toLowerCase().includes(keyword)
    );
    setPosts(filtered);
  };

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html.replace(/<[^>]+>/g, '');
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen pb-20 text-gray-900">
      {/* Blog Header */}
      <div className="bg-white border-b border-gray-200 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Tech Blog</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Cập nhật tin tức công nghệ mới nhất, đánh giá chuyên sâu và các mẹo hữu ích từ các chuyên gia của RIU.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {loading ? (
              <div className="text-center py-20 text-gray-500">Đang tải bài viết...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">Không tìm thấy bài viết nào.</div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && (
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <Link href={`/blog/${featuredPost.id}`}>
                      <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                        {featuredPost.thumbnail_url ? (
                          <img src={featuredPost.thumbnail_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <ImageIcon className="w-20 h-20 text-gray-300" />
                        )}
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                          Nổi bật
                        </div>
                      </div>
                    </Link>
                    <div className="p-8">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(featuredPost.created_at)}</span>
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {featuredPost.Author?.name || "Admin"}</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                      </h2>
                      <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                        {stripHtml(featuredPost.content)}
                      </p>
                      <Link href={`/blog/${featuredPost.id}`} className="inline-flex items-center text-blue-600 font-medium hover:underline gap-1">
                        Đọc tiếp <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                )}

                {/* Grid Posts */}
                <div className="grid md:grid-cols-2 gap-8">
                  {gridPosts.map((post) => (
                    <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
                      <Link href={`/blog/${post.id}`}>
                        <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                          {post.thumbnail_url ? (
                            <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                          )}
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.Author?.name || "Admin"}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          <Link href={`/blog/${post.id}`}>{post.title}</Link>
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                          {stripHtml(post.content)}
                        </p>
                        <Link href={`/blog/${post.id}`} className="inline-flex items-center text-blue-600 text-sm font-medium hover:underline gap-1 mt-auto">
                          Đọc tiếp <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {posts.length > 0 && (
              <div className="flex justify-center pt-8">
                <Button variant="outline" className="mr-2">Trang trước</Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">1</Button>
                <Button variant="outline" className="ml-2">Trang sau</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Tìm kiếm</h3>
              <div className="relative">
                <Input 
                  placeholder="Tìm bài viết..." 
                  className="pr-10" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </button>
              </div>
            </form>

            {/* Categories */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Danh mục</h3>
              <ul className="space-y-2">
                {categories.map((cat, idx) => (
                  <li key={idx}>
                    <Link href="#" className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${idx === 0 ? "text-blue-600 font-medium" : "text-gray-600"}`}>
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> {cat}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular tags */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Thẻ phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {["Laptop", "PC", "NVIDIA", "Apple", "Bàn phím", "Màn hình", "Gaming", "Review"].map((tag, idx) => (
                  <Link key={idx} href="#" className="bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
