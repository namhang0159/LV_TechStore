'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBlog } from '@/util/api'
import { ChevronLeft, Save } from 'lucide-react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function CreateBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail_url: '',
    status: 'draft',
    author_id: 2, // Default author_id for now
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await createBlog(formData)
      router.push('/dashboard/blog')
    } catch (error) {
      console.error('Failed to create blog:', error)
      alert('Failed to create blog. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Create New Blog</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. my-awesome-blog-post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
            <input
              type="text"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="pb-12">
            <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
            <ReactQuill 
              theme="snow"
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              className="h-96"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                  ['link', 'image', 'video'],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="size-4" />
            {loading ? 'Saving...' : 'Save Blog'}
          </button>
        </div>
      </form>
    </div>
  )
}
