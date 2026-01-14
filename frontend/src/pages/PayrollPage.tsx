import { useState } from 'react'
import { Calculator, Download } from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { useAttendance } from '@/hooks/useAttendance'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, getMonthOptions } from '@/lib/utils'

export const PayrollPage = () => {
  const { employees } = useEmployees()
  const { getAttendanceByMonth, loading } = useAttendance()

  const [selectedEmployee, setSelectedEmployee] = useState<number>(0)
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  )
  const [payrollData, setPayrollData] = useState<any>(null)

  const handleCalculate = async () => {
    if (!selectedEmployee || selectedEmployee === 0) {
      alert('กรุณาเลือกพนักงาน')
      return
    }

    const data = await getAttendanceByMonth(selectedEmployee, selectedMonth)
    if (data) {
      setPayrollData(data)
    }
  }

  const employee = employees.find(e => e.id === selectedEmployee)

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
          <CardTitle>เลือกพนักงานและเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="เลือกพนักงาน"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(Number(e.target.value))}
              options={employees.map(emp => ({
                value: emp.id,
                label: `${emp.first_name} ${emp.last_name} (${emp.employment_type === 'daily' ? 'รายวัน' : 'รายเดือน'})`
              }))}
            />
            <Select
              label="เลือกเดือน"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={getMonthOptions(1)}
            />
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleCalculate}
                disabled={loading}
                className="w-full"
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
              <CardTitle>สรุปการเข้างาน - {selectedMonth}</CardTitle>
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

                {/* Total Income */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">รวมรายได้</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(payrollData.summary.total_wage || 0)}
                    </span>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">เงินสุทธิที่ได้รับ</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatCurrency(payrollData.summary.total_wage || 0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    * คำนวณตามการเข้างานจริงและรวม OT แล้ว
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
              เลือกพนักงานและเดือนเพื่อคำนวณเงินเดือน
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
