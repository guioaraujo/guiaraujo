"use client";

import { CRAVING_LABEL, MEAL_LABEL } from "@/data/options";
import type { PlanSlot, Recipe } from "@/lib/types";
import { brl, cn } from "@/lib/utils";
import { Lock, LockOpen, Users } from "lucide-react";
import Link from "next/link";
import { RecipeCover } from "./recipe-cover";

export function MealCard({
  slot,
  recipe,
  cost,
  onToggleLock,
}: {
  slot: PlanSlot;
  recipe: Recipe;
  cost: number;
  onToggleLock?: () => void;
}) {
  const tag = recipe.tags[0];
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-3xl border bg-white p-2.5 pr-3 transition",
        slot.locked ? "border-accent/60 shadow-[0_0_0_1px_#d97b3c66]" : "border-ink/6",
      )}
    >
      <Link href={`/receita/${recipe.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <RecipeCover recipe={recipe} className="h-[72px] w-[72px] shrink-0 rounded-2xl" emojiClassName="text-[34px]" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-serif text-[16px] leading-tight text-ink">{recipe.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <span className="rounded-full bg-sand px-2 py-0.5 font-medium text-ink-soft">{MEAL_LABEL[slot.meal]}</span>
            {tag && <span className="rounded-full bg-leaf-soft px-2 py-0.5 font-medium text-leaf">{CRAVING_LABEL[tag]}</span>}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {slot.servings}
            </span>
            <span className="font-semibold text-ink">{brl(cost)}</span>
          </div>
        </div>
      </Link>
      {onToggleLock && (
        <button
          type="button"
          aria-label={slot.locked ? "Desafixar refeição" : "Fixar refeição"}
          aria-pressed={slot.locked}
          onClick={onToggleLock}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition active:scale-95",
            slot.locked ? "border-accent bg-accent text-white" : "border-ink/10 text-muted",
          )}
        >
          {slot.locked ? <Lock size={15} /> : <LockOpen size={15} />}
        </button>
      )}
    </div>
  );
}
