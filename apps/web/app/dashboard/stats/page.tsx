'use client'

import { useState, useEffect } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import { 
  WeeklyBarChart, 
  XPLineChart, 
  MonthComparisonCard, 
  HabitStatsCard,
  GlobalStatsCard 
} from '@/components/stats-charts'
import { LeaderboardCard } from '@/components/leaderboard-card'
import { getProductivityStats, type ProductivityStats } from '@/lib/stats-actions'
import { getLeaderboard, type LeaderboardData } from '@/lib/leaderboard-actions'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

export default function StatsPage() {
  const [stats, setStats] = useState<ProductivityStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [statsData, leaderboardData] = await Promise.all([
        getProductivityStats(6), // 6 semaines au lieu de 12
        getLeaderboard('all-time')
      ])
      setStats(statsData)
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto p-6 max-w-4xl text-center">
          <p className="text-gray-500">Impossible de charger les statistiques</p>
          <button onClick={loadStats} className="btn-primary mt-4">
            Réessayer
          </button>
        </div>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            📊 Statistiques
          </h1>
        </header>

        {/* Stats globales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlobalStatsCard {...stats.globalStats} />
        </motion.div>

        {/* Graphiques principaux */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WeeklyBarChart 
              data={stats.weekly} 
              title="Taux de réussite hebdomadaire"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <XPLineChart 
              data={stats.dailyXP} 
              title="Évolution des glands (30 jours)"
            />
          </motion.div>
        </div>

        {/* Comparaison mensuelle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <MonthComparisonCard {...stats.monthComparison} />
        </motion.div>

        {/* Classement */}
        {leaderboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LeaderboardCard {...leaderboard} />
          </motion.div>
        )}

        {/* Stats par habitude */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Détail par habitude
          </h2>

          {stats.habits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-gray-100">
              <p className="text-gray-500">Aucune habitude à afficher</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.habits.map((habit, index) => (
                <motion.div
                  key={habit.habitId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <HabitStatsCard habit={habit} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <MobileNav />
    </div>
  )
}
