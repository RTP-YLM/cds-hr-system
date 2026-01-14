import { useState } from 'react'
import { Plus, Calendar, Clock } from 'lucide-react'
import { useAttendance } from '@/hooks/useAttendance'
import { useEmployees } from '@/hooks/useEmployees'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export const AttendancePage = () => {
  const { attendances, loading, error, createAttendance, fetchAttendances } = useAttendance()
  const { employees } = useEmployees()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    ot_hours: 0,
    is_leave: false,
    leave_type: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employee_id || formData.employee_id === 0) {
      alert('กรุณาเลือกพนักงาน')
      return
    }

    // Convert string values to numbers
    const submitData = {
      ...formData,
      employee_id: Number(formData.employee_id),
      ot_hours: Number(formData.ot_hours)
    }

    const result = await createAttendance(submitData)
    if (result) {
      alert('บันทึกเวลาสำเร็จ')
      setShowForm(false)
      setFormData({
        employee_id: 0,
        date: new Date().toISOString().split('T')[0],
        check_in_time: '',
        check_out_time: '',
        ot_hours: 0,
        is_leave: false,
        leave_type: '',
        notes: '',
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">บันทึกเวลาเข้า-ออกงาน</h1>
          <p className="text-gray-500 mt-1">จำนวนบันทึกทั้งหมด: {attendances.length} รายการ</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          บันทึกเวลาใหม่
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>บันทึกเวลาเข้า-ออกงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="เลือกพนักงาน *"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  options={employees.map(emp => ({
                    value: emp.id,
                    label: `${emp.first_name} ${emp.last_name} (${emp.position_name}) - ${emp.work_start_time?.substring(0, 5) || '08:00'}-${emp.work_end_time?.substring(0, 5) || '17:00'}`
                  }))}
                />
                <Input
                  label="วันที่ *"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="เวลาเข้างาน"
                  name="check_in_time"
                  type="time"
                  value={formData.check_in_time}
                  onChange={handleChange}
                />
                <Input
                  label="เวลาออกงาน"
                  name="check_out_time"
                  type="time"
                  value={formData.check_out_time}
                  onChange={handleChange}
                />
                <Input
                  label="OT (ชั่วโมง)"
                  name="ot_hours"
                  type="number"
                  step="0.5"
                  value={formData.ot_hours}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_leave"
                    checked={formData.is_leave}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">ลางาน</label>
                </div>
                {formData.is_leave && (
                  <Select
                    label="ประเภทการลา"
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    options={[
                      { value: 'ลาป่วย', label: 'ลาป่วย (ไม่หักเงิน)' },
                      { value: 'ลากิจ', label: 'ลากิจ (หักเต็ม)' },
                      { value: 'ลาพักร้อน', label: 'ลาพักร้อน (ไม่หักเงิน)' },
                    ]}
                  />
                )}
              </div>

              <div>
                <Input
                  label="หมายเหตุ"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && !showForm && (
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

      {/* Attendance List */}
      {!loading && !error && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">พนักงาน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลาเข้า</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลาออก</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT (ชม.)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สาย (นาที)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">เงิน</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      ยังไม่มีข้อมูลการบันทึกเวลา
                    </td>
                  </tr>
                ) : (
                  attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(att.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {att.first_name} {att.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{att.position_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-green-500" />
                          {formatTime(att.check_in_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-red-500" />
                          {formatTime(att.check_out_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {att.ot_hours > 0 ? (
                          <span className="text-blue-600 font-medium">{att.ot_hours}</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {att.late_minutes > 0 ? (
                          <span className="text-red-600 font-medium">{att.late_minutes}</span>
                        ) : (
                          <span className="text-green-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {att.is_leave ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {att.leave_type}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            เข้างาน
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(att.calculated_wage_daily)}
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
