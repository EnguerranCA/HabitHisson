'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DebugTimeContextType {
  currentDate: Date
  addDays: (days: number) => void
  addWeeks: (weeks: number) => void
  resetDate: () => void
  isDebugMode: boolean
}

const DebugTimeContext = createContext<DebugTimeContextType | undefined>(undefined)

export function DebugTimeProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isDebugMode, setIsDebugMode] = useState(false)

  useEffect(() => {
    // Vérifier si le mode debug est activé
    const debugModeEnv = process.env.NEXT_PUBLIC_DEBUG_MODE
    const nodeEnv = process.env.NODE_ENV
    
    console.log('🔍 Debug Time Context - Configuration:')
    console.log('  NEXT_PUBLIC_DEBUG_MODE:', debugModeEnv)
    console.log('  NODE_ENV:', nodeEnv)
    
    // Activer le mode debug si la variable est 'true' (insensible à la casse)
    const debugMode = debugModeEnv?.toLowerCase() === 'true'
    
    console.log('  isDebugMode:', debugMode)
    setIsDebugMode(debugMode)

    // Charger la date simulée du localStorage si elle existe
    if (debugMode && typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('debug_date')
      if (savedDate) {
        setCurrentDate(new Date(savedDate))
        console.log('  📅 Date simulée chargée:', savedDate)
      }
    }
  }, [])

  const saveDate = (date: Date) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug_date', date.toISOString())
    }
    setCurrentDate(date)
  }

  const addDays = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    saveDate(newDate)
  }

  const addWeeks = (weeks: number) => {
    addDays(weeks * 7)
  }

  const resetDate = () => {
    const realDate = new Date()
    saveDate(realDate)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('debug_date')
    }
  }

  return (
    <DebugTimeContext.Provider
      value={{
        currentDate,
        addDays,
        addWeeks,
        resetDate,
        isDebugMode
      }}
    >
      {children}
    </DebugTimeContext.Provider>
  )
}

export function useDebugTime() {
  const context = useContext(DebugTimeContext)
  if (context === undefined) {
    throw new Error('useDebugTime must be used within a DebugTimeProvider')
  }
  return context
}

// Hook pour obtenir la date actuelle (réelle ou simulée)
export function useCurrentDate() {
  const { currentDate, isDebugMode } = useDebugTime()
  return isDebugMode ? currentDate : new Date()
}
