import { Bell, User } from 'lucide-react'

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ระบบบริหารจัดการทรัพยากรบุคคล</h2>
          <p className="text-sm text-gray-500 mt-1">CDS HR Management System</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">Admin</p>
              <p className="text-gray-500 text-xs">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
