'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAllProducts, createInventoryTransaction, getAllSuppliers } from '@/util/api'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  warehouseId: string
}

export function TransactionModal({ isOpen, onClose, onSuccess, warehouseId }: TransactionModalProps) {
  const [type, setType] = useState<'IN' | 'OUT'>('IN')
  const [referenceType, setReferenceType] = useState('PO')
  const [referenceId, setReferenceId] = useState('')
  const [note, setNote] = useState('')
  
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  
  const [items, setItems] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      fetchSuppliers()
      // Reset form
      setItems([{ variant_id: '', quantity: 1, unit_cost: 0, serials: '' }])
      setReferenceId('')
      setReferenceType('PO')
      setNote('')
    }
  }, [isOpen])

  const fetchSuppliers = async () => {
    try {
      const res = await getAllSuppliers()
      if (res.data?.success && res.data?.data) {
        setSuppliers(res.data.data)
      } else if (Array.isArray(res.data)) {
        setSuppliers(res.data)
      } else if (res.data?.data) {
        setSuppliers(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers', error)
    }
  }

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const res = await getAllProducts()
      if (res.data?.data) {
        setProducts(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { variant_id: '', quantity: 1, unit_cost: 0, serials: '' }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async () => {
    // Validate
    if (!warehouseId) {
      alert("Warehouse ID is missing")
      return
    }
    
    // Format items
    const formattedItems = items.map(item => {
      // Split serials string into array, ignore empty strings
      const serialsArray = item.serials 
        ? item.serials.split('\n').map((s: string) => s.trim()).filter((s: string) => s) 
        : []
        
      return {
        variant_id: parseInt(item.variant_id),
        quantity: parseInt(item.quantity),
        unit_cost: parseFloat(item.unit_cost) || 0,
        serials: serialsArray
      }
    }).filter(item => item.variant_id && item.quantity > 0)

    if (formattedItems.length === 0) {
      alert("Please add at least one valid item")
      return
    }

    // Validate serials length matches quantity
    for (const item of formattedItems) {
      if (item.serials.length > 0 && item.serials.length !== item.quantity) {
        alert(`Quantity mismatch for variant ${item.variant_id}. You entered ${item.quantity} quantity but ${item.serials.length} serial numbers.`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload = {
        warehouse_id: parseInt(warehouseId),
        transaction_type: type,
        reference_type: referenceType,
        reference_id: referenceId ? parseInt(referenceId) : null,
        note,
        items: formattedItems
      }
      
      const res = await createInventoryTransaction(payload)
      if (res.data?.success) {
        alert("Transaction completed successfully")
        onSuccess()
        onClose()
      } else {
        alert(res.data?.message || "Failed to create transaction")
      }
    } catch (error: any) {
      console.error(error)
      alert(error.response?.data?.message || error.message || "Failed to create transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get all variants mapped nicely for dropdown
  const variantOptions = products.flatMap(p => 
    (p.ProductVariants || []).map((v: any) => ({
      id: v.id.toString(),
      name: `${p.name} - ${v.sku}`
    }))
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === 'IN' ? 'Receive Stock (Nhập Kho)' : 'Issue Stock (Xuất Kho)'}</DialogTitle>
          <DialogDescription>
            Create a new inventory transaction for this warehouse.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={type} onValueChange={(val: 'IN' | 'OUT') => setType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Import (Nhập hàng)</SelectItem>
                  <SelectItem value="OUT">Export (Xuất hàng)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Reference Type</Label>
              <Select value={referenceType} onValueChange={setReferenceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PO">Purchase Order (PO)</SelectItem>
                  <SelectItem value="SUPPLIER">Supplier (SUPPLIER)</SelectItem>
                  <SelectItem value="ORDER">Customer Order (ORDER)</SelectItem>
                  <SelectItem value="RETURN">Customer Return (RETURN)</SelectItem>
                  <SelectItem value="TRANSFER">Warehouse Transfer (TRANSFER)</SelectItem>
                  <SelectItem value="OTHER">Other (OTHER)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {referenceType === 'SUPPLIER' ? (
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={referenceId} onValueChange={setReferenceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Reference ID (Optional)</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. 123" 
                  value={referenceId} 
                  onChange={e => setReferenceId(e.target.value)} 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Note / Reason</Label>
              <Input 
                placeholder="Additional notes" 
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-semibold">Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="size-4 mr-2" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg bg-slate-50 relative">
                  {items.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Product Variant</Label>
                      <Select 
                        value={item.variant_id} 
                        onValueChange={(val) => handleItemChange(index, 'variant_id', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingProducts ? "Loading..." : "Select product variant"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {variantOptions.map((opt: any) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {type === 'IN' && (
                      <div className="space-y-2">
                        <Label>Unit Cost (VNĐ)</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          value={item.unit_cost} 
                          onChange={e => handleItemChange(index, 'unit_cost', e.target.value)} 
                        />
                      </div>
                    )}
                    <div className={`space-y-2 ${type === 'OUT' ? 'md:col-span-2' : ''}`}>
                      <Label>Serial Numbers (IMEI) - One per line</Label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Scan or type serial numbers here...&#10;SN123456&#10;SN123457"
                        value={item.serials}
                        onChange={e => handleItemChange(index, 'serials', e.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        Leave empty if product does not use serial numbers. Number of lines must match Quantity.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</> : 'Submit Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
