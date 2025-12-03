'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@repo/db'

// ═══════════════════════════════════════════════════════════
// 📊 STATISTIQUES DE PRODUCTIVITÉ (US13)
// ═══════════════════════════════════════════════════════════

export interface WeeklyStats {
  weekStart: string // Date de début de semaine (YYYY-MM-DD)
  weekEnd: string
  totalHabits: number
  completedHabits: number
  successRate: number // Pourcentage de réussite
  xpEarned: number
}

export interface DailyXP {
  date: string // YYYY-MM-DD
  xp: number // XP gagné ce jour
  cumulativeXP: number // XP total cumulé à cette date
}

export interface HabitStats {
  habitId: number
  name: string
  emoji: string
  type: 'GOOD' | 'BAD'
  frequency: 'DAILY' | 'WEEKLY'
  totalCompletions: number
  currentStreak: number
  bestStreak: number
  successRate: number // % de jours réussis
  weeklyData: { week: string; completed: number; total: number }[]
}

export interface MonthComparison {
  currentMonth: {
    name: string
    successRate: number
    totalCompletions: number
    xpEarned: number
  }
  previousMonth: {
    name: string
    successRate: number
    totalCompletions: number
    xpEarned: number
  }
  change: {
    successRate: number // Différence en points de %
    completions: number // Différence en nombre
    xp: number // Différence en XP
  }
}

export interface ProductivityStats {
  weekly: WeeklyStats[]
  dailyXP: DailyXP[]
  habits: HabitStats[]
  monthComparison: MonthComparison
  globalStats: {
    totalHabits: number
    totalCompletions: number
    overallSuccessRate: number
    totalXP: number
    averageDaily: number
  }
}

/**
 * Récupère les statistiques de productivité complètes
 * @param period - Nombre de semaines à récupérer (default: 12)
 * @param habitId - ID d'une habitude spécifique (optionnel, sinon toutes)
 */
export async function getProductivityStats(
  period: number = 12,
  habitId?: number
): Promise<ProductivityStats> {
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Date de début (il y a X semaines)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - period * 7)

  // Récupérer toutes les habitudes actives
  const habitsQuery = habitId
    ? { userId: user.id, id: habitId, isActive: true }
    : { userId: user.id, isActive: true }

  const habits = await prisma.habit.findMany({
    where: habitsQuery,
    include: {
      habitLogs: {
        where: {
          date: { gte: startDate },
        },
        orderBy: { date: 'asc' },
      },
    },
  })

  // ═══════════════════════════════════════════════════════════
  // 📈 CALCUL DES STATS HEBDOMADAIRES
  // ═══════════════════════════════════════════════════════════
  const weeklyStats: WeeklyStats[] = []
  
  for (let w = 0; w < period; w++) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - (period - w) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    let totalHabits = 0
    let completedHabits = 0
    let xpEarned = 0

    habits.forEach((habit) => {
      // Compter les jours où l'habitude était active cette semaine
      const habitCreatedAt = new Date(habit.createdAt)
      habitCreatedAt.setHours(0, 0, 0, 0)

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(dayDate.getDate() + d)

        // Vérifier si l'habitude existait ce jour
        if (dayDate >= habitCreatedAt && dayDate <= today) {
          // Pour les habitudes hebdomadaires, ne compter qu'une fois par semaine
          if (habit.frequency === 'WEEKLY' && d > 0) continue
          
          totalHabits++

          // Vérifier si complétée ce jour
          const isCompleted = habit.habitLogs.some((log) => {
            const logDate = new Date(log.date)
            logDate.setHours(0, 0, 0, 0)
            return logDate.getTime() === dayDate.getTime() && log.completed
          })

          if (isCompleted) {
            completedHabits++
            xpEarned += habit.frequency === 'DAILY' ? 10 : 50
          }
        }
      }
    })

    weeklyStats.push({
      weekStart: weekStart.toISOString().split('T')[0] ?? '',
      weekEnd: weekEnd.toISOString().split('T')[0] ?? '',
      totalHabits,
      completedHabits,
      successRate: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
      xpEarned,
    })
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 ÉVOLUTION DE L'XP QUOTIDIEN
  // ═══════════════════════════════════════════════════════════
  const dailyXP: DailyXP[] = []
  let cumulativeXP = 0

  for (let d = period * 7; d >= 0; d--) {
    const dayDate = new Date(today)
    dayDate.setDate(dayDate.getDate() - d)
    
    let dayXP = 0
    habits.forEach((habit) => {
      const isCompleted = habit.habitLogs.some((log) => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return (
          logDate.getTime() === dayDate.getTime() &&
          log.completed
        )
      })

      if (isCompleted) {
        // Logique inversée pour les mauvaises habitudes
        if (habit.type === 'GOOD') {
          dayXP += habit.frequency === 'DAILY' ? 10 : 50
        } else {
          dayXP -= habit.frequency === 'DAILY' ? 10 : 50
        }
      }
    })

    cumulativeXP = Math.max(0, cumulativeXP + dayXP)
    
    dailyXP.push({
      date: dayDate.toISOString().split('T')[0] ?? '',
      xp: dayXP,
      cumulativeXP,
    })
  }

  // ═══════════════════════════════════════════════════════════
  // 🎯 STATS PAR HABITUDE
  // ═══════════════════════════════════════════════════════════
  const habitStats: HabitStats[] = habits.map((habit) => {
    const completedLogs = habit.habitLogs.filter((l) => l.completed)
    const totalCompletions = completedLogs.length

    // Calcul du streak actuel
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    const checkDate = new Date(today)

    // Parcourir les 365 derniers jours pour les streaks
    for (let i = 0; i < 365; i++) {
      const hasLog = completedLogs.some((log) => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === checkDate.getTime()
      })

      if (hasLog) {
        tempStreak++
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak
        }
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        if (i === 0) {
          // Aujourd'hui pas encore fait, continuer
        } else {
          tempStreak = 0
          if (currentStreak > 0 && i > 1) {
            // Le streak s'est cassé
          }
        }
      }
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Calcul du taux de réussite
    const habitCreatedAt = new Date(habit.createdAt)
    habitCreatedAt.setHours(0, 0, 0, 0)
    const daysSinceCreation = Math.ceil(
      (today.getTime() - habitCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    const expectedCompletions =
      habit.frequency === 'DAILY'
        ? daysSinceCreation
        : Math.ceil(daysSinceCreation / 7)
    const successRate =
      expectedCompletions > 0
        ? Math.round((totalCompletions / expectedCompletions) * 100)
        : 0

    // Stats hebdomadaires par habitude
    const weeklyData = weeklyStats.map((week) => {
      const weekStartDate = new Date(week.weekStart)
      const weekEndDate = new Date(week.weekEnd)
      
      const completedThisWeek = completedLogs.filter((log) => {
        const logDate = new Date(log.date)
        return logDate >= weekStartDate && logDate <= weekEndDate
      }).length

      const totalExpected = habit.frequency === 'DAILY' ? 7 : 1
      
      return {
        week: week.weekStart,
        completed: completedThisWeek,
        total: totalExpected,
      }
    })

    return {
      habitId: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      type: habit.type as 'GOOD' | 'BAD',
      frequency: habit.frequency as 'DAILY' | 'WEEKLY',
      totalCompletions,
      currentStreak,
      bestStreak,
      successRate: Math.min(100, successRate),
      weeklyData,
    }
  })

  // ═══════════════════════════════════════════════════════════
  // 📅 COMPARAISON MOIS ACTUEL VS PRÉCÉDENT
  // ═══════════════════════════════════════════════════════════
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  const calculateMonthStats = (start: Date, end: Date) => {
    let total = 0
    let completed = 0
    let xp = 0

    habits.forEach((habit) => {
      const habitCreatedAt = new Date(habit.createdAt)
      habitCreatedAt.setHours(0, 0, 0, 0)

      const dayCount = Math.ceil((end.getTime() - Math.max(start.getTime(), habitCreatedAt.getTime())) / (1000 * 60 * 60 * 24))
      if (dayCount <= 0) return

      if (habit.frequency === 'DAILY') {
        total += dayCount
      } else {
        total += Math.ceil(dayCount / 7)
      }

      habit.habitLogs.forEach((log) => {
        const logDate = new Date(log.date)
        if (logDate >= start && logDate <= end && log.completed) {
          completed++
          if (habit.type === 'GOOD') {
            xp += habit.frequency === 'DAILY' ? 10 : 50
          }
        }
      })
    })

    return {
      total,
      completed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      xp,
    }
  }

  const currentStats = calculateMonthStats(currentMonthStart, today)
  const previousStats = calculateMonthStats(previousMonthStart, previousMonthEnd)

  const monthComparison: MonthComparison = {
    currentMonth: {
      name: monthNames[today.getMonth()] ?? '',
      successRate: currentStats.successRate,
      totalCompletions: currentStats.completed,
      xpEarned: currentStats.xp,
    },
    previousMonth: {
      name: monthNames[previousMonthStart.getMonth()] ?? '',
      successRate: previousStats.successRate,
      totalCompletions: previousStats.completed,
      xpEarned: previousStats.xp,
    },
    change: {
      successRate: currentStats.successRate - previousStats.successRate,
      completions: currentStats.completed - previousStats.completed,
      xp: currentStats.xp - previousStats.xp,
    },
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 STATS GLOBALES
  // ═══════════════════════════════════════════════════════════
  const totalCompletions = habitStats.reduce((sum, h) => sum + h.totalCompletions, 0)
  const overallSuccessRate =
    weeklyStats.length > 0
      ? Math.round(
          weeklyStats.reduce((sum, w) => sum + w.successRate, 0) / weeklyStats.length
        )
      : 0

  return {
    weekly: weeklyStats,
    dailyXP,
    habits: habitStats,
    monthComparison,
    globalStats: {
      totalHabits: habits.length,
      totalCompletions,
      overallSuccessRate,
      totalXP: user.xp,
      averageDaily: Math.round(totalCompletions / (period * 7)),
    },
  }
}

/**
 * Exporte les données de productivité en format CSV
 */
export async function exportProductivityCSV(): Promise<string> {
  const stats = await getProductivityStats(12)

  const lines: string[] = []

  // En-tête
  lines.push('=== STATISTIQUES DE PRODUCTIVITÉ ===')
  lines.push('')

  // Stats globales
  lines.push('RÉSUMÉ GLOBAL')
  lines.push(`Nombre d'habitudes,${stats.globalStats.totalHabits}`)
  lines.push(`Total complétions,${stats.globalStats.totalCompletions}`)
  lines.push(`Taux de réussite global,${stats.globalStats.overallSuccessRate}%`)
  lines.push(`Total glands,${stats.globalStats.totalXP}`)
  lines.push(`Moyenne quotidienne,${stats.globalStats.averageDaily}`)
  lines.push('')

  // Comparaison mensuelle
  lines.push('COMPARAISON MENSUELLE')
  lines.push(`Mois,Taux de réussite,Complétions,Glands gagnés`)
  lines.push(
    `${stats.monthComparison.currentMonth.name},${stats.monthComparison.currentMonth.successRate}%,${stats.monthComparison.currentMonth.totalCompletions},${stats.monthComparison.currentMonth.xpEarned}`
  )
  lines.push(
    `${stats.monthComparison.previousMonth.name},${stats.monthComparison.previousMonth.successRate}%,${stats.monthComparison.previousMonth.totalCompletions},${stats.monthComparison.previousMonth.xpEarned}`
  )
  lines.push('')

  // Stats hebdomadaires
  lines.push('STATISTIQUES HEBDOMADAIRES')
  lines.push('Semaine début,Semaine fin,Habitudes totales,Complétées,Taux de réussite,Glands gagnés')
  stats.weekly.forEach((week) => {
    lines.push(
      `${week.weekStart},${week.weekEnd},${week.totalHabits},${week.completedHabits},${week.successRate}%,${week.xpEarned}`
    )
  })
  lines.push('')

  // Stats par habitude
  lines.push('STATISTIQUES PAR HABITUDE')
  lines.push('Nom,Type,Fréquence,Complétions totales,Streak actuel,Meilleur streak,Taux de réussite')
  stats.habits.forEach((habit) => {
    lines.push(
      `${habit.emoji} ${habit.name},${habit.type === 'GOOD' ? 'Bonne' : 'Mauvaise'},${habit.frequency === 'DAILY' ? 'Quotidienne' : 'Hebdomadaire'},${habit.totalCompletions},${habit.currentStreak},${habit.bestStreak},${habit.successRate}%`
    )
  })
  lines.push('')

  // XP quotidien (derniers 30 jours)
  lines.push('ÉVOLUTION DES GLANDS (30 derniers jours)')
  lines.push('Date,Glands du jour,Glands cumulés')
  stats.dailyXP.slice(-30).forEach((day) => {
    lines.push(`${day.date},${day.xp},${day.cumulativeXP}`)
  })

  return lines.join('\n')
}
