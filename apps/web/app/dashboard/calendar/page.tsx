'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Award, Flame } from 'lucide-react'
import { getHabitLogsForMonth, HabitLogWithHabit, getHabitStreaks, HabitStreak, getStreakHistory } from '@/lib/calendar-actions'
import { MobileNav } from '@/components/mobile-nav'

export default function CalendarPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [habitLogs, setHabitLogs] = useState<HabitLogWithHabit[]>([])
  const [streaks, setStreaks] = useState<HabitStreak[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHabitForGraph, setSelectedHabitForGraph] = useState<number | null>(null)
  const [streakHistory, setStreakHistory] = useState<Array<{ date: string; streak: number }>>([])
  const [loading, setLoading] = useState(true)

  // Charger les données du mois
  useEffect(() => {
    async function loadMonthData() {
      setLoading(true)
      try {
        const [logs, streaksData] = await Promise.all([
          getHabitLogsForMonth(selectedYear, selectedMonth),
          getHabitStreaks(),
        ])
        setHabitLogs(logs)
        setStreaks(streaksData)
      } catch (error) {
        console.error('Erreur chargement calendrier:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMonthData()
  }, [selectedYear, selectedMonth])

  // Fonctions de navigation
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
    setSelectedDay(null)
  }

  // Calculer les jours du mois
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Lundi = 0

  // Générer le calendrier
  const calendarDays = []
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null) // Jours vides avant le 1er
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Récupérer les logs d'un jour spécifique
  const getLogsForDay = (day: number) => {
    return habitLogs.filter((log) => {
      const logDate = new Date(log.date)
      // Utiliser les méthodes locales pour éviter le décalage timezone
      return (
        logDate.getDate() === day &&
        logDate.getMonth() + 1 === selectedMonth &&
        logDate.getFullYear() === selectedYear
      )
    })
  }

  // Déterminer la couleur d'une pastille
  const getPillColor = (completed: boolean, isToday: boolean) => {
    if (isToday && !completed) return 'bg-gray-400' // Gris pour aujourd'hui non fait
    if (completed) return 'bg-green-500' // Vert pour accompli
    return 'bg-red-500' // Rouge pour manqué
  }

  // Vérifier si un jour est aujourd'hui
  const isToday = (day: number) => {
    return (
      day === currentDate.getDate() &&
      selectedMonth === currentDate.getMonth() + 1 &&
      selectedYear === currentDate.getFullYear()
    )
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ]

  // Charger l'historique du streak pour une habitude
  const loadStreakHistory = async (habitId: number) => {
    try {
      const history = await getStreakHistory(habitId)
      setStreakHistory(history)
      setSelectedHabitForGraph(habitId)
    } catch (error) {
      console.error('Erreur chargement historique streak:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-6 max-w-4xl">
        {/* En-tête avec navigation mois */}
        <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </button>
        
        <h1 className="text-2xl font-bold text-foreground">
          {monthNames[selectedMonth - 1]} {selectedYear}
        </h1>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-6 w-6 text-primary" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
        </div>
      ) : (
        <>
          {/* Section Streaks (US5) */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              🔥 Vos Streaks
            </h2>
            
            {streaks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Commencez à accomplir vos habitudes pour voir vos streaks !
              </p>
            ) : (
              <div className="space-y-3">
                {streaks.map((streak) => (
                  <div
                    key={streak.habitId}
                    className="border-2 rounded-lg p-3 transition-all hover:shadow-md cursor-pointer"
                    style={{ borderColor: streak.streakColor }}
                    onClick={() => loadStreakHistory(streak.habitId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{streak.emoji}</span>
                        <span className="font-semibold text-foreground">{streak.habitName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium" style={{ color: streak.streakColor }}>
                        <Flame className="h-4 w-4" />
                        {streak.currentStreak} jours
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>Record: {streak.bestStreak} jours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" style={{ color: streak.streakColor }} />
                        <span>{streak.totalCompletions} complétions</span>
                      </div>
                    </div>
                    
                    {/* Barre de progression vers centurion */}
                    {streak.totalCompletions < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${streak.totalCompletions}%`,
                              backgroundColor: streak.streakColor,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {100 - streak.totalCompletions} complétions avant le badge Centurion 🏆
                        </p>
                      </div>
                    )}
                    
                    {streak.totalCompletions >= 100 && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                          🏆 CENTURION 🏆
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Graphique d'évolution du streak */}
          {selectedHabitForGraph !== null && streakHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  📈 Évolution du Streak (30 derniers jours)
                </h3>
                <button
                  onClick={() => {
                    setSelectedHabitForGraph(null)
                    setStreakHistory([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Graphique en barres simple */}
              <div className="relative h-40 flex items-end gap-1">
                {streakHistory.map((point, index) => {
                  const maxStreak = Math.max(...streakHistory.map((p) => p.streak), 1)
                  const heightPercent = (point.streak / maxStreak) * 100
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 group relative"
                      style={{ height: '100%' }}
                    >
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t transition-all hover:opacity-80"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: point.streak > 0 ? '4px' : '0px',
                        }}
                      />
                      
                      {/* Tooltip au survol */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          {new Date(point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          <br />
                          Streak: {point.streak}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{streakHistory[0] ? new Date(streakHistory[0].date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}</span>
                <span>Aujourd&apos;hui</span>
              </div>
            </div>
          )}

          {/* Calendrier */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />
                }

                const dayLogs = getLogsForDay(day)
                const todayFlag = isToday(day)
                const isSelected = selectedDay === day

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    className={`
                      aspect-square p-1 rounded-lg border transition-all
                      ${todayFlag ? 'border-primary border-2 bg-secondary' : 'border-border'}
                      ${isSelected ? 'ring-2 ring-primary scale-105' : ''}
                      hover:bg-secondary hover:scale-105
                    `}
                  >
                    <div className="text-sm font-medium text-foreground mb-1">
                      {day}
                    </div>
                    
                    {/* Pastilles des habitudes */}
                    <div className="flex flex-wrap gap-1 justify-center">
                      {dayLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`h-2 w-2 rounded-full ${getPillColor(log.completed, todayFlag)}`}
                          title={`${log.habit.emoji} ${log.habit.name}: ${log.completed ? 'Fait' : 'Manqué'}`}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Détails du jour sélectionné */}
          {selectedDay !== null && (
            <div className="bg-white rounded-lg shadow-md p-4 animate-in slide-in-from-bottom duration-300">
              <h2 className="text-xl font-bold text-foreground mb-4">
                📅 {selectedDay} {monthNames[selectedMonth - 1]} {selectedYear}
              </h2>

              {getLogsForDay(selectedDay).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucune habitude enregistrée ce jour-là
                </p>
              ) : (
                <div className="space-y-3">
                  {getLogsForDay(selectedDay).map((log) => (
                    <div
                      key={log.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border-2
                        ${log.completed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{log.habit.emoji}</span>
                        <span className="font-medium text-foreground">
                          {log.habit.name}
                        </span>
                      </div>
                      
                      <span className={`text-sm font-semibold ${log.completed ? 'text-green-600' : 'text-red-600'}`}>
                        {log.completed ? '✅ Fait' : '❌ Manqué'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Légende */}
          <div className="bg-white rounded-lg shadow-md p-4 mt-6">
            <h3 className="font-semibold text-foreground mb-3">Légende :</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Habitude accomplie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Habitude manquée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <span>Aujourd&apos;hui (pas encore fait)</span>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      
      <MobileNav />
    </div>
  )
}