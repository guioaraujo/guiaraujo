import type { Aisle, Ingredient, Plan, Recipe } from "./types";
import { resolveIngredient, scaleFactor, unitCost } from "./pricing";

export interface ShoppingItem {
  key: string;
  ingredient: Ingredient;
  qty: number;
  cost: number;
  recipes: { id: string; name: string }[];
}

export const AISLE_ORDER: Aisle[] = [
  "Hortifrúti",
  "Açougue e peixaria",
  "Laticínios e frios",
  "Padaria",
  "Mercearia",
  "Temperos e molhos",
  "Congelados",
  "Bebidas",
];

/** Itens básicos que quase toda casa já tem: entram na lista, mas no fim. */
export const PANTRY_STAPLES = new Set(["sal", "oleo", "acucar", "pimenta-do-reino", "louro"]);

export function buildShoppingList(
  plan: Plan,
  getRecipe: (id: string) => Recipe | undefined,
  factor: number,
): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const slot of plan.slots) {
    const recipe = getRecipe(slot.recipeId);
    if (!recipe) continue;
    const scale = scaleFactor(recipe, slot.servings);
    for (const ri of recipe.ingredients) {
      const ing = resolveIngredient(ri);
      const qty = ri.qty * scale;
      const existing = map.get(ing.id);
      if (existing) {
        existing.qty += qty;
        existing.cost += unitCost(ing, qty, factor);
        if (!existing.recipes.some((r) => r.id === recipe.id)) {
          existing.recipes.push({ id: recipe.id, name: recipe.name });
        }
      } else {
        map.set(ing.id, {
          key: ing.id,
          ingredient: ing,
          qty,
          cost: unitCost(ing, qty, factor),
          recipes: [{ id: recipe.id, name: recipe.name }],
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => {
    const sa = PANTRY_STAPLES.has(a.key) ? 1 : 0;
    const sb = PANTRY_STAPLES.has(b.key) ? 1 : 0;
    if (sa !== sb) return sa - sb;
    return a.ingredient.name.localeCompare(b.ingredient.name, "pt-BR");
  });
}

export function groupByAisle(items: ShoppingItem[]) {
  const groups = new Map<Aisle, ShoppingItem[]>();
  for (const item of items) {
    const list = groups.get(item.ingredient.aisle) ?? [];
    list.push(item);
    groups.set(item.ingredient.aisle, list);
  }
  return AISLE_ORDER.filter((a) => groups.has(a)).map((aisle) => ({ aisle, items: groups.get(aisle)! }));
}

export function groupByRecipe(items: ShoppingItem[]) {
  const groups = new Map<string, { id: string; name: string; items: ShoppingItem[] }>();
  for (const item of items) {
    for (const r of item.recipes) {
      const g = groups.get(r.id) ?? { id: r.id, name: r.name, items: [] };
      g.items.push(item);
      groups.set(r.id, g);
    }
  }
  return [...groups.values()];
}
