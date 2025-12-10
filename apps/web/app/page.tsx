'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Trophy, 
  CheckCircle, 
  Sparkles,
  Users,
  Star,
  ArrowRight 
} from 'lucide-react'

export default function LandingPage() {
  const { scrollY } = useScroll()
  const [mounted, setMounted] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const hedgehogStages: string[] = [
    '/hedgehogs/herisson-1.png',
    '/hedgehogs/herisson-2.png',
    '/hedgehogs/herisson-3.png'
  ]

  useEffect(() => {
    setMounted(true)
    
    // Alterner entre les 3 stades de hérisson toutes les 3 secondes
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % 3)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  // Parallax effect
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -30])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background decorations */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-50 blur-xl"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-50 blur-xl"
        />

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Ton compagnon pour<br />
              <span className="text-primary">mieux grandir</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Crée de bonnes habitudes avec ton hérisson personnel et deviens la meilleure version de toi-même ! 🦔
            </p>
            
            {/* Hérisson Hero */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="my-12"
            >
              <div className="inline-block relative">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    key={currentStage}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image 
                      src={hedgehogStages[currentStage]!} 
                      alt="Hérisson" 
                      width={200} 
                      height={200}
                      className="drop-shadow-2xl"
                    />
                  </motion.div>
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-orange-300 rounded-full blur-xl"
                />
              </div>
            </motion.div>

            <Link 
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <p className="text-sm text-gray-600 mt-4">
              Déjà membre ?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
                Se connecter
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi HabitHisson ?
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont tu as besoin pour réussir
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'Suivi d\'habitudes',
                description: 'Crée et suis tes habitudes quotidiennes et hebdomadaires facilement'
              },
              {
                icon: TrendingUp,
                title: 'Progression visible',
                description: 'Vois ton hérisson grandir au fur et à mesure de tes accomplissements'
              },
              {
                icon: Calendar,
                title: 'Calendrier interactif',
                description: 'Visualise ton historique et tes streaks sur un calendrier coloré'
              },
              {
                icon: Trophy,
                title: 'Classements',
                description: 'Compare-toi aux autres et deviens le meilleur dresseur de hérissons'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
