'use client'

import { useState, useCallback } from 'react'
import { getUserHabits, toggleHabit, deleteHabit } from '@/lib/habit-actions'

interface HabitLog {
  id: number
  completed: boolean
  date: Date
}

interface Habit {
  id: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
  frequency: 'DAILY' | 'WEEKLY'
  createdAt: Date
  habitLogs: HabitLog[]
  completedToday?: boolean
}

interface AcornAnimationState {
  id: string
  startPos: { x: number; y: number }
  endPos: { x: number; y: number }
  count: number
  isLoss: boolean
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingHabit, setTogglingHabit] = useState<number | null>(null)
  const [userXP, setUserXP] = useState(0)
  const [acornAnimations, setAcornAnimations] = useState<AcornAnimationState[]>([])

  // Charger les habitudes
  const loadHabits = useCallback(async () => {
    try {
      const fetchedHabits = await getUserHabits()
      setHabits(fetchedHabits)
    } catch (error) {
      console.error('Erreur chargement habitudes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle une habitude
  const handleToggleHabit = useCallback(async (habitId: number) => {
    setTogglingHabit(habitId)
    
    // Mise à jour optimiste de l'interface
    setHabits(prevHabits => 
      prevHabits.map(h => 
        h.id === habitId 
          ? { ...h, completedToday: !h.completedToday }
          : h
      )
    )
    
    try {
      const result = await toggleHabit(habitId, new Date())
      
      if (result.success && result.xpGained !== undefined) {
        // Animation des glands entre l'habitude et le hérisson
        const habitElement = document.getElementById(`habit-${habitId}`)
        const hedgehogElement = document.getElementById('hedgehog-container')
        
        if (habitElement && hedgehogElement) {
          const habitRect = habitElement.getBoundingClientRect()
          const hedgehogRect = hedgehogElement.getBoundingClientRect()
          
          const isGain = result.xpGained > 0
          const acornCount = Math.abs(result.xpGained) >= 50 ? 5 : 1
          
          // Position de départ et d'arrivée selon gain ou perte
          const startPos = isGain 
            ? { x: habitRect.left + habitRect.width / 2 - 16, y: habitRect.top + habitRect.height / 2 - 16 }
            : { x: hedgehogRect.left + hedgehogRect.width / 2 - 16, y: hedgehogRect.top + hedgehogRect.height / 2 - 16 }
          
          const endPos = isGain
            ? { x: hedgehogRect.left + hedgehogRect.width / 2 - 16, y: hedgehogRect.top + hedgehogRect.height / 2 - 16 }
            : { x: habitRect.left + habitRect.width / 2 - 16, y: habitRect.top + habitRect.height / 2 - 16 }
          
          const animationId = `${Date.now()}-${habitId}`
          
          setAcornAnimations(prev => [...prev, {
            id: animationId,
            startPos,
            endPos,
            count: acornCount,
            isLoss: !isGain,
          }])
        }
        
        // Mettre à jour l'XP localement
        setUserXP(prev => Math.max(0, prev + result.xpGained!))
      } else {
        // Rollback si échec
        setHabits(prevHabits =>
          prevHabits.map(h =>
            h.id === habitId
              ? { ...h, completedToday: !h.completedToday }
              : h
          )
        )
      }
    } catch (error) {
      console.error('Erreur toggle habitude:', error)
      // Rollback en cas d'erreur
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId
            ? { ...h, completedToday: !h.completedToday }
            : h
        )
      )
    } finally {
      setTogglingHabit(null)
    }
  }, [])

  // Supprimer une habitude
  const handleDeleteHabit = useCallback(async (habitId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette habitude ?')) {
      return
    }

    try {
      const result = await deleteHabit(habitId)
      if (result.success) {
        await loadHabits()
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }, [loadHabits])

  // Callback pour supprimer une animation terminée
  const removeAnimation = useCallback((id: string) => {
    setAcornAnimations(prev => prev.filter(anim => anim.id !== id))
  }, [])

  return {
    habits,
    loading,
    togglingHabit,
    userXP,
    acornAnimations,
    loadHabits,
    handleToggleHabit,
    handleDeleteHabit,
    removeAnimation,
    setUserXP,
  }
}
