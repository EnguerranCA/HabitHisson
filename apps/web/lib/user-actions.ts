'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@repo/db'
import { redirect } from 'next/navigation'
import { calculateLevelFromXP } from '@/lib/xp-utils'

export async function getUserXP() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userId = parseInt(session.user.id)

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
      }
    })

    if (!user) {
      return { xp: 0, level: 1 }
    }

    return { 
      xp: user.xp, 
      level: calculateLevelFromXP(user.xp) 
    }
  } catch (error) {
    console.error('Error fetching user XP:', error)
    return { xp: 0, level: 1 }
  }
}
