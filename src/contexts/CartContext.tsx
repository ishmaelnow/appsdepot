import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { App, BuildRequest } from '../types'

interface TrayState {
  requests: BuildRequest[]
  count: number
  addRequest: (app: App) => void
  removeRequest: (appId: string) => void
  hasRequest: (appId: string) => boolean
  clearTray: () => void
}

const TrayContext = createContext<TrayState | null>(null)
const TRAY_STORAGE_KEY = 'appsdepot.buildTray'

function loadStoredRequests(): BuildRequest[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(TRAY_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BuildRequest[]>(loadStoredRequests)

  useEffect(() => {
    window.localStorage.setItem(TRAY_STORAGE_KEY, JSON.stringify(requests))
  }, [requests])

  const addRequest = useCallback((app: App) => {
    setRequests(prev => {
      if (prev.find(r => r.app.id === app.id)) return prev
      return [...prev, { app, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeRequest = useCallback((appId: string) => {
    setRequests(prev => prev.filter(r => r.app.id !== appId))
  }, [])

  const hasRequest = useCallback((appId: string) => {
    return requests.some(r => r.app.id === appId)
  }, [requests])

  const clearTray = useCallback(() => setRequests([]), [])

  return (
    <TrayContext.Provider value={{ requests, count: requests.length, addRequest, removeRequest, hasRequest, clearTray }}>
      {children}
    </TrayContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(TrayContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
