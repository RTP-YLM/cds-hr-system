import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, UserPlus, Users, Save, Trash2, Info } from 'lucide-react'
import { useAttendance } from '@/hooks/useAttendance'
import { useEmployees } from '@/hooks/useEmployees'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatTime, cn } from '@/lib/utils'

interface BatchItem {
  employee_id: number;
  employee_name: string;
  position_name: string;
  check_in_time: string;
  check_out_time: string;
  ot_hours: number;
  is_leave: boolean;
  leave_type: string;
  notes: string;
  default_start?: string;
}

export const AttendancePage = () => {
  const { attendances, loading, error, createBatchAttendance, fetchAttendances } = useAttendance()
  const { employees } = useEmployees()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [showBatchForm, setShowBatchForm] = useState(false)

  // Initialize batch items with all active employees if requested
  const handleAddAllEmployees = () => {
    const newItems: BatchItem[] = employees.map(emp => {
      // ค้นหาว่าพนักงานคนนี้มีบันทึกของวันนี้อยู่ในระบบแล้วหรือยัง
      const existing = attendances.find(a => a.employee_id === emp.id)

      return {
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        position_name: emp.position_name || '',
        // ถ้ามีข้อมูลที่ลงไว้แล้ว ให้เอาอันนั้นมาโชว์ ถ้าไม่มีค่อยใช้เวลาขอบแต่ละคน
        check_in_time: existing ? (existing.check_in_time?.substring(0, 5) || '') : (emp.work_start_time?.substring(0, 5) || '08:00'),
        check_out_time: existing ? (existing.check_out_time?.substring(0, 5) || '') : (emp.work_end_time?.substring(0, 5) || '17:00'),
        ot_hours: existing ? Number(existing.ot_hours) : 0,
        is_leave: existing ? existing.is_leave : false,
        leave_type: existing ? (existing.leave_type || 'ลาป่วย') : 'ลาป่วย',
        notes: existing ? (existing.notes || '') : '',
        default_start: emp.work_start_time?.substring(0, 5)
      }
    })
    setBatchItems(newItems)
    setShowBatchForm(true)
  }

  const handleAddEmployee = (empId: number) => {
    if (batchItems.find(item => item.employee_id === empId)) {
      alert('พนักงานคนนี้อยู่ในรายการแล้ว')
      return
    }

    const emp = employees.find(e => e.id === empId)
    const existing = attendances.find(a => a.employee_id === empId)

    if (emp) {
      const newItem: BatchItem = {
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        position_name: emp.position_name || '',
        check_in_time: existing ? (existing.check_in_time?.substring(0, 5) || '') : (emp.work_start_time?.substring(0, 5) || '08:00'),
        check_out_time: existing ? (existing.check_out_time?.substring(0, 5) || '') : (emp.work_end_time?.substring(0, 5) || '17:00'),
        ot_hours: existing ? Number(existing.ot_hours) : 0,
        is_leave: existing ? existing.is_leave : false,
        leave_type: existing ? (existing.leave_type || 'ลาป่วย') : 'ลาป่วย',
        notes: existing ? (existing.notes || '') : '',
        default_start: emp.work_start_time?.substring(0, 5)
      }
      setBatchItems(prev => [...prev, newItem])
      setShowBatchForm(true)
    }
  }

  const handleRemoveItem = (empId: number) => {
    setBatchItems(prev => prev.filter(item => item.employee_id !== empId))
  }

  const handleUpdateItem = (empId: number, field: keyof BatchItem, value: any) => {
    setBatchItems(prev => prev.map(item => {
      if (item.employee_id === empId) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleSubmitBatch = async () => {
    if (batchItems.length === 0) {
      alert('กรุณาเพิ่มพนักงานอย่างน้อย 1 คน')
      return
    }

    const data = {
      date: selectedDate,
      items: batchItems.map(item => ({
        employee_id: item.employee_id,
        check_in_time: item.is_leave ? null : item.check_in_time,
        check_out_time: item.is_leave ? null : item.check_out_time,
        ot_hours: item.ot_hours,
        is_leave: item.is_leave,
        leave_type: item.is_leave ? item.leave_type : null,
        notes: item.notes || ''
      }))
    }

    const result = await createBatchAttendance(data)
    if (result) {
      alert('บันทึกข้อมูลสำเร็จ')
      setBatchItems([])
      setShowBatchForm(false)
      fetchAttendances({ date: selectedDate })
    }
  }

  useEffect(() => {
    fetchAttendances({ date: selectedDate })
  }, [selectedDate])

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ระบบบันทึกเวลา</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Users size={16} /> พนักงานทั้งหมด: {employees.length} คน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <Calendar size={18} className="text-blue-600 ml-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700"
            />
          </div>

          <Button variant="primary" onClick={handleAddAllEmployees} className="shadow-blue-100 shadow-lg">
            <UserPlus size={18} className="mr-2" />
            บันทึกหมู่ทั้งหมด
          </Button>

          <div className="relative group">
            <Select
              className="min-w-[200px]"
              value={0}
              onChange={(e) => handleAddEmployee(Number(e.target.value))}
              options={[
                { value: 0, label: '+ เพิ่มพนักงานรายคน' },
                ...employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.first_name} ${emp.last_name}`
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Batch Form Card */}
      {showBatchForm && batchItems.length > 0 && (
        <Card className="border-2 border-blue-500 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-blue-600 text-white flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Save size={20} />
              <CardTitle className="text-white text-lg font-bold">บันทึกเวลารายกลุ่ม - วันที่ {formatDate(selectedDate)}</CardTitle>
            </div>
            <div className="text-xs bg-blue-500 px-3 py-1 rounded-full text-blue-50">
              จำนวน {batchItems.length} คน
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-blue-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">พนักงาน</th>
                    <th className="px-4 py-3 text-center font-bold">สถานะ</th>
                    <th className="px-4 py-3 text-center font-bold">เวลาเข้า</th>
                    <th className="px-4 py-3 text-center font-bold">เวลาออก</th>
                    <th className="px-4 py-3 text-center font-bold">OT (ชม.)</th>
                    <th className="px-4 py-3 text-left font-bold">หมายเหตุ</th>
                    <th className="px-4 py-3 text-center font-bold">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batchItems.map((item) => (
                    <tr key={item.employee_id} className={cn("hover:bg-blue-50/30 transition-colors", item.is_leave && "bg-orange-50/50")}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{item.employee_name}</div>
                        <div className="text-xs text-gray-500">{item.position_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.is_leave}
                              onChange={(e) => handleUpdateItem(item.employee_id, 'is_leave', e.target.checked)}
                              className="rounded text-blue-600"
                            />
                            <span className={cn("font-medium", item.is_leave ? "text-orange-600" : "text-gray-600")}>ลางาน</span>
                          </label>
                          {item.is_leave && (
                            <select
                              value={item.leave_type}
                              onChange={(e) => handleUpdateItem(item.employee_id, 'leave_type', e.target.value)}
                              className="text-xs border border-gray-200 rounded p-1 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="ลาป่วย">ลาป่วย</option>
                              <option value="ลากิจ">ลากิจ</option>
                              <option value="ลาพักร้อน">ลาพักร้อน</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="time"
                          disabled={item.is_leave}
                          value={item.check_in_time}
                          onChange={(e) => handleUpdateItem(item.employee_id, 'check_in_time', e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="time"
                          disabled={item.is_leave}
                          value={item.check_out_time}
                          onChange={(e) => handleUpdateItem(item.employee_id, 'check_out_time', e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={item.ot_hours}
                          onChange={(e) => handleUpdateItem(item.employee_id, 'ot_hours', Number(e.target.value))}
                          className="w-16 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 italic text-gray-400">
                        <input
                          type="text"
                          placeholder="บันทึกเพิ่มเติม..."
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(item.employee_id, 'notes', e.target.value)}
                          className="w-full bg-transparent border-b border-gray-100 focus:border-blue-300 focus:outline-none transition-all py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.employee_id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <Info size={16} />
                <span className="text-xs font-medium">กดปุ่ม "บันทึกข้อมูลทั้งหมด" ด้านล่างเพื่อยืนยันรายการ</span>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setBatchItems([]); setShowBatchForm(false); }}>
                  ยกเลิกทั้งหมด
                </Button>
                <Button variant="primary" onClick={handleSubmitBatch} disabled={loading} className="px-8 shadow-md">
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List Header */}
      <div className="flex items-center gap-2 mt-8">
        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-800">รายการบันทึกของวันที่ {formatDate(selectedDate)}</h2>
      </div>

      {/* Attendance List */}
      {!loading && !error && (
        <Card className="overflow-hidden border-none shadow-sm bg-white/80">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">พนักงาน</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">เวลาเข้า</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">เวลาออก</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">OT (ชม.)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">สาย (นาที)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">รายได้วัน</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Users size={48} />
                        <p className="text-sm font-medium">ยังไม่มีข้อมูลการบันทึกเวลาในวันนี้</p>
                        <p className="text-xs text-gray-400">เลือก "บันทึกหมู่ทั้งหมด" ด้านบนเพื่อเริ่มรายการ</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {att.first_name} {att.last_name}
                        </div>
                        <div className="text-xs text-gray-400">{att.position_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          {formatTime(att.check_in_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          {formatTime(att.check_out_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {att.ot_hours > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                            +{att.ot_hours} ชม.
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {att.late_minutes > 0 ? (
                          <span className="text-red-500 font-bold text-sm">{att.late_minutes} น.</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {att.is_leave ? (
                          <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-orange-100 text-orange-700">
                            {att.leave_type}
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-green-100 text-green-700">
                            ทำงานปกติ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-extrabold text-blue-600">
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
