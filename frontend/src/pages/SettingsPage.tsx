import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useToast } from '@/context/ToastContext'

export const SettingsPage = () => {
  const { configs, loading, updateConfig, fetchConfigs } = useConfig()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (configs.length > 0) {
      const data: Record<string, string> = {}
      configs.forEach(config => {
        data[config.key] = config.value
      })
      setFormData(data)
    }
  }, [configs])

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (key: string) => {
    setSaving(true)
    const result = await updateConfig(key, formData[key])
    if (result.success) {
      showToast('บันทึกการตั้งค่าสำเร็จ', 'success')
    } else {
      showToast(result.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
    }
    setSaving(false)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    let hasError = false
    for (const key of Object.keys(formData)) {
      const result = await updateConfig(key, formData[key])
      if (!result.success) {
        hasError = true
      }
    }
    if (hasError) {
      showToast('บันทึกการตั้งค่าบางรายการไม่สำเร็จ', 'warning')
    } else {
      showToast('บันทึกการตั้งค่าทั้งหมดสำเร็จ', 'success')
    }
    setSaving(false)
  }

  const configGroups = {
    attendance: {
      title: 'การเข้างาน',
      keys: ['standard_check_in_time', 'standard_check_out_time', 'daily_work_hours']
    },
    late: {
      title: 'การหักสาย',
      keys: ['late_fine_per_minute']
    },
    ot: {
      title: 'OT (โอที)',
      keys: ['ot_rate_multiplier']
    },
    leave: {
      title: 'การลา',
      keys: ['leave_sick_deduction', 'leave_personal_deduction', 'leave_vacation_deduction']
    },
    payroll: {
      title: 'เงินเดือนและการทำงาน',
      keys: ['saturday_work_mode', 'weekly_off_days']
    }
  }

  const getConfigLabel = (key: string) => {
    const labels: Record<string, string> = {
      'late_fine_per_minute': 'ค่าปรับสายต่อนาที (บาท)',
      'standard_check_in_time': 'เวลาเข้างานมาตรฐาน',
      'standard_check_out_time': 'เวลาออกงานมาตรฐาน',
      'ot_rate_multiplier': 'อัตราคูณ OT',
      'leave_sick_deduction': 'ลาป่วยหักเงิน (%)',
      'leave_personal_deduction': 'ลากิจหักเงิน (%)',
      'leave_vacation_deduction': 'ลาพักร้อนหักเงิน (%)',
      'work_days_per_month': 'จำนวนวันทำงานต่อเดือน (กรณีทั่วไป)',
      'daily_work_hours': 'จำนวนชั่วโมงทำงานต่อวัน',
      'weekly_off_days': 'วันหยุดประจำสัปดาห์ (JSON: 0=อาทิตย์, ..., 6=เสาร์)',
      'saturday_work_mode': 'โหมดวันเสาร์ (all=ทำทุกเสาร์, none=หยุดทุกเสาร์, biweekly=เสาร์เว้นเสาร์)'
    }
    return labels[key] || key
  }

  const getInputType = (key: string) => {
    if (key.includes('time')) return 'time'
    if (key === 'saturday_work_mode' || key === 'weekly_off_days') return 'text'
    return 'number'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-gray-500 mt-1">จัดการการตั้งค่าระบบ HR</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={fetchConfigs} disabled={loading}>
            <RefreshCw size={20} className="mr-2" />
            รีเฟรช
          </Button>
          <Button variant="primary" onClick={handleSaveAll} disabled={saving}>
            <Save size={20} className="mr-2" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">กำลังโหลดการตั้งค่า...</p>
        </div>
      )}

      {/* Settings Groups */}
      {!loading && (
        <div className="space-y-6">
          {Object.entries(configGroups).map(([groupKey, group]) => (
            <Card key={groupKey}>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.keys.map(key => {
                    const config = configs.find(c => c.key === key)
                    if (!config) return null

                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Input
                            label={getConfigLabel(key)}
                            type={getInputType(key)}
                            step="0.01"
                            value={formData[key] || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                          {config.description && (
                            <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSave(key)}
                          disabled={saving}
                        >
                          <Save size={16} className="mr-2" />
                          บันทึก
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 คำอธิบาย</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>ค่าปรับสาย:</strong> จำนวนเงินที่หักต่อนาทีที่สาย</li>
                <li>• <strong>อัตราคูณ OT:</strong> ค่า OT คำนวณเป็น 1.5 เท่าของอัตราปกติ</li>
                <li>• <strong>การหักลา:</strong> 0% = ไม่หัก, 100% = หักเต็มจำนวน</li>
                <li>• <strong>ลาป่วย/ลาพักร้อน:</strong> ปกติไม่หักเงิน (0%)</li>
                <li>• <strong>ลากิจ:</strong> ปกติหักเต็มจำนวน (100%)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
