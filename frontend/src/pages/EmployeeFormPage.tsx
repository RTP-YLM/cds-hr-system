import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { usePositions } from '@/hooks/usePositions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { CreateEmployeeInput } from '@/types'

export const EmployeeFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const { createEmployee, updateEmployee, getEmployee, loading } = useEmployees()
  const { positions } = usePositions()

  const [formData, setFormData] = useState<CreateEmployeeInput>({
    prefix: '',
    first_name: '',
    last_name: '',
    id_card_number: '',
    phone: '',
    address: '',
    nationality: 'ไทย',
    birth_date: '',
    hired_date: '',
    position_id: 0,
    status: 'probation',
    employment_type: 'monthly',
    base_salary_or_wage: 0,
    bank_name: '',
    bank_account_no: '',
    work_start_time: '08:00',
    work_end_time: '17:00',
  })

  const [files, setFiles] = useState<{ profile?: File; contract?: File }>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEditMode && id) {
      loadEmployee(parseInt(id))
    }
  }, [id])

  const loadEmployee = async (employeeId: number) => {
    const employee = await getEmployee(employeeId)
    if (employee) {
      setFormData({
        prefix: employee.prefix || '',
        first_name: employee.first_name,
        last_name: employee.last_name,
        id_card_number: employee.id_card_number,
        phone: employee.phone || '',
        address: employee.address || '',
        nationality: employee.nationality || 'ไทย',
        birth_date: employee.birth_date || '',
        hired_date: employee.hired_date,
        position_id: employee.position_id,
        status: employee.status,
        employment_type: employee.employment_type,
        base_salary_or_wage: employee.base_salary_or_wage,
        bank_name: employee.bank_name || '',
        bank_account_no: employee.bank_account_no || '',
        work_start_time: employee.work_start_time?.substring(0, 5) || '08:00',
        work_end_time: employee.work_end_time?.substring(0, 5) || '17:00',
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'contract') => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name) newErrors.first_name = 'กรุณากรอกชื่อ'
    if (!formData.last_name) newErrors.last_name = 'กรุณากรอกนามสกุล'
    if (!formData.id_card_number) newErrors.id_card_number = 'กรุณากรอกเลขบัตรประชาชน'
    if (formData.id_card_number.length !== 13) newErrors.id_card_number = 'เลขบัตรประชาชนต้องมี 13 หลัก'
    if (!formData.hired_date) newErrors.hired_date = 'กรุณาเลือกวันที่บรรจุ'
    if (!formData.position_id || formData.position_id === 0) newErrors.position_id = 'กรุณาเลือกตำแหน่ง'
    if (!formData.base_salary_or_wage || formData.base_salary_or_wage <= 0) {
      newErrors.base_salary_or_wage = 'กรุณากรอกเงินเดือน/ค่าแรง'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    // Convert string values to proper types
    const submitData: CreateEmployeeInput = {
      ...formData,
      position_id: Number(formData.position_id),
      base_salary_or_wage: Number(formData.base_salary_or_wage),
      // Remove empty optional fields
      birth_date: formData.birth_date || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      bank_name: formData.bank_name || undefined,
      bank_account_no: formData.bank_account_no || undefined,
      work_start_time: formData.work_start_time || undefined,
      work_end_time: formData.work_end_time || undefined,
    }

    const result = isEditMode
      ? await updateEmployee(parseInt(id!), submitData, files)
      : await createEmployee(submitData, files)

    if (result) {
      alert(isEditMode ? 'อัพเดทข้อมูลสำเร็จ' : 'เพิ่มพนักงานสำเร็จ')
      navigate('/employees')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/employees')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
          </h1>
          <p className="text-gray-500 mt-1">กรอกข้อมูลพนักงาน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ข้อมูลส่วนตัว */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="คำนำหน้า"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                options={[
                  { value: 'นาย', label: 'นาย' },
                  { value: 'นาง', label: 'นาง' },
                  { value: 'นางสาว', label: 'นางสาว' },
                ]}
              />
              <Input
                label="ชื่อ *"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
              />
              <Input
                label="นามสกุล *"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="เลขบัตรประชาชน *"
                name="id_card_number"
                value={formData.id_card_number}
                onChange={handleChange}
                maxLength={13}
                error={errors.id_card_number}
              />
              <Input
                label="เบอร์โทรศัพท์"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="วันเกิด"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
              />
              <Input
                label="สัญชาติ"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>

            <div className="mt-4">
              <Input
                label="ที่อยู่"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลการทำงาน */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการทำงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="วันที่บรรจุ *"
                name="hired_date"
                type="date"
                value={formData.hired_date}
                onChange={handleChange}
                error={errors.hired_date}
              />
              <Select
                label="ตำแหน่ง *"
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                options={positions.map(p => ({ value: p.id, label: p.position_name }))}
                error={errors.position_id}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Select
                label="สถานะ *"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'probation', label: 'ทดลองงาน' },
                  { value: 'internship', label: 'ฝึกงาน' },
                  { value: 'part-time', label: 'พาร์ทไทม์' },
                  { value: 'permanent', label: 'พนักงานประจำ' },
                  { value: 'resigned', label: 'ลาออก' },
                ]}
              />
              <Select
                label="ประเภทการจ้าง *"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                options={[
                  { value: 'daily', label: 'รายวัน' },
                  { value: 'monthly', label: 'รายเดือน' },
                ]}
              />
              <Input
                label={formData.employment_type === 'daily' ? 'ค่าแรงรายวัน (บาท) *' : 'เงินเดือน (บาท) *'}
                name="base_salary_or_wage"
                type="number"
                value={formData.base_salary_or_wage}
                onChange={handleChange}
                error={errors.base_salary_or_wage}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="เวลาเข้างาน"
                name="work_start_time"
                type="time"
                value={formData.work_start_time}
                onChange={handleChange}
              />
              <Input
                label="เวลาออกงาน"
                name="work_end_time"
                type="time"
                value={formData.work_end_time}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลธนาคาร */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลธนาคาร</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ธนาคาร"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />
              <Input
                label="เลขที่บัญชี"
                name="bank_account_no"
                value={formData.bank_account_no}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Files */}
        <Card>
          <CardHeader>
            <CardTitle>ไฟล์เอกสาร</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รูปโปรไฟล์</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {files.profile && (
                  <p className="text-sm text-gray-500 mt-1">✓ {files.profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สัญญาจ้าง (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'contract')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {files.contract && (
                  <p className="text-sm text-gray-500 mt-1">✓ {files.contract.name}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : isEditMode ? 'อัพเดทข้อมูล' : 'เพิ่มพนักงาน'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/employees')}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  )
}
