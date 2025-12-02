'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createUser, FormState } from '@/lib/actions'

export default function SignUpPage() {
  const initialState: FormState = { message: '', errors: {} }
  const [state, dispatch] = useFormState(createUser, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-xl border-2 border-orange-200">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">🦔</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Habit Hisson</h2>
          <p className="text-gray-600">Créez votre compte</p>
        </div>
        
        <form action={dispatch} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Votre nom"
            />
            {state?.errors?.name && (
              <div className="text-red-600 text-sm mt-1">
                {state.errors.name.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

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
            {state?.errors?.email && (
              <div className="text-red-600 text-sm mt-1">
                {state.errors.email.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
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
            {state?.errors?.password && (
              <div className="text-red-600 text-sm mt-1">
                {state.errors.password.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <SignUpButton />

          {state?.message && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {state.message}
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function SignUpButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
    >
      {pending ? 'Création...' : 'Créer le compte'}
    </button>
  )
}