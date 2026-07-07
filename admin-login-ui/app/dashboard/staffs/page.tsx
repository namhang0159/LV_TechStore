'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Edit, Trash2, Plus, X, Shield, ShieldCheck } from 'lucide-react'
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '@/util/api'

export default function StaffsPage() {
  const [staffs, setStaffs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStaffId, setCurrentStaffId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    position: 'consultant'
  })

  const POSITION_MAP: Record<string, string> = {
    owner: 'Chủ cửa hàng',
    manager: 'Quản lý cửa hàng',
    consultant: 'Tư vấn bán hàng',
    cashier: 'Thu ngân',
    warehouse: 'Nhân viên kho',
    shipping: 'Giao hàng',
    technician: 'Kỹ thuật/Bảo hành',
    content: 'Content/Marketing',
    customer_service: 'Chăm sóc khách hàng'
  }

  useEffect(() => {
    fetchStaffs()
  }, [])

  const fetchStaffs = async () => {
    setIsLoading(true)
    try {
      const res = await getAllAdmins()
      if (res.data?.success && res.data?.data) {
        setStaffs(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch staffs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (staff?: any) => {
    if (staff) {
      setIsEditing(true)
      setCurrentStaffId(staff.id)
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        phone: staff.phone || '',
        password: '',
        role: staff.role || 'staff',
        position: staff.position || 'consultant'
      })
    } else {
      setIsEditing(false)
      setCurrentStaffId(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        phone: '',
        password: '',
        role: 'staff',
        position: 'consultant'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ name: '', email: '', phone: '', password: '', role: 'staff', position: 'consultant' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        position: formData.position
      }
      if (formData.password) {
        payload.password = formData.password
      }
      
      if (isEditing && currentStaffId) {
        await updateAdmin(currentStaffId, payload)
      } else {
        await createAdmin(payload)
      }
      handleCloseModal()
      fetchStaffs()
    } catch (error) {
      console.error('Failed to save staff:', error)
      alert('Error saving staff account')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff account?')) {
      try {
        await deleteAdmin(id)
        fetchStaffs()
      } catch (error) {
        console.error('Failed to delete staff:', error)
      }
    }
  }

  const filteredStaffs = staffs.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery)
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const getInitial = (name: string) => {
    if (!name) return 'S'
    return name.charAt(0).toUpperCase()
  }

  const getBgColor = (id: number) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'
    ]
    return colors[(id || 0) % colors.length]
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage administrators and staff members.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
          >
            <Plus className="size-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[calc(100vh-15rem)]">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name, email, phone..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            Total: {filteredStaffs.length} Staffs
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin size-6 mr-2" /> Loading staffs...
            </div>
          ) : filteredStaffs.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 font-medium">Staff</th>
                  <th className="py-4 px-6 font-medium">Contact</th>
                  <th className="py-4 px-6 font-medium text-center">Role & Position</th>
                  <th className="py-4 px-6 font-medium">Joined</th>
                  <th className="py-4 px-6 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${getBgColor(staff.id)} flex items-center justify-center text-white font-bold shadow-sm`}>
                          {getInitial(staff.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 line-clamp-1">{staff.name}</span>
                          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">ID: #{staff.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-700 font-medium">{staff.phone || 'N/A'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{staff.email}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          staff.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {staff.role === 'admin' ? <ShieldCheck className="size-3" /> : <Shield className="size-3" />}
                          {staff.role}
                        </div>
                        {staff.position && (
                          <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {POSITION_MAP[staff.position] || staff.position}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {formatDate(staff.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(staff)}
                          className="flex items-center justify-center size-8 bg-white text-blue-600 rounded-full shadow-sm border border-slate-200 hover:bg-blue-50 transition-colors tooltip"
                          title="Edit Staff"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(staff.id)}
                          className="flex items-center justify-center size-8 bg-white text-red-600 rounded-full shadow-sm border border-slate-200 hover:bg-red-50 transition-colors tooltip"
                          title="Delete Staff"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Search className="size-12 mb-3 text-slate-300" />
              <p>No staffs found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Staff' : 'Add New Staff'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0123456789"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                  <select 
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {Object.entries(POSITION_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {isEditing && <span className="text-xs text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input 
                  type="password" 
                  required={!isEditing}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
