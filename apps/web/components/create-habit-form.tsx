'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { createHabit, HabitFormState } from '@/lib/habit-actions'

const emojis = ['✅', '📚', '🏃‍♂️', '💧', '🥗', '💪', '😴', '📱', '🚬', '🍺']

export default function CreateHabitForm({ onClose }: { onClose: () => void }) {
  const initialState: HabitFormState = { message: '', errors: {} }
  const [state, dispatch] = useActionState(createHabit, initialState)
  const [selectedEmoji, setSelectedEmoji] = useState('✅')
  const [selectedType, setSelectedType] = useState<'GOOD' | 'BAD'>('GOOD')
  const [selectedFrequency, setSelectedFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-2 border-orange-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nouvelle habitude</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form action={dispatch} className="space-y-6">
          {/* Nom de l'habitude */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'habitude
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Ex: Boire 8 verres d'eau"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Sélection d'emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choisir un emoji
            </label>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-3xl p-3 rounded-lg transition-all hover:scale-110 ${
                    selectedEmoji === emoji
                      ? 'bg-orange-100 ring-2 ring-orange-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input type="hidden" name="emoji" value={selectedEmoji} />
            {state?.errors?.emoji && (
              <p className="mt-1 text-sm text-red-600">{state.errors.emoji[0]}</p>
            )}
          </div>

          {/* Type d'habitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type d'habitude
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedType('GOOD')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'GOOD'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Bonne habitude</div>
                <div className="text-xs text-gray-500 mt-1">À développer</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('BAD')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'BAD'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Mauvaise habitude</div>
                <div className="text-xs text-gray-500 mt-1">À éviter</div>
              </button>
            </div>
            <input type="hidden" name="type" value={selectedType} />
            {state?.errors?.type && (
              <p className="mt-1 text-sm text-red-600">{state.errors.type[0]}</p>
            )}
          </div>

          {/* Fréquence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fréquence
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedFrequency('DAILY')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  selectedFrequency === 'DAILY'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Quotidienne</div>
                <div className="text-xs text-gray-500 mt-1">Chaque jour</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFrequency('WEEKLY')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  selectedFrequency === 'WEEKLY'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Hebdomadaire</div>
                <div className="text-xs text-gray-500 mt-1">Chaque semaine</div>
              </button>
            </div>
            <input type="hidden" name="frequency" value={selectedFrequency} />
            {state?.errors?.frequency && (
              <p className="mt-1 text-sm text-red-600">{state.errors.frequency[0]}</p>
            )}
          </div>

          {/* Message d'erreur global */}
          {state?.message && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.message}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <CreateHabitButton />
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateHabitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-md cursor-pointer"
    >
      {pending ? 'Création...' : 'Créer'}
    </button>
  )
}