import { supabase } from "./client";
import { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];

export const recipes = {
  async getByGroup(groupId: string) {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async create(recipe: Omit<RecipeInsert, "created_by">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        ...recipe,
        created_by: user.id,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(recipeId: string, updates: RecipeUpdate) {
    const { data, error } = await supabase
      .from("recipes")
      .update(updates)
      .eq("id", recipeId)
      .select()
      .single();

    return { data, error };
  },

  async delete(recipeId: string) {
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId);

    return { error };
  },
};
