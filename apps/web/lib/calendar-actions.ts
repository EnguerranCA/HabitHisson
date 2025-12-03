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

// ═══════════════════════════════════════════════════════════
// 🔥 SYSTÈME DE STREAKS (US5)
// ═══════════════════════════════════════════════════════════

export interface HabitStreak {
  habitId: number
  habitName: string
  emoji: string
  currentStreak: number
  bestStreak: number
  totalCompletions: number
  streakColor: string // Couleur basée sur le nombre de complétions
}

/**
 * Calcule les streaks pour toutes les habitudes de l'utilisateur
 */
export async function getHabitStreaks(): Promise<HabitStreak[]> {
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

  // Récupérer toutes les habitudes actives
  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      habitLogs: {
        where: { completed: true },
        orderBy: { date: 'desc' },
      },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return habits.map((habit) => {
    const completedLogs = habit.habitLogs.filter((log) => log.completed)
    
    // Calcul du streak actuel
    let currentStreak = 0
    const checkDate = new Date(today)
    
    for (let i = 0; i < 365; i++) {
      const hasLog = completedLogs.some((log) => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === checkDate.getTime()
      })
      
      if (hasLog) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // Si c'est aujourd'hui et pas encore fait, on continue
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        break
      }
    }

    // Calcul du meilleur streak historique
    let bestStreak = 0
    let tempStreak = 0
    let previousDate: Date | null = null

    const sortedLogs = [...completedLogs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedLogs.forEach((log) => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)

      if (previousDate === null) {
        tempStreak = 1
      } else {
        const daysDiff = Math.floor(
          (logDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysDiff === 1) {
          tempStreak++
        } else {
          bestStreak = Math.max(bestStreak, tempStreak)
          tempStreak = 1
        }
      }

      previousDate = logDate
    })

    bestStreak = Math.max(bestStreak, tempStreak)

    // Déterminer la couleur selon le nombre de complétions
    const totalCompletions = completedLogs.length
    let streakColor = '#10B981' // Vert par défaut

    if (totalCompletions >= 100) {
      streakColor = '#059669' // Vert très foncé (Centurion)
    } else if (totalCompletions >= 50) {
      streakColor = '#10B981' // Vert foncé
    } else if (totalCompletions >= 20) {
      streakColor = '#34D399' // Vert moyen
    } else if (totalCompletions >= 10) {
      streakColor = '#6EE7B7' // Vert clair
    } else {
      streakColor = '#A7F3D0' // Vert très clair
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      emoji: habit.emoji,
      currentStreak,
      bestStreak,
      totalCompletions,
      streakColor,
    }
  })
}

/**
 * Récupère l'historique du streak d'une habitude spécifique (30 derniers jours)
 */
export async function getStreakHistory(habitId: number): Promise<Array<{ date: string; streak: number }>> {
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

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      userId: user.id,
      completed: true,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Construire l'historique jour par jour
  const history: Array<{ date: string; streak: number }> = []
  let currentStreak = 0
  let previousDate: Date | null = null

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(thirtyDaysAgo)
    checkDate.setDate(checkDate.getDate() + i)
    
    const hasLog = logs.some((log) => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === checkDate.getTime()
    })

    if (hasLog) {
      if (previousDate === null || 
          Math.floor((checkDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
      previousDate = checkDate
    } else {
      currentStreak = 0
      previousDate = null
    }

    history.push({
      date: checkDate.toISOString().split('T')[0] ?? '',
      streak: currentStreak,
    })
  }

  return history
}
