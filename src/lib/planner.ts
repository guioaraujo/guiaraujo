import type {
  MealType,
  Plan,
  PlanSlot,
  Profile,
  Recipe,
  RestrictionId,
} from "./types";
import { recipeCost } from "./pricing";
import { rng, shuffle, uid } from "./utils";

const MEAL_ORDER: MealType[] = ["cafe", "almoco", "jantar"];

/** Peso de cada refeição no orçamento (café costuma ser mais barato). */
const MEAL_WEIGHT: Record<MealType, number> = { cafe: 0.6, almoco: 1.2, jantar: 1.2 };

function matchesRestriction(recipe: Recipe, r: RestrictionId) {
  const d = recipe.diet;
  switch (r) {
    case "vegano":
      return !!d.vegan;
    case "vegetariano":
      return !!(d.vegetarian || d.vegan);
    case "pescetariano":
      return !!(d.pescatarian || d.vegetarian || d.vegan);
    case "sem-gluten":
      return !!d.glutenFree;
    case "sem-lactose":
      return !!(d.lactoseFree || d.vegan);
  }
}

/** Filtros rígidos: restrições, alergias, aparelhos e proteína principal. */
export function isCompatible(recipe: Recipe, profile: Profile) {
  if (!profile.restrictions.every((r) => matchesRestriction(recipe, r))) return false;
  if (recipe.allergens.some((a) => profile.allergies.includes(a))) return false;
  if (!recipe.appliances.every((a) => profile.appliances.includes(a))) return false;
  if (profile.proteins.length > 0 && recipe.proteins.length > 0) {
    const main = recipe.proteins[0];
    if (!profile.proteins.includes(main)) return false;
  }
  return true;
}

export function filterRecipes(recipes: Recipe[], profile: Profile) {
  return recipes.filter((r) => isCompatible(r, profile));
}

/** Pontuação de afinidade com as vontades do perfil (quanto maior, melhor). */
export function scoreRecipe(recipe: Recipe, profile: Profile) {
  let score = 1;
  for (const c of profile.cravings) {
    if (recipe.tags.includes(c)) score += 3;
  }
  if (profile.cravings.includes("rapido") && recipe.minutes <= 25) score += 2;
  if (profile.cravings.includes("baixa-caloria") && recipe.macros.kcal <= 450) score += 2;
  if (profile.cravings.includes("proteico") && recipe.macros.protein >= 35) score += 2;
  if (profile.proteins.length > 0) {
    score += recipe.proteins.filter((p) => profile.proteins.includes(p)).length * 0.5;
  }
  return score;
}

export interface PlanOptions {
  weekStart: Date;
  previous?: Plan | null;
  seed?: number;
  marketFactor: number;
}

export interface PlanResult {
  plan: Plan;
  total: number;
  /** Receitas disponíveis depois dos filtros (para avisar quando ficou curto). */
  poolSize: number;
}

export function generatePlan(
  recipes: Recipe[],
  profile: Profile,
  opts: PlanOptions,
): PlanResult {
  const rand = rng(opts.seed ?? Date.now());
  const pool = filterRecipes(recipes, profile);
  const meals = MEAL_ORDER.filter((m) => profile.meals.includes(m));
  const people = Math.max(1, profile.people);
  const factor = opts.marketFactor;

  const costOf = new Map<string, number>();
  const cost = (r: Recipe) => {
    let c = costOf.get(r.id);
    if (c === undefined) {
      c = recipeCost(r, people, factor);
      costOf.set(r.id, c);
    }
    return c;
  };

  // Orçamento por slot, ponderado por tipo de refeição.
  const slotsSpec: { day: number; meal: MealType }[] = [];
  for (let day = 0; day < 7; day++) for (const meal of meals) slotsSpec.push({ day, meal });
  const weightSum = slotsSpec.reduce((s, x) => s + MEAL_WEIGHT[x.meal], 0);
  const target = (meal: MealType) => (profile.budget * MEAL_WEIGHT[meal]) / weightSum;

  const previousLocked = new Map<string, PlanSlot>();
  if (opts.previous) {
    for (const s of opts.previous.slots) {
      if (s.locked) previousLocked.set(`${s.day}-${s.meal}`, s);
    }
  }

  const used = new Set<string>();
  for (const s of previousLocked.values()) used.add(s.recipeId);

  const slots: PlanSlot[] = [];
  let lastMainProtein: Record<MealType, string | undefined> = { cafe: undefined, almoco: undefined, jantar: undefined };

  for (const spec of slotsSpec) {
    const key = `${spec.day}-${spec.meal}`;
    const locked = previousLocked.get(key);
    if (locked) {
      slots.push({ ...locked, servings: people });
      const r = recipes.find((x) => x.id === locked.recipeId);
      lastMainProtein = { ...lastMainProtein, [spec.meal]: r?.proteins[0] };
      continue;
    }

    let candidates = pool.filter((r) => r.meals.includes(spec.meal) && !used.has(r.id));
    if (candidates.length === 0) {
      // Pool curto: permite repetir receitas da semana.
      candidates = pool.filter((r) => r.meals.includes(spec.meal));
    }
    if (candidates.length === 0) continue;

    const t = target(spec.meal);
    const ranked = shuffle(candidates, rand)
      .map((r) => {
        let s = scoreRecipe(r, profile);
        const c = cost(r);
        if (c > t) s -= ((c - t) / t) * 4; // penaliza estourar a meta do slot
        else s += 0.5;
        if (profile.cravings.includes("economico")) s += Math.max(0, (t - c) / t) * 2;
        if (r.proteins[0] && r.proteins[0] === lastMainProtein[spec.meal]) s -= 2; // variedade
        return { r, s };
      })
      .sort((a, b) => b.s - a.s);

    const top = ranked.slice(0, Math.min(4, ranked.length));
    const pick = top[Math.floor(rand() * top.length)].r;
    used.add(pick.id);
    lastMainProtein = { ...lastMainProtein, [spec.meal]: pick.proteins[0] };
    slots.push({ id: uid(), day: spec.day, meal: spec.meal, recipeId: pick.id, locked: false, servings: people });
  }

  // Ajuste final: se passou do orçamento, troca os slots mais caros (não fixados)
  // por alternativas mais baratas até caber.
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const total = () => slots.reduce((s, x) => s + (byId.get(x.recipeId) ? cost(byId.get(x.recipeId)!) : 0), 0);

  const uses = () => {
    const m = new Map<string, number>();
    for (const sl of slots) m.set(sl.recipeId, (m.get(sl.recipeId) ?? 0) + 1);
    return m;
  };

  // Fase 1 só com receitas inéditas na semana; fase 2 aceita repetir (no máximo
  // duas vezes a mesma receita) quando ainda assim não couber.
  for (const allowRepeat of [false, true]) {
    let guard = 0;
    while (total() > profile.budget && guard++ < 60) {
      const count = uses();
      const unlocked = slots
        .filter((s) => !s.locked && byId.get(s.recipeId))
        .sort((a, b) => cost(byId.get(b.recipeId)!) - cost(byId.get(a.recipeId)!));
      let swapped = false;
      for (const slot of unlocked) {
        const current = byId.get(slot.recipeId)!;
        const options = pool
          .filter((r) => r.meals.includes(slot.meal) && r.id !== current.id && cost(r) < cost(current) * 0.97)
          .filter((r) => (allowRepeat ? (count.get(r.id) ?? 0) < 2 : !count.has(r.id)))
          .sort((a, b) => scoreRecipe(b, profile) - cost(b) / 50 - (scoreRecipe(a, profile) - cost(a) / 50));
        if (options.length > 0) {
          slot.recipeId = options[0].id;
          swapped = true;
          break;
        }
      }
      if (!swapped) break;
    }
    if (total() <= profile.budget) break;
  }

  const plan: Plan = {
    id: uid(),
    createdAt: new Date().toISOString(),
    weekStart: opts.weekStart.toISOString(),
    slots,
    saved: false,
  };

  return { plan, total: total(), poolSize: pool.length };
}
