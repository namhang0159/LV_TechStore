'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, X, Folder, Image as ImageIcon, Eye } from 'lucide-react'
import { getAllCategory, createCategory, updateCategory, deleteCategory } from '@/util/api'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  parent_id: number | null
  created_at: string
  Products?: any[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const res = await getAllCategory()
      if (res.data && res.data.success && res.data.data) {
        setCategories(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setFormData({ name: '', slug: '', icon: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateSlug = () => {
    if (!formData.name) return
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateCategory(editingId, formData)
      } else {
        await createCategory(formData)
      }
      closeModal()
      fetchCategories()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Action failed. Check console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory(id)
      fetchCategories()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed.')
    }
  }

  // A simple function to determine background color dynamically based on ID
  const getBgClass = (id: number) => {
    const colors = [
      'bg-slate-100', 'bg-blue-50', 'bg-emerald-50', 
      'bg-amber-50', 'bg-rose-50', 'bg-indigo-50', 
      'bg-cyan-50', 'bg-purple-50'
    ]
    return colors[id % colors.length]
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product categories and groupings</p>
        </div>
        <button 
          onClick={openAddModal}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="size-4" />
          Add Category
        </button>
      </div>

      {/* Grid Area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-500">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
          <Folder className="size-12 mb-3 text-slate-300" />
          <p>No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative">
              
              <Link href={`/dashboard/categories/${category.id}`} className="absolute inset-0 z-0"></Link>
              
              <div className={`h-40 w-full ${getBgClass(category.id)} flex items-center justify-center relative p-6 pointer-events-none`}>
                
                {/* Visual Representation */}
                {category.icon ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-16 bg-white rounded-full shadow-sm flex items-center justify-center p-3 text-2xl font-bold text-blue-600 border border-slate-100">
                      {category.icon.endsWith('.png') || category.icon.endsWith('.jpg') || category.icon.endsWith('.svg') ? (
                         <img src={`/${category.icon}`} alt={category.name} className="w-full h-full object-contain opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-icon'); }} />
                      ) : (
                        <Folder className="size-8 text-blue-400" />
                      )}
                    </div>
                  </div>
                ) : (
                  <Folder className="size-16 text-slate-300" />
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300 backdrop-blur-[2px] z-10 pointer-events-auto">
                  <Link 
                    href={`/dashboard/categories/${category.id}`}
                    className="flex items-center justify-center size-10 bg-white text-slate-700 rounded-full shadow-lg hover:bg-slate-50 transition-colors tooltip"
                    title="View Category"
                  >
                    <Eye className="size-4" />
                  </Link>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(category); }}
                    className="flex items-center justify-center size-10 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors tooltip"
                    title="Edit Category"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(category.id); }}
                    className="flex items-center justify-center size-10 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 pointer-events-none">
                <h3 className="font-bold text-slate-900 line-clamp-1">{category.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">
                    {category.Products?.length || 0} items
                  </p>
                  <p className="text-xs text-slate-400">/{category.slug}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Category Name *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Smart Watches"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block flex justify-between">
                  Slug *
                  <button type="button" onClick={generateSlug} className="text-xs text-blue-600 hover:underline">Auto-generate</button>
                </label>
                <input 
                  type="text" 
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder="e.g. smart-watches"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Icon Class/Filename</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. watch-icon.png"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Provide an image filename or icon class.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
