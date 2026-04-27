import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { TireAppData } from '../types'
import { generateTireAppData } from '../data/mockTireData'

interface DataContextValue {
  data: TireAppData
  refreshData: () => void
  lastSync: Date
  syncStatus: 'live' | 'syncing' | 'offline'
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TireAppData>(() => generateTireAppData())
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [syncStatus, setSyncStatus] = useState<'live' | 'syncing' | 'offline'>('live')

  // Simulate periodic sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing')
      setTimeout(() => {
        setData(generateTireAppData())
        setLastSync(new Date())
        setSyncStatus('live')
      }, 800 + Math.random() * 400) // pseudo-latency
    }, 30000) // every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshData = useCallback(() => {
    setSyncStatus('syncing')
    setTimeout(() => {
      setData(generateTireAppData())
      setLastSync(new Date())
      setSyncStatus('live')
    }, 600 + Math.random() * 600)
  }, [])

  const value = useMemo(() => ({
    data, refreshData, lastSync, syncStatus
  }), [data, refreshData, lastSync, syncStatus])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useTireData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useTireData must be used within DataProvider')
  return ctx
}

// Legacy hook for backward compatibility
export const useData = () => {
  return null
}
