'use server'

import { prisma } from '@repo/db'
import { auth } from '@/lib/auth'

export interface LeaderboardEntry {
  rank: number
  userId: number
  name: string
  level: number
  xp: number
  isCurrentUser: boolean
}

export interface LeaderboardData {
  topPlayers: LeaderboardEntry[]
  currentUserRank: number | null
  currentUserEntry: LeaderboardEntry | null
  totalPlayers: number
}

// Obtenir le classement mondial
export async function getLeaderboard(period: 'week' | 'month' | 'all-time' = 'all-time'): Promise<LeaderboardData> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return {
      topPlayers: [],
      currentUserRank: null,
      currentUserEntry: null,
      totalPlayers: 0
    }
  }

  const currentUserId = parseInt(session.user.id)

  try {
    // Calculer la date de début selon la période
    let startDate: Date | undefined
    const now = new Date()
    
    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 1)
    }

    // Récupérer tous les utilisateurs avec leur XP
    // Note: Pour l'instant on utilise l'XP total. Pour les périodes, il faudrait calculer l'XP gagné pendant la période
    const allUsers = await prisma.user.findMany({
      where: startDate ? {
        createdAt: { gte: startDate }
      } : {},
      select: {
        id: true,
        name: true,
        level: true,
        xp: true,
      },
      orderBy: [
        { xp: 'desc' },
        { level: 'desc' },
      ],
    })

    const totalPlayers = allUsers.length

    // Créer le classement avec les rangs
    const leaderboard: LeaderboardEntry[] = allUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name || `Joueur ${user.id}`,
      level: user.level,
      xp: user.xp,
      isCurrentUser: user.id === currentUserId
    }))

    // Top 10
    const topPlayers = leaderboard.slice(0, 10)

    // Position de l'utilisateur actuel
    const currentUserIndex = leaderboard.findIndex(entry => entry.userId === currentUserId)
    const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null
    const currentUserEntry = currentUserIndex >= 0 && leaderboard[currentUserIndex] ? leaderboard[currentUserIndex] : null

    return {
      topPlayers,
      currentUserRank,
      currentUserEntry,
      totalPlayers
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du classement:', error)
    return {
      topPlayers: [],
      currentUserRank: null,
      currentUserEntry: null,
      totalPlayers: 0
    }
  }
}
