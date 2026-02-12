import { useState, useEffect } from 'react'
import { FileText, Download, Filter, Search, Calendar, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAttendance } from '@/hooks/useAttendance'
import { useEmployees } from '@/hooks/useEmployees'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatTime, cn } from '@/lib/utils'

export const ReportsPage = () => {
    const { attendances, fetchAttendances, loading } = useAttendance()
    const { employees } = useEmployees()

    // Default to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [startDate, setStartDate] = useState(firstDay)
    const [endDate, setEndDate] = useState(lastDay)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0)

    const handleFetchReport = () => {
        fetchAttendances({
            start_date: startDate,
            end_date: endDate,
            employee_id: selectedEmployeeId !== 0 ? selectedEmployeeId : undefined
        })
    }

    // ส่งออกข้อมูลเป็น CSV (เปิดได้ใน Excel)
    const handleExportExcel = () => {
        if (filteredAttendances.length === 0) {
            alert('ไม่มีข้อมูลให้ส่งออก')
            return
        }

        // CSV Header
        const headers = ['วันที่', 'ชื่อพนักงาน', 'ตำแหน่ง', 'เวลาเข้า', 'เวลาออก', 'ลา (ชม.)', 'OT (ชม.)', 'สาย (น.)', 'ประเภท', 'รายได้วัน']
        
        // CSV Rows
        const rows = filteredAttendances.map(att => [
            att.date,
            `${att.first_name} ${att.last_name}`,
            att.position_name || '-',
            att.check_in_time?.substring(0, 5) || '-',
            att.check_out_time?.substring(0, 5) || '-',
            att.leave_hours || 0,
            att.ot_hours || 0,
            att.late_minutes || 0,
            att.employment_type === 'daily' ? 'รายวัน' : 'รายเดือน',
            att.calculated_wage_daily || 0
        ])

        // รวมเป็น CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // สร้างไฟล์และดาวน์โหลด
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `รายงานการเข้างาน_${startDate}_${endDate}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    useEffect(() => {
        handleFetchReport()
    }, [])

    const filteredAttendances = attendances.filter(att =>
        `${att.first_name} ${att.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // พนักงานที่ไม่มาทำงานในช่วงวันที่เลือก (ขาดงาน?)
    // อันนี้ต้องคำนวณซับซ้อนขึ้นหน่อย แต่เอาแค่ข้อมูลที่มีก่อน

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">รายงานการเข้างาน</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <Calendar size={16} /> รายงานระดับวัน เลือกช่วงวันที่ต้องการได้
                    </p>
                </div>
                <Button variant="secondary" className="gap-2" onClick={handleExportExcel}>
                    <Download size={18} />
                    ส่งออก Excel
                </Button>
            </div>

            {/* Filters Card */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">พนักงาน</label>
                            <select
                                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                            >
                                <option value={0}>ทั้งหมด</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="เริ่มวันที่"
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

                        <Button variant="primary" onClick={handleFetchReport} disabled={loading} className="h-10 rounded-xl shadow-lg shadow-blue-100">
                            <Search size={18} className="mr-2" />
                            {loading ? 'กำลังโหลด...' : 'ดึงข้อมูล'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Search and Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาพนักงานในรายการ..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    พบข้อมูลทั้งหมด <span className="text-blue-600 font-bold">{filteredAttendances.length}</span> รายการ
                </div>
            </div>

            {/* Report Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider">พนักงาน</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider">เข้า/ออก</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider">ลา (ชม.)</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider">OT (ชม.)</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider">สาย (น.)</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider">ประเภทงาน</th>
                                <th className="px-6 py-4 text-right font-bold text-gray-400 uppercase tracking-wider">รายได้วัน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttendances.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                                        <FileText size={48} className="mx-auto text-gray-200 mb-2" />
                                        ไม่พบข้อมูลสำหรับเงื่อนไขที่เลือก
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600 text-xs">
                                            {formatDate(att.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{att.first_name} {att.last_name}</div>
                                            <div className="text-[10px] text-gray-400">{att.position_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {att.is_leave && att.leave_hours === 0 ? (
                                                <span className="text-orange-500 font-bold">ลา</span>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs text-green-600 font-medium">{att.check_in_time?.substring(0, 5) || '--:--'}</span>
                                                    <span className="text-gray-300">-</span>
                                                    <span className="text-xs text-red-600 font-medium">{att.check_out_time?.substring(0, 5) || '--:--'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold">
                                            {att.leave_hours > 0 ? (
                                                <span className="text-orange-600">{att.leave_hours} <span className="text-[10px] font-normal">ชม.</span></span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold">
                                            {att.ot_hours > 0 ? (
                                                <span className="text-blue-600">+{att.ot_hours} <span className="text-[10px] font-normal">ชม.</span></span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold">
                                            {att.late_minutes > 0 ? (
                                                <span className="text-red-500">{att.late_minutes} <span className="text-[10px] font-normal">น.</span></span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                att.employment_type === 'daily' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                            )}>
                                                {att.employment_type === 'daily' ? 'รายวัน' : 'รายเดือน'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-gray-800">
                                            {formatCurrency(att.calculated_wage_daily)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Logic Card */}
            <Card className="bg-blue-50 border-blue-100 border text-blue-800">
                <CardContent className="py-4 text-xs">
                    <p className="font-bold mb-1 flex items-center gap-1"><FileText size={14} /> ข้อมูลเบื้องต้นเกี่ยวกับรายงาน:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                        <li>รายงานนี้แสดงข้อมูลการเข้างานตามช่วงวันที่เลือก</li>
                        <li>รายได้วันคำนวณจาก (เงินเดือนหารวันทำงาน) หรือ (ค่าแรงรายสัปดาห์) + ค่าอาหาร + OT - หักสาย - หักลา</li>
                        <li>ในกรณีลารายชั่วโมง ระบบจะคำนวณการหักเงินเป็นสัดส่วนรายชั่วโมงตามนโยบายบริษัท</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
