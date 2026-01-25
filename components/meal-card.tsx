"use client";

import { useState } from "react";
import { Plus, X, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MealCardProps {
  mealType: "midi" | "soir";
  recipe: string | null;
  onUpdate: (recipe: string | null) => void;
}

export function MealCard({ mealType, recipe, onUpdate }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(recipe || "");

  const handleSave = () => {
    if (inputValue.trim()) {
      onUpdate(inputValue.trim());
    }
    setIsOpen(false);
  };

  const handleRemove = () => {
    onUpdate(null);
    setInputValue("");
    setIsOpen(false);
  };

  const mealLabel = mealType === "midi" ? "Déjeuner" : "Dîner";
  const mealIcon = mealType === "midi" ? "☀️" : "🌙";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="group relative">
        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <span>{mealIcon}</span>
          <span>{mealLabel}</span>
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
                <Utensils className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground line-clamp-2">
                  {recipe}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <button
              className="w-full min-h-15 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
              onClick={() => setInputValue("")}
            >
              <Plus className="h-4 w-4" />
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
                className="text-destructive"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
