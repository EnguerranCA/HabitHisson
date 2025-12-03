'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@repo/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { calculateXPGain, calculateLevelFromXP } from '@/lib/xp-utils'

const CreateHabit = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  emoji: z.string().min(1, 'Un emoji est requis'),
  type: z.enum(['GOOD', 'BAD']),
  frequency: z.enum(['DAILY', 'WEEKLY']),
})

export type HabitFormState = {
  errors?: {
    name?: string[]
    emoji?: string[]
    type?: string[]
    frequency?: string[]
  }
  message?: string
}

export async function createHabit(prevState: HabitFormState, formData: FormData): Promise<HabitFormState> {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const validatedFields = CreateHabit.safeParse({
    name: formData.get('name'),
    emoji: formData.get('emoji'),
    type: formData.get('type'),
    frequency: formData.get('frequency'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs invalides. Échec de la création de l\'habitude.',
    }
  }

  const { name, emoji, type, frequency } = validatedFields.data

  try {
    await prisma.habit.create({
      data: {
        name,
        emoji,
        type: type as 'GOOD' | 'BAD',
        frequency: frequency as 'DAILY' | 'WEEKLY',
        userId: parseInt(session.user.id),
      }
    })
  } catch (error) {
    return {
      message: 'Erreur de base de données: Échec de la création de l\'habitude.',
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function getUserHabits() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  const userId = parseInt(session.user.id)
  const today = new Date()
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  try {
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        habitLogs: {
          where: {
            date: dateOnly
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // Ajouter le statut de complétion pour aujourd'hui
    return habits.map(habit => ({
      ...habit,
      completedToday: habit.habitLogs[0]?.completed ?? false
    }))
  } catch (error) {
    console.error('Error fetching habits:', error)
    return []
  }
}

export async function toggleHabit(habitId: number, date: Date) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userId = parseInt(session.user.id)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  try {
    // Récupérer l'habitude pour connaître sa fréquence
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { frequency: true }
    })

    if (!habit) {
      return { success: false, error: 'Habitude non trouvée.' }
    }

    // Vérifier si le log existe déjà
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: dateOnly
        }
      }
    })

    const wasCompletedBefore = existingLog?.completed ?? false
    let willBeCompleted = !wasCompletedBefore

    if (existingLog) {
      // Toggle l'état existant
      await prisma.habitLog.update({
        where: {
          habitId_date: {
            habitId,
            date: dateOnly
          }
        },
        data: {
          completed: !existingLog.completed
        }
      })
      willBeCompleted = !existingLog.completed
    } else {
      // Créer un nouveau log (toujours completed=true au premier clic)
      await prisma.habitLog.create({
        data: {
          habitId,
          userId,
          date: dateOnly,
          completed: true
        }
      })
      willBeCompleted = true
    }

    // ═══════════════════════════════════════════════════════════
    // 🌰 GAIN D'XP (US10)
    // ═══════════════════════════════════════════════════════════
    let xpGained = 0
    
    if (willBeCompleted && !wasCompletedBefore) {
      // L'habitude vient d'être cochée → gagner de l'XP
      xpGained = calculateXPGain(habit.frequency as 'DAILY' | 'WEEKLY')
      
      // Mettre à jour l'XP de l'utilisateur
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: xpGained
          }
        },
        select: { xp: true }
      })

      // Calculer le nouveau niveau
      const newLevel = calculateLevelFromXP(user.xp)
      
      // Mettre à jour le niveau dans la table User
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel }
      })
    } else if (!willBeCompleted && wasCompletedBefore) {
      // L'habitude vient d'être décochée → retirer l'XP
      const xpToRemove = calculateXPGain(habit.frequency as 'DAILY' | 'WEEKLY')
      xpGained = -xpToRemove
      
      // Récupérer l'XP actuel pour éviter qu'il devienne négatif
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true }
      })

      if (!currentUser) {
        return { success: false, error: 'Utilisateur non trouvé.' }
      }

      // Calculer le nouvel XP (minimum 0)
      const newXP = Math.max(0, currentUser.xp - xpToRemove)
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXP
        },
        select: { xp: true }
      })

      const newLevel = calculateLevelFromXP(user.xp)
      
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel }
      })
    }

    revalidatePath('/dashboard')
    return { success: true, xpGained }
  } catch (error) {
    console.error('Error in toggleHabit:', error)
    return { success: false, error: 'Erreur lors de la mise à jour de l\'habitude.' }
  }
}

// ═══════════════════════════════════════════════════════════
// 🔙 SYSTÈME DE RATTRAPAGE (US6)
// ═══════════════════════════════════════════════════════════

export async function getMissedHabitsFromYesterday() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  const userId = parseInt(session.user.id)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  try {
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true,
        frequency: 'DAILY' // Seules les habitudes quotidiennes peuvent être rattrapées
      },
      include: {
        habitLogs: {
          where: {
            date: yesterdayDate
          }
        }
      }
    })
    
    // Filtrer les habitudes non complétées hier
    return habits.filter(habit => 
      habit.habitLogs.length === 0 || 
      (habit.habitLogs[0] && !habit.habitLogs[0].completed)
    ).map(habit => ({
      id: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      type: habit.type,
      frequency: habit.frequency
    }))
  } catch (error) {
    console.error('Error fetching missed habits:', error)
    return []
  }
}

export async function catchUpHabit(habitId: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userId = parseInt(session.user.id)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  try {
    // Vérifier si déjà rattrapé
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: yesterdayDate
        }
      }
    })

    if (existingLog) {
      // Mettre à jour l'existant
      await prisma.habitLog.update({
        where: {
          habitId_date: {
            habitId,
            date: yesterdayDate
          }
        },
        data: {
          completed: true
        }
      })
    } else {
      // Créer un nouveau log de rattrapage
      await prisma.habitLog.create({
        data: {
          habitId,
          userId,
          date: yesterdayDate,
          completed: true
        }
      })
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error catching up habit:', error)
    return { success: false, error: 'Erreur lors du rattrapage de l\'habitude.' }
  }
}

export async function checkIfShouldShowCatchUp() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return false
  }

  const userId = parseInt(session.user.id)

  try {
    // Vérifier si l'utilisateur a un lastLoginDate
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    })

    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Si pas de lastLoginDate ou si c'était hier ou avant
    if (!userProgress?.lastLoginDate) {
      // Créer ou mettre à jour le UserProgress
      await prisma.userProgress.upsert({
        where: { userId },
        update: { lastLoginDate: todayDate },
        create: {
          userId,
          lastLoginDate: todayDate,
          totalXp: 0,
          currentLevel: 1,
          bestStreak: 0
        }
      })
      return true // Premier login, vérifier les habitudes manquées
    }

    const lastLogin = new Date(userProgress.lastLoginDate)
    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())

    // Si le dernier login était hier, proposer le rattrapage
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

    if (lastLoginDate.getTime() < todayDate.getTime()) {
      // Mettre à jour le lastLoginDate
      await prisma.userProgress.update({
        where: { userId },
        data: { lastLoginDate: todayDate }
      })

      // Montrer le popup uniquement si c'était hier
      return lastLoginDate.getTime() === yesterdayDate.getTime()
    }

    return false
  } catch (error) {
    console.error('Error checking catch-up status:', error)
    return false
  }
}