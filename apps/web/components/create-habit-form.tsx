'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { createHabit, HabitFormState } from '@/lib/habit-actions'

const emojis = ['✅', '📚', '🏃‍♂️', '💧', '🥗', '💪', '😴', '📱', '🚬', '🍺', '🍕', '📺', '🎮', '💻', '📖', '🧘‍♀️', '🚿', '🦷', '☕', '🎨']

export default function CreateHabitForm({ onClose }: { onClose: () => void }) {
  const initialState: HabitFormState = { message: '', errors: {} }
  const [state, dispatch] = useActionState(createHabit, initialState)
  const [selectedEmoji, setSelectedEmoji] = useState('✅')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-2 border-orange-200">
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
              <div className="text-red-600 text-sm mt-1">
                {state.errors.name.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emoji
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-3 rounded-lg border-2 transition-colors ${
                    selectedEmoji === emoji
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input type="hidden" name="emoji" value={selectedEmoji} />
            {state?.errors?.emoji && (
              <div className="text-red-600 text-sm mt-1">
                {state.errors.emoji.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'habitude
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="type"
                  value="GOOD"
                  defaultChecked
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-green-600 font-medium">✨ Bonne habitude</span>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="type"
                  value="BAD"
                  className="text-red-500 focus:ring-red-500"
                />
                <span className="ml-2 text-red-600 font-medium">🚫 Mauvaise habitude</span>
              </label>
            </div>
            {state?.errors?.type && (
              <div className="text-red-600 text-sm mt-1">
                {state.errors.type.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="frequency"
                  value="DAILY"
                  defaultChecked
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 font-medium">📅 Quotidienne</span>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="frequency"
                  value="WEEKLY"
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 font-medium">📊 Hebdomadaire</span>
              </label>
            </div>
            {state?.errors?.frequency && (
              <div className="text-red-600 text-sm mt-1">
                {state.errors.frequency.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <CreateHabitButton />

          {state?.message && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {state.message}
            </div>
          )}
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
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
    >
      {pending ? 'Création...' : 'Créer l\'habitude'}
    </button>
  )
}