"use client"

import { useState, useEffect } from "react"
import { DayColumn } from "./day-column"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

const DAYS = [
  { name: "Lundi", short: "Lun" },
  { name: "Mardi", short: "Mar" },
  { name: "Mercredi", short: "Mer" },
  { name: "Jeudi", short: "Jeu" },
  { name: "Vendredi", short: "Ven" },
  { name: "Samedi", short: "Sam" },
  { name: "Dimanche", short: "Dim" },
]

type WeekMeals = {
  [key: string]: {
    midi: string | null
    soir: string | null
  }
}

function getWeekKey(weekOffset: number): string {
  const now = new Date()
  now.setDate(now.getDate() + weekOffset * 7)
  const year = now.getFullYear()
  const weekNumber = getWeekNumber(now)
  return `week-${year}-${weekNumber}`
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getWeekDates(weekOffset: number): Date[] {
  const now = new Date()
  const currentDay = now.getDay()
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
  
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7)
  
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push(date)
  }
  return dates
}

function formatDateRange(dates: Date[]): string {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  const start = dates[0].toLocaleDateString("fr-FR", options)
  const end = dates[6].toLocaleDateString("fr-FR", options)
  return `${start} - ${end}`
}

function getTodayIndex(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

const STORAGE_KEY = "meal-planner-data"

function loadMealsFromStorage(): { [weekKey: string]: WeekMeals } {
  if (typeof window === "undefined") return {}
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveMealsToStorage(data: { [weekKey: string]: WeekMeals }) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function createEmptyWeek(): WeekMeals {
  return DAYS.reduce((acc, day) => {
    acc[day.name] = { midi: null, soir: null }
    return acc
  }, {} as WeekMeals)
}

export function WeekCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [allMeals, setAllMeals] = useState<{ [weekKey: string]: WeekMeals }>({})
  const [mounted, setMounted] = useState(false)

  const weekKey = getWeekKey(weekOffset)
  const weekDates = getWeekDates(weekOffset)
  const todayIndex = weekOffset === 0 ? getTodayIndex() : -1

  useEffect(() => {
    setAllMeals(loadMealsFromStorage())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      saveMealsToStorage(allMeals)
    }
  }, [allMeals, mounted])

  const currentWeekMeals = allMeals[weekKey] || createEmptyWeek()

  const handleUpdateMeal = (dayName: string, mealType: "midi" | "soir", recipe: string | null) => {
    setAllMeals((prev) => ({
      ...prev,
      [weekKey]: {
        ...createEmptyWeek(),
        ...prev[weekKey],
        [dayName]: {
          ...(prev[weekKey]?.[dayName] || { midi: null, soir: null }),
          [mealType]: recipe,
        },
      },
    }))
  }

  const handleReset = () => {
    setAllMeals((prev) => ({
      ...prev,
      [weekKey]: createEmptyWeek(),
    }))
  }

  const totalMeals = Object.values(currentWeekMeals).reduce((count, meals) => {
    return count + (meals.midi ? 1 : 0) + (meals.soir ? 1 : 0)
  }, 0)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Menu de la Semaine
              </h1>
              <p className="text-muted-foreground mt-1">
                Planifiez vos repas du midi et du soir
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                {totalMeals}/14 repas planifiés
              </span>
            </div>
          </div>
        </header>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6 bg-card rounded-xl p-4 shadow-sm border border-border">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-foreground">
              {weekOffset === 0 ? "Cette semaine" : weekOffset === 1 ? "Semaine prochaine" : weekOffset === -1 ? "Semaine dernière" : `Semaine ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDateRange(weekDates)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {weekOffset !== 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(0)}
                className="hidden sm:flex"
              >
                Aujourd'hui
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Reset button */}
        {totalMeals > 0 && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser la semaine
            </Button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {DAYS.map((day, index) => (
            <DayColumn
              key={day.name}
              day={day.name}
              shortDay={day.short}
              meals={currentWeekMeals[day.name] || { midi: null, soir: null }}
              onUpdateMeal={(mealType, recipe) => handleUpdateMeal(day.name, mealType, recipe)}
              isToday={index === todayIndex}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Cliquez sur "Ajouter" pour planifier vos repas</p>
        </footer>
      </div>
    </div>
  )
}
