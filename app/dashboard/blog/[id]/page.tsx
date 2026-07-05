'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getBlogById } from '@/util/api'
import { ChevronLeft, Edit2, Calendar, User, FileText } from 'lucide-react'
import Link from 'next/link'

interface Blog {
  id: number
  title: string
  slug: string
  content: string
  status: string
  thumbnail_url: string
  created_at: string
  Author: {
    id: number
    name: string
    avatar_url: string
  }
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchBlog = async () => {
      try {
        const response = await getBlogById(id)
        if (response.data && response.data.data) {
          setBlog(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch blog details', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="text-slate-500">Loading blog details...</div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="text-slate-500">Blog post not found.</div>
        <button 
          onClick={() => router.back()}
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ChevronLeft className="size-4" /> Back to Blogs
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/blog')}
            className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Blog Details
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase
                ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {blog.status}
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/blog/edit/${blog.id}`} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Edit2 className="size-4" /> Edit Post
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {blog.thumbnail_url && (
          <div className="w-full h-64 md:h-80 relative bg-slate-100 border-b border-slate-200">
            <img 
              src={blog.thumbnail_url} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              {blog.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2">
                {blog.Author?.avatar_url ? (
                  <img src={blog.Author.avatar_url} alt={blog.Author.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User className="size-4" />
                )}
                <span className="font-medium text-slate-700">{blog.Author?.name || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>{new Date(blog.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="size-4" />
                <span>Slug: <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{blog.slug}</span></span>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-img:rounded-lg prose-headings:font-semibold">
            {blog.content ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <p className="text-slate-400 italic">No content available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
