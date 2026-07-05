'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Tags,
  FolderTree,
  Users,
  BarChart3,
  TicketPercent,
  HelpCircle,
  BellRing,
  User,
  Settings,
  FileText,
  Star,
  Image as ImageIcon,
  Activity,
  Network,
  Warehouse,
  Headset,
  UserCog,
  ShieldCheck,
  ClipboardList,
  Truck
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Orders', icon: ShoppingCart, href: '/dashboard/orders', badge: '16' },
  { name: 'Products', icon: Tags, href: '/dashboard/products' },
  { name: 'Inventory', icon: Warehouse, href: '/dashboard/inventory' },
  { name: 'Suppliers', icon: Truck, href: '/dashboard/suppliers' },
  { name: 'Consulting', icon: Headset, href: '/dashboard/consulting' },
  { name: 'Categories', icon: FolderTree, href: '/dashboard/categories' },
  { name: 'Customers', icon: Users, href: '/dashboard/customers' },
  { name: 'Staffs', icon: UserCog, href: '/dashboard/staffs' },
  { name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
  { name: 'Coupons', icon: TicketPercent, href: '/dashboard/coupons' },
  { name: 'Blog', icon: FileText, href: '/dashboard/blog' },
  { name: 'Reviews', icon: Star, href: '/dashboard/reviews' },
  { name: 'Banners', icon: ImageIcon, href: '/dashboard/banners' },
  { name: 'Warranties', icon: ShieldCheck, href: '/dashboard/warranties' },
  { name: 'Tasks', icon: ClipboardList, href: '/dashboard/tasks' },
  { name: 'Behavior Analysis', icon: Activity, href: '/dashboard/behavioral-analysis' },
  { name: 'Clustering', icon: Network, href: '/dashboard/customer-clustering' },
]

const otherItems = [
  { name: 'Knowledge Base', icon: HelpCircle, href: '/dashboard/knowledge' },
  { name: 'Product Updates', icon: BellRing, href: '/dashboard/updates' },
]

const settingsItems = [
  { name: 'Personal Settings', icon: User, href: '/dashboard/settings/personal' },
  { name: 'Global Settings', icon: Settings, href: '/dashboard/settings/global' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('admin')
  const [position, setPosition] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role) setRole(user.role)
        if (user.position) setPosition(user.position)
      } catch (e) {}
    }
  }, [])

  const getPositionMenus = (pos: string | null) => {
    switch (pos) {
      case 'consultant':
        return ['Tasks', 'Consulting']
      case 'cashier':
        return ['Tasks', 'Orders', 'Consulting']
      case 'warehouse':
        return ['Tasks', 'Inventory', 'Suppliers']
      case 'shipping':
        return ['Tasks', 'Orders']
      case 'technician':
        return ['Tasks', 'Warranties', 'Consulting']
      case 'content':
        return ['Tasks', 'Blog', 'Banners']
      case 'customer_service':
        return ['Tasks', 'Reviews', 'Consulting']
      case 'manager':
        return ['Dashboard', 'Orders', 'Products', 'Inventory', 'Consulting', 'Tasks', 'Reports', 'Warranties']
      case 'owner':
        return menuItems.map(m => m.name)
      default:
        return ['Tasks', 'Orders', 'Inventory', 'Consulting', 'Blog', 'Warranties']
    }
  }

  const allowedStaffMenus = getPositionMenus(position)

  const filteredMenuItems = menuItems.filter(item => 
    role === 'admin' || allowedStaffMenus.includes(item.name)
  )

  const filteredOtherItems = role === 'admin' ? otherItems : []
  const filteredSettingsItems = role === 'admin' ? settingsItems : []

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    return (
      <Link
        href={item.href}
        className={`flex items-center justify-between px-6 py-3 text-sm transition-colors ${
          isActive
            ? 'bg-white text-slate-900 font-medium rounded-r-full mr-4'
            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`size-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
          {item.name}
        </div>
        {item.badge && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-[#1e2235] pt-0">
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-2 px-6 bg-[#171a2b]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <ShoppingCart className="size-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-wide">RIU</span>
      </div>

      <div className="h-[calc(100vh-4rem)] overflow-y-auto py-6 custom-scrollbar">
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {filteredOtherItems.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Other Information
            </h3>
            <nav className="space-y-1">
              {filteredOtherItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        )}

        {filteredSettingsItems.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Settings
            </h3>
            <nav className="space-y-1">
              {filteredSettingsItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        )}
      </div>
    </aside>
  )
}
