import { getCatalogIngredient } from "@/data/ingredients";
import type { Ingredient, PriceOverrides, Recipe, RecipeIngredient } from "./types";

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

/** Contexto de preço: fator da rede e preços informados pelo usuário nessa rede. */
export interface PriceContext {
  factor: number;
  overrides?: Record<string, number>;
}

/** Preço por kg, L ou un já considerando o ajuste manual (que não leva fator). */
export function effectivePricePer(ing: Ingredient, ctx: PriceContext) {
  const o = ctx.overrides?.[ing.id];
  if (o !== undefined && o >= 0) return o;
  return ing.pricePer * ctx.factor;
}

export function hasOverride(ingId: string, ctx: PriceContext) {
  return ctx.overrides?.[ingId] !== undefined;
}

/** Custo de uma quantidade na unidade base do ingrediente. */
export function unitCost(ing: Ingredient, qty: number, ctx: PriceContext) {
  const per = effectivePricePer(ing, ctx);
  return qty * (ing.unit === "un" ? per : per / 1000);
}

export function scaleFactor(recipe: Recipe, servings: number) {
  return servings / Math.max(1, recipe.servings);
}

/** Custo estimado da receita para `servings` porções no mercado escolhido. */
export function recipeCost(recipe: Recipe, servings: number, ctx: PriceContext) {
  const scale = scaleFactor(recipe, servings);
  return recipe.ingredients.reduce((sum, ri) => {
    const ing = resolveIngredient(ri);
    return sum + unitCost(ing, ri.qty * scale, ctx);
  }, 0);
}

export function recipeCostPerServing(recipe: Recipe, ctx: PriceContext) {
  return recipeCost(recipe, recipe.servings, ctx) / recipe.servings;
}

export function priceContext(factor: number, overrides: PriceOverrides | undefined, marketId: string | undefined): PriceContext {
  return { factor, overrides: marketId ? overrides?.[marketId] : undefined };
}
