import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()
  
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-amber-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 p-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-orange-600">🦔</h1>
            <h2 className="text-4xl font-bold text-gray-900">Habit Hisson</h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              Suivez vos habitudes quotidiennes avec votre hérisson virtuel !
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/auth/signin"
              className="block w-full max-w-sm mx-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Se connecter
            </Link>
            
            <Link 
              href="/auth/signup"
              className="block w-full max-w-sm mx-auto border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Créer un compte
            </Link>
          </div>
          
          <div className="text-sm text-gray-500 space-y-2">
            <p>✅ Créez vos habitudes personnalisées</p>
            <p>📊 Suivez vos progrès visuellement</p>
            <p>🦔 Faites grandir votre hérisson</p>
          </div>
        </div>
      </div>
    </div>
  )
}
