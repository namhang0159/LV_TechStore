'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById } from '@/util/api'
import { ChevronLeft, Edit2, Package, Tag, Layers, Settings, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

// Types
interface ProductSpec {
  id: number;
  group_name: string;
  label: string;
  value: string;
  sort_order: number;
}

interface ProductVariant {
  id: number;
  price: string;
  sku: string;
  status: string;
  ProductVariantImages: any[];
  AttributeValues: { Attribute: { name: string }, value: string }[];
}

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  description_short: string;
  status: string;
  warranty_months: number;
  Category: { name: string };
  Brand: { name: string };
  ProductDescriptions: { type: string, data_json: any }[];
  ProductSpecs: ProductSpec[];
  ProductVariants: ProductVariant[];
  Tags: { name: string }[];
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        const response = await getProductById(id)
        if (response.data && response.data.data) {
          setProduct(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch product details', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr)
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="text-slate-500">Loading product details...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="text-slate-500">Product not found.</div>
        <button 
          onClick={() => router.back()}
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ChevronLeft className="size-4" /> Back to Products
        </button>
      </div>
    )
  }

  // Group specs by group_name
  const specsByGroup = product.ProductSpecs.reduce((acc, spec) => {
    if (!acc[spec.group_name]) acc[spec.group_name] = []
    acc[spec.group_name].push(spec)
    return acc
  }, {} as Record<string, ProductSpec[]>)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {product.name}
              {product.status === 'active' && (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                  Active
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">ID: {product.id} • Slug: {product.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Edit2 className="size-4" /> Edit Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2 font-semibold text-slate-800">
              <Package className="size-5 text-blue-500" />
              General Information
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Base Price</p>
                <p className="text-xl font-bold text-slate-900">{formatPrice(product.base_price)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Brand</p>
                <p className="font-medium text-slate-900">{product.Brand?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Category</p>
                <p className="font-medium text-slate-900">{product.Category?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Warranty</p>
                <p className="font-medium text-slate-900">{product.warranty_months} months</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500 mb-1">Short Description</p>
                <p className="text-slate-700">{product.description_short || 'No description available.'}</p>
              </div>
              {product.Tags && product.Tags.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.Tags.map(tag => (
                      <span key={tag.name} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descriptions Card */}
          {product.ProductDescriptions && product.ProductDescriptions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2 font-semibold text-slate-800">
                <Layers className="size-5 text-purple-500" />
                Detailed Description
              </div>
              <div className="p-6 space-y-6">
                {product.ProductDescriptions.map((desc, idx) => (
                  <div key={idx} className="prose prose-sm max-w-none prose-slate">
                    {desc.type === 'html' ? (
                      <div dangerouslySetInnerHTML={{ __html: desc.data_json?.content || '' }} />
                    ) : desc.type === 'features' ? (
                      <ul className="list-disc pl-5">
                        {desc.data_json?.list?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2 font-semibold text-slate-800">
              <Tag className="size-5 text-emerald-500" />
              Product Variants
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50">
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4 font-medium">Image</th>
                    <th className="py-3 px-4 font-medium">SKU</th>
                    <th className="py-3 px-4 font-medium">Attributes</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.ProductVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {variant.ProductVariantImages?.[0]?.image_url ? (
                            variant.ProductVariantImages[0].image_url.startsWith('data:') || variant.ProductVariantImages[0].image_url.startsWith('http') ? (
                              <Image 
                                src={variant.ProductVariantImages[0].image_url} 
                                alt={variant.sku} 
                                width={48} 
                                height={48} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <ImageIcon className="size-5 text-slate-400" />
                            )
                          ) : (
                            <ImageIcon className="size-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{variant.sku}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {variant.AttributeValues?.map((attr, i) => (
                            <span key={i} className="text-xs text-slate-600">
                              <span className="font-medium text-slate-700">{attr.Attribute?.name}:</span> {attr.value}
                            </span>
                          ))}
                          {(!variant.AttributeValues || variant.AttributeValues.length === 0) && (
                            <span className="text-xs text-slate-400">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{formatPrice(variant.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          variant.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {variant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {product.ProductVariants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">No variants available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Specs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-24">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2 font-semibold text-slate-800">
              <Settings className="size-5 text-orange-500" />
              Specifications
            </div>
            <div className="p-0">
              {Object.keys(specsByGroup).length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {Object.entries(specsByGroup).map(([group, specs]) => (
                    <div key={group} className="p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{group}</h3>
                      <div className="space-y-3">
                        {specs.sort((a, b) => a.sort_order - b.sort_order).map(spec => (
                          <div key={spec.id} className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500">{spec.label}</span>
                            <span className="text-sm text-slate-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No specifications provided.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
