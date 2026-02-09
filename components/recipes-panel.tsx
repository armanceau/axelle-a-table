"use client";

import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {useRecipes} from "@/hooks/useRecipes";
import {Check, Loader2, Pencil, Plus, Sparkles, Trash2, X} from "lucide-react";

interface RecipesPanelProps {
    groupId: string;
}

export function RecipesPanel({groupId}: RecipesPanelProps) {
    const {recipes, loading, createRecipe, updateRecipe, deleteRecipe} =
        useRecipes(groupId);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newExternalUrl, setNewExternalUrl] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingDescription, setEditingDescription] = useState("");
    const [editingExternalUrl, setEditingExternalUrl] = useState("");
    const [ideaRegime, setIdeaRegime] = useState("");
    const [ideaCount, setIdeaCount] = useState("2");
    const [ideaResults, setIdeaResults] = useState<string[]>([]);
    const [ideaLoading, setIdeaLoading] = useState(false);
    const [ideaError, setIdeaError] = useState<string | null>(null);

    const totalRecipes = recipes.length;

    const sortedRecipes = useMemo(() => {
        return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
    }, [recipes]);

    const normalizedTitles = useMemo(() => {
        return new Set(
            recipes.map((recipe) => recipe.title.trim().toLowerCase()),
        );
    }, [recipes]);

    const extractIdeaText = (item: unknown) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        const candidate = (item as { title?: string; name?: string }).title;
        if (candidate) return candidate;
        return (item as { name?: string }).name ?? "";
    };

    const parseIdeaResponse = (payload: unknown) => {
        const result = (payload as { result?: string })?.result;
        if (typeof result === "string" && result.trim().length > 0) {
            const boldTitles = [...result.matchAll(/\*\*(.+?)\*\*/g)].map(
                (match) => match[1]?.trim(),
            );
            const cleanedBold = boldTitles.filter((title) => title.length > 0);
            if (cleanedBold.length > 0) {
                return cleanedBold;
            }

            return result
                .split(/\n\s*\n/)
                .map((block) => block.replace(/\*\*/g, "").trim())
                .filter((block) => block.length > 0)
                .map((block) => block.split(/\n/)[0].trim())
                .filter((block) => block.length > 0);
        }

        const rawList = Array.isArray(payload)
            ? payload
            : Array.isArray((payload as { ideas?: unknown[] })?.ideas)
                ? (payload as { ideas: unknown[] }).ideas
                : Array.isArray((payload as { dishes?: unknown[] })?.dishes)
                    ? (payload as { dishes: unknown[] }).dishes
                    : Array.isArray((payload as { recipes?: unknown[] })?.recipes)
                        ? (payload as { recipes: unknown[] }).recipes
                        : Array.isArray((payload as { data?: unknown[] })?.data)
                            ? (payload as { data: unknown[] }).data
                            : [];

        return rawList
            .map((item) => extractIdeaText(item).trim())
            .filter((item) => item.length > 0);
    };

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

    const handleGenerateIdeas = async () => {
        const regime = ideaRegime.trim();
        const count = Math.max(1, Number.parseInt(ideaCount, 10) || 1);
        const dishes = recipes
            .map((recipe) => recipe.title.trim())
            .filter((title) => title.length > 0);

        setIdeaLoading(true);
        setIdeaError(null);

        try {
            const response = await fetch(
                "https://keskonmange.vercel.app/api/external",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        dishes,
                        regime,
                        count,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error("Impossible de generer des idées pour le moment.");
            }

            const payload = (await response.json()) as unknown;
            const ideas = parseIdeaResponse(payload);

            if (ideas.length === 0) {
                setIdeaError("Aucune idee recue.");
            }

            setIdeaResults(ideas);
        } catch (err) {
            setIdeaError((err as Error).message);
            setIdeaResults([]);
        } finally {
            setIdeaLoading(false);
        }
    };

    const handleAddIdea = async (idea: string) => {
        const title = idea.trim();
        if (!title) return;
        await createRecipe({
            group_id: groupId,
            title,
            description: null,
            external_url: null,
        });
    };

    const handleAddAllIdeas = async () => {
        const pendingIdeas = ideaResults.filter(
            (idea) => !normalizedTitles.has(idea.trim().toLowerCase()),
        );

        for (const idea of pendingIdeas) {
            // Sequential to keep UI responsive and reuse existing hook refresh.
            // eslint-disable-next-line no-await-in-loop
            await handleAddIdea(idea);
        }
    };

    return (
        <div className="bg-background">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Pas d&apos;idee ?</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <Input
                                placeholder="Regime (ex: vegetarien)"
                                value={ideaRegime}
                                onChange={(e) => setIdeaRegime(e.target.value)}
                            />
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                placeholder="Nombre d'idees"
                                value={ideaCount}
                                onChange={(e) => setIdeaCount(e.target.value)}
                            />
                            <Button
                                onClick={handleGenerateIdeas}
                                disabled={ideaLoading || !ideaRegime.trim()}
                                className="w-full"
                            >
                                {ideaLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : (
                                    <Sparkles className="h-4 w-4"/>
                                )}
                                Generer des idees
                            </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {recipes.length} recette{recipes.length > 1 ? "s" : ""} deja
                            connues utilisees pour l&apos;inspiration.
                        </div>
                        {ideaError && (
                            <div className="text-sm text-destructive">{ideaError}</div>
                        )}
                        {ideaResults.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Idées proposées
                  </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleAddAllIdeas}
                                        disabled={ideaResults.every((idea) =>
                                            normalizedTitles.has(idea.trim().toLowerCase()),
                                        )}
                                    >
                                        Ajouter tout
                                    </Button>
                                </div>
                                <ul className="flex flex-col gap-2">
                                    {ideaResults.map((idea) => {
                                        const normalized = idea.trim().toLowerCase();
                                        const alreadyExists = normalizedTitles.has(normalized);
                                        return (
                                            <li
                                                key={idea}
                                                className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                                            >
                        <span className="text-sm text-foreground">
                          {idea}
                        </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAddIdea(idea)}
                                                    disabled={alreadyExists}
                                                >
                                                    {alreadyExists ? "Deja dans la liste" : "Ajouter"}
                                                </Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                                <Plus className="h-4 w-4"/>
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
                                                        <Check className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={cancelEditing}
                                                    >
                                                        <X className="h-4 w-4"/>
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
                                                        <span
                                                            className="text-xs text-muted-foreground whitespace-pre-wrap wrap-break-word">
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
                                                        <Pencil className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive"
                                                        onClick={() => handleDelete(recipe.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
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
