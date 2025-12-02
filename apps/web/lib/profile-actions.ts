'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@repo/db'

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
    habits: any[]
    habitLogs: any[]
    userProgress: { bestStreak: number } | null
  }

  return {
    id: userWithRelations.id,
    name: userWithRelations.name,
    email: userWithRelations.email,
    level: userWithRelations.level,
    xp: userWithRelations.xp,
    hedgehogState: userWithRelations.hedgehogState,
    profilePublic: userWithRelations.profilePublic ?? false,
    createdAt: userWithRelations.createdAt,
    totalHabits: userWithRelations.habits?.length ?? 0,
    totalCompletions: userWithRelations.habitLogs?.length ?? 0,
    bestStreak: userWithRelations.userProgress?.bestStreak ?? 0,
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
