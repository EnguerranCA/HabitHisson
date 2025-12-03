'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { updateHabit, deleteHabit, HabitFormState } from '@/lib/habit-actions'

const emojis = ['✅', '📚', '🏃‍♂️', '💧', '🥗', '💪', '😴', '📱', '🚬', '🍺']

interface EditHabitModalProps {
  habit: {
    id: number
    name: string
    emoji: string
    type: 'GOOD' | 'BAD'
    frequency: 'DAILY' | 'WEEKLY'
  }
  onClose: () => void
}

export default function EditHabitModal({ habit, onClose }: EditHabitModalProps) {
  const initialState: HabitFormState = { message: '', errors: {} }
  const [state, dispatch] = useActionState(updateHabit.bind(null, habit.id), initialState)
  const [selectedEmoji, setSelectedEmoji] = useState(habit.emoji)
  const [selectedType, setSelectedType] = useState(habit.type)
  const [selectedFrequency, setSelectedFrequency] = useState(habit.frequency)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette habitude ? Cette action est irréversible.')) {
      return
    }
    
    setIsDeleting(true)
    const result = await deleteHabit(habit.id)
    
    if (result.success) {
      onClose()
      window.location.reload() // Recharger pour voir les changements
    } else {
      alert('Erreur lors de la suppression')
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-2 border-orange-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Modifier l'habitude</h2>
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
              defaultValue={habit.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Ex: Boire 8 verres d'eau"
            />
            {state.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

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
          </div>

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
                <div className="text-2xl mb-1">✅</div>
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
                <div className="text-2xl mb-1">❌</div>
                <div className="font-semibold">Mauvaise habitude</div>
                <div className="text-xs text-gray-500 mt-1">À éviter</div>
              </button>
            </div>
            <input type="hidden" name="type" value={selectedType} />
          </div>

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
                <div className="text-2xl mb-1">📅</div>
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
                <div className="text-2xl mb-1">📆</div>
                <div className="font-semibold">Hebdomadaire</div>
                <div className="text-xs text-gray-500 mt-1">Chaque semaine</div>
              </button>
            </div>
            <input type="hidden" name="frequency" value={selectedFrequency} />
          </div>

          {state.message && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 disabled:bg-red-300 transition-colors shadow-md"
            >
              {isDeleting ? 'Suppression...' : '🗑️ Supprimer'}
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:bg-orange-300 transition-colors shadow-md"
    >
      {pending ? 'Modification...' : '✅ Modifier'}
    </button>
  )
}
