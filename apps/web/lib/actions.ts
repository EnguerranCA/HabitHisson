'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { prismaAuth } from '@repo/db'

const CreateUser = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export type FormState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string
}

export async function createUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs manquants. Échec de la création du compte.',
    }
  }

  const { name, email, password } = validatedFields.data

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prismaAuth.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return {
      message: 'Un compte avec cet email existe déjà.',
    }
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    // Créer l'utilisateur
    await prismaAuth.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
  } catch (error) {
    return {
      message: 'Erreur de base de données: Échec de la création du compte.',
    }
  }

  // Se connecter automatiquement après inscription
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    return {
      message: 'Compte créé mais erreur de connexion automatique.',
    }
  }

  redirect('/dashboard')
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'Email ou mot de passe incorrect.'
    }
    throw error
  }
  redirect('/dashboard')
}