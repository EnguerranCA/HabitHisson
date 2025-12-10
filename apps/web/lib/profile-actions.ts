'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@repo/db'
import { getHedgehogStage, getStageLabel, calculateLevelFromXP } from '@/lib/xp-utils'

export interface UserProfile {
  id: number
  name: string
  email: string
  level: number
  xp: number
  hedgehogState: string
  profilePublic: boolean
  createdAt: Date
  totalHabits: number
  totalCompletions: number
  bestStreak: number
}

/**
 * Récupère le profil complet de l'utilisateur avec statistiques
 */
export async function getUserProfile(): Promise<UserProfile> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Non authentifié')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      habits: {
        where: { isActive: true },
        include: {
          habitLogs: {
            where: { completed: true },
            orderBy: { date: 'asc' },
          },
        },
      },
      habitLogs: {
        where: { completed: true },
      },
      userProgress: true,
    },
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  // Cast temporaire pour éviter les erreurs TypeScript (en attendant regeneration Prisma)
  const userWithRelations = user as typeof user & {
    profilePublic: boolean
    habits: Array<{
      id: number
      habitLogs: Array<{ date: Date; completed: boolean }>
    }>
    habitLogs: any[]
    userProgress: { bestStreak: number } | null
  }

  // Calculer le meilleur streak global parmi toutes les habitudes
  let globalBestStreak = 0

  for (const habit of userWithRelations.habits) {
    const completedLogs = habit.habitLogs.filter((log) => log.completed)
    
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
    globalBestStreak = Math.max(globalBestStreak, bestStreak)
  }

  // Calculer le niveau réel à partir des XP (glands)
  const calculatedLevel = calculateLevelFromXP(userWithRelations.xp)
  
  // Calculer l'état du hérisson basé sur le niveau calculé
  const hedgehogStage = getHedgehogStage(calculatedLevel)
  
  // Mapper le stage vers les valeurs attendues en anglais
  const stageMap: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'baby',
    2: 'child',
    3: 'teen',
    4: 'adult',
    5: 'elder'
  }
  const hedgehogStateLabel = stageMap[hedgehogStage]

  return {
    id: userWithRelations.id,
    name: userWithRelations.name,
    email: userWithRelations.email,
    level: calculatedLevel, // Utiliser le niveau calculé à partir des XP
    xp: userWithRelations.xp,
    hedgehogState: hedgehogStateLabel, // Calculer dynamiquement au lieu de prendre de la BDD
    profilePublic: userWithRelations.profilePublic ?? false,
    createdAt: userWithRelations.createdAt,
    totalHabits: userWithRelations.habits?.length ?? 0,
    totalCompletions: userWithRelations.habitLogs?.length ?? 0,
    bestStreak: globalBestStreak, // Utiliser le streak calculé au lieu de userProgress.bestStreak
  }
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(data: { name?: string; profilePublic?: boolean }) {
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

  await prisma.user.update({
    where: { id: user.id },
    data,
  })
}
