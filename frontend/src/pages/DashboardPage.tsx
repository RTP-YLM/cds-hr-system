import { useState, useEffect } from 'react'
import { Users, Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { useAttendance } from '@/hooks/useAttendance'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'

export const DashboardPage = () => {
  const { employees } = useEmployees()
  const { attendances, fetchAttendances } = useAttendance()

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    dailyEmployees: 0,
    monthlyEmployees: 0,
  })

  useEffect(() => {
    fetchAttendances({
      date: new Date().toISOString().split('T')[0]
    })
  }, [])

  useEffect(() => {
    if (employees.length > 0) {
      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status !== 'resigned').length,
        dailyEmployees: employees.filter(e => e.employment_type === 'daily').length,
        monthlyEmployees: employees.filter(e => e.employment_type === 'monthly').length,
      })
    }
  }, [employees])

  const todayAttendances = attendances.filter(a =>
    a.date === new Date().toISOString().split('T')[0]
  )

  const lateToday = todayAttendances.filter(a => a.late_minutes > 0).length
  const leaveToday = todayAttendances.filter(a => a.is_leave).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1">ภาพรวมระบบ HR - {formatDate(new Date().toISOString())}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">พนักงานทั้งหมด</p>
                <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
                <p className="text-xs text-gray-400 mt-1">คน</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">เข้างานวันนี้</p>
                <p className="text-3xl font-bold mt-2 text-green-600">
                  {todayAttendances.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">คน</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">สายวันนี้</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{lateToday}</p>
                <p className="text-xs text-gray-400 mt-1">คน</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingUp size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ลาวันนี้</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">{leaveToday}</p>
                <p className="text-xs text-gray-400 mt-1">คน</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>สถิติพนักงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">พนักงานประจำ</span>
                <span className="text-xl font-bold text-green-600">
                  {employees.filter(e => e.status === 'permanent').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">ทดลองงาน</span>
                <span className="text-xl font-bold text-yellow-600">
                  {employees.filter(e => e.status === 'probation').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">พนักงานรายวัน</span>
                <span className="text-xl font-bold text-blue-600">{stats.dailyEmployees}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">พนักงานรายเดือน</span>
                <span className="text-xl font-bold text-purple-600">{stats.monthlyEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การเข้างานวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ยังไม่มีการบันทึกเวลาวันนี้
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayAttendances.slice(0, 5).map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {att.first_name} {att.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{att.position_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {att.check_in_time?.substring(0, 5) || '-'}
                      </p>
                      {att.late_minutes > 0 && (
                        <span className="text-xs text-red-600">สาย {att.late_minutes} นาที</span>
                      )}
                      {att.is_leave && (
                        <span className="text-xs text-yellow-600">{att.leave_type}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card>
        <CardHeader>
          <CardTitle>พนักงานที่เข้ามาใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่บรรจุ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">เงินเดือน</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.slice(0, 5).map((emp) => (
                  <tr key={emp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {emp.prefix} {emp.first_name} {emp.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {emp.position_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(emp.hired_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(emp.base_salary_or_wage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
