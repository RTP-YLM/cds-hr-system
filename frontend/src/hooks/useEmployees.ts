import { useState, useEffect } from 'react'
import type { Employee, CreateEmployeeInput } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ดึงข้อมูลพนักงานทั้งหมด
  const fetchEmployees = async (filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams(filters)
      const response = await fetch(`${API_URL}/employees?${params}`)
      const result = await response.json()

      if (result.success) {
        setEmployees(result.data)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ดึงข้อมูลพนักงานคนเดียว
  const getEmployee = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/employees/${id}`)
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

  // เพิ่มพนักงานใหม่
  const createEmployee = async (data: CreateEmployeeInput, files?: { profile?: File; contract?: File }) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()

      // เพิ่มข้อมูล
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // เพิ่มไฟล์
      if (files?.profile) {
        formData.append('profile_image', files.profile)
      }
      if (files?.contract) {
        formData.append('contract_file', files.contract)
      }

      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (result.success) {
        await fetchEmployees()
        return result
      } else {
        setError(result.message)
        return result
      }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // อัพเดทพนักงาน
  const updateEmployee = async (id: number, data: Partial<CreateEmployeeInput>, files?: { profile?: File; contract?: File }) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      if (files?.profile) {
        formData.append('profile_image', files.profile)
      }
      if (files?.contract) {
        formData.append('contract_file', files.contract)
      }

      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PATCH',
        body: formData,
      })
      const result = await response.json()

      if (result.success) {
        await fetchEmployees()
        return result
      } else {
        setError(result.message)
        return result
      }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ลบพนักงาน
  const deleteEmployee = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        await fetchEmployees()
        return result
      } else {
        setError(result.message)
        return result
      }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
