"use client";

import {useEffect, useMemo, useState} from "react";
import {DayColumn} from "./day-column";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, RefreshCw, RotateCcw, Wand2,} from "lucide-react";
import {useMeals} from "@/hooks/useMeals";
import {UsersBadge} from "@/components/users-badge";
import {useRecipes} from "@/hooks/useRecipes";

const DAYS = [
    {name: "Lundi", short: "Lun"},
    {name: "Mardi", short: "Mar"},
    {name: "Mercredi", short: "Mer"},
    {name: "Jeudi", short: "Jeu"},
    {name: "Vendredi", short: "Ven"},
    {name: "Samedi", short: "Sam"},
    {name: "Dimanche", short: "Dim"},
];

function getTodayIndex(): number {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
}

function getWeekDates(weekOffset: number): Date[] {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function formatDateRange(dates: Date[]): string {
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
    };
    const start = dates[0].toLocaleDateString("fr-FR", options);
    const end = dates[6].toLocaleDateString("fr-FR", options);
    return `${start} - ${end}`;
}

interface WeekCalendarProps {
    groupId: string;
}

export function WeekCalendar({groupId}: WeekCalendarProps) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [mounted, setMounted] = useState(false);

    const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
    const weekStart = useMemo(() => weekDates[0], [weekDates]);
    const todayIndex = weekOffset === 0 ? getTodayIndex() : -1;

    const [countdown, setCountdown] = useState(300);

    const {meals, loading, createMeal, updateMeal, deleteMeal, refetch} =
        useMeals(groupId, weekStart);
    const {recipes} = useRecipes(groupId);

    const isInitialLoading = (!mounted || loading) && meals.length === 0;
    const isRefreshing = loading && meals.length > 0;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleRefetch();
                    return 300;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const mealsByDay = DAYS.reduce(
        (acc, day, dayIndex) => {
            const date = new Date(weekDates[dayIndex]);
            const dateStr = date.toISOString().split("T")[0];

            const dayMeals = meals.filter((m) => m.date === dateStr);

            acc[day.name] = {
                midi: dayMeals.find((m) => m.meal_type === "lunch")?.title || null,
                soir: dayMeals.find((m) => m.meal_type === "dinner")?.title || null,
                mealIds: {
                    midi: dayMeals.find((m) => m.meal_type === "lunch")?.id,
                    soir: dayMeals.find((m) => m.meal_type === "dinner")?.id,
                },
            };
            return acc;
        },
        {} as Record<
            string,
            {
                midi: string | null;
                soir: string | null;
                mealIds: Record<string, string | undefined>;
            }
        >,
    );

    const handleRefetch = async () => {
        await refetch();
    };

    const handleUpdateMeal = async (
        dayName: string,
        mealType: "midi" | "soir",
        recipe: {
            title: string;
            description?: string | null;
            external_url?: string | null;
        } | null,
    ) => {
        const dayIndex = DAYS.findIndex((d) => d.name === dayName);
        const date = new Date(weekDates[dayIndex]);
        const dateStr = date.toISOString().split("T")[0];

        const mealTypeMap = {midi: "lunch", soir: "dinner"} as const;

        if (recipe === null) {
            const mealId = mealsByDay[dayName].mealIds[mealType];
            if (mealId) {
                await deleteMeal(mealId);
            }
        } else {
            const mealId = mealsByDay[dayName].mealIds[mealType];
            if (mealId) {
                await updateMeal(mealId, {
                    title: recipe.title,
                    description: recipe.description ?? null,
                });
            } else {
                await createMeal({
                    group_id: groupId,
                    title: recipe.title,
                    description: recipe.description ?? null,
                    meal_type: mealTypeMap[mealType],
                    date: dateStr,
                });
            }
        }
    };

    const handleReset = async () => {
        const weekMeals = meals.filter((m) => {
            const mealDate = new Date(m.date);
            const weekStartDate = new Date(weekDates[0]);
            const weekEndDate = new Date(weekDates[6]);
            weekEndDate.setHours(23, 59, 59, 999);
            return mealDate >= weekStartDate && mealDate <= weekEndDate;
        });
        for (const m of weekMeals) {
            await deleteMeal(m.id);
        }
    };

    const getUniqueRecipeTitles = () => {
        const titles = recipes
            .map((recipe) => recipe.title?.trim())
            .filter((title): title is string => Boolean(title));
        return Array.from(new Set(titles));
    };

    const shuffle = (items: string[]) => {
        const array = [...items];
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleAutoFill = async () => {
        const recipeTitles = getUniqueRecipeTitles();
        if (recipeTitles.length === 0) return;

        const usedTitles = new Set(
            meals
                .map((meal) => meal.title?.trim())
                .filter((title): title is string => Boolean(title)),
        );

        const emptySlots: Array<{
            dayName: string;
            mealType: "midi" | "soir";
            dateStr: string;
        }> = [];

        DAYS.forEach((day, dayIndex) => {
            const date = new Date(weekDates[dayIndex]);
            const dateStr = date.toISOString().split("T")[0];
            if (!mealsByDay[day.name]?.midi) {
                emptySlots.push({dayName: day.name, mealType: "midi", dateStr});
            }
            if (!mealsByDay[day.name]?.soir) {
                emptySlots.push({dayName: day.name, mealType: "soir", dateStr});
            }
        });

        if (emptySlots.length === 0) return;

        const availableRecipes = shuffle(
            recipeTitles.filter((title) => !usedTitles.has(title)),
        );

        const mealTypeMap = {midi: "lunch", soir: "dinner"} as const;

        let recipeIndex = 0;
        for (const slot of emptySlots) {
            if (recipeIndex >= availableRecipes.length) break;
            const title = availableRecipes[recipeIndex];
            usedTitles.add(title);
            recipeIndex += 1;

            await createMeal({
                group_id: groupId,
                title,
                meal_type: mealTypeMap[slot.mealType],
                date: slot.dateStr,
            });
        }
    };

    const totalMeals = Object.values(mealsByDay).reduce((count, meals) => {
        return count + (meals.midi ? 1 : 0) + (meals.soir ? 1 : 0);
    }, 0);

    const emptySlotsCount = Object.values(mealsByDay).reduce((count, meals) => {
        return count + (meals.midi ? 0 : 1) + (meals.soir ? 0 : 1);
    }, 0);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                    Chargement du calendrier...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6">
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
                        <div className="flex items-center gap-3">
                            <UsersBadge/>
                            <div className="flex items-center gap-3">
                                {isRefreshing && (
                                    <span
                                        className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full animate-pulse">
                    Mise à jour...
                  </span>
                                )}
                                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                  {totalMeals}/14 repas planifiés
                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Week Navigation */}
                <div
                    className="flex items-center justify-between mb-6 bg-card rounded-xl p-4 shadow-sm border border-border">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setWeekOffset((prev) => prev - 1)}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>

                    <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-foreground">
              {weekOffset === 0
                  ? "Cette semaine"
                  : weekOffset === 1
                      ? "Semaine prochaine"
                      : weekOffset === -1
                          ? "Semaine dernière"
                          : `Semaine ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
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
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between mb-4 flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefetch}
                            disabled={loading}
                        >
                            <RefreshCw className="h-4 w-4"/>
                            Synchroniser
                        </Button>
                        <span className="text-sm text-muted-foreground">
              {Math.floor(countdown / 60)}:
                            {(countdown % 60).toString().padStart(2, "0")}
            </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAutoFill}
                            disabled={
                                loading || recipes.length === 0 || emptySlotsCount === 0
                            }
                        >
                            <Wand2 className="h-4 w-4"/>
                            Auto-remplir
                        </Button>
                        {totalMeals > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-destructive hover:bg-destructive"
                            >
                                <RotateCcw className="h-4 w-4"/>
                                Réinitialiser la semaine
                            </Button>
                        )}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {DAYS.map((day, index) => (
                        <DayColumn
                            key={day.name}
                            day={day.name}
                            shortDay={day.short}
                            meals={mealsByDay[day.name] || {midi: null, soir: null}}
                            recipes={recipes}
                            onUpdateMeal={(mealType, recipe) =>
                                handleUpdateMeal(day.name, mealType, recipe)
                            }
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
    );
}
