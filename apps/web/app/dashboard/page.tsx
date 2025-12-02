'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import CreateHabitForm from '@/components/create-habit-form'
import { getUserHabits, toggleHabit } from '@/lib/habit-actions'

interface Habit {
  id: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
  frequency: 'DAILY' | 'WEEKLY'
  createdAt: Date
}

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    async function loadHabits() {
      try {
        const userHabits = await getUserHabits()
        setHabits(userHabits)
      } catch (error) {
        console.error('Erreur lors du chargement des habitudes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadHabits()
  }, [])

  const handleToggleHabit = async (habitId: number) => {
    try {
      await toggleHabit(habitId, today)
      // Recharger les habitudes
      const userHabits = await getUserHabits()
      setHabits(userHabits)
    } catch (error) {
      console.error('Erreur lors du toggle de l\'habitude:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-2xl text-orange-600">Chargement... 🦔</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🦔 Salut !
              </h1>
              <p className="text-gray-600">Voici tes habitudes du jour</p>
            </div>
            <button 
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </header>

        {habits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-200 text-center">
            <div className="text-6xl mb-4">🦔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune habitude pour le moment</h3>
            <p className="text-gray-600 mb-6">
              Commencez votre parcours en créant votre première habitude !
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
            >
              ✨ Créer ma première habitude
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Mes habitudes</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ➕ Ajouter
              </button>
            </div>
            
            <div className="grid gap-4">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{habit.emoji}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                      <div className="flex space-x-2 text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          habit.type === 'GOOD' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {habit.type === 'GOOD' ? '✨ Bonne' : '🚫 Mauvaise'}
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          {habit.frequency === 'DAILY' ? '📅 Quotidienne' : '📊 Hebdomadaire'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-orange-500 transition-colors flex items-center justify-center"
                  >
                    <div className="w-6 h-6 bg-orange-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCreateForm && (
          <CreateHabitForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>
    </div>
  )
}