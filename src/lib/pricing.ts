import { getCatalogIngredient } from "@/data/ingredients";
import type { Ingredient, Recipe, RecipeIngredient } from "./types";

export function resolveIngredient(ri: RecipeIngredient): Ingredient {
  if (ri.custom) {
    return {
      id: ri.ingredientId,
      name: ri.custom.name,
      emoji: ri.custom.emoji ?? "🛒",
      aisle: ri.custom.aisle,
      unit: ri.custom.unit,
      pricePer: ri.custom.pricePer,
    };
  }
  return (
    getCatalogIngredient(ri.ingredientId) ?? {
      id: ri.ingredientId,
      name: ri.ingredientId,
      emoji: "🛒",
      aisle: "Mercearia",
      unit: "un",
      pricePer: 0,
    }
  );
}

/** Custo de uma quantidade na unidade base do ingrediente. */
export function unitCost(ing: Ingredient, qty: number, factor = 1) {
  const perBase = ing.unit === "un" ? ing.pricePer : ing.pricePer / 1000;
  return qty * perBase * factor;
}

export function scaleFactor(recipe: Recipe, servings: number) {
  return servings / Math.max(1, recipe.servings);
}

/** Custo estimado da receita para `servings` porções no mercado escolhido. */
export function recipeCost(recipe: Recipe, servings: number, factor = 1) {
  const scale = scaleFactor(recipe, servings);
  return recipe.ingredients.reduce((sum, ri) => {
    const ing = resolveIngredient(ri);
    return sum + unitCost(ing, ri.qty * scale, factor);
  }, 0);
}

export function recipeCostPerServing(recipe: Recipe, factor = 1) {
  return recipeCost(recipe, recipe.servings, factor) / recipe.servings;
}
