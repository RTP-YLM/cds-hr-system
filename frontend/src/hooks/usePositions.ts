import { useState, useEffect } from 'react'
import type { Position } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const usePositions = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPositions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/positions`)
      const result = await response.json()

      if (result.success) {
        setPositions(result.data)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPosition = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        await fetchPositions()
        return result
      }
      setError(result.message)
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updatePosition = async (id: number, data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/positions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        await fetchPositions()
        return result
      }
      setError(result.message)
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deletePosition = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/positions/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        await fetchPositions()
        return result
      }
      setError(result.message)
      return result
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
  }, [])

  return { positions, loading, error, fetchPositions, createPosition, updatePosition, deletePosition }
}
