'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import CreateHabitForm from '@/components/create-habit-form'
import EditHabitModal from '@/components/edit-habit-modal'
import CatchUpModal from '@/components/catch-up-modal'
import { MobileNav } from '@/components/mobile-nav'
import { HedgehogDisplay } from '@/components/hedgehog-display'
import { AcornAnimation } from '@/components/acorn-animation'
import { HabitCard } from '@/components/habit-card'
import { LoadingSpinner } from '@/components/loading-spinner'
import { useHabits } from '@/hooks/useHabits'
import { useCatchUp } from '@/hooks/useCatchUp'
import { getUserXP } from '@/lib/user-actions'

interface Habit {
  id: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
  frequency: 'DAILY' | 'WEEKLY'
  createdAt: Date
  habitLogs: Array<{
    id: number
    completed: boolean
    date: Date
  }>
  completedToday?: boolean
}

export default function Dashboard() {
  // États locaux pour les modales
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const today = new Date()

  // Hooks custom
  const {
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
  } = useHabits()

  const {
    showCatchUpModal,
    missedHabits,
    checkCatchUp,
    closeCatchUpModal,
  } = useCatchUp()

  // Chargement initial
  useEffect(() => {
    async function initialize() {
      try {
        // Charger les habitudes et l'XP en parallèle
        const [, xpData] = await Promise.all([
          loadHabits(),
          getUserXP(),
        ])
        
        setUserXP(xpData.xp)

        // Vérifier s'il faut afficher le popup de rattrapage
        await checkCatchUp()
      } catch (error) {
        console.error('Erreur initialisation:', error)
      }
    }
    
    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers pour les modales
  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowEditModal(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Animations des glands */}
      {acornAnimations.map((anim) => (
        <AcornAnimation
          key={anim.id}
          startPosition={anim.startPos}
          endPosition={anim.endPos}
          count={anim.count}
          onComplete={() => removeAnimation(anim.id)}
        />
      ))}

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
          </div>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* 🦔 Le fond derrière le hérisson */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <div 
            className="relative rounded-3xl p-4 mb-6 overflow-hidden shadow-lg"
            style={{
              background: 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 40%, #90EE90 60%, #7CFC00 100%)',
            }}
          >
            {/* Soleil */}
            <div className="absolute top-6 right-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg"></div>
            
            {/* Nuages flat */}
            <div className="absolute top-12 left-12">
              <div className="flex items-center">
                <div className="w-12 h-8 bg-white rounded-full"></div>
                <div className="w-16 h-10 bg-white rounded-full -ml-4"></div>
                <div className="w-12 h-8 bg-white rounded-full -ml-4"></div>
              </div>
            </div>
            
            <div className="absolute top-20 right-24">
              <div className="flex items-center opacity-80">
                <div className="w-10 h-7 bg-white rounded-full"></div>
                <div className="w-14 h-9 bg-white rounded-full -ml-3"></div>
                <div className="w-10 h-7 bg-white rounded-full -ml-3"></div>
              </div>
            </div>

            {/* Collines au loin */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-400 rounded-t-full transform scale-x-150"></div>

            {/* Hérisson au centre */}
            <div className="relative z-10 flex justify-center" id="hedgehog-container">
              <HedgehogDisplay xp={userXP} showXPBar={true} size="medium" />
            </div>
          </div>
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
              className="bg-primary rounded-3xl text-lg text-white px-6 py-3 font-semibold hover:scale-105 transition-transform shadow-md cursor-pointer"
            >
              ✨ Créer ma première habitude
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-foreground">
                Mes habitudes
              </h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary rounded-2xl text-white px-4 py-2 font-medium hover:scale-105 transition-transform shadow-md cursor-pointer flex items-center gap-2"
              >
                <Plus />
                Nouvelle habitude
              </button>
            </div>
            
            <div className="grid gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isToggling={togglingHabit === habit.id}
                  onToggle={handleToggleHabit}
                  onEdit={handleEdit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation mobile */}
      <MobileNav />

      {/* Modales */}
      {showCreateForm && (
        <CreateHabitForm onClose={() => setShowCreateForm(false)} />
      )}

      {showEditModal && editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => {
            setShowEditModal(false)
            setEditingHabit(null)
          }}
        />
      )}

      {showCatchUpModal && (
        <CatchUpModal
          missedHabits={missedHabits}
          onClose={closeCatchUpModal}
        />
      )}
    </div>
  )
}
