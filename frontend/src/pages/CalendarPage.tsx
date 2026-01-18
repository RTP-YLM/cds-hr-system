import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { holidayService, Holiday } from '@/services/holidayService'
import { useToast } from '@/context/ToastContext'

export const CalendarPage = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([])
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast()
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [newHoliday, setNewHoliday] = useState({
        date: '',
        name: '',
        holiday_type: 'public',
        is_paid: true
    })
    const [previewData, setPreviewData] = useState<{ date: string, reason: string }[]>([])
    const [showPreview, setShowPreview] = useState(false)

    const fetchHolidays = async () => {
        setLoading(true)
        try {
            const data = await holidayService.getHolidays(currentYear)
            setHolidays(data)
        } catch (error) {
            console.error('Failed to fetch holidays:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHolidays()
    }, [currentYear])

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newHoliday.date || !newHoliday.name) return

        try {
            await holidayService.createHoliday(newHoliday)
            showToast('บันทึกวันหยุดสำเร็จ', 'success')
            setNewHoliday({
                date: '',
                name: '',
                holiday_type: 'public',
                is_paid: true
            })
            fetchHolidays()
        } catch (error) {
            console.error('Failed to add holiday:', error)
            showToast('ไม่สามารถเพิ่มวันหยุดได้', 'error')
        }
    }

    const handleDeleteHoliday = async (id: number) => {
        if (!confirm('ยืนยันการลบวันหยุดนี้?')) return
        try {
            await holidayService.deleteHoliday(id)
            showToast('ลบวันหยุดสำเร็จ', 'success')
            fetchHolidays()
        } catch (error) {
            console.error('Failed to delete holiday:', error)
            showToast('ไม่สามารถลบวันหยุดได้', 'error')
        }
    }

    const handleFetchPreview = async () => {
        try {
            const data = await holidayService.getCalendarPreview(currentYear)
            setPreviewData(data.offDays)
            setShowPreview(true)
        } catch (error) {
            console.error('Failed to fetch preview:', error)
            alert('ไม่สามารถดึงข้อมูลพรีวิวได้')
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ปฏิทินระบบ</h1>
                    <p className="text-gray-500 mt-1">จัดการวันหยุดและวันทำงาน</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentYear(currentYear - 1)}>
                        <ChevronLeft size={20} />
                    </Button>
                    <span className="text-xl font-bold w-16 text-center">{currentYear + 543}</span>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentYear(currentYear + 1)}>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Holiday Form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus size={20} />
                            เพิ่มวันหยุดใหม่
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddHoliday} className="space-y-4">
                            <Input
                                label="วันที่"
                                type="date"
                                value={newHoliday.date}
                                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                required
                            />
                            <Input
                                label="ชื่อวันหยุด"
                                placeholder="เช่น วันสงกรานต์"
                                value={newHoliday.name}
                                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                required
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">ประเภท</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newHoliday.holiday_type}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, holiday_type: e.target.value })}
                                >
                                    <option value="public">วันหยุดนักขัตฤกษ์</option>
                                    <option value="company">วันหยุดบริษัท</option>
                                    <option value="other">อื่นๆ</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_paid"
                                    checked={newHoliday.is_paid}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, is_paid: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_paid" className="text-sm text-gray-700">
                                    จ่ายเงินเดือนปกติ
                                </label>
                            </div>
                            <Button type="submit" variant="primary" className="w-full">
                                บันทึกวันหยุด
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Holiday List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon size={20} />
                                รายการวันหยุด ปี {currentYear + 543}
                            </CardTitle>
                            <Button variant="secondary" size="sm" onClick={handleFetchPreview}>
                                <Eye size={16} className="mr-2" />
                                พรีวิววันหยุดทั้งหมด
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center py-8 text-gray-500">กำลังโหลด...</p>
                        ) : holidays.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <CalendarIcon size={48} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">ไม่พบข้อมูลวันหยุดในปีนี้</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left text-sm text-gray-500">
                                            <th className="pb-3 font-medium">วันที่</th>
                                            <th className="pb-3 font-medium">ชื่อวันหยุด</th>
                                            <th className="pb-3 font-medium">ประเภท</th>
                                            <th className="pb-3 font-medium text-center">จ่ายเงิน</th>
                                            <th className="pb-3 font-medium text-right">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {holidays.map((holiday: Holiday) => (
                                            <tr key={holiday.id} className="group hover:bg-gray-50">
                                                <td className="py-4 text-sm font-medium">{formatDate(holiday.date)}</td>
                                                <td className="py-4 text-sm">{holiday.name}</td>
                                                <td className="py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${holiday.holiday_type === 'public' ? 'bg-orange-100 text-orange-700' :
                                                        holiday.holiday_type === 'company' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {holiday.holiday_type === 'public' ? 'นักขัตฤกษ์' :
                                                            holiday.holiday_type === 'company' ? 'บริษัท' : 'อื่นๆ'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-center">
                                                    {holiday.is_paid ? '✅' : '❌'}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteHoliday(holiday.id)}
                                                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Preview Section */}
            {showPreview && (
                <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-blue-900">พรีวิววันหยุดทั้งหมดในปี {currentYear + 543}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>ปิดพรีวิว</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(12)].map((_, i) => {
                                const monthIndex = i + 1;
                                const monthName = new Date(currentYear, i).toLocaleDateString('th-TH', { month: 'long' });
                                const daysInMonth = previewData.filter((d: any) => {
                                    const date = new Date(d.date);
                                    return date.getMonth() === i;
                                });

                                return (
                                    <div key={i} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                        <h5 className="font-bold text-blue-700 mb-2 border-b pb-1">{monthName}</h5>
                                        {daysInMonth.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">ไม่มีวันหยุด</p>
                                        ) : (
                                            <ul className="space-y-1">
                                                {daysInMonth.map((day: any, idx: number) => (
                                                    <li key={idx} className="text-xs flex flex-col">
                                                        <span className="font-medium text-gray-700">
                                                            วันที่ {new Date(day.date).getDate()}:
                                                        </span>
                                                        <span className="text-gray-500 ml-2">{day.reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Logic Note */}
            <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="py-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">💡 หมายเหตุการคำนวณ</h4>
                    <p className="text-sm text-yellow-800">
                        ระบบจะใช้ข้อมูลวันหยุดในปฏิทินนี้ร่วมกับ <strong>"วันหยุดประจำสัปดาห์"</strong> และ <strong>"โหมดวันเสาร์"</strong> (ตั้งค่าที่หน้า Settings)
                        ในการคำนวณจำนวนวันทำงานจริงของแต่ละเดือน เพื่อความแม่นยำในการคิดเงินเดือนและค่าแรงรายวัน
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
