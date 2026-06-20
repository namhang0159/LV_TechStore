"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBlogById } from "@/util/api";

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

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await getBlogById(id as string);
        if (res.data) {
          setBlog(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch blog detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Đang tải bài viết...</div>;
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h2>
        <Button onClick={() => router.push('/blog')} variant="outline">
          Quay lại trang Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20 text-gray-900">
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách bài viết
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(blog.created_at)}</span>
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {blog.Author?.name || "Admin"}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
          {blog.title}
        </h1>
      </div>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <div className="aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-sm">
          {blog.thumbnail_url ? (
            <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-20 h-20 text-gray-300" />
          )}
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4">
        <div 
          className="prose prose-lg prose-blue max-w-none prose-img:rounded-xl prose-img:w-full prose-headings:font-bold prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <Tag className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-700">Tags:</span>
            {["Công nghệ", "Review", "Sản phẩm mới"].map((tag, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
