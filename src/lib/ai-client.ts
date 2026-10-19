import type { MealType, Plan, PlanSlot, Profile, Recipe } from "./types";
import { uid } from "./utils";

let availability: Promise<boolean> | null = null;

/** Diz se o servidor tem a chave da Anthropic configurada. */
export function aiAvailable(): Promise<boolean> {
  if (!availability) {
    availability = fetch("/api/plan", { method: "GET" })
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((j: { available?: boolean }) => !!j.available)
      .catch(() => false);
  }
  return availability;
}

export interface AiSlotSpec {
  day: number;
  meal: MealType;
}

export interface AiResponse {
  recipes: (Recipe & { day: number; meal: MealType })[];
}

export async function generateWithAi(
  profile: Profile,
  slots: AiSlotSpec[],
  avoidNames: string[],
): Promise<AiResponse> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile, slots, avoidNames }),
  });
  const text = (await res.text()).trim();
  if (!res.ok) {
    let message = "Não foi possível gerar com IA agora.";
    try {
      message = (JSON.parse(text) as { error?: string }).error ?? message;
    } catch {
      /* corpo não é JSON */
    }
    throw new Error(message);
  }
  const json = JSON.parse(text) as Partial<AiResponse> & { error?: string };
  if (json.error || !Array.isArray(json.recipes)) throw new Error(json.error ?? "Resposta inesperada da IA.");
  return { recipes: json.recipes };
}

/** Monta um plano novo mantendo os slots fixados e preenchendo o resto com a IA. */
export function mergeAiPlan(previous: Plan, people: number, generated: AiResponse["recipes"]): Plan {
  const slots: PlanSlot[] = previous.slots.map((s) => {
    if (s.locked) return { ...s, servings: people };
    const r = generated.find((g) => g.day === s.day && g.meal === s.meal);
    return r ? { ...s, id: uid(), recipeId: r.id, servings: people } : { ...s, servings: people };
  });
  return { ...previous, id: uid(), createdAt: new Date().toISOString(), slots, saved: false };
}
