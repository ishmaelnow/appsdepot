import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BuildRequest[]>([])

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
