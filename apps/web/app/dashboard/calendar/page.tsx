'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getHabitLogsForMonth, HabitLogWithHabit } from '@/lib/calendar-actions'
import { MobileNav } from '@/components/mobile-nav'

export default function CalendarPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [habitLogs, setHabitLogs] = useState<HabitLogWithHabit[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger les données du mois
  useEffect(() => {
    async function loadMonthData() {
      setLoading(true)
      try {
        const logs = await getHabitLogsForMonth(selectedYear, selectedMonth)
        setHabitLogs(logs)
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

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6">
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
      
      <MobileNav />
    </div>
  )
}
