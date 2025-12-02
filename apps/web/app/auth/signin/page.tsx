'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { authenticate } from '@/lib/actions'

export default function SignInPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-xl border-2 border-orange-200">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">🦔</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Habit Hisson</h2>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>
        
        <form action={dispatch} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="votre@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <SignInButton />

          {errorMessage && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function SignInButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
    >
      {pending ? 'Connexion...' : 'Se connecter'}
    </button>
  )
}