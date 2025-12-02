'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import CreateHabitForm from '@/components/create-habit-form'
import CatchUpModal from '@/components/catch-up-modal'
import { MobileNav } from '@/components/mobile-nav'
import { getUserHabits, toggleHabit, checkIfShouldShowCatchUp, getMissedHabitsFromYesterday } from '@/lib/habit-actions'

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

interface MissedHabit {
  id: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
}

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [missedHabits, setMissedHabits] = useState<MissedHabit[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCatchUpModal, setShowCatchUpModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [togglingHabit, setTogglingHabit] = useState<number | null>(null)
  const today = new Date()

  // Fonction de chargement des habitudes
  async function loadHabits() {
    try {
      setLoading(true)
      const userHabits = await getUserHabits()
      setHabits(userHabits)
    } catch (error) {
      console.error('Erreur lors du chargement des habitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Chargement initial + vérification rattrapage
  useEffect(() => {
    async function initialize() {
      try {
        // Charger les habitudes
        await loadHabits()

        // Vérifier s'il faut afficher le popup de rattrapage (seulement au premier chargement)
        const shouldShow = await checkIfShouldShowCatchUp()
        if (shouldShow) {
          const missed = await getMissedHabitsFromYesterday()
          if (missed.length > 0) {
            setMissedHabits(missed)
            setShowCatchUpModal(true)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      }
    }
    
    initialize()
  }, [])

  const handleToggleHabit = async (habitId: number) => {
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
      const result = await toggleHabit(habitId, today)
      
      if (!result.success) {
        // Annuler la mise à jour optimiste en cas d'erreur
        setHabits(prevHabits => 
          prevHabits.map(h => 
            h.id === habitId 
              ? { ...h, completedToday: !h.completedToday }
              : h
          )
        )
        console.error('Erreur:', result.error)
      }
    } catch (error) {
      // Annuler la mise à jour optimiste
      setHabits(prevHabits => 
        prevHabits.map(h => 
          h.id === habitId 
            ? { ...h, completedToday: !h.completedToday }
            : h
        )
      )
      console.error('Erreur lors du toggle de l\'habitude:', error)
    } finally {
      setTogglingHabit(null)
    }
  }

  const handleHabitCreated = () => {
    setShowCreateForm(false)
    // Recharger les habitudes
    loadHabits()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-2xl text-orange-600">Chargement... 🦔</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                🦔 Salut !
              </h1>
              <p className="text-muted-foreground text-lg">
                {today.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button 
              onClick={() => signOut()}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl transition-all hover:scale-105 font-semibold shadow-md"
            >
              Se déconnecter
            </button>
          </div>

          {/* Statistiques du jour */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-sm">
                <div className="text-muted-foreground text-sm font-medium mb-1">Total habitudes</div>
                <div className="text-3xl font-bold text-foreground">{habits.length}</div>
              </div>
              <div className="bg-success/10 border-2 border-success/40 rounded-2xl p-4 shadow-sm">
                <div className="text-success text-sm font-medium mb-1">✓ Accomplies</div>
                <div className="text-3xl font-bold text-success">
                  {habits.filter(h => h.completedToday).length}
                </div>
              </div>
              <div className="bg-warning/10 border-2 border-warning/40 rounded-2xl p-4 shadow-sm">
                <div className="text-warning-foreground text-sm font-medium mb-1">○ Restantes</div>
                <div className="text-3xl font-bold text-warning-foreground">
                  {habits.filter(h => !h.completedToday).length}
                </div>
              </div>
            </div>
          )}
        </header>

        {habits.length === 0 ? (
          <div className="bg-card rounded-3xl shadow-xl p-12 border-3 border-primary/20 text-center">
            <div className="text-8xl mb-6 animate-hedgehog-bounce">🦔</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Aucune habitude pour le moment
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              Commencez votre parcours en créant votre première habitude !
              Votre hérisson a hâte de grandir avec vous. 🌱
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary text-lg"
            >
              ✨ Créer ma première habitude
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">
                📋 Mes habitudes du jour
              </h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-secondary"
              >
                ➕ Ajouter une habitude
              </button>
            </div>
            
            <div className="grid gap-4">
              {habits.map((habit) => {
                const isCompleted = habit.completedToday
                const isToggling = togglingHabit === habit.id
                
                return (
                  <div
                    key={habit.id}
                    className={`habit-card transition-all duration-300 rounded-2xl ${
                      isCompleted ? 'bg-success/10 border-success/40' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between rounded-2xl">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-4xl">{habit.emoji}</div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold transition-all ${
                            isCompleted ? 'text-success line-through' : 'text-foreground'
                          }`}>
                            {habit.name}
                          </h3>
                          <div className="flex space-x-2 text-sm mt-1">
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              habit.type === 'GOOD' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-destructive/20 text-destructive'
                            }`}>
                              {habit.type === 'GOOD' ? '✨ Bonne' : '🚫 Mauvaise'}
                            </span>
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full font-medium">
                              {habit.frequency === 'DAILY' ? '📅 Quotidienne' : '📊 Hebdomadaire'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        disabled={isToggling}
                        className={`relative w-14 h-14 rounded-2xl border-3 transition-all duration-300 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-success border-success shadow-lg scale-110'
                            : 'bg-input border-border hover:border-primary hover:scale-105'
                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={isCompleted ? 'Marquer comme non fait' : 'Marquer comme fait'}
                      >
                        {isToggling ? (
                          <div className="animate-spin text-2xl">⏳</div>
                        ) : isCompleted ? (
                          <span className="text-3xl font-bold text-white">✓</span>
                        ) : (
                          <span className="text-2xl text-muted-foreground">○</span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {showCreateForm && (
          <CreateHabitForm onClose={() => setShowCreateForm(false)} />
        )}

        {showCatchUpModal && missedHabits.length > 0 && (
          <CatchUpModal
            missedHabits={missedHabits}
            onClose={() => {
              setShowCatchUpModal(false)
              // Recharger les habitudes après le rattrapage
              loadHabits()
            }}
          />
        )}

        <MobileNav />
      </div>
    </div>
  )
}