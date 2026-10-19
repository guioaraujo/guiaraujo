"use client";

import { RecipeCover } from "@/components/recipe-cover";
import { StepText } from "@/components/step-text";
import { Stepper } from "@/components/stepper";
import { BackButton, BottomBar, Button, Chip, IconButton } from "@/components/ui";
import { getMarket } from "@/data/markets";
import { CRAVING_LABEL, MEAL_LABEL } from "@/data/options";
import { recipeCost, resolveIngredient, scaleFactor } from "@/lib/pricing";
import { actions, useRecipe, useStore } from "@/lib/store";
import { brl, formatQty } from "@/lib/utils";
import { ChefHat, Clock, Heart, ShoppingBasket, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const recipe = useRecipe(id);
  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);
  const favorite = useStore((s) => s.favorites.includes(id));
  const cookedAt = useStore((s) => s.cooked[id]);
  const [servings, setServings] = useState<number | null>(null);

  if (!hydrated) return null;
  if (!recipe) {
    return (
      <main className="px-5 pt-24 text-center">
        <p className="text-muted">Receita não encontrada.</p>
        <Link href="/receitas" className="mt-4 inline-block font-semibold">
          Ver receitas
        </Link>
      </main>
    );
  }

  const n = servings ?? profile?.people ?? recipe.servings;
  const factor = getMarket(profile?.marketId).factor;
  const scale = scaleFactor(recipe, n);
  const cost = recipeCost(recipe, n, factor);

  return (
    <main className="pb-36">
      <div className="relative">
        <RecipeCover recipe={recipe} className="h-[300px] w-full" emojiClassName="text-[120px]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4" style={{ paddingTop: "calc(var(--safe-top) + 10px)" }}>
          <BackButton />
          <IconButton aria-label="Favoritar" aria-pressed={favorite} onClick={() => actions.toggleFavorite(recipe.id)}>
            <Heart size={20} className={favorite ? "text-danger" : ""} fill={favorite ? "currentColor" : "none"} />
          </IconButton>
        </div>
      </div>

      <div className="-mt-6 rounded-t-[28px] bg-cream px-5 pt-6">
        <div className="flex flex-wrap gap-1.5">
          {recipe.meals.map((m) => (
            <Chip key={m}>{MEAL_LABEL[m]}</Chip>
          ))}
          {recipe.tags.slice(0, 2).map((t) => (
            <Chip key={t} tone="leaf">
              {CRAVING_LABEL[t]}
            </Chip>
          ))}
          {recipe.source === "ai" && <Chip tone="ink">Criada por IA</Chip>}
        </div>
        <h1 className="mt-3 font-serif text-[26px] leading-tight">{recipe.name}</h1>
        <p className="mt-2 text-[14px] text-muted">{recipe.description}</p>
        <div className="mt-3 flex items-center gap-3 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {recipe.minutes} min
          </span>
          <span>·</span>
          <span>{recipe.cuisine}</span>
          {cookedAt && (
            <>
              <span>·</span>
              <span className="text-leaf">feita {new Date(cookedAt).toLocaleDateString("pt-BR")}</span>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-3xl border border-ink/6 bg-white px-4 py-3">
          <div>
            <p className="inline-flex items-center gap-1 text-[12px] text-muted">
              <Users size={12} /> porções
            </p>
            <p className="text-[13px] font-semibold">{brl(cost)} no total</p>
          </div>
          <Stepper size="sm" value={n} onChange={setServings} min={1} max={12} />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            ["kcal", recipe.macros.kcal, ""],
            ["proteína", recipe.macros.protein, "g"],
            ["carbo", recipe.macros.carbs, "g"],
            ["gordura", recipe.macros.fat, "g"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-2xl bg-sand px-2 py-3 text-center">
              <p className="font-serif text-[18px] leading-none">
                {value}
                <span className="text-[11px]">{unit}</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-right text-[10px] text-muted">por porção, estimativa</p>

        <section className="mt-6">
          <h2 className="font-serif text-[20px]">Ingredientes</h2>
          <ul className="mt-2 divide-y divide-ink/5 rounded-3xl border border-ink/6 bg-white px-4">
            {recipe.ingredients.map((ri) => {
              const ing = resolveIngredient(ri);
              return (
                <li key={ri.ingredientId} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 text-center text-[18px]">{ing.emoji}</span>
                  <span className="flex-1 text-[15px]">
                    {ing.name}
                    {ri.note && <span className="text-muted"> · {ri.note}</span>}
                  </span>
                  <span className="text-[13px] tabular-nums text-muted">{formatQty(ri.qty * scale, ing.unit)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-[20px]">Modo de preparo</h2>
          <ol className="mt-2 space-y-3">
            {recipe.steps.map((st, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-cream">{i + 1}</span>
                <div className="pt-0.5">
                  <StepText text={st.text} className="step-text text-[15px] leading-relaxed" />
                  {st.minutes && <p className="mt-0.5 text-[12px] text-muted">⏱ {st.minutes} min</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <button
          type="button"
          onClick={() => {
            actions.markCooked(recipe.id);
            toast.success("Boa! Receita marcada como feita.");
          }}
          className="mt-8 w-full text-center text-[14px] font-semibold text-ink-soft"
        >
          Marcar como feita
        </button>
      </div>

      <BottomBar>
        <div className="flex gap-2">
          <Button className="flex-[1.4]" onClick={() => router.push(`/receita/${recipe.id}/cozinhar`)}>
            <ChefHat size={18} /> Cozinhar
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => router.push("/lista")}>
            <ShoppingBasket size={18} /> Lista
          </Button>
        </div>
      </BottomBar>
    </main>
  );
}
