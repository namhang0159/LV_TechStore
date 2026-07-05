'use client'

import { Search, Edit2, Trash2, Plus, Image as ImageIcon, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAllBlogs, deleteBlog } from '@/util/api'
import Link from 'next/link'

interface Blog {
  id: number
  title: string
  slug: string
  status: string
  thumbnail_url: string
  created_at: string
  Author: {
    id: number
    name: string
    avatar_url: string
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await getAllBlogs()
      if (response.data && response.data.data) {
        setPosts(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id)
        fetchBlogs()
      } catch (error) {
        console.error('Failed to delete blog:', error)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
        <div className="flex items-center gap-3">
          {/* We assume a create page exists or will be created at /dashboard/blog/create */}
          <Link href="/dashboard/blog/create" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 flex items-center gap-2">
            <Plus className="size-4" />
            Create Post
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading blogs...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-4 px-4 font-medium">Post Info</th>
                  <th className="py-4 px-4 font-medium">Author</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 px-4 font-medium">Created At</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        {post.thumbnail_url ? (
                          <img src={post.thumbnail_url} alt={post.title} className="w-16 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImageIcon className="size-5" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="max-w-[300px] truncate" title={post.title}>{post.title}</span>
                          <span className="text-xs text-slate-400 font-normal">{post.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        {post.Author?.avatar_url && (
                          <img src={post.Author.avatar_url} alt={post.Author.name} className="w-6 h-6 rounded-full object-cover" />
                        )}
                        <span>{post.Author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase
                        ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(post.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/blog/${post.id}`} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors" title="View details">
                          <Eye className="size-4" />
                        </Link>
                        <Link href={`/dashboard/blog/edit/${post.id}`} className="p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                          <Edit2 className="size-4" />
                        </Link>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No blog posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
