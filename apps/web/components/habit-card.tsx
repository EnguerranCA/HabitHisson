'use client'

import { motion } from 'framer-motion'
import { Pencil, Trash2, Check } from 'lucide-react'

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

interface HabitCardProps {
  habit: Habit
  isToggling: boolean
  onToggle: (habitId: number) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: number) => void
}

export function HabitCard({ habit, isToggling, onToggle, onEdit, onDelete }: HabitCardProps) {
  const isGoodHabit = habit.type === 'GOOD'
  const isCompleted = habit.completedToday ?? false

  return (
    <div
      id={`habit-${habit.id}`}
      className={`p-4 bg-white transition-all duration-300 rounded-2xl ${
        isCompleted ? 'bg-success/5 border-success/40' : 'bg-card'
      }`}
    >
      <div className="flex items-center justify-between rounded-2xl">
        {/* Partie gauche : Emoji + Infos */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="text-4xl">{habit.emoji}</div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {habit.name}
            </h3>
            
            <div className="flex gap-2 flex-wrap">
              {/* Type */}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isGoodHabit 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isGoodHabit ? 'Bonne' : 'Mauvaise'}
              </span>

              {/* Fréquence */}
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                {habit.frequency === 'DAILY' ? 'Quotidienne' : 'Hebdomadaire'}
              </span>
            </div>
          </div>
        </div>

        {/* Partie droite : Actions dans un grand carré */}
        <div className="flex items-center gap-2">
          {/* Grand bouton checkbox */}
          <button
            onClick={() => onToggle(habit.id)}
            disabled={isToggling}
            className={`relative w-14 h-14 rounded-2xl border-3 transition-all duration-300 flex items-center justify-center ${
              isCompleted
                ? 'bg-success border-success shadow-lg scale-100'
                : 'bg-input border-border hover:border-primary hover:scale-105'
            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isCompleted && <Check className="h-8 w-8 text-white" strokeWidth={3} />}
          </button>

          {/* Bouton Edit */}
          <button
            onClick={() => onEdit(habit)}
            className="w-14 h-14 rounded-2xl border-3 border-border bg-input hover:border-primary hover:bg-secondary transition-all flex items-center justify-center"
            title="Modifier"
          >
            <Pencil size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
