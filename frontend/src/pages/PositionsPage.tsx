import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { usePositions } from '@/hooks/usePositions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'

export const PositionsPage = () => {
    const { positions, loading, error, createPosition, updatePosition, deletePosition } = usePositions()
    const { showToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    // Form State
    const [form, setForm] = useState({
        position_name: '',
        meal_allowance_per_day: 0,
        monthly_allowance: 0
    })

    const filteredItems = positions.filter(pos =>
        pos.position_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenModal = (item: any = null) => {
        if (item) {
            setEditingItem(item)
            setForm({
                position_name: item.position_name,
                meal_allowance_per_day: Number(item.meal_allowance_per_day),
                monthly_allowance: Number(item.monthly_allowance)
            })
        } else {
            setEditingItem(null)
            setForm({
                position_name: '',
                meal_allowance_per_day: 0,
                monthly_allowance: 0
            })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingItem) {
            const result = await updatePosition(editingItem.id, form)
            if (result.success) {
                showToast('อัพเดทตำแหน่งสำเร็จ', 'success')
                setShowModal(false)
            } else {
                showToast(result.message || 'เกิดข้อผิดพลาดในการอัพเดท', 'error')
            }
        } else {
            const result = await createPosition(form)
            if (result.success) {
                showToast('เพิ่มตำแหน่งสำเร็จ', 'success')
                setShowModal(false)
            } else {
                showToast(result.message || 'เกิดข้อผิดพลาดในการเพิ่มตำแหน่ง', 'error')
            }
        }
    }

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`ต้องการลบตำแหน่ง ${name} ใช่หรือไม่?`)) {
            const result = await deletePosition(id)
            if (result.success) {
                showToast('ลบข้อมูลสำเร็จ', 'success')
            } else {
                showToast(result.message || 'เกิดข้อผิดพลาดในการลบ', 'error')
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">จัดการตำแหน่งงาน</h1>
                    <p className="text-gray-500 mt-1">จัดการรายชื่อตำแหน่งและค่าตอบแทนพิเศษ (เบี้ยเลี้ยง/ค่าอาหาร)</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => handleOpenModal()}
                >
                    <Plus size={20} className="mr-2" />
                    เพิ่มตำแหน่งใหม่
                </Button>
            </div>

            {/* Search */}
            <Card>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="ค้นหาชื่อตำแหน่ง..."
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

            {/* Loading & Error */}
            {loading && <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {error}
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-600">ชื่อตำแหน่ง</th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-600">ค่าอาหาร/วัน</th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-600">เบี้ยเลี้ยง/เดือน</th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-600">จำนวนพนักงาน</th>
                                    <th className="px-6 py-4 text-right font-semibold text-gray-600">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">ไม่พบข้อมูลตำแหน่ง</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.position_name}</td>
                                            <td className="px-6 py-4 text-center text-gray-700">{formatCurrency(item.meal_allowance_per_day)}</td>
                                            <td className="px-6 py-4 text-center text-gray-700">{formatCurrency(item.monthly_allowance)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                                    {item.employee_count || 0} คน
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id, item.position_name)} className="text-red-600 hover:text-red-800">
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editingItem ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่งใหม่'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">ชื่อตำแหน่ง</label>
                                <Input
                                    required
                                    value={form.position_name}
                                    onChange={e => setForm({ ...form, position_name: e.target.value })}
                                    placeholder="เช่น พนักงานฝ่ายผลิต, ผู้จัดการ"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">ค่าอาหาร (ต่อวัน)</label>
                                    <Input
                                        type="number"
                                        value={form.meal_allowance_per_day}
                                        onChange={e => setForm({ ...form, meal_allowance_per_day: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">เบี้ยเลี้ยง (ต่อเดือน)</label>
                                    <Input
                                        type="number"
                                        value={form.monthly_allowance}
                                        onChange={e => setForm({ ...form, monthly_allowance: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>ยกเลิก</Button>
                                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>บันทึก</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
