"use client";

import { RecipeCover } from "@/components/recipe-cover";
import { Title } from "@/components/ui";
import { getMarket } from "@/data/markets";
import { buildShoppingList, groupByAisle, groupByRecipe, PANTRY_STAPLES, type ShoppingItem } from "@/lib/shopping";
import { actions, findRecipe, usePriceContext, useStore } from "@/lib/store";
import { PriceEditor } from "@/components/price-editor";
import { hasOverride } from "@/lib/pricing";
import type { Ingredient } from "@/lib/types";
import { addDays, brl, cn, DAY_SHORT, formatQty, shortDate } from "@/lib/utils";
import { CalendarDays, Check, Share } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ListPage() {
  const profile = useStore((s) => s.profile)!;
  const plan = useStore((s) => s.plan);
  const custom = useStore((s) => s.customRecipes);
  const checked = useStore((s) => s.checked);
  const [groupBy, setGroupBy] = useState<"corredor" | "receita">("corredor");
  const [showMeals, setShowMeals] = useState(true);

  const market = getMarket(profile.marketId);
  const price = usePriceContext();
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const getRecipe = (id: string) => findRecipe(id, custom);
  const items = useMemo(() => (plan ? buildShoppingList(plan, getRecipe, price) : []), [plan, custom, price]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan) {
    return (
      <main className="px-5 text-center" style={{ paddingTop: "calc(var(--safe-top) + 64px)" }}>
        <div className="text-[56px]">🧺</div>
        <Title className="mt-4">Sem lista ainda</Title>
        <p className="mt-2 text-muted">Gere um plano para montar a lista de compras automaticamente.</p>
        <Link href="/plano" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-cream">
          Ir para o plano
        </Link>
      </main>
    );
  }

  const bought = items.filter((i) => checked[i.key]).length;
  const total = items.reduce((s, i) => s + i.cost, 0);
  const remaining = items.filter((i) => !checked[i.key]).reduce((s, i) => s + i.cost, 0);

  const meals = plan.slots
    .map((s) => ({ slot: s, recipe: getRecipe(s.recipeId) }))
    .filter((x): x is { slot: typeof x.slot; recipe: NonNullable<typeof x.recipe> } => !!x.recipe);

  async function share() {
    const lines = groupByAisle(items).flatMap((g) => [
      `\n${g.aisle.toUpperCase()}`,
      ...g.items.map((i) => `${checked[i.key] ? "☑" : "☐"} ${i.ingredient.name} — ${formatQty(i.qty, i.ingredient.unit)}`),
    ]);
    const text = `Lista de compras (${shortDate(addDays(plan!.weekStart, 0))} – ${shortDate(addDays(plan!.weekStart, 6))})${lines.join("\n")}\n\nTotal estimado: ${brl(total)}`;
    try {
      if (navigator.share) await navigator.share({ title: "Lista de compras", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Lista copiada");
      }
    } catch {
      /* cancelado */
    }
  }

  const groups =
    groupBy === "corredor"
      ? groupByAisle(items).map((g) => ({ key: g.aisle, title: g.aisle, items: g.items }))
      : groupByRecipe(items).map((g) => ({ key: g.id, title: g.name, items: g.items }));

  return (
    <main className="pb-10" style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}>
      <header className="flex items-center justify-between px-5 pt-3">
        <Title className="text-[24px]">Lista de compras</Title>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Compartilhar" onClick={share} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Share size={18} />
          </button>
          <Link href="/plano" aria-label="Ver plano" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <CalendarDays size={18} />
          </Link>
        </div>
      </header>

      <section className="mt-5">
        <div className="flex items-end justify-between px-5">
          <div>
            <h2 className="font-serif text-[18px]">Refeições planejadas</h2>
            <p className="text-[12px] text-muted">
              {meals.length} selecionadas · {shortDate(addDays(plan.weekStart, 0))} – {shortDate(addDays(plan.weekStart, 6))}
            </p>
          </div>
          <button type="button" onClick={() => setShowMeals((v) => !v)} className="text-[13px] font-semibold text-ink">
            {showMeals ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {showMeals && (
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5">
            {meals.map(({ slot, recipe }) => (
              <Link key={slot.id} href={`/receita/${recipe.id}`} className="w-[108px] shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {DAY_SHORT[slot.day]} · {shortDate(addDays(plan.weekStart, slot.day))}
                </p>
                <RecipeCover recipe={recipe} className="mt-1 h-[108px] w-[108px] rounded-2xl" emojiClassName="text-[40px]" />
                <p className="mt-1 line-clamp-2 text-[12px] leading-tight">{recipe.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-[18px]">Sua lista de compras</h2>
            <p className="text-[12px] text-muted">
              {items.length} itens · {bought} comprados · faltam {brl(remaining, { cents: false })} de {brl(total, { cents: false })}
            </p>
          </div>
          <label className="flex items-center gap-1 text-[12px] text-muted">
            Agrupar por
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "corredor" | "receita")}
              className="rounded-full border border-ink/10 bg-white px-2 py-1 text-[12px] font-semibold text-ink"
            >
              <option value="corredor">Corredor</option>
              <option value="receita">Receita</option>
            </select>
          </label>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-dark">
          <div className="h-full bg-leaf transition-[width]" style={{ width: `${items.length ? (bought / items.length) * 100 : 0}%` }} />
        </div>

        <div className="mt-4 space-y-6">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.title}</h3>
              <ul className="divide-y divide-ink/5 rounded-3xl border border-ink/6 bg-white px-3">
                {g.items.map((item) => (
                  <ListRow
                    key={g.key + item.key}
                    item={item}
                    done={!!checked[item.key]}
                    custom={hasOverride(item.key, price)}
                    onToggle={() => actions.toggleChecked(item.key)}
                    onEditPrice={() => setEditing(item.ingredient)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[12px] text-muted">Toque no preço de um item para informar o valor da etiqueta.</p>

        {bought > 0 && (
          <button type="button" onClick={() => actions.clearChecked()} className="mt-6 w-full text-center text-[13px] font-semibold text-muted">
            Desmarcar tudo
          </button>
        )}
      </section>

      {editing && (
        <PriceEditor
          ingredient={editing}
          marketName={market.name}
          estimated={editing.pricePer * market.factor}
          current={price.overrides?.[editing.id]}
          onSave={(v) => {
            actions.setPriceOverride(market.id, editing.id, v);
            setEditing(null);
            toast.success(`Preço de ${editing.name} atualizado`);
          }}
          onReset={() => {
            actions.setPriceOverride(market.id, editing.id, null);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}

function ListRow({
  item,
  done,
  custom,
  onToggle,
  onEditPrice,
}: {
  item: ShoppingItem;
  done: boolean;
  custom: boolean;
  onToggle: () => void;
  onEditPrice: () => void;
}) {
  const staple = PANTRY_STAPLES.has(item.key);
  return (
    <li className="flex items-center gap-2 py-3">
      <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="w-7 text-center text-[20px] leading-none">{item.ingredient.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-[15px] leading-tight", done && "text-muted line-through")}>{item.ingredient.name}</span>
          <span className="block text-[12px] text-muted">
            {formatQty(item.qty, item.ingredient.unit)}
            {staple && " · básico da despensa"}
            {item.recipes.length > 1 && ` · ${item.recipes.length} receitas`}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onEditPrice}
        aria-label={`Ajustar preço de ${item.ingredient.name}`}
        className={cn(
          "rounded-full px-2 py-1 text-[12px] tabular-nums",
          custom ? "bg-leaf-soft font-semibold text-leaf" : "text-muted underline decoration-dotted underline-offset-4",
        )}
      >
        {brl(item.cost)}
      </button>
      <button type="button" onClick={onToggle} aria-label={done ? "Desmarcar" : "Marcar como comprado"} className="p-0.5">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md border transition",
            done ? "border-ink bg-ink text-cream" : "border-ink/20 bg-white",
          )}
        >
          {done && <Check size={14} strokeWidth={3} />}
        </span>
      </button>
    </li>
  );
}
