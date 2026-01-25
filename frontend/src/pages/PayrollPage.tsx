import { useState } from 'react'
import { Calculator, Download, Plus, Trash2 } from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { useAttendance } from '@/hooks/useAttendance'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'

export const PayrollPage = () => {
  const { employees } = useEmployees()
  const { getAttendanceByRange, loading } = useAttendance()
  const { showToast } = useToast()

  const [selectedEmployee, setSelectedEmployee] = useState<number>(0)

  // Default to current month range
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(lastDay)
  const [payrollData, setPayrollData] = useState<any>(null)

  // Custom adjustments state
  const [adjustments, setAdjustments] = useState<Array<{ id: string, description: string, amount: number }>>([])
  const [newAdjDesc, setNewAdjDesc] = useState('')
  const [newAdjAmount, setNewAdjAmount] = useState('')

  const handleAddAdjustment = () => {
    if (!newAdjDesc || !newAdjAmount) {
      showToast('กรุณากรอกรายละเอียดและจำนวนเงิน', 'warning')
      return
    }
    const amount = parseFloat(newAdjAmount)
    if (isNaN(amount)) {
      showToast('จำนวนเงินไม่ถูกต้อง', 'error')
      return
    }

    setAdjustments([...adjustments, {
      id: Math.random().toString(36).substr(2, 9),
      description: newAdjDesc,
      amount
    }])
    setNewAdjDesc('')
    setNewAdjAmount('')
  }

  const handleRemoveAdjustment = (id: string) => {
    setAdjustments(adjustments.filter(a => a.id !== id))
  }

  const calculateTotalAdjustments = () => {
    return adjustments.reduce((sum: number, adj) => sum + adj.amount, 0)
  }



  const handleCalculate = async () => {
    if (!selectedEmployee || selectedEmployee === 0) {
      showToast('กรุณาเลือกพนักงาน', 'warning')
      return
    }

    if (!startDate || !endDate) {
      showToast('กรุณาเลือกช่วงวันที่', 'warning')
      return
    }

    const data = await getAttendanceByRange(selectedEmployee, startDate, endDate)
    if (data) {
      setPayrollData(data)
      showToast('คำนวณเงินเดือนสำเร็จ', 'success')
    } else {
      showToast('ไม่พบข้อมูลการเข้างานในช่วงวันที่เลือก', 'error')
    }
  }

  const employee = employees.find(e => e.id === selectedEmployee)

  const totalWage = parseFloat(payrollData?.summary?.total_wage || '0')
  const monthlyAllowance = employee?.employment_type === 'monthly' ? parseFloat(String(employee?.monthly_allowance || '0')) : 0
  const finalNetPay = totalWage + monthlyAllowance + calculateTotalAdjustments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">คำนวณเงินเดือน</h1>
        <p className="text-gray-500 mt-1">คำนวณเงินเดือนและสลิปเงินเดือนรายเดือน</p>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>เลือกพนักงานและช่วงวันที่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Select
                label="เลือกพนักงาน"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                options={employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.first_name} ${emp.last_name} (${emp.employment_type === 'daily' ? 'รายวัน' : 'รายเดือน'})`
                }))}
              />
            </div>

            <Input
              label="จากวันที่"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="ถึงวันที่"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleCalculate}
                disabled={loading}
                className="w-full h-10"
              >
                <Calculator size={20} className="mr-2" />
                {loading ? 'กำลังคำนวณ...' : 'คำนวณ'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Result */}
      {payrollData && employee && (
        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพนักงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                  <p className="text-lg font-medium">
                    {employee.prefix} {employee.first_name} {employee.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ตำแหน่ง</p>
                  <p className="text-lg font-medium">{employee.position_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ประเภทการจ้าง</p>
                  <p className="text-lg font-medium">
                    {employee.employment_type === 'daily' ? 'รายวัน' : 'รายเดือน'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">เงินเดือน/ค่าแรง</p>
                  <p className="text-lg font-medium text-blue-600">
                    {formatCurrency(employee.base_salary_or_wage)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>สรุปการเข้างาน - {formatDate(startDate)} ถึง {formatDate(endDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">วันทำงาน</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {payrollData.summary.days_attended || 0}
                  </p>
                  <p className="text-xs text-gray-500">วัน</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">วันลา</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {payrollData.summary.days_leave || 0}
                  </p>
                  <p className="text-xs text-gray-500">วัน</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">OT</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {parseFloat(payrollData.summary.total_ot_hours || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">ชั่วโมง</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">สาย</p>
                  <p className="text-3xl font-bold text-red-600">
                    {payrollData.summary.total_late_minutes || 0}
                  </p>
                  <p className="text-xs text-gray-500">นาที</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>รายละเอียดเงินเดือน</CardTitle>
                <Button variant="primary" size="sm">
                  <Download size={16} className="mr-2" />
                  ดาวน์โหลด PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Income */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">รายได้</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">
                        {employee.employment_type === 'daily'
                          ? `ค่าแรง (${payrollData.summary.days_attended || 0} วัน)`
                          : 'เงินเดือน'
                        }
                      </span>
                      <span className="font-medium">
                        {formatCurrency(employee.base_salary_or_wage)}
                      </span>
                    </div>
                    {employee.monthly_allowance && parseFloat(String(employee.monthly_allowance)) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">เบี้ยเลี้ยงรายเดือน</span>
                        <span className="font-medium">
                          {formatCurrency(employee.monthly_allowance)}
                        </span>
                      </div>
                    )}
                    {employee.meal_allowance_per_day && parseFloat(String(employee.meal_allowance_per_day)) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">
                          ค่าอาหาร ({payrollData.summary.days_attended || 0} วัน × {employee.meal_allowance_per_day} บาท)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            parseFloat(String(employee.meal_allowance_per_day)) *
                            parseInt(payrollData.summary.days_attended || 0)
                          )}
                        </span>
                      </div>
                    )}
                    {payrollData.summary.total_ot_amount && parseFloat(payrollData.summary.total_ot_amount) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">เงิน OT</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(payrollData.summary.total_ot_amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Adjustments Section */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                    รายการปรับปรุง (เงินเพิ่ม/เงินหัก)
                    <span className="text-xs font-normal text-gray-500">* ค่าติดลบคือการหักเงิน</span>
                  </h4>
                  <div className="space-y-2 mb-4">
                    {adjustments.map((adj) => (
                      <div key={adj.id} className="flex justify-between items-center py-2 border-b group">
                        <span className="text-gray-600">{adj.description}</span>
                        <div className="flex items-center gap-3">
                          <span className={cn("font-medium", adj.amount >= 0 ? "text-green-600" : "text-red-600")}>
                            {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount)}
                          </span>
                          <button
                            onClick={() => handleRemoveAdjustment(adj.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add adjustment form */}
                  <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <Input
                        label="รายละเอียด"
                        placeholder="เช่น โบนัส, เบี้ยขยัน, หักสาย"
                        value={newAdjDesc}
                        onChange={(e) => setNewAdjDesc(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        label="จำนวนเงิน"
                        type="number"
                        placeholder="0.00"
                        value={newAdjAmount}
                        onChange={(e) => setNewAdjAmount(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleAddAdjustment}
                      className="h-10 px-3"
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">รายได้หลักรวม</span>
                    <span className="text-xl font-bold text-gray-700">
                      {formatCurrency(payrollData.summary.total_wage || 0)}
                    </span>
                  </div>
                  {adjustments.length > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-600">รวมเงินเพิ่ม/เงินหัก</span>
                      <span className={cn("font-bold", calculateTotalAdjustments() >= 0 ? "text-green-600" : "text-red-600")}>
                        {calculateTotalAdjustments() >= 0 ? '+' : ''}{formatCurrency(calculateTotalAdjustments())}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-600 p-6 rounded-lg shadow-lg shadow-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calculator size={100} />
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xl font-bold text-white">เงินสุทธิที่ได้รับ</span>
                    <span className="text-4xl font-bold text-white">
                      {formatCurrency(finalNetPay)}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm mt-2 relative z-10">
                    * คำนวณจากค่าแรงฐาน + รายการเงินเข้า - รายการเงินหัก
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!payrollData && (
        <Card>
          <CardContent className="text-center py-12">
            <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              เลือกพนักงานและช่วงวันที่เพื่อคำนวณเงินเดือน
            </h3>
            <p className="text-gray-500">
              ระบบจะคำนวณเงินเดือนอัตโนมัติตามการเข้างานและการตั้งค่า
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
