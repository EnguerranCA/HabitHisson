'use client'

import { useState } from 'react'
import { useDebugTime } from '@/lib/debug-time-context'

export default function DebugTimeMenu() {
  const { currentDate, addDays, addWeeks, resetDate, isDebugMode } = useDebugTime()
  const [isOpen, setIsOpen] = useState(false)

  if (!isDebugMode) {
    return null
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const realDate = new Date()
  // Normaliser les dates à minuit pour un calcul précis
  const realDateNormalized = new Date(realDate.getFullYear(), realDate.getMonth(), realDate.getDate())
  const currentDateNormalized = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
  const daysDiff = Math.round((currentDateNormalized.getTime() - realDateNormalized.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl font-bold hover:scale-110 transition-transform animate-pulse-soft"
        title="Mode Debug Temporel"
      >
        ⏱️
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-card border-3 border-purple-500 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
              ⏱️ Mode Debug Temporel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground text-2xl"
            >
              ×
            </button>
          </div>

          {/* Date actuelle simulée */}
          <div className="bg-purple-100 border-2 border-purple-300 rounded-2xl p-4 mb-4">
            <div className="text-sm text-purple-700 font-medium mb-1">
              📅 Date simulée
            </div>
            <div className="text-lg font-bold text-purple-900">
              {formatDate(currentDate)}
            </div>
            <div className="text-sm text-purple-600 mt-1">
              {formatTime(currentDate)}
            </div>
            
            {daysDiff !== 0 && (
              <div className="mt-2 text-sm text-purple-700">
                {daysDiff > 0 ? `+${daysDiff}` : daysDiff} jour{Math.abs(daysDiff) > 1 ? 's' : ''} vs réel
              </div>
            )}
          </div>

          {/* Boutons de contrôle */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addDays(1)}
                className="bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md"
              >
                +1 jour
              </button>
              <button
                onClick={() => addWeeks(1)}
                className="bg-accent text-accent-foreground px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md"
              >
                +1 semaine
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addDays(-1)}
                className="bg-muted text-muted-foreground px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all border-2 border-border"
              >
                -1 jour
              </button>
              <button
                onClick={() => addWeeks(-1)}
                className="bg-muted text-muted-foreground px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all border-2 border-border"
              >
                -1 semaine
              </button>
            </div>

            <button
              onClick={() => {
                resetDate()
                setIsOpen(false)
              }}
              className="w-full bg-destructive text-destructive-foreground px-4 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md"
            >
              🔄 Reset à la date réelle
            </button>
          </div>

          {/* Avertissement */}
          <div className="mt-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-xl">
            <p className="text-xs text-yellow-800">
              ⚠️ Mode développement uniquement. Cette date est stockée localement et affecte toutes les fonctionnalités temporelles.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
