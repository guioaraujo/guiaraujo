"use client";

import { MealCard } from "@/components/meal-card";
import { BottomBar, Button, Card, Title } from "@/components/ui";
import { getMarket } from "@/data/markets";
import { aiAvailable, generateWithAi, mergeAiPlan } from "@/lib/ai-client";
import { generatePlan } from "@/lib/planner";
import { recipeCost } from "@/lib/pricing";
import { buildShoppingList } from "@/lib/shopping";
import { actions, findRecipe, useRecipes, useStore } from "@/lib/store";
import { addDays, brl, DAY_NAMES, nextMonday, shortDate } from "@/lib/utils";
import { ChevronRight, RefreshCw, ShoppingBasket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function PlanPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile)!;
  const plan = useStore((s) => s.plan);
  const custom = useStore((s) => s.customRecipes);
  const checked = useStore((s) => s.checked);
  const recipes = useRecipes();
  const [ai, setAi] = useState(false);
  const [busy, setBusy] = useState<"local" | "ai" | null>(null);

  useEffect(() => {
    aiAvailable().then(setAi);
  }, []);

  const market = getMarket(profile.marketId);
  const getRecipe = (id: string) => findRecipe(id, custom);

  const rows = useMemo(() => {
    if (!plan) return [];
    return plan.slots
      .map((slot) => {
        const recipe = getRecipe(slot.recipeId);
        return recipe ? { slot, recipe, cost: recipeCost(recipe, slot.servings, market.factor) } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, custom, market.factor]);

  const total = rows.reduce((s, r) => s + r.cost, 0);
  const list = useMemo(() => (plan ? buildShoppingList(plan, getRecipe, market.factor) : []), [plan, custom, market.factor]); // eslint-disable-line react-hooks/exhaustive-deps
  const bought = list.filter((i) => checked[i.key]).length;
  const over = total - profile.budget;

  function regenerate() {
    setBusy("local");
    const result = generatePlan(recipes, profile, {
      weekStart: plan ? new Date(plan.weekStart) : nextMonday(),
      marketFactor: market.factor,
      previous: plan,
    });
    actions.setPlan(result.plan);
    const lockedCount = plan?.slots.filter((s) => s.locked).length ?? 0;
    toast.success(lockedCount ? `Novo plano, mantendo ${lockedCount} fixada${lockedCount > 1 ? "s" : ""}` : "Novo plano gerado");
    setBusy(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function regenerateWithAi() {
    if (!plan) return;
    const open = plan.slots.filter((s) => !s.locked).map((s) => ({ day: s.day, meal: s.meal }));
    if (open.length === 0) {
      toast("Todas as refeições estão fixadas");
      return;
    }
    setBusy("ai");
    const id = toast.loading("Criando receitas novas para a sua semana…");
    try {
      const avoid = rows.map((r) => r.recipe.name);
      const out = await generateWithAi(profile, open, avoid);
      actions.addCustomRecipes(out.recipes.map(({ day: _d, meal: _m, ...r }) => (void _d, void _m, r)));
      actions.setPlan(mergeAiPlan(plan, profile.people, out.recipes));
      toast.success(`${out.recipes.length} receitas novas criadas`, { id });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar com IA", { id });
    } finally {
      setBusy(null);
    }
  }

  function save() {
    actions.savePlan();
    toast.success("Plano salvo. Sua lista de compras está pronta.");
    router.push("/lista");
  }

  if (!plan) {
    return (
      <main className="px-5 pt-16 text-center" style={{ paddingTop: "calc(var(--safe-top) + 64px)" }}>
        <div className="text-[56px]">🗓️</div>
        <Title className="mt-4">Vamos montar sua semana</Title>
        <p className="mt-2 text-muted">Com base nas suas preferências e no orçamento de {brl(profile.budget, { cents: false })}.</p>
        <Button className="mt-8" onClick={regenerate}>
          Gerar plano
        </Button>
      </main>
    );
  }

  const days = Array.from({ length: 7 }, (_, d) => ({
    day: d,
    date: addDays(plan.weekStart, d),
    rows: rows.filter((r) => r.slot.day === d),
  })).filter((d) => d.rows.length > 0);

  return (
    <main className="pb-28" style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}>
      <header className="px-5 pt-3">
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
          {shortDate(addDays(plan.weekStart, 0))} – {shortDate(addDays(plan.weekStart, 6))}
        </p>
        <Title className="mt-1">{plan.saved ? "Seu plano da semana" : "Seu plano alimentar está pronto"}</Title>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Card className="p-4">
          <p className="text-[12px] text-muted">Custo estimado</p>
          <p className="mt-1 font-serif text-[24px] leading-none">{brl(total, { cents: false })}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-dark">
            <div
              className={over > 0 ? "h-full bg-danger" : "h-full bg-leaf"}
              style={{ width: `${Math.min(100, (total / profile.budget) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted">
            {over > 0 ? `${brl(over, { cents: false })} acima` : `${brl(-over, { cents: false })} abaixo`} de {brl(profile.budget, { cents: false })}
          </p>
        </Card>
        <Link href="/lista">
          <Card className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <ShoppingBasket size={18} className="text-accent" />
              <ChevronRight size={16} className="text-muted" />
            </div>
            <div>
              <p className="text-[13px] font-semibold">Lista de compras</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {bought}/{list.length} itens comprados
              </p>
            </div>
          </Card>
        </Link>
      </div>

      <p className="mt-5 px-5 text-[14px] text-muted">
        Fixe as refeições que você adora e gere as outras de novo.
      </p>
      {market && (
        <p className="mt-1 px-5 text-[12px] text-muted">
          Preços estimados para {market.name} · {profile.people} {profile.people === 1 ? "pessoa" : "pessoas"}
        </p>
      )}

      <div className="mt-4 space-y-6 px-5">
        {days.map((d) => (
          <section key={d.day}>
            <h2 className="mb-2 flex items-baseline gap-2 font-serif text-[20px]">
              {DAY_NAMES[d.day]}
              <span className="font-sans text-[12px] text-muted">{shortDate(d.date)}</span>
            </h2>
            <div className="space-y-2.5">
              {d.rows.map((r) => (
                <MealCard key={r.slot.id} slot={r.slot} recipe={r.recipe} cost={r.cost} onToggleLock={() => actions.toggleLock(r.slot.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <BottomBar aboveTabs>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={regenerate}
            disabled={busy !== null}
            className="inline-flex h-14 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-ink/15 bg-white px-3 text-[14px] font-semibold text-ink disabled:opacity-40"
          >
            <RefreshCw size={16} className={busy === "local" ? "animate-spin" : ""} />
            Gerar de novo
          </button>
          {ai && (
            <button
              type="button"
              onClick={regenerateWithAi}
              disabled={busy !== null}
              aria-label="Criar receitas novas com IA"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent-soft text-accent disabled:opacity-40"
            >
              <Sparkles size={18} className={busy === "ai" ? "animate-pulse" : ""} />
            </button>
          )}
          <Button className="flex-1" onClick={save} disabled={busy !== null}>
            {plan.saved ? "Ver lista" : "Salvar plano"}
          </Button>
        </div>
      </BottomBar>
    </main>
  );
}
