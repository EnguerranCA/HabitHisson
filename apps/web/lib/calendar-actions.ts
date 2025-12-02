'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@repo/db'

export interface HabitLogWithHabit {
  id: number
  habitId: number
  date: Date
  completed: boolean
  habit: {
    id: number
    name: string
    emoji: string
    type: string
  }
}

export interface CalendarDayData {
  date: Date
  habits: Array<{
    habitId: number
    name: string
    emoji: string
    type: string
    completed: boolean
  }>
}

/**
 * Récupère tous les HabitLogs d'un mois spécifique pour l'utilisateur connecté
 * @param year - Année (ex: 2025)
 * @param month - Mois (1-12)
 */
export async function getHabitLogsForMonth(year: number, month: number) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Non authentifié')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  // Date de début et fin du mois
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Récupérer tous les HabitLogs du mois avec les infos de l'habitude
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      habit: {
        select: {
          id: true,
          name: true,
          emoji: true,
          type: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return habitLogs as HabitLogWithHabit[]
}

/**
 * Récupère les détails d'une journée spécifique (toutes les habitudes avec leur état)
 * @param date - Date au format YYYY-MM-DD
 */
export async function getDayDetails(date: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Non authentifié')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  const targetDate = new Date(date)

  // Récupérer toutes les habitudes actives
  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
  })

  // Récupérer les logs de ce jour
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      userId: user.id,
      date: targetDate,
    },
  })

  // Construire la structure de données
  const dayData: CalendarDayData = {
    date: targetDate,
    habits: habits.map((habit) => {
      const log = habitLogs.find((l) => l.habitId === habit.id)
      return {
        habitId: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        type: habit.type,
        completed: log?.completed ?? false,
      }
    }),
  }

  return dayData
}
