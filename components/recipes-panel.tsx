"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRecipes } from "@/hooks/useRecipes";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

interface RecipesPanelProps {
  groupId: string;
}

export function RecipesPanel({ groupId }: RecipesPanelProps) {
  const { recipes, loading, createRecipe, updateRecipe, deleteRecipe } =
    useRecipes(groupId);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newExternalUrl, setNewExternalUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingExternalUrl, setEditingExternalUrl] = useState("");

  const totalRecipes = recipes.length;

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes]);

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await createRecipe({
      group_id: groupId,
      title,
      description: newDescription.trim() || null,
      external_url: newExternalUrl.trim() || null,
    });
    setNewTitle("");
    setNewDescription("");
    setNewExternalUrl("");
  };

  const startEditing = (
    id: string,
    title: string,
    description: string | null,
    externalUrl: string | null,
  ) => {
    setEditingId(id);
    setEditingTitle(title);
    setEditingDescription(description ?? "");
    setEditingExternalUrl(externalUrl ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingExternalUrl("");
  };

  const saveEditing = async () => {
    if (!editingId) return;
    const title = editingTitle.trim();
    if (!title) return;
    await updateRecipe(editingId, {
      title,
      description: editingDescription.trim() || null,
      external_url: editingExternalUrl.trim() || null,
    });
    cancelEditing();
  };

  const handleDelete = async (id: string) => {
    await deleteRecipe(id);
    if (editingId === id) {
      cancelEditing();
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Liste de recettes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Ajouter une recette..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Textarea
                  placeholder="Description (optionnel)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <Input
                  placeholder="Lien externe (optionnel)"
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {totalRecipes} recette{totalRecipes > 1 ? "s" : ""} enregistrée
              {totalRecipes > 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recettes disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Chargement...</div>
            ) : sortedRecipes.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aucune recette pour le moment.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {sortedRecipes.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    {editingId === recipe.id ? (
                      <div className="flex flex-1 flex-col gap-2 w-full">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEditing()}
                          placeholder="Titre"
                        />
                        <Textarea
                          value={editingDescription}
                          onChange={(e) =>
                            setEditingDescription(e.target.value)
                          }
                          placeholder="Description (optionnel)"
                        />
                        <Input
                          value={editingExternalUrl}
                          onChange={(e) =>
                            setEditingExternalUrl(e.target.value)
                          }
                          placeholder="Lien externe (optionnel)"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveEditing}
                            disabled={!editingTitle.trim()}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <span className="text-sm font-medium text-foreground wrap-break-word">
                            {recipe.title}
                          </span>
                          {recipe.description && (
                            <span className="text-xs text-muted-foreground whitespace-pre-wrap wrap-break-word">
                              {recipe.description}
                            </span>
                          )}
                          {recipe.external_url && (
                            <a
                              href={recipe.external_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline break-all"
                            >
                              {recipe.external_url}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              startEditing(
                                recipe.id,
                                recipe.title,
                                recipe.description,
                                recipe.external_url,
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive"
                            onClick={() => handleDelete(recipe.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
