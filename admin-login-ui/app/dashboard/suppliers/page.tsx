'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, X, Truck, Phone } from 'lucide-react'
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/util/api'

interface Supplier {
  id: number
  name: string
  contact: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSuppliers = async () => {
    setIsLoading(true)
    try {
      const res = await getAllSuppliers()
      if (res.data && res.data.success && res.data.data) {
        setSuppliers(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setFormData({ name: '', contact: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (supplier: Supplier) => {
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name,
      contact: supplier.contact
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateSupplier(editingId, formData)
      } else {
        await createSupplier(formData)
      }
      closeModal()
      fetchSuppliers()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Action failed. Check console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return
    try {
      await deleteSupplier(id)
      fetchSuppliers()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product suppliers and vendors</p>
        </div>
        <button 
          onClick={openAddModal}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="size-4" />
          Add Supplier
        </button>
      </div>

      {/* List Area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-500">Loading suppliers...</div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
          <Truck className="size-12 mb-3 text-slate-300" />
          <p>No suppliers found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">#{supplier.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-slate-400" />
                      {supplier.contact}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(supplier)}
                      className="text-blue-600 hover:text-blue-900 mx-2 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-900 mx-2 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Supplier Name *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Apple Inc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">
                  Contact Information *
                </label>
                <input 
                  type="text" 
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="e.g. +1-800-123-4567 or contact@supplier.com"
                  required
                />
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
                  {isSubmitting ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
