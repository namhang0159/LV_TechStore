'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Edit, Trash2, Plus, X, ClipboardList, CheckCircle2, Clock, AlertCircle, Eye, ShoppingCart } from 'lucide-react'
import { getAllStaffTasksAdmin, getStaffTasks, assignStaffTask, updateTaskStatus, deleteStaffTask, getAllAdmins } from '@/util/api'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [role, setRole] = useState<string>('staff')
  const [position, setPosition] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isRoleLoaded, setIsRoleLoaded] = useState(false)

  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isAssigning, setIsAssigning] = useState(true) // true for new task
  const [formData, setFormData] = useState({
    staff_id: '',
    order_id: '',
    task_type: 'shipping', // default
    note: '',
    status: 'pending'
  })

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role) setRole(user.role)
        if (user.position) setPosition(user.position)
        if (user.id) setCurrentUserId(user.id)
      } catch (e) { }
    }
    setIsRoleLoaded(true)
  }, [])

  useEffect(() => {
    if (isRoleLoaded) {
      if (role === 'admin' || position === 'manager') {
        fetchStaffs()
      }
      fetchTasks()
    }
  }, [role, position, isRoleLoaded])

  const fetchStaffs = async () => {
    try {
      const res = await getAllAdmins()
      if (res.data?.success && res.data?.data) {
        setStaffList(res.data.data.filter((u: any) => u.role === 'staff' || u.role === 'admin'))
      }
    } catch (error) {
      console.error('Failed to fetch staffs:', error)
    }
  }

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      if (role === 'admin' || position === 'manager') {
        const res = await getAllStaffTasksAdmin()
        if (res.data?.success && res.data?.data) {
          setTasks(res.data.data)
        }
      } else {
        const res = await getStaffTasks()
        if (res.data?.success && res.data?.data) {
          setTasks(res.data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenAssignModal = () => {
    setFormData({ staff_id: '', order_id: '', task_type: 'shipping', note: '', status: 'pending' })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.staff_id) return alert('Please select a staff member')
      const payload = {
        staff_id: parseInt(formData.staff_id),
        order_id: formData.order_id ? parseInt(formData.order_id) : null,
        task_type: formData.task_type,
        note: formData.note
      }
      await assignStaffTask(payload)
      handleCloseModal()
      fetchTasks()
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Error saving task')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteStaffTask(id)
        fetchTasks()
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const filteredTasks = tasks.filter(t => {
    const term = searchQuery.toLowerCase()
    return (
      (t.Admin?.name?.toLowerCase() || '').includes(term) ||
      (t.order_id?.toString() || '').includes(term) ||
      (t.task_type || '').toLowerCase().includes(term) ||
      (t.status || '').toLowerCase().includes(term)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="size-3" /> Completed</span>
      case 'in_progress':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200"><Clock className="size-3" /> In Progress</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200"><AlertCircle className="size-3" /> Pending</span>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track staff tasks.</p>
        </div>
        {(role === 'admin' || position === 'manager') && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAssignModal}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
            >
              <Plus className="size-4" />
              Assign Task
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[calc(100vh-15rem)]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total: {filteredTasks.length} Tasks
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <Loader2 className="animate-spin size-6 mr-2" /> Loading tasks...
            </div>
          ) : filteredTasks.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 font-medium">Task ID</th>
                  <th className="py-4 px-6 font-medium">Type</th>
                  {(role === 'admin' || position === 'manager') && <th className="py-4 px-6 font-medium">Assigned To</th>}
                  <th className="py-4 px-6 font-medium">Order ID</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Created</th>
                  <th className="py-4 px-6 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 font-medium text-slate-900">#{task.id}</td>
                    <td className="py-4 px-6 capitalize">{task.task_type}</td>
                    {(role === 'admin' || position === 'manager') && (
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{task.Admin?.name || `Staff #${task.staff_id}`}</div>
                        <div className="text-xs text-slate-500">{task.Admin?.email || ''}</div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      {task.order_id ? <span className="font-medium text-blue-600">#{task.order_id}</span> : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(task.status)}</td>
                    <td className="py-4 px-6 text-slate-600">{formatDate(task.created_at)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            router.push(`/dashboard/tasks/${task.id}`)
                          }}
                          className="flex items-center justify-center size-8 bg-white text-slate-600 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors tooltip"
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </button>
                        {(role === 'admin' || position === 'manager') && (
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="flex items-center justify-center size-8 bg-white text-red-600 rounded-full shadow-sm border border-slate-200 hover:bg-red-50 transition-colors tooltip"
                            title="Delete Task"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <ClipboardList className="size-12 mb-3 text-slate-300" />
              <p>No tasks found.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {isAssigning ? 'Assign New Task' : 'Update Task Status'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Staff</label>
                    <select
                      required
                      value={formData.staff_id}
                      onChange={e => setFormData({ ...formData, staff_id: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select a staff member...</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name} ({staff.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Task Type</label>
                    <select
                      value={formData.task_type}
                      onChange={e => setFormData({ ...formData, task_type: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="shipping">Shipping</option>
                      <option value="warranty">Warranty</option>
                      <option value="repair">Repair</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order ID (Optional)</label>
                    <input
                      type="number"
                      value={formData.order_id}
                      onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. 123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      value={formData.note}
                      onChange={e => setFormData({ ...formData, note: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Additional instructions..."
                    />
                  </div>
                </>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Update Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  {formData.order_id && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Update Order Payment Status</label>
                      <select
                        value={formData.payment_status}
                        onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">(No change)</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">Update this if cash is collected for a COD order.</p>
                    </div>
                  )}
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
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
