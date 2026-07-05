'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { 
  getAllCategory, 
  getAllBrands, 
  getAllTags, 
  createTag, 
  getAllAttributes, 
  createAttribute, 
  createAttributeValue, 
  createProduct 
} from '@/util/api'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'

import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface Category { id: number; name: string }
interface Brand { id: number; name: string }
interface Tag { id: number; name: string }
interface Attribute { id: number; name: string; AttributeValues?: { id: number; value: string }[] }

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- Form State ---
  const [baseInfo, setBaseInfo] = useState({
    name: '',
    slug: '',
    base_price: '',
    warranty_months: '12',
    description_short: '',
    status: 'active',
    category_id: '',
    brand_id: '',
  })
  const [isFeatured, setIsFeatured] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)

  const [tags, setTags] = useState<number[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  const [descriptions, setDescriptions] = useState([{ type: 'html', data_json: '' }])

  const [specs, setSpecs] = useState([{ group_name: 'Cấu hình chung', label: '', value: '', sort_order: 1 }])

  const [variants, setVariants] = useState([{
    price: '',
    sku: '',
    status: 'active',
    imagesInput: '', 
    attributes: [] as number[],
    // Temporary inputs for creating attributes inside variant
    tempAttrName: '',
    tempAttrValue: '',
    isAddingAttr: false
  }])

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [catRes, brandRes, tagRes, attrRes] = await Promise.all([
          getAllCategory(),
          getAllBrands(),
          getAllTags(),
          getAllAttributes()
        ])

        if (catRes.data?.success) {
          setCategories(catRes.data.data)
          if (catRes.data.data.length > 0) setBaseInfo(prev => ({ ...prev, category_id: String(catRes.data.data[0].id) }))
        }
        if (brandRes.data?.success) {
          setBrands(brandRes.data.data)
          if (brandRes.data.data.length > 0) setBaseInfo(prev => ({ ...prev, brand_id: String(brandRes.data.data[0].id) }))
        }
        if (tagRes.data?.success) setAvailableTags(tagRes.data.data)
        if (attrRes.data?.success) setAvailableAttributes(attrRes.data.data)
      } catch (error) {
        console.error('Failed to load dependencies', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDependencies()
  }, [])

  const handleBaseInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBaseInfo(prev => ({ ...prev, [name]: value }))
  }

  const createSlugHelper = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  const generateSlug = () => {
    if (!baseInfo.name) return
    setBaseInfo(prev => ({ ...prev, slug: createSlugHelper(baseInfo.name) }))
  }

  // Tags Handlers
  const handleAddTag = async () => {
    if (!tagInput.trim()) return
    setIsAddingTag(true)
    try {
      const existing = availableTags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase())
      if (existing) {
        if (!tags.includes(existing.id)) setTags([...tags, existing.id])
      } else {
        const res = await createTag({ name: tagInput.trim(), slug: createSlugHelper(tagInput.trim()) })
        if (res.data?.data) {
          setAvailableTags([...availableTags, res.data.data])
          setTags([...tags, res.data.data.id])
        }
      }
      setTagInput('')
    } catch (error) {
      console.error('Failed to add tag', error)
      toast({ title: 'Error', description: 'Failed to add tag', variant: 'destructive' })
    } finally {
      setIsAddingTag(false)
    }
  }

  const removeTag = (id: number) => {
    setTags(tags.filter(tId => tId !== id))
  }

  // Description Handlers
  const handleDescChange = (index: number, val: string) => {
    setDescriptions(prev => {
      const newDescs = [...prev]
      newDescs[index] = { ...newDescs[index], data_json: val }
      return newDescs
    })
  }

  // Spec Handlers
  const addSpec = () => {
    setSpecs(prev => [...prev, { group_name: prev[prev.length-1]?.group_name || 'Cấu hình chung', label: '', value: '', sort_order: prev.length + 1 }])
  }
  const removeSpec = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index))
  }
  const handleSpecChange = (index: number, field: string, value: string) => {
    const newSpecs = [...specs]
    newSpecs[index] = { ...newSpecs[index], [field]: value }
    setSpecs(newSpecs)
  }

  // Variant Handlers
  const addVariant = () => {
    setVariants(prev => [...prev, { 
      price: baseInfo.base_price, sku: '', status: 'active', imagesInput: '', attributes: [], tempAttrName: '', tempAttrValue: '', isAddingAttr: false 
    }])
  }
  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }
  const handleVariantChange = (index: number, field: string, value: any) => {
    setVariants(prev => {
      const newVars = [...prev]
      newVars[index] = { ...newVars[index], [field]: value }
      return newVars
    })
  }
  
  const handleAddVariantAttribute = async (index: number) => {
    const variant = variants[index]
    const name = variant.tempAttrName.trim()
    const value = variant.tempAttrValue.trim()
    
    if (!name || !value) return
    
    handleVariantChange(index, 'isAddingAttr', true)
    
    try {
      let attrId
      let existingAttr = availableAttributes.find(a => a.name.toLowerCase() === name.toLowerCase())
      
      if (existingAttr) {
        attrId = existingAttr.id
      } else {
        const res = await createAttribute({ name, slug: createSlugHelper(name) })
        existingAttr = res.data.data
        existingAttr!.AttributeValues = []
        setAvailableAttributes(prev => [...prev, existingAttr!])
        attrId = existingAttr!.id
      }

      let attrValId
      let existingVal = existingAttr!.AttributeValues?.find(v => v.value.toLowerCase() === value.toLowerCase())
      
      if (existingVal) {
        attrValId = existingVal.id
      } else {
        const res = await createAttributeValue(attrId, { value, slug: createSlugHelper(value) })
        existingVal = res.data.data
        setAvailableAttributes(prev => prev.map(a => a.id === attrId ? { ...a, AttributeValues: [...(a.AttributeValues||[]), existingVal!] } : a))
        attrValId = existingVal!.id
      }

      if (!variant.attributes.includes(attrValId)) {
        handleVariantChange(index, 'attributes', [...variant.attributes, attrValId])
      }
      
      handleVariantChange(index, 'tempAttrName', '')
      handleVariantChange(index, 'tempAttrValue', '')
    } catch (error) {
      console.error('Failed to add attribute', error)
      toast({ title: 'Error', description: 'Failed to add variant attribute', variant: 'destructive' })
    } finally {
      handleVariantChange(index, 'isAddingAttr', false)
    }
  }

  const removeVariantAttribute = (variantIndex: number, attrValId: number) => {
    const newVars = [...variants]
    newVars[variantIndex].attributes = newVars[variantIndex].attributes.filter(id => id !== attrValId)
    setVariants(newVars)
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const payload = {
        name: baseInfo.name,
        slug: baseInfo.slug,
        brand_id: baseInfo.brand_id ? parseInt(baseInfo.brand_id, 10) : null,
        category_id: baseInfo.category_id ? parseInt(baseInfo.category_id, 10) : null,
        base_price: baseInfo.base_price ? parseFloat(baseInfo.base_price) : 0,
        description_short: baseInfo.description_short,
        is_featured: isFeatured,
        is_best_seller: isBestSeller,
        warranty_months: baseInfo.warranty_months ? parseInt(baseInfo.warranty_months, 10) : 0,
        status: baseInfo.status,
      }

      const formattedDescriptions = descriptions.map(d => {
        if (d.type === 'features') {
          return {
            type: 'features',
            data_json: { list: d.data_json.split('\n').map((i: string) => i.trim()).filter((i: string) => i) }
          }
        }
        return {
          type: d.type,
          data_json: { content: d.data_json }
        }
      })

      const formattedSpecs = specs.map(s => ({
        ...s,
        sort_order: parseInt(s.sort_order as any, 10)
      }))

      const formattedVariants = variants.map(v => ({
        price: parseFloat(v.price),
        sku: v.sku,
        status: v.status,
        images: v.imagesInput.split(',').map(url => url.trim()).filter(url => url),
        attributes: v.attributes
      }))

      const finalPayload = {
        ...payload,
        descriptions: formattedDescriptions,
        specs: formattedSpecs,
        tags: tags,
        variants: formattedVariants
      }

      await createProduct(finalPayload)
      
      toast({ title: 'Success', description: 'Product created successfully' })
      router.push('/dashboard/products')
    } catch (error: any) {
      console.error('Submit error:', error)
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to create product', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-sm text-slate-500 mt-1">Configure full product details including variants and specs.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Product Name *</label>
              <input type="text" name="name" value={baseInfo.name} onChange={handleBaseInfoChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex justify-between">Slug * <button type="button" onClick={generateSlug} className="text-xs text-blue-600 hover:underline">Auto-generate</button></label>
              <input type="text" name="slug" value={baseInfo.slug} onChange={handleBaseInfoChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-slate-50" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Brand *</label>
              <select name="brand_id" value={baseInfo.brand_id} onChange={handleBaseInfoChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white" required>
                <option value="" disabled>Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category *</label>
              <select name="category_id" value={baseInfo.category_id} onChange={handleBaseInfoChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white" required>
                <option value="" disabled>Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Base Price (VND) *</label>
              <input type="number" name="base_price" value={baseInfo.base_price} onChange={handleBaseInfoChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Warranty (Months)</label>
              <input type="number" name="warranty_months" value={baseInfo.warranty_months} onChange={handleBaseInfoChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-8 py-2">
              <div className="flex items-center gap-3">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="isFeatured" />
                <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 cursor-pointer">Featured Product</label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} id="isBestSeller" />
                <label htmlFor="isBestSeller" className="text-sm font-medium text-slate-700 cursor-pointer">Best Seller</label>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <label className="text-sm font-medium text-slate-700">Status:</label>
                <select name="status" value={baseInfo.status} onChange={handleBaseInfoChange} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Short Description</label>
              <textarea name="description_short" value={baseInfo.description_short} onChange={handleBaseInfoChange} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Brief summary of the product..."></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Tags */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Tags</h2>
          
          <div className="flex flex-wrap gap-2">
            {tags.map(id => {
              const tag = availableTags.find(t => t.id === id)
              return tag ? (
                <span key={id} className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                  {tag.name}
                  <button type="button" onClick={() => removeTag(id)} className="hover:text-red-600 focus:outline-none">
                    <Trash2 className="size-3" />
                  </button>
                </span>
              ) : null
            })}
          </div>

          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Type a tag name and click Add" 
              className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              list="available-tags"
            />
            <datalist id="available-tags">
              {availableTags.map(t => <option key={t.id} value={t.name} />)}
            </datalist>
            <button 
              type="button" 
              onClick={handleAddTag} 
              disabled={isAddingTag || !tagInput.trim()}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAddingTag ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </button>
          </div>
        </div>

        {/* Section 3: Descriptions */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-lg font-semibold text-slate-800">Rich Description</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDescriptions(prev => [...prev, { type: 'html', data_json: '' }])} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"><Plus className="size-4" /> Add HTML</button>
              <button type="button" onClick={() => setDescriptions(prev => [...prev, { type: 'features', data_json: '' }])} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"><Plus className="size-4" /> Add Features</button>
            </div>
          </div>
          {descriptions.map((desc, idx) => (
            <div key={idx} className={`space-y-2 relative ${desc.type === 'html' ? 'pb-12' : ''}`}>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Content ({desc.type})</label>
                <button type="button" onClick={() => setDescriptions(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Trash2 className="size-4" /></button>
              </div>
              {desc.type === 'features' ? (
                <textarea 
                  value={desc.data_json}
                  onChange={(e) => handleDescChange(idx, e.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Enter features, one per line..."
                />
              ) : (
                <ReactQuill 
                  theme="snow"
                  value={desc.data_json}
                  onChange={(content) => handleDescChange(idx, content)}
                  className="h-64"
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
              )}
            </div>
          ))}
        </div>

        {/* Section 4: Specifications */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-lg font-semibold text-slate-800">Specifications</h2>
            <button type="button" onClick={addSpec} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              <Plus className="size-4" /> Add Spec
            </button>
          </div>
          
          <div className="space-y-3">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1 space-y-1">
                  <input type="text" value={spec.group_name} onChange={(e) => handleSpecChange(idx, 'group_name', e.target.value)} placeholder="Group Name (e.g. Cấu hình chung)" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" required />
                </div>
                <div className="flex-1 space-y-1">
                  <input type="text" value={spec.label} onChange={(e) => handleSpecChange(idx, 'label', e.target.value)} placeholder="Label (e.g. CPU)" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" required />
                </div>
                <div className="flex-1 space-y-1">
                  <input type="text" value={spec.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} placeholder="Value" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" required />
                </div>
                <div className="w-20 space-y-1">
                  <input type="number" value={spec.sort_order} onChange={(e) => handleSpecChange(idx, 'sort_order', e.target.value)} placeholder="Order" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
                </div>
                <button type="button" onClick={() => removeSpec(idx)} className="p-1.5 mt-0.5 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 rounded-md">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {specs.length === 0 && <p className="text-sm text-slate-500 italic">No specifications added.</p>}
          </div>
        </div>

        {/* Section 5: Variants */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-lg font-semibold text-slate-800">Product Variants</h2>
            <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              <Plus className="size-4" /> Add Variant
            </button>
          </div>
          
          <div className="space-y-6">
            {variants.map((variant, idx) => (
              <div key={idx} className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-4 relative">
                <button type="button" onClick={() => removeVariant(idx)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-md shadow-sm border border-slate-200">
                  <Trash2 className="size-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Variant SKU *</label>
                    <input type="text" value={variant.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" required placeholder="e.g. ASUS-G15-R7" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Variant Price *</label>
                    <input type="number" value={variant.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Status</label>
                    <select value={variant.status} onChange={(e) => handleVariantChange(idx, 'status', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Image URLs (comma separated)</label>
                    <textarea value={variant.imagesInput} onChange={(e) => handleVariantChange(idx, 'imagesInput', e.target.value)} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-mono resize-none" placeholder="https://..., https://..." />
                  </div>
                  
                  {/* Dynamic Variant Attributes Selection */}
                  <div className="md:col-span-3 space-y-3 pt-2">
                    <label className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-1 block">Variant Attributes</label>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {variant.attributes.map(attrValId => {
                        let attrName = ''
                        let attrVal = ''
                        availableAttributes.forEach(a => {
                          const v = a.AttributeValues?.find(av => av.id === attrValId)
                          if (v) { attrName = a.name; attrVal = v.value }
                        })
                        return (
                          <span key={attrValId} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs font-medium border border-indigo-200">
                            {attrName}: {attrVal}
                            <button type="button" onClick={() => removeVariantAttribute(idx, attrValId)} className="hover:text-red-600">
                              <Trash2 className="size-3" />
                            </button>
                          </span>
                        )
                      })}
                      {variant.attributes.length === 0 && <span className="text-xs text-slate-400 italic">No attributes added yet.</span>}
                    </div>

                    <div className="flex gap-2 items-center bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <input 
                        type="text" 
                        value={variant.tempAttrName} 
                        onChange={(e) => handleVariantChange(idx, 'tempAttrName', e.target.value)}
                        placeholder="Name (e.g. Color)" 
                        className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                        list={`attr-names-${idx}`}
                      />
                      <datalist id={`attr-names-${idx}`}>
                        {availableAttributes.map(a => <option key={a.id} value={a.name} />)}
                      </datalist>

                      <input 
                        type="text" 
                        value={variant.tempAttrValue} 
                        onChange={(e) => handleVariantChange(idx, 'tempAttrValue', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariantAttribute(idx))}
                        placeholder="Value (e.g. Red)" 
                        className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                        list={`attr-values-${idx}`}
                      />
                      <datalist id={`attr-values-${idx}`}>
                        {availableAttributes.find(a => a.name.toLowerCase() === variant.tempAttrName.trim().toLowerCase())?.AttributeValues?.map(v => (
                          <option key={v.id} value={v.value} />
                        ))}
                      </datalist>

                      <button 
                        type="button" 
                        onClick={() => handleAddVariantAttribute(idx)} 
                        disabled={variant.isAddingAttr || !variant.tempAttrName.trim() || !variant.tempAttrValue.trim()}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {variant.isAddingAttr ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {variants.length === 0 && <p className="text-sm text-slate-500 italic">No variants added. A product should typically have at least one variant.</p>}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 sticky bottom-6 bg-slate-50/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm z-10">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Complete Product
          </button>
        </div>
      </form>
    </div>
  )
}
