"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Plan, PriceOverrides, Profile, Recipe } from "./types";
import { RECIPES } from "@/data/recipes";
import { getMarket } from "@/data/markets";
import { priceContext } from "./pricing";

export interface State {
  hydrated: boolean;
  profile: Profile | null;
  plan: Plan | null;
  /** Receitas criadas pela IA, guardadas no aparelho. */
  customRecipes: Recipe[];
  /** Itens já comprados da lista atual. */
  checked: Record<string, true>;
  favorites: string[];
  /** id da receita → data ISO da última vez que foi feita */
  cooked: Record<string, string>;
  /** preços informados pelo usuário, por mercado */
  priceOverrides: PriceOverrides;
}

const KEY = "despensa:v1";

const initial: State = {
  hydrated: false,
  profile: null,
  plan: null,
  customRecipes: [],
  checked: {},
  favorites: [],
  cooked: {},
  priceOverrides: {},
};

let state: State = initial;
const listeners = new Set<() => void>();
let loaded = false;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    const { hydrated: _h, ...rest } = state;
    void _h;
    window.localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    // armazenamento cheio ou indisponível: segue só em memória
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = { ...initial, ...parsed, hydrated: true };
    } else {
      state = { ...initial, hydrated: true };
    }
  } catch {
    state = { ...initial, hydrated: true };
  }
  // emite fora do ciclo de render
  queueMicrotask(emit);
}

function set(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

export const actions = {
  setProfile(profile: Profile) {
    set({ profile });
  },
  setPlan(plan: Plan | null) {
    set({ plan, checked: {} });
  },
  savePlan() {
    set((s) => ({ plan: s.plan ? { ...s.plan, saved: true } : null }));
  },
  toggleLock(slotId: string) {
    set((s) => ({
      plan: s.plan
        ? { ...s.plan, slots: s.plan.slots.map((x) => (x.id === slotId ? { ...x, locked: !x.locked } : x)) }
        : null,
    }));
  },
  replaceSlotRecipe(slotId: string, recipeId: string) {
    set((s) => ({
      plan: s.plan
        ? { ...s.plan, slots: s.plan.slots.map((x) => (x.id === slotId ? { ...x, recipeId } : x)) }
        : null,
    }));
  },
  toggleChecked(key: string) {
    set((s) => {
      const checked = { ...s.checked };
      if (checked[key]) delete checked[key];
      else checked[key] = true;
      return { checked };
    });
  },
  clearChecked() {
    set({ checked: {} });
  },
  toggleFavorite(id: string) {
    set((s) => ({
      favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
    }));
  },
  markCooked(id: string) {
    set((s) => ({ cooked: { ...s.cooked, [id]: new Date().toISOString() } }));
  },
  setPriceOverride(marketId: string, ingredientId: string, pricePer: number | null) {
    set((s) => {
      const forMarket = { ...(s.priceOverrides[marketId] ?? {}) };
      if (pricePer === null) delete forMarket[ingredientId];
      else forMarket[ingredientId] = pricePer;
      return { priceOverrides: { ...s.priceOverrides, [marketId]: forMarket } };
    });
  },
  clearPriceOverrides(marketId: string) {
    set((s) => {
      const next = { ...s.priceOverrides };
      delete next[marketId];
      return { priceOverrides: next };
    });
  },
  addCustomRecipes(recipes: Recipe[]) {
    set((s) => {
      const ids = new Set(recipes.map((r) => r.id));
      return { customRecipes: [...s.customRecipes.filter((r) => !ids.has(r.id)), ...recipes] };
    });
  },
  reset() {
    set({ ...initial, hydrated: true });
  },
};

export function allRecipes(custom: Recipe[]) {
  return [...RECIPES, ...custom];
}

export function findRecipe(id: string, custom: Recipe[]) {
  return RECIPES.find((r) => r.id === id) ?? custom.find((r) => r.id === id);
}

export function useRecipes() {
  const custom = useStore((s) => s.customRecipes);
  return useMemo(() => allRecipes(custom), [custom]);
}

/** Contexto de preço do mercado do perfil, com os ajustes manuais. */
export function usePriceContext() {
  const marketId = useStore((s) => s.profile?.marketId);
  const overrides = useStore((s) => s.priceOverrides);
  return useMemo(() => priceContext(getMarket(marketId).factor, overrides, marketId), [marketId, overrides]);
}

export function useRecipe(id: string) {
  const custom = useStore((s) => s.customRecipes);
  return findRecipe(id, custom);
}
