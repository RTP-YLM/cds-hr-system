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

  useEffect(() => {
    fetchPositions()
  }, [])

  return { positions, loading, error, fetchPositions }
}
