'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, ClipboardList, ShoppingCart, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { getAllStaffTasksAdmin, getStaffTasks, updateTaskStatus } from '@/util/api'
import Link from 'next/link'

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [taskToView, setTaskToView] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<string>('staff')
  const [isRoleLoaded, setIsRoleLoaded] = useState(false)
  
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role) setRole(user.role)
      } catch (e) { }
    }
    setIsRoleLoaded(true)
  }, [])

  useEffect(() => {
    if (isRoleLoaded && id) {
      fetchTask()
    }
  }, [role, isRoleLoaded, id])

  const fetchTask = async () => {
    setIsLoading(true)
    try {
      let res;
      if (role === 'admin') {
        res = await getAllStaffTasksAdmin()
      } else {
        res = await getStaffTasks()
      }
      
      if (res?.data?.success && res.data.data) {
        const task = res.data.data.find((t: any) => t.id.toString() === id)
        if (task) {
          setTaskToView(task)
          setStatus(task.status || 'pending')
          setPaymentStatus(task.Order?.payment_status || '')
        }
      }
    } catch (error) {
      console.error('Failed to fetch task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!taskToView) return
    setIsSaving(true)
    try {
      await updateTaskStatus(taskToView.id, status, paymentStatus)
      alert('Status updated successfully!')
      fetchTask()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Error updating status')
    } finally {
      setIsSaving(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="animate-spin size-6 mr-2" /> Loading task details...
      </div>
    )
  }

  if (!taskToView) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-4">
        <p>Task not found.</p>
        <Link href="/dashboard/tasks" className="text-blue-600 hover:underline">
          Back to Tasks
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tasks" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="size-6 text-blue-600" />
            Task Details #{taskToView.id}
          </h1>
          <p className="text-slate-500 text-sm mt-1">View and update task status.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Update Status Section */}
          <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">Update Status</h4>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {taskToView.order_id && (
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">(No change)</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              )}
              
              <button
                onClick={handleUpdateStatus}
                disabled={isSaving}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                Save Changes
              </button>
            </div>
          </div>

          {/* Task Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-lg border border-slate-100 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Type</p>
                <p className="font-medium capitalize text-slate-900">{taskToView.task_type}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Current Status</p>
                <div>{getStatusBadge(taskToView.status)}</div>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500 mb-1">Assigned Staff</p>
                {taskToView.Admin ? (
                  <p className="font-medium text-slate-900">{taskToView.Admin.name} <span className="text-slate-500 font-normal">({taskToView.Admin.email})</span></p>
                ) : (
                  <p className="font-medium text-slate-900">Staff #{taskToView.staff_id}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500 mb-1">Notes</p>
                <p className="text-slate-900 bg-white p-4 rounded border border-slate-200 min-h-[80px] whitespace-pre-wrap">{taskToView.note || 'No additional notes.'}</p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          {taskToView.Order ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <ShoppingCart className="size-4" /> Order Details
              </h4>
              <div className="space-y-4 bg-slate-50 p-5 rounded-lg border border-slate-100 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-500 mb-1">Order Code</p>
                    <p className="font-bold text-blue-700">{taskToView.Order.order_code || `#${taskToView.order_id}`}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Order Status</p>
                    <p className="font-medium text-slate-900 capitalize">{taskToView.Order.order_status}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Final Amount</p>
                    <p className="font-bold text-emerald-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taskToView.Order.final_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Payment Method</p>
                    <p className="font-medium text-slate-900 capitalize">{taskToView.Order.payment_method}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 mb-1">Current Payment Status</p>
                    {taskToView.Order.payment_status?.toLowerCase() === 'paid' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Paid (No collection needed)</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">Unpaid (Needs collection)</span>
                    )}
                  </div>
                </div>

                {(() => {
                  const rawAddress = taskToView.Order.shipping_address_json;
                  if (!rawAddress) return null;

                  let address = rawAddress;
                  if (typeof rawAddress === 'string') {
                    try {
                      address = JSON.parse(rawAddress);
                    } catch (e) {
                      return null;
                    }
                  }

                  return (
                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <p className="text-slate-500 mb-2">Shipping Address</p>
                      <div className="bg-white p-4 rounded border border-slate-200 text-slate-700 shadow-sm">
                        <p className="font-semibold text-slate-900 text-base">{address.name}</p>
                        <p className="text-slate-600 mt-1">{address.phone}</p>
                        <p className="mt-2 text-slate-800">{address.address}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : taskToView.order_id ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Order Details</h4>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 text-sm">
                <p className="text-slate-500">Order ID: <span className="font-medium text-slate-900">#{taskToView.order_id}</span></p>
                <p className="text-xs text-slate-400 mt-1">Detailed order data is not available.</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
