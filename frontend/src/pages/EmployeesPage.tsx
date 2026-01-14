import { useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatCurrency, translateEmployeeStatus, translateEmploymentType } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export const EmployeesPage = () => {
  const navigate = useNavigate()
  const { employees, loading, error, deleteEmployee } = useEmployees()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id_card_number.includes(searchTerm)
  )

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`ต้องการลบพนักงาน ${name} ใช่หรือไม่?`)) {
      const success = await deleteEmployee(id)
      if (success) {
        alert('ลบพนักงานสำเร็จ')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการพนักงาน</h1>
          <p className="text-gray-500 mt-1">จำนวนพนักงานทั้งหมด: {employees.length} คน</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/employees/new')}
        >
          <Plus size={20} className="mr-2" />
          เพิ่มพนักงานใหม่
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="ค้นหาชื่อพนักงานหรือเลขบัตรประชาชน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost">
            <Search size={20} className="mr-2" />
            ค้นหา
          </Button>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Employee List */}
      {!loading && !error && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขบัตรประชาชน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลาทำงาน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เงินเดือน/ค่าแรง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      ไม่พบข้อมูลพนักงาน
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{employee.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.prefix} {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.id_card_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {translateEmploymentType(employee.employment_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {employee.work_start_time?.substring(0, 5) || '08:00'} - {employee.work_end_time?.substring(0, 5) || '17:00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(employee.base_salary_or_wage)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          employee.status === 'permanent' ? 'bg-green-100 text-green-800' :
                          employee.status === 'probation' ? 'bg-yellow-100 text-yellow-800' :
                          employee.status === 'resigned' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {translateEmployeeStatus(employee.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/employees/edit/${employee.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id, `${employee.first_name} ${employee.last_name}`)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
