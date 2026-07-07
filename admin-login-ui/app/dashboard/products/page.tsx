'use client'

import { Search, ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAllProducts, deleteProduct } from '@/util/api'

// Define the interface for the product from API
interface Product {
  id: number;
  name: string;
  base_price: string;
  status: string;
  Category: {
    name: string;
  };
  Brand: {
    name: string;
  };
  ProductVariants: any[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 10

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = await getAllProducts(currentPage, limit)
        if (response.data && response.data.data) {
          setProducts(response.data.data)
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages)
            setTotalItems(response.data.pagination.totalItems)
          }
        }
      } catch (error) {
        console.error('Failed to fetch products', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage])

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      alert('Xóa sản phẩm thành công');
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  }

  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr)
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getColor = (product: Product) => {
    if (!product.ProductVariants || product.ProductVariants.length === 0) return 'N/A'
    for (const variant of product.ProductVariants) {
      if (variant.AttributeValues) {
        const colorAttr = variant.AttributeValues.find((a: any) => a.Attribute && a.Attribute.name === 'Màu sắc')
        if (colorAttr) return colorAttr.value
      }
    }
    return 'N/A'
  }

  const getFirstImage = (product: Product) => {
    if (!product.ProductVariants || product.ProductVariants.length === 0) return null
    for (const variant of product.ProductVariants) {
      if (variant.ProductVariantImages && variant.ProductVariantImages.length > 0) {
        return variant.ProductVariantImages[0].image_url
      }
    }
    return null
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Export
          </button>
          <Link href="/dashboard/products/add" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select className="appearance-none rounded-md border border-slate-200 bg-white pl-4 pr-10 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Filter</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md border border-slate-200 text-blue-500 hover:bg-slate-50">
              <Edit2 className="size-4" />
            </button>
            <button className="p-2 rounded-md border border-slate-200 text-blue-500 hover:bg-slate-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading products...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-4 pl-4 pr-2 font-medium w-12">
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4" />
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium">Product</th>
                  <th className="py-4 px-4 font-medium">Brand</th>
                  <th className="py-4 px-4 font-medium">Color</th>
                  <th className="py-4 px-4 font-medium">Price</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const imageUrl = getFirstImage(product)
                  const color = getColor(product)
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pl-4 pr-2">
                        <div className="flex items-center justify-center h-full">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer" 
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                          <div className="h-10 w-10 rounded-md bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {imageUrl && imageUrl.startsWith('http') ? (
                              <Image src={imageUrl} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-6 h-8 bg-slate-300 rounded-sm relative"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 group-hover:text-blue-600 line-clamp-1 max-w-[200px]" title={product.name}>{product.name}</div>
                            <div className="text-xs text-blue-500 mt-0.5">{product.Category?.name || 'Uncategorized'}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{product.Brand?.name || 'N/A'}</td>
                      <td className="py-4 px-4 text-slate-600">
                        <span className="line-clamp-1 max-w-[120px]" title={color}>{color}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">{formatPrice(product.base_price)}</td>
                      <td className="py-4 px-4">
                        {product.status === 'active' ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500">
                            {product.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/products/${product.id}`} className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit2 className="size-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white rounded-b-xl">
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button className="w-8 h-8 rounded text-sm font-medium flex items-center justify-center bg-blue-100 text-blue-600">
              {currentPage}
            </button>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="text-sm text-slate-500">
            {totalItems > 0 ? `${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalItems)} of ${totalItems}` : '0'} Results
          </div>
        </div>
      </div>
    </div>
  )
}
