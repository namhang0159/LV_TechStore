'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Package, Folder, Tag, Calendar, Edit2, ShieldCheck, Box
} from 'lucide-react'
import { getCategoryById } from '@/util/api'

export default function CategoryDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const [category, setCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getCategoryById(Number(id))
        if (response.data && response.data.success && response.data.data) {
          setCategory(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch category', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCategory()
    }
  }, [id])

  const formatPrice = (priceStr: string | number) => {
    const price = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  const getBgClass = (id: number) => {
    const colors = [
      'bg-slate-100', 'bg-blue-50', 'bg-emerald-50', 
      'bg-amber-50', 'bg-rose-50', 'bg-indigo-50', 
      'bg-cyan-50', 'bg-purple-50'
    ]
    return colors[id % colors.length]
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)] text-slate-500">Loading category details...</div>
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-slate-500">
        <Folder className="size-16 mb-4 text-slate-300" />
        <p className="text-lg font-medium text-slate-600">Category not found</p>
        <Link href="/dashboard/categories" className="mt-4 text-blue-600 hover:underline">Return to Categories</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/categories" className="p-2 rounded-md hover:bg-slate-100 transition-colors bg-white border border-slate-200 shadow-sm">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {category.name}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Tag className="size-3.5" /> /{category.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm">
            <Edit2 className="size-4" /> Edit Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sidebar - Category Info */}
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`h-32 w-full ${getBgClass(category.id)} flex items-center justify-center`}>
              {category.icon ? (
                <div className="size-16 bg-white rounded-full shadow-sm flex items-center justify-center p-3">
                  <img src={`/${category.icon}`} alt={category.name} className="w-full h-full object-contain opacity-70" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              ) : (
                <Folder className="size-16 text-slate-300" />
              )}
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">ID</span>
                <span className="text-sm font-medium text-slate-900">#{category.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Slug</span>
                <span className="text-sm font-medium text-slate-900">{category.slug}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Parent</span>
                <span className="text-sm font-medium text-slate-900">{category.parent_id ? `#${category.parent_id}` : 'None (Root)'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Created At</span>
                <span className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  {formatDate(category.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Total Products</span>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {category.Products?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Products List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">Products in Category</h2>
              </div>
              <Link href="/dashboard/products/new" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Add Product
              </Link>
            </div>
            
            {(!category.Products || category.Products.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Box className="size-12 mb-3 text-slate-300" />
                <p>No products found in this category.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-6 font-medium">Product Name</th>
                      <th className="py-3 px-6 font-medium">Brand</th>
                      <th className="py-3 px-6 font-medium">Base Price</th>
                      <th className="py-3 px-6 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {category.Products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <Link href={`/dashboard/products/${product.id}`} className="block">
                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product.description_short}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {product.is_featured && <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Featured</span>}
                              {product.is_best_seller && <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Bestseller</span>}
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {product.Brand?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {formatPrice(product.base_price)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
