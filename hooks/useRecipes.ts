import { useEffect, useState } from "react";
import { recipes } from "@/lib/supabase";
import { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];

export function useRecipes(groupId: string) {
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await recipes.getByGroup(groupId);
      if (error) throw error;
      setRecipesList(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const createRecipe = async (recipe: Omit<RecipeInsert, "created_by">) => {
    const { data, error } = await recipes.create(recipe);
    if (!error) {
      await fetchRecipes();
    }
    return { data, error };
  };

  const updateRecipe = async (recipeId: string, updates: Partial<Recipe>) => {
    const { data, error } = await recipes.update(recipeId, updates);
    if (!error) {
      await fetchRecipes();
    }
    return { data, error };
  };

  const deleteRecipe = async (recipeId: string) => {
    const { error } = await recipes.delete(recipeId);
    if (!error) {
      await fetchRecipes();
    }
    return { error };
  };

  return {
    recipes: recipesList,
    loading,
    error,
    refetch: fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
