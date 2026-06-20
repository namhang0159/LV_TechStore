'use client'

import { Search, MessageSquare, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAdmin } from '@/util/api'

export default function Header() {
  const router = useRouter()
  const [adminName, setAdminName] = useState('Loading...')
  const [adminInitial, setAdminInitial] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/')
          return
        }

        const response = await fetchAdmin()
        const data = response.data

        if (data.success && data.data) {
          setAdminName(data.data.name)
          setAdminInitial(data.data.name.charAt(0).toUpperCase())
        } else {
          // If token is invalid or expired, clear and redirect
          localStorage.removeItem('token')
          localStorage.removeItem('adminUser')
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to fetch admin details', error)
        // Optionally redirect on error if needed
        localStorage.removeItem('token')
        localStorage.removeItem('adminUser')
        router.push('/')
      }
    }

    loadAdminData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminUser')
    router.push('/')
  }

  return (
    <header className="fixed top-0 right-0 left-64 z-30 flex h-16 items-center justify-between bg-[#171a2b] px-6">
      {/* Search */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="size-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 bg-transparent py-1.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-400 focus:ring-0 sm:leading-6"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right side icons & Profile */}
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-white transition-colors">
          <MessageSquare className="size-5" />
        </button>
        
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            5
          </span>
        </button>

        <div className="relative">
          <div 
            className="flex items-center gap-3 pl-4 border-l border-slate-700 cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
              {adminInitial || 'A'}
            </div>
            <div className="hidden md:block text-sm">
              <span className="text-slate-300 group-hover:text-white transition-colors">{adminName}</span>
            </div>
            <ChevronDown className="size-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
