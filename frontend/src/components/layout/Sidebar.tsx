import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Clock, DollarSign, Settings } from 'lucide-react'

const menuItems = [
  { path: '/dashboard', label: 'หน้าหลัก', icon: Home },
  { path: '/employees', label: 'จัดการพนักงาน', icon: Users },
  { path: '/attendance', label: 'บันทึกเวลา', icon: Clock },
  { path: '/payroll', label: 'คำนวณเงินเดือน', icon: DollarSign },
  { path: '/settings', label: 'ตั้งค่า', icon: Settings },
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-900 min-h-screen text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">CDS HR</h1>
        <p className="text-sm text-gray-400 mt-1">ระบบ HR</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>Version 1.0.0</p>
        <p className="text-xs mt-1">© 2024 CDS</p>
      </div>
    </div>
  )
}
