import { supabase } from "./client";
import { Database } from "@/types/database";

type Meal = Database["public"]["Tables"]["meals"]["Row"];
type MealInsert = Database["public"]["Tables"]["meals"]["Insert"];
type MealUpdate = Database["public"]["Tables"]["meals"]["Update"];

export const meals = {
  async getByDateRange(groupId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("group_id", groupId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("meal_type", { ascending: true });

    return { data, error };
  },

  async getWeekMeals(groupId: string, weekStart: Date) {
    const startDate = weekStart.toISOString().split("T")[0];
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split("T")[0];

    return this.getByDateRange(groupId, startDate, endDateStr);
  },

  async getById(mealId: string) {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("id", mealId)
      .single();

    return { data, error };
  },

  async create(meal: Omit<MealInsert, "created_by">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("meals")
      .insert({
        ...meal,
        created_by: user.id,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(mealId: string, updates: MealUpdate) {
    const { data, error } = await supabase
      .from("meals")
      .update(updates)
      .eq("id", mealId)
      .select()
      .single();

    return { data, error };
  },

  async delete(mealId: string) {
    const { error } = await supabase.from("meals").delete().eq("id", mealId);

    return { error };
  },

  async getByDate(groupId: string, date: string) {
    const { data, error } = await supabase
      .from("meals")
      .select(
        `
        *,
        profiles(
          display_name,
          avatar_url
        )
      `,
      )
      .eq("group_id", groupId)
      .eq("date", date)
      .order("meal_type", { ascending: true });

    return { data, error };
  },
};
