'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@repo/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

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
    // Vérifier si le log existe déjà
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: dateOnly
        }
      }
    })

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
    } else {
      // Créer un nouveau log
      await prisma.habitLog.create({
        data: {
          habitId,
          userId,
          date: dateOnly,
          completed: true
        }
      })
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour de l\'habitude.' }
  }
}