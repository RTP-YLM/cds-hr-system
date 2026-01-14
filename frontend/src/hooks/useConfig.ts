import { useState, useEffect } from 'react'
import type { SystemConfig } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const useConfig = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/config`)
      const result = await response.json()

      if (result.success) {
        setConfigs(result.data)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (key: string, value: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/config/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      const result = await response.json()

      if (result.success) {
        await fetchConfigs()
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

  useEffect(() => {
    fetchConfigs()
  }, [])

  return { configs, loading, error, fetchConfigs, updateConfig }
}
