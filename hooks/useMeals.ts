import { useState, useEffect, useMemo } from "react";
import { meals } from "@/lib/supabase";
import { Database } from "@/types/database";

type Meal = Database["public"]["Tables"]["meals"]["Row"];
type MealInsert = Database["public"]["Tables"]["meals"]["Insert"];

export function useMeals(groupId: string, startDate?: Date) {
  const [mealsList, setMealsList] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dateKey = useMemo(() => startDate?.getTime() || 0, [startDate]);

  const fetchMeals = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const start = startDate || new Date();
      const { data, error } = await meals.getWeekMeals(groupId, start);
      if (error) throw error;
      setMealsList(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, dateKey]);

  const createMeal = async (meal: Omit<MealInsert, "created_by">) => {
    const { data, error } = await meals.create(meal);
    if (!error) {
      await fetchMeals();
    }
    return { data, error };
  };

  const updateMeal = async (mealId: string, updates: Partial<Meal>) => {
    const { data, error } = await meals.update(mealId, updates);
    if (!error) {
      await fetchMeals();
    }
    return { data, error };
  };

  const deleteMeal = async (mealId: string) => {
    const { error } = await meals.delete(mealId);
    if (!error) {
      await fetchMeals();
    }
    return { error };
  };

  return {
    meals: mealsList,
    loading,
    error,
    refetch: fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
  };
}
