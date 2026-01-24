"use client"

import { MealCard } from "./meal-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DayColumnProps {
  day: string
  shortDay: string
  meals: {
    midi: string | null
    soir: string | null
  }
  onUpdateMeal: (mealType: "midi" | "soir", recipe: string | null) => void
  isToday?: boolean
}

export function DayColumn({ day, shortDay, meals, onUpdateMeal, isToday }: DayColumnProps) {
  return (
    <Card className={`flex flex-col ${isToday ? "ring-2 ring-primary shadow-lg" : ""}`}>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-center">
          <span className="block text-lg font-semibold text-foreground">{day}</span>
          <span className={`block text-xs font-medium mt-0.5 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
            {isToday ? "Aujourd'hui" : shortDay}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 px-4 pb-4">
        <MealCard
          mealType="midi"
          recipe={meals.midi}
          onUpdate={(recipe) => onUpdateMeal("midi", recipe)}
        />
        <MealCard
          mealType="soir"
          recipe={meals.soir}
          onUpdate={(recipe) => onUpdateMeal("soir", recipe)}
        />
      </CardContent>
    </Card>
  )
}
