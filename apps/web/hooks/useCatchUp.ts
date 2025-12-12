'use client'

import { useState, useCallback } from 'react'
import { checkIfShouldShowCatchUp, getMissedHabitsFromYesterday, catchUpHabit } from '@/lib/habit-actions'

interface MissedHabit {
  id: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
}

export function useCatchUp() {
  const [showCatchUpModal, setShowCatchUpModal] = useState(false)
  const [missedHabits, setMissedHabits] = useState<MissedHabit[]>([])

  // Vérifier si on doit montrer la modal de rattrapage
  const checkCatchUp = useCallback(async () => {
    try {
      const shouldShow = await checkIfShouldShowCatchUp()
      
      if (shouldShow) {
        const missed = await getMissedHabitsFromYesterday()
        if (missed.length > 0) {
          setMissedHabits(missed)
          setShowCatchUpModal(true)
        }
      }
    } catch (error) {
      console.error('Erreur vérification rattrapage:', error)
    }
  }, [])

  // Rattraper une habitude
  const handleCatchUp = useCallback(async (habitId: number, onSuccess?: () => void) => {
    try {
      const result = await catchUpHabit(habitId)
      if (result.success) {
        // Retirer de la liste des habitudes manquées
        setMissedHabits(prev => prev.filter(h => h.id !== habitId))
        
        // Callback optionnel (par exemple recharger les habitudes)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Erreur rattrapage:', error)
    }
  }, [])

  // Fermer la modal
  const closeCatchUpModal = useCallback(() => {
    setShowCatchUpModal(false)
    setMissedHabits([])
  }, [])

  return {
    showCatchUpModal,
    missedHabits,
    checkCatchUp,
    handleCatchUp,
    closeCatchUpModal,
  }
}
