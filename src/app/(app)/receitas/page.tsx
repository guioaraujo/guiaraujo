"use client";

import { RecipeCover } from "@/components/recipe-cover";
import { Title } from "@/components/ui";
import { MEALS } from "@/data/options";
import { isCompatible } from "@/lib/planner";
import { recipeCostPerServing, type PriceContext } from "@/lib/pricing";
import { usePriceContext, useRecipes, useStore } from "@/lib/store";
import type { MealType, Recipe } from "@/lib/types";
import { brl, cn } from "@/lib/utils";
import { Clock, Flame, Heart, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function RecipesPage() {
  const profile = useStore((s) => s.profile)!;
  const favorites = useStore((s) => s.favorites);
  const recipes = useRecipes();
  const [q, setQ] = useState("");
  const [meal, setMeal] = useState<MealType | "todas">("todas");
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const factor = usePriceContext();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return recipes.filter((r) => {
      if (meal !== "todas" && !r.meals.includes(meal)) return false;
      if (onlyCompatible && !isCompatible(r, profile)) return false;
      if (term && !`${r.name} ${r.description} ${r.cuisine}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [recipes, q, meal, onlyCompatible, profile]);

  const favs = filtered.filter((r) => favorites.includes(r.id));
  const rest = filtered.filter((r) => !favorites.includes(r.id));

  return (
    <main className="pb-6" style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}>
      <header className="px-5 pt-3">
        <Title className="text-[24px]">Receitas</Title>
        <label className="mt-3 flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4">
          <Search size={16} className="text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou cozinha"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
        </label>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {[{ id: "todas" as const, label: "Todas", emoji: "✨" }, ...MEALS].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMeal(m.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium",
                meal === m.id ? "border-ink bg-ink text-cream" : "border-ink/10 bg-white text-ink-soft",
              )}
            >
              {m.emoji} {m.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyCompatible((v) => !v)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium",
              onlyCompatible ? "border-leaf bg-leaf-soft text-leaf" : "border-ink/10 bg-white text-ink-soft",
            )}
          >
            ✓ Para o meu perfil
          </button>
        </div>
      </header>

      {favs.length > 0 && (
        <Section title="Favoritas">
          {favs.map((r) => (
            <RecipeTile key={r.id} recipe={r} factor={factor} fav />
          ))}
        </Section>
      )}
      <Section title={favs.length ? "Todas" : undefined}>
        {rest.map((r) => (
          <RecipeTile key={r.id} recipe={r} factor={factor} />
        ))}
      </Section>
      {filtered.length === 0 && <p className="mt-10 text-center text-muted">Nenhuma receita com esses filtros.</p>}
    </main>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 px-5">
      {title && <h2 className="mb-2 font-serif text-[18px]">{title}</h2>}
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function RecipeTile({ recipe, factor, fav }: { recipe: Recipe; factor: PriceContext; fav?: boolean }) {
  return (
    <Link href={`/receita/${recipe.id}`} className="overflow-hidden rounded-3xl border border-ink/6 bg-white">
      <div className="relative">
        <RecipeCover recipe={recipe} className="h-[120px] w-full" emojiClassName="text-[48px]" />
        {fav && (
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger">
            <Heart size={14} fill="currentColor" />
          </span>
        )}
        {recipe.source === "ai" && <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-cream">IA</span>}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-serif text-[15px] leading-tight">{recipe.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-0.5">
            <Clock size={11} /> {recipe.minutes} min
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Flame size={11} /> {recipe.macros.kcal}
          </span>
          <span className="ml-auto font-semibold text-ink">{brl(recipeCostPerServing(recipe, factor))}/p</span>
        </div>
      </div>
    </Link>
  );
}
