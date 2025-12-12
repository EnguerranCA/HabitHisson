'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/profile-actions'
import { User, Mail, Trophy, Calendar, TrendingUp, CheckCircle, Flame, Info, Sparkles, Target, Baby, Users, LogOut, RefreshCw } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile()
        setProfile(data)
        setName(data.name)
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    if (!name.trim()) return
    
    setSaving(true)
    try {
      await updateUserProfile({ name })
      setProfile((prev: UserProfile | null) => prev ? { ...prev, name } : null)
      setEditing(false)
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-8 w-8 text-orange-500" />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Erreur de chargement du profil</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container mx-auto px-4 pt-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Mon Profil</h1>

      {/* Carte Profil Principal */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            {editing ? (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Votre nom"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setName(profile.name)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="text-primary hover:underline text-sm mt-1"
                >
                  Modifier le nom
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-5 w-5" />
          <span>{profile.email}</span>
        </div>
      </div>

      {/* Statistiques Gamification */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Progression
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-medium">Niveau</span>
            </div>
            <span className="text-2xl font-bold text-primary">{profile.level}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-medium">Glands</span>
            </div>
            <span className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <Image src="/icons/gland.webp" alt="gland" width={20} height={20} />
              {profile.xp}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="font-medium">État du hérisson</span>
            </div>
            <span className="text-lg font-semibold capitalize text-primary">
              {profile.hedgehogState === 'baby' && 'Bébé'}
              {profile.hedgehogState === 'child' && 'Enfant'}
              {profile.hedgehogState === 'teen' && 'Adolescent'}
              {profile.hedgehogState === 'adult' && 'Adulte'}
              {profile.hedgehogState === 'elder' && 'Ancien'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques Habitudes */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Mes Habitudes
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-medium">Habitudes actives</span>
            </div>
            <span className="text-2xl font-bold text-primary">{profile.totalHabits}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="font-medium">Complétions totales</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{profile.totalCompletions}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" />
              <span className="font-medium">Meilleur streak</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">{profile.bestStreak} jours</span>
          </div>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" />
          Informations
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Membre depuis :</strong>{' '}
            {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Bouton de déconnexion */}
      <div className="mt-6">
        <button
          onClick={() => signOut()}
          className="w-full bg-red-600 text-white px-4 py-3 rounded-xl transition-all hover:bg-red-700 font-semibold shadow-md flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          Se déconnecter
        </button>
      </div>
      </div>
      
      <MobileNav />
    </div>
  )
}
