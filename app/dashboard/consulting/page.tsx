'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Package, CheckCircle2, XCircle, Info, Smartphone, Box, ShieldCheck, Loader2 } from 'lucide-react'
import { getAllProducts, getProductById, getAllWarehouses, getWarehouseById } from '@/util/api'

export default function ConsultingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [productDetail, setProductDetail] = useState<any>(null)
  const [warehouseDetail, setWarehouseDetail] = useState<any>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      try {
        const [prodRes, whRes] = await Promise.all([
          getAllProducts(),
          getAllWarehouses()
        ])
        
        if (prodRes.data?.data) {
          setProducts(prodRes.data.data)
        }
        
        if (whRes.data?.data) {
          setWarehouses(whRes.data.data)
          if (whRes.data.data.length > 0) {
            setSelectedBranchId(whRes.data.data[0].id.toString())
          }
        }
      } catch (error) {
        console.error('Failed to load initial data', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initData()
  }, [])

  useEffect(() => {
    const fetchWarehouseDetail = async () => {
      if (!selectedBranchId) return
      try {
        const res = await getWarehouseById(Number(selectedBranchId))
        if (res.data?.success && res.data?.data) {
          setWarehouseDetail(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch warehouse detail', error)
      }
    }
    fetchWarehouseDetail()
  }, [selectedBranchId])

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!selectedProduct) {
        setProductDetail(null)
        return
      }
      
      setIsDetailLoading(true)
      try {
        const res = await getProductById(selectedProduct.id)
        if (res.data?.data) {
          setProductDetail(res.data.data)
        } else {
          // fallback to list item if detail fetch fails or is strangely formatted
          setProductDetail(selectedProduct)
        }
      } catch (error) {
        console.error('Failed to fetch product detail', error)
        setProductDetail(selectedProduct)
      } finally {
        setIsDetailLoading(false)
      }
    }
    fetchProductDetail()
  }, [selectedProduct])

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (priceStr: string | number) => {
    const price = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr
    if (isNaN(price)) return priceStr
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  // Calculate stock in current warehouse
  const getStockInSelectedBranch = (productId: number) => {
    if (!warehouseDetail || !warehouseDetail.Inventories) return 0
    // find inventories matching any variant of this product
    const relevantInventories = warehouseDetail.Inventories.filter((inv: any) => 
      inv.ProductVariant?.product_id === productId
    )
    return relevantInventories.reduce((acc: number, curr: any) => acc + curr.quantity, 0)
  }

  const getVariantStock = (variantId: number) => {
    if (!warehouseDetail || !warehouseDetail.Inventories) return 0
    const inv = warehouseDetail.Inventories.find((inv: any) => inv.variant_id === variantId || inv.ProductVariant?.id === variantId)
    return inv ? inv.quantity : 0
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Lookup (Consulting)</h1>
          <p className="text-slate-500 text-sm mt-1">Search products to advise customers and check branch availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="appearance-none rounded-md border border-slate-200 bg-white pl-10 pr-8 py-2 text-sm text-slate-700 font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              {warehouses.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left column: Search and List */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or slug..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Loader2 className="animate-spin size-6 mb-2" />
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No products found.
              </div>
            ) : (
              filteredProducts.map(product => {
                const stock = getStockInSelectedBranch(product.id)
                const inStock = stock > 0
                const imageUrl = product.ProductVariants?.[0]?.ProductVariantImages?.[0]?.image_url 
                              || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=400'
                
                return (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedProduct?.id === product.id 
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.description_short}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium text-blue-600 text-sm">{formatPrice(product.base_price)}</span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                            {inStock ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {inStock ? `${stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column: Product Details */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          {isDetailLoading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="animate-spin size-8 mb-4 text-blue-500" />
               <p>Loading product details...</p>
             </div>
          ) : productDetail ? (
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-10">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:w-48 h-48 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 flex-shrink-0">
                  <img 
                    src={productDetail.ProductVariants?.[0]?.ProductVariantImages?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=400'} 
                    alt={productDetail.name} 
                    className="max-w-full max-h-full object-contain" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      <Package className="size-3.5" />
                      {productDetail.Category?.name || 'Uncategorized'}
                    </div>
                    {productDetail.Brand && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {productDetail.Brand.name}
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{productDetail.name}</h2>
                  <p className="text-slate-500 font-medium mt-1">Slug: {productDetail.slug}</p>
                  <p className="text-slate-600 mt-2">{productDetail.description_short}</p>
                  <div className="text-3xl font-bold text-blue-600 mt-4">{formatPrice(productDetail.base_price)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Specs */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    <Smartphone className="size-5 text-blue-500" />
                    Technical Specifications
                  </h3>
                  <div className="space-y-3">
                    {productDetail.ProductSpecs && productDetail.ProductSpecs.length > 0 ? (
                      productDetail.ProductSpecs.map((spec: any) => (
                        <div key={spec.id} className="flex justify-between text-sm py-1 border-b border-slate-50 border-dashed">
                          <span className="text-slate-500">{spec.label}</span>
                          <span className="font-medium text-slate-900 text-right max-w-[60%]">{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No technical specifications available.</p>
                    )}
                  </div>
                </div>

                {/* Features & Warranty */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    <ShieldCheck className="size-5 text-emerald-500" />
                    Warranty & Info
                  </h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-sm text-slate-600">Official Warranty</span>
                      <span className="font-bold text-slate-900">{productDetail.warranty_months} Months</span>
                    </div>
                    <div className="flex gap-2">
                      {productDetail.is_featured && <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-amber-100 text-amber-700">Featured</span>}
                      {productDetail.is_best_seller && <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-100 text-blue-700">Best Seller</span>}
                      <span className={`text-xs uppercase font-bold tracking-wider px-2 py-1 rounded ${productDetail.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{productDetail.status}</span>
                    </div>
                  </div>

                  <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2 mt-8">
                    <Info className="size-5 text-blue-500" />
                    Key Features
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {productDetail.ProductDescriptions?.filter((d: any) => d.type === 'features').map((desc: any, idx: number) => (
                      <div key={idx}>
                        {desc.data_json?.list?.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </div>
                    ))}
                    {(!productDetail.ProductDescriptions || !productDetail.ProductDescriptions.some((d: any) => d.type === 'features')) && (
                      <p className="text-sm text-slate-500 italic">No features listed.</p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Branch Availability Overview */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                  <Box className="size-5 text-orange-500" />
                  Inventory by Variant in Current Branch
                </h3>
                <div className="space-y-3">
                  {productDetail.ProductVariants && productDetail.ProductVariants.length > 0 ? (
                    productDetail.ProductVariants.map((variant: any) => {
                      const stock = getVariantStock(variant.id)
                      const imageUrl = variant.ProductVariantImages?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=400'
                      const attributes = variant.AttributeValues?.map((attr: any) => attr.value).join(' - ') || ''
                      
                      return (
                        <div key={variant.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={imageUrl} alt={variant.sku} className="w-12 h-12 object-contain rounded bg-white border border-slate-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                SKU: {variant.sku}
                              </div>
                              <div className="text-xs text-slate-500">
                                {attributes ? `${attributes} | ` : ''} {formatPrice(variant.price)}
                              </div>
                            </div>
                          </div>
                          
                          {stock > 0 ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                              <CheckCircle2 className="size-4" />
                              {stock} units
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                              <XCircle className="size-4" />
                              Out of stock
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-center">
                      No variants found for this product.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Search className="size-12 mb-4 opacity-20" />
              <p>Select a product to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
