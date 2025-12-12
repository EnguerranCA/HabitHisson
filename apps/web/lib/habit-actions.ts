'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@repo/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { calculateXPGain } from '@/lib/xp-utils'

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

// ═══════════════════════════════════════════════════════════
// 📝 UPDATE HABIT
// ═══════════════════════════════════════════════════════════
export async function updateHabit(habitId: number, prevState: HabitFormState, formData: FormData): Promise<HabitFormState> {
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
      message: 'Champs invalides. Échec de la modification de l\'habitude.',
    }
  }

  const { name, emoji, type, frequency } = validatedFields.data

  try {
    await prisma.habit.update({
      where: {
        id: habitId,
        userId: parseInt(session.user.id), // Sécurité : vérifier que c'est bien l'habitude de l'utilisateur
      },
      data: {
        name,
        emoji,
        type: type as 'GOOD' | 'BAD',
        frequency: frequency as 'DAILY' | 'WEEKLY',
      }
    })
  } catch (error) {
    return {
      message: 'Erreur de base de données: Échec de la modification de l\'habitude.',
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ═══════════════════════════════════════════════════════════
// 🗑️ DELETE HABIT
// ═══════════════════════════════════════════════════════════
export async function deleteHabit(habitId: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  try {
    // Soft delete: marquer comme inactif au lieu de supprimer
    await prisma.habit.update({
      where: {
        id: habitId,
        userId: parseInt(session.user.id), // Sécurité
      },
      data: {
        isActive: false
      }
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression habitude:', error)
    return { success: false, error: 'Erreur lors de la suppression.' }
  }
}

// ═══════════════════════════════════════════════════════════
// 📅 HELPER FUNCTIONS FOR WEEKLY HABITS
// ═══════════════════════════════════════════════════════════

/**
 * Retourne le lundi de la semaine actuelle (00:00:00)
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Si dimanche (0), reculer de 6 jours, sinon aller au lundi
  d.setDate(d.getDate() + diff)
  return d
}

/**
 * Retourne le dimanche de la semaine actuelle (23:59:59)
 */
function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

export async function getUserHabits() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  const userId = parseInt(session.user.id)
  const today = new Date()
  // Utiliser UTC pour éviter les problèmes de timezone
  const dateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  const weekStart = getStartOfWeek(today)
  const weekEnd = getEndOfWeek(today)

  try {
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        habitLogs: {
          where: {
            // Pour les quotidiennes : aujourd'hui
            // Pour les hebdomadaires : toute la semaine
            OR: [
              { date: dateOnly }, // Aujourd'hui
              { 
                date: {
                  gte: weekStart,
                  lte: weekEnd
                }
              }
            ]
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // Ajouter le statut de complétion pour aujourd'hui ou cette semaine
    return habits.map(habit => {
      let completedToday = false
      
      if (habit.frequency === 'DAILY') {
        // Pour les quotidiennes : vérifier aujourd'hui
        completedToday = habit.habitLogs.some(
          log => log.date.getTime() === dateOnly.getTime() && log.completed
        )
      } else if (habit.frequency === 'WEEKLY') {
        // Pour les hebdomadaires : afficher l'état du DERNIER log de la semaine
        // Cela permet de décocher même si c'était coché un autre jour
        const thisWeekLogs = habit.habitLogs
          .filter(log => log.date >= weekStart && log.date <= weekEnd)
          .sort((a, b) => b.date.getTime() - a.date.getTime()) // Trier du plus récent au plus ancien
        
        const lastLog = thisWeekLogs[0]
        if (lastLog) {
          completedToday = lastLog.completed
        }
      }
      
      return {
        ...habit,
        completedToday
      }
    })
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
  // Utiliser UTC pour éviter les problèmes de timezone
  const dateOnly = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

  try {
    // Récupérer l'habitude pour connaître sa fréquence et son type
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { 
        frequency: true,
        type: true
      }
    })

    if (!habit) {
      return { success: false, error: 'Habitude non trouvée.' }
    }

    const isWeekly = habit.frequency === 'WEEKLY'
    
    // Pour les hebdomadaires : récupérer tous les logs de la semaine
    let weekLogs: Array<{ id: number; date: Date; completed: boolean }> = []
    let currentVisualState = false // État visuel actuel (ce que voit l'utilisateur)
    
    if (isWeekly) {
      const weekStart = getStartOfWeek(date)
      const weekEnd = getEndOfWeek(date)
      
      weekLogs = await prisma.habitLog.findMany({
        where: {
          habitId,
          date: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        orderBy: {
          date: 'desc' // Plus récent en premier
        }
      })
      
      // L'état visuel est celui du dernier log de la semaine
      const lastWeekLog = weekLogs[0]
      if (lastWeekLog) {
        currentVisualState = lastWeekLog.completed
      }
    }

    // Vérifier si le log existe déjà pour ce jour précis
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: dateOnly
        }
      }
    })

    // Pour les quotidiennes : l'état visuel est le log d'aujourd'hui
    if (!isWeekly) {
      currentVisualState = existingLog?.completed ?? false
    }

    // L'état après le toggle
    const newVisualState = !currentVisualState

    // Créer ou mettre à jour le log d'aujourd'hui
    if (existingLog) {
      await prisma.habitLog.update({
        where: {
          habitId_date: {
            habitId,
            date: dateOnly
          }
        },
        data: {
          completed: newVisualState
        }
      })
    } else {
      await prisma.habitLog.create({
        data: {
          habitId,
          userId,
          date: dateOnly,
          completed: newVisualState
        }
      })
    }

    // ═══════════════════════════════════════════════════════════
    // 🌰 GAIN/PERTE D'XP (US10)
    // ═══════════════════════════════════════════════════════════
    let xpGained = 0
    const baseXP = calculateXPGain(habit.frequency as 'DAILY' | 'WEEKLY')
    const isGoodHabit = habit.type === 'GOOD'
    
    if (newVisualState && !currentVisualState) {
      // COCHAGE : de décoché → coché
      // Pour hebdo : vérifier si c'était la première fois cette semaine
      let shouldGiveXP = true
      if (isWeekly) {
        // Compter combien de logs completed=true il y avait AVANT ce toggle (exclure celui d'aujourd'hui)
        const previousCompletedCount = weekLogs.filter(
          log => log.completed && log.date.getTime() !== dateOnly.getTime()
        ).length
        shouldGiveXP = previousCompletedCount === 0 // Première complétion de la semaine
      }
      
      if (shouldGiveXP) {
        xpGained = isGoodHabit ? baseXP : -baseXP
        
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true }
        })

        if (currentUser) {
          const newXP = Math.max(0, currentUser.xp + xpGained)
          await prisma.user.update({
            where: { id: userId },
            data: { xp: newXP }
          })
        }
      }
    } else if (!newVisualState && currentVisualState) {
      // DÉCOCHAGE : de coché → décoché
      // Pour hebdo : vérifier si c'était le dernier log complété de la semaine
      let shouldRemoveXP = true
      if (isWeekly) {
        // Compter combien de logs completed=true il reste APRÈS ce toggle (exclure celui d'aujourd'hui)
        const remainingCompletedCount = weekLogs.filter(
          log => log.completed && log.date.getTime() !== dateOnly.getTime()
        ).length
        shouldRemoveXP = remainingCompletedCount === 0 // Plus aucun log complété cette semaine
      }
      
      if (shouldRemoveXP) {
        xpGained = isGoodHabit ? -baseXP : baseXP
        
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true }
        })

        if (currentUser) {
          const newXP = Math.max(0, currentUser.xp + xpGained)
          await prisma.user.update({
            where: { id: userId },
            data: { xp: newXP }
          })
        }
      }
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
  const yesterdayDate = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()))
  
  // Pour les hebdomadaires : vérifier toute la semaine actuelle
  const today = new Date()
  const weekStart = getStartOfWeek(today)
  const weekEnd = getEndOfWeek(today)

  try {
    // Récupérer TOUTES les habitudes actives (quotidiennes ET hebdomadaires)
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        habitLogs: {
          where: {
            OR: [
              { date: yesterdayDate }, // Pour les quotidiennes d'hier
              { 
                date: {
                  gte: weekStart,
                  lte: weekEnd
                },
                completed: true // Pour vérifier si les hebdomadaires sont déjà complétées cette semaine
              }
            ]
          }
        }
      }
    })
    
    // Filtrer selon le type d'habitude
    const missedHabits = habits.filter(habit => {
      if (habit.frequency === 'DAILY') {
        // Pour les quotidiennes : vérifier si non complétée hier
        return habit.habitLogs.length === 0 || 
          (habit.habitLogs[0] && !habit.habitLogs[0].completed)
      } else if (habit.frequency === 'WEEKLY') {
        // Pour les hebdomadaires : vérifier si non complétée cette semaine
        const completedThisWeek = habit.habitLogs.some(
          log => log.completed && log.date >= weekStart && log.date <= weekEnd
        )
        return !completedThisWeek
      }
      return false
    })
    
    return missedHabits.map(habit => ({
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
  const yesterdayDate = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()))

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
    const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))

    // Si pas de lastLoginDate ou si c'était hier ou avant
    if (!userProgress?.lastLoginDate) {
      // Créer ou mettre à jour le UserProgress
      await prisma.userProgress.upsert({
        where: { userId },
        update: { lastLoginDate: todayDate },
        create: {
          userId,
          lastLoginDate: todayDate
        }
      })
      return true // Premier login, vérifier les habitudes manquées
    }

    const lastLogin = new Date(userProgress.lastLoginDate)
    const lastLoginDate = new Date(Date.UTC(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()))

    // Si le dernier login était hier, proposer le rattrapage
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()))

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