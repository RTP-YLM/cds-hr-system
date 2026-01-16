import { useState, useEffect } from 'react'
import type { Attendance, CreateAttendanceInput, AttendanceMonthData } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const useAttendance = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ดึงข้อมูลการเข้างานทั้งหมด
  const fetchAttendances = async (filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams(filters)
      const response = await fetch(`${API_URL}/attendance?${params}`)
      const result = await response.json()

      if (result.success) {
        setAttendances(result.data)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ดึงข้อมูลการเข้างานตามพนักงานและเดือน
  const getAttendanceByMonth = async (employeeId: number, month: string): Promise<AttendanceMonthData | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/attendance/employee/${employeeId}/${month}`)
      const result = await response.json()

      if (result.success) {
        return result.data
      } else {
        setError(result.message)
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // สร้างบันทึกการเข้างาน
  const createAttendance = async (data: CreateAttendanceInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        await fetchAttendances()
        return result.data
      } else {
        setError(result.message)
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // อัพเดทการเข้างาน
  const updateAttendance = async (id: number, data: Partial<CreateAttendanceInput>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        await fetchAttendances()
        return result.data
      } else {
        setError(result.message)
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // ลบการเข้างาน
  const deleteAttendance = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/attendance/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        await fetchAttendances()
        return true
      } else {
        setError(result.message)
        return false
      }
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // สร้างบันทึกการเข้างานแบบกลุ่ม
  const createBatchAttendance = async (data: { date: string; items: any[] }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/attendance/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        await fetchAttendances()
        return result.data
      } else {
        setError(result.message)
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    attendances,
    loading,
    error,
    fetchAttendances,
    getAttendanceByMonth,
    createAttendance,
    createBatchAttendance,
    updateAttendance,
    deleteAttendance,
  }
}
