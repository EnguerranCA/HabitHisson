'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import type { WeeklyStats, DailyXP } from '@/lib/stats-actions'

// ═══════════════════════════════════════════════════════════
// 📊 GRAPHIQUE EN BARRES - TAUX DE RÉUSSITE HEBDOMADAIRE
// ═══════════════════════════════════════════════════════════

interface BarChartProps {
  data: WeeklyStats[]
  title: string
  showXP?: boolean
}

export function WeeklyBarChart({ data, title, showXP = false }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipData, setTooltipData] = useState<WeeklyStats | null>(null)

  const maxValue = showXP 
    ? Math.max(...data.map(d => d.xpEarned), 1)
    : 100

  const getBarColor = (value: number) => {
    if (showXP) {
      return '#f59e0b' // amber
    }
    if (value >= 80) return '#10b981' // green
    if (value >= 60) return '#84cc16' // lime
    if (value >= 40) return '#eab308' // yellow
    if (value >= 20) return '#f97316' // orange
    return '#ef4444' // red
  }

  const formatWeekLabel = (weekStart: string) => {
    const date = new Date(weekStart)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📊 {title}
      </h3>

      {/* Graphique */}
      <div className="relative h-64">
        {/* Lignes de grille */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[100, 75, 50, 25, 0].map((value) => (
            <div key={value} className="flex items-center">
              <span className="text-xs text-gray-400 w-8">{showXP ? '' : `${value}%`}</span>
              <div className="flex-1 border-b border-gray-100" />
            </div>
          ))}
        </div>

        {/* Barres */}
        <div className="absolute inset-0 flex items-end justify-around pl-8 pb-6 gap-2">
          {data.map((week, index) => {
            const value = showXP ? week.xpEarned : week.successRate
            // Calculer la hauteur en pixels (le container fait 256px de haut avec h-64)
            const containerHeight = 256 - 24 // moins le padding bottom
            const heightPx = Math.max((value / maxValue) * containerHeight, 8)

            return (
              <div
                key={week.weekStart}
                className="flex flex-col items-center relative flex-1"
                onMouseEnter={() => {
                  setHoveredIndex(index)
                  setTooltipData(week)
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null)
                  setTooltipData(null)
                }}
              >
                <motion.div
                  className="w-full rounded-t-lg relative"
                  style={{ 
                    background: `linear-gradient(to top, ${getBarColor(week.successRate)}, ${getBarColor(week.successRate)}dd)`,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPx}px` }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
                  whileHover={{ scaleX: 1.1 }}
                >
                  {/* Tooltip */}
                  {hoveredIndex === index && tooltipData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-xl"
                    >
                      <div className="font-bold mb-1">
                        Semaine du {formatWeekLabel(tooltipData.weekStart)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>✅ {tooltipData.completedHabits}/{tooltipData.totalHabits}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📈 {tooltipData.successRate}% réussite</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image src="/icons/gland.webp" alt="gland" width={12} height={12} />
                        <span>{tooltipData.xpEarned} glands</span>
                      </div>
                      {/* Flèche du tooltip */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Label de la semaine */}
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {formatWeekLabel(week.weekStart)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-green-400 to-green-600" />
          <span>≥80%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-lime-400 to-lime-600" />
          <span>60-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-400 to-yellow-600" />
          <span>40-59%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-400 to-orange-600" />
          <span>20-39%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-red-400 to-red-600" />
          <span>&lt;20%</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 📈 COURBE D'ÉVOLUTION DE L'XP
// ═══════════════════════════════════════════════════════════

interface LineChartProps {
  data: DailyXP[]
  title: string
}

export function XPLineChart({ data, title }: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Prendre les 30 derniers jours
  const displayData = data.slice(-30)
  const maxXP = Math.max(...displayData.map(d => d.cumulativeXP), 1)
  const minXP = Math.min(...displayData.map(d => d.cumulativeXP), 0)
  const range = maxXP - minXP || 1

  // Calculer les points du graphique
  const points = displayData.map((day, index) => {
    const x = (index / (displayData.length - 1)) * 100
    const y = 100 - ((day.cumulativeXP - minXP) / range) * 100
    return { x, y, data: day }
  })

  // Créer le path SVG pour la courbe
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    
    // Courbe de Bézier pour un rendu plus doux
    const prevPoint = points[index - 1]
    if (!prevPoint) return path
    const cpx = (prevPoint.x + point.x) / 2
    return `${path} Q ${cpx} ${prevPoint.y} ${point.x} ${point.y}`
  }, '')

  // Path pour le remplissage
  const areaPath = `${linePath} L 100 100 L 0 100 Z`

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Image src="/icons/gland.webp" alt="gland" width={20} height={20} />
        {title}
      </h3>

      {/* Graphique SVG */}
      <div className="relative h-64">
        {/* Labels Y-axis */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
          <span>{maxXP}</span>
          <span>{Math.round((maxXP + minXP) / 2)}</span>
          <span>{minXP}</span>
        </div>

        {/* Zone du graphique */}
        <div className="absolute left-12 right-0 top-0 bottom-8">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grille horizontale */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Lignes de grille */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            ))}

            {/* Zone remplie sous la courbe */}
            <motion.path
              d={areaPath}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />

            {/* Ligne de la courbe */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Points interactifs */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === index ? 3 : 1.5}
                  fill="#F59E0B"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-xl pointer-events-none"
              style={{
                left: `${points[hoveredIndex].x}%`,
                top: `${points[hoveredIndex].y}%`,
                transform: 'translate(-50%, -120%)',
              }}
            >
              <div className="font-bold">{formatDate(points[hoveredIndex].data.date)}</div>
              <div className="flex items-center gap-1 mt-1">
                <Image src="/icons/gland.webp" alt="gland" width={10} height={10} />
                <span>{points[hoveredIndex].data.cumulativeXP} glands total</span>
              </div>
              <div className="text-gray-400">
                {points[hoveredIndex].data.xp >= 0 ? '+' : ''}{points[hoveredIndex].data.xp} ce jour
              </div>
            </motion.div>
          )}
        </div>

        {/* Labels X-axis */}
        <div className="absolute left-12 right-0 bottom-0 h-8 flex justify-between text-xs text-gray-400">
          <span>{formatDate(displayData[0]?.date || '')}</span>
          <span>{formatDate(displayData[Math.floor(displayData.length / 2)]?.date || '')}</span>
          <span>{formatDate(displayData[displayData.length - 1]?.date || '')}</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 📅 COMPARAISON MENSUELLE
// ═══════════════════════════════════════════════════════════

interface MonthComparisonProps {
  currentMonth: {
    name: string
    successRate: number
    totalCompletions: number
    xpEarned: number
  }
  previousMonth: {
    name: string
    successRate: number
    totalCompletions: number
    xpEarned: number
  }
  change: {
    successRate: number
    completions: number
    xp: number
  }
}

export function MonthComparisonCard({ currentMonth, previousMonth, change }: MonthComparisonProps) {
  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return '↑'
    if (value < 0) return '↓'
    return '→'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📅 Comparaison mensuelle
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Mois précédent */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-600 mb-3">{previousMonth.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Réussite</span>
              <span className="font-medium">{previousMonth.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Complétions</span>
              <span className="font-medium">{previousMonth.totalCompletions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Glands</span>
              <span className="font-medium flex items-center gap-1">
                <Image src="/icons/gland.webp" alt="gland" width={12} height={12} />
                {previousMonth.xpEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Mois actuel */}
        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
          <h4 className="font-semibold text-orange-600 mb-3">{currentMonth.name} 📍</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Réussite</span>
              <span className="font-medium">
                {currentMonth.successRate}%
                <span className={`ml-1 ${getChangeColor(change.successRate)}`}>
                  {getChangeIcon(change.successRate)}{Math.abs(change.successRate)}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Complétions</span>
              <span className="font-medium">
                {currentMonth.totalCompletions}
                <span className={`ml-1 ${getChangeColor(change.completions)}`}>
                  {getChangeIcon(change.completions)}{Math.abs(change.completions)}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Glands</span>
              <span className="font-medium flex items-center gap-1">
                <Image src="/icons/gland.webp" alt="gland" width={12} height={12} />
                {currentMonth.xpEarned}
                <span className={`${getChangeColor(change.xp)}`}>
                  {getChangeIcon(change.xp)}{Math.abs(change.xp)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 🎯 STATS PAR HABITUDE
// ═══════════════════════════════════════════════════════════

interface HabitStatsCardProps {
  habit: {
    habitId: number
    name: string
    emoji: string
    type: 'GOOD' | 'BAD'
    frequency: 'DAILY' | 'WEEKLY'
    totalCompletions: number
    currentStreak: number
    bestStreak: number
    successRate: number
  }
}

export function HabitStatsCard({ habit }: HabitStatsCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100 hover:border-orange-200 transition-all"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{habit.emoji}</span>
          <div>
            <h4 className="font-semibold text-gray-800">{habit.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              habit.type === 'GOOD' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {habit.type === 'GOOD' ? 'Bonne' : 'Mauvaise'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">{habit.successRate}%</div>
          <div className="text-xs text-gray-500">réussite</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-bold text-gray-700">{habit.totalCompletions}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <div className="font-bold text-orange-600">🔥 {habit.currentStreak}</div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2">
          <div className="font-bold text-yellow-600">🏆 {habit.bestStreak}</div>
          <div className="text-xs text-gray-500">Record</div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// 📊 STATS GLOBALES RÉSUMÉ
// ═══════════════════════════════════════════════════════════

interface GlobalStatsProps {
  totalHabits: number
  totalCompletions: number
  overallSuccessRate: number
  totalXP: number
  averageDaily: number
}

export function GlobalStatsCard({ 
  totalHabits, 
  totalCompletions, 
  overallSuccessRate, 
  totalXP,
  averageDaily 
}: GlobalStatsProps) {
  return (
    <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        🦔 Vue d'ensemble
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{totalHabits}</div>
          <div className="text-orange-100 text-sm">Habitudes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{totalCompletions}</div>
          <div className="text-orange-100 text-sm">Complétions</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{overallSuccessRate}%</div>
          <div className="text-orange-100 text-sm">Réussite</div>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="text-3xl font-bold flex items-center gap-1">
            <Image src="/icons/gland.webp" alt="gland" width={24} height={24} />
            {totalXP}
          </div>
          <div className="text-orange-100 text-sm">Glands</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{averageDaily}</div>
          <div className="text-orange-100 text-sm">Moy/jour</div>
        </div>
      </div>
    </div>
  )
}
