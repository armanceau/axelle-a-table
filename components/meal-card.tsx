"use client";

import {useState} from "react";
import {Plus, Trash, Utensils} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";

interface RecipeOption {
    id: string;
    title: string;
    description?: string | null;
    external_url?: string | null;
}

interface RecipeSelection {
    title: string;
    description?: string | null;
    external_url?: string | null;
}

interface MealCardProps {
    mealType: "midi" | "soir";
    recipe: string | null;
    recipes: RecipeOption[];
    onUpdate: (recipe: RecipeSelection | null) => void;
}

export function MealCard({
                             mealType,
                             recipe,
                             recipes,
                             onUpdate,
                         }: MealCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(recipe || "");
    const [pickerOpen, setPickerOpen] = useState(false);
    const matchedRecipe = recipe
        ? recipes.find((item) => item.title === recipe)
        : undefined;

    const handleSave = () => {
        if (inputValue.trim()) {
            onUpdate({
                title: inputValue.trim(),
                description: matchedRecipe?.description ?? null,
                external_url: matchedRecipe?.external_url ?? null,
            });
        }
        setIsOpen(false);
    };

    const handleRemove = () => {
        onUpdate(null);
        setInputValue("");
        setIsOpen(false);
    };

    const handleSelectRecipe = (selectedRecipe: RecipeOption) => {
        onUpdate(selectedRecipe);
        setInputValue(selectedRecipe.title);
        setPickerOpen(false);
    };

    const mealLabel = mealType === "midi" ? "Déjeuner" : "Dîner";
    const mealIcon = mealType === "midi" ? "☀️" : "🌙";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="group relative">
                <div
                    className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                        <span>{mealIcon}</span>
                        <span>{mealLabel}</span>
                    </div>
                    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="opacity-80 hover:opacity-100"
                            >
                                <Plus className="h-3.5 w-3.5"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="end">
                            <Command>
                                <CommandInput placeholder="Rechercher une recette..."/>
                                <CommandList>
                                    <CommandEmpty>Aucune recette trouvée.</CommandEmpty>
                                    <CommandGroup>
                                        {recipes.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.title}
                                                onSelect={() => handleSelectRecipe(item)}
                                            >
                                                <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                                                    {item.description && (
                                                        <span className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {recipe ? (
                    <DialogTrigger asChild>
                        <div
                            role="button"
                            tabIndex={0}
                            className="relative bg-secondary/50 rounded-lg p-3 min-h-15 flex items-center w-full text-left transition-all hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onClick={() => setInputValue(recipe)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setInputValue(recipe);
                                    setIsOpen(true);
                                }
                            }}
                        >
                            <div className="flex items-center gap-2 flex-1 pr-8">
                                <Utensils className="h-4 w-4 text-primary shrink-0"/>
                                <span className="text-sm font-medium text-foreground line-clamp-2">
                  {recipe}
                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                            >
                                <Trash className="h-3.5 w-3.5 text-destructive"/>
                            </Button>
                        </div>
                    </DialogTrigger>
                ) : (
                    <DialogTrigger asChild>
                        <button
                            className="w-full min-h-15 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => setInputValue("")}
                        >
                            <Plus className="h-4 w-4"/>
                            <span className="text-sm">Ajouter</span>
                        </button>
                    </DialogTrigger>
                )}
            </div>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {recipe ? "Modifier la recette" : "Ajouter une recette"} -{" "}
                        {mealLabel}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-4">
                    <Input
                        placeholder="Nom de la recette..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        autoFocus
                    />
                    <div className="flex justify-between gap-2">
                        {recipe && (
                            <Button
                                variant="ghost"
                                className="text-destructive hover:bg-destructive"
                                onClick={handleRemove}
                            >
                                Supprimer
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={!inputValue.trim()}>
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                    {matchedRecipe && (
                        <div className="border-t border-border pt-4">
                            <div className="text-sm font-medium text-foreground mb-2">
                                Recette complète
                            </div>
                            {matchedRecipe.description && (
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {matchedRecipe.description}
                                </div>
                            )}
                            {matchedRecipe.external_url && (
                                <a
                                    href={matchedRecipe.external_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block text-sm text-primary hover:underline"
                                >
                                    {matchedRecipe.external_url}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
