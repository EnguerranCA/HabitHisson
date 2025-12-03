'use client'

import { useState } from 'react'
import { catchUpHabit } from '@/lib/habit-actions'

interface MissedHabit {
  id: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
}

interface CatchUpModalProps {
  missedHabits: MissedHabit[]
  onClose: () => void
}

export default function CatchUpModal({ missedHabits, onClose }: CatchUpModalProps) {
  const [caughtUpHabits, setCaughtUpHabits] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)

  const handleCatchUp = async (habitId: number) => {
    setProcessing(true)
    const result = await catchUpHabit(habitId)
    
    if (result.success) {
      setCaughtUpHabits(prev => new Set([...prev, habitId]))
    }
    setProcessing(false)
  }

  const handleIgnoreAll = () => {
    onClose()
  }

  const allCaughtUp = missedHabits.every(h => caughtUpHabits.has(h.id))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-primary/30 animate-pulse-soft">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-hedgehog-bounce">🦔</div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Oups ! Des oublis hier ?
          </h2>
          <p className="text-muted-foreground text-lg">
            Tu peux encore rattraper ces habitudes 💪
          </p>
        </div>

        {missedHabits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-success text-lg font-semibold mb-4">
              ✨ Aucune habitude manquée ! Bravo ! ✨
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Continuer
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {missedHabits.map((habit) => {
                const isCaughtUp = caughtUpHabits.has(habit.id)
                
                return (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isCaughtUp
                        ? 'bg-success/20 border-success/50'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{habit.emoji}</span>
                        <div>
                          <h3 className={`font-semibold text-lg ${
                            isCaughtUp ? 'text-success line-through' : 'text-foreground'
                          }`}>
                            {habit.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            habit.type === 'GOOD'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {habit.type === 'GOOD' ? 'Bonne' : 'Mauvaise'}
                          </span>
                        </div>
                      </div>
                      
                      {isCaughtUp ? (
                        <div className="text-success text-3xl font-bold">✓</div>
                      ) : (
                        <button
                          onClick={() => handleCatchUp(habit.id)}
                          disabled={processing}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            processing
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:scale-105 shadow-md'
                          }`}
                        >
                          {processing ? '⏳' : 'Rattraper'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleIgnoreAll}
                className="flex-1 bg-muted text-muted-foreground px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all border-2 border-border"
              >
                Ignorer
              </button>
              
              {allCaughtUp && (
                <button
                  onClick={onClose}
                  className="flex-1 btn-primary"
                >
                  Continuer ✨
                </button>
              )}
            </div>

            <p className="text-center text-muted-foreground text-sm mt-4">
              💡 Le rattrapage maintient ton streak en cours !
            </p>
          </>
        )}
      </div>
    </div>
  )
}
