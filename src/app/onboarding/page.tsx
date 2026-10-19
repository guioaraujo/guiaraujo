"use client";

import { BudgetSlider } from "@/components/budget-slider";
import { KitchenScene } from "@/components/kitchen-scene";
import { MarketGrid } from "@/components/market-grid";
import { OptionGrid } from "@/components/option-grid";
import { Stepper } from "@/components/stepper";
import { BottomBar, Button, Progress, Subtitle, Title } from "@/components/ui";
import { getMarket } from "@/data/markets";
import { ALLERGENS, APPLIANCES, CRAVINGS, MEALS, PROTEINS, RESTRICTIONS } from "@/data/options";
import { generatePlan } from "@/lib/planner";
import { actions, allRecipes, useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { nextMonday } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const STEPS = ["mercado", "pessoas", "orcamento", "refeicoes", "vontades", "restricoes", "alergias", "proteinas", "cozinha"] as const;

const DEFAULT: Omit<Profile, "createdAt"> = {
  marketId: "",
  people: 2,
  budget: 275,
  meals: ["almoco", "jantar"],
  cravings: [],
  restrictions: [],
  allergies: [],
  proteins: [],
  appliances: ["fogao", "microondas"],
};

function toggle<T>(list: T[], id: T, max?: number): T[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (max && list.length >= max) {
    toast(`Escolha até ${max}`);
    return list;
  }
  return [...list, id];
}

function OnboardingGate() {
  const router = useRouter();
  const params = useSearchParams();
  const editing = params.get("edit") === "1";
  const existing = useStore((s) => s.profile);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && existing && !editing) router.replace("/plano");
  }, [hydrated, existing, editing, router]);

  if (!hydrated) return null;
  if (existing && !editing) return null;
  return <OnboardingForm editing={editing} initial={editing && existing ? { ...DEFAULT, ...existing } : DEFAULT} />;
}

function OnboardingForm({ editing, initial }: { editing: boolean; initial: Omit<Profile, "createdAt"> }) {
  const router = useRouter();
  const existing = useStore((s) => s.profile);
  const custom = useStore((s) => s.customRecipes);
  const plan = useStore((s) => s.plan);

  const [step, setStep] = useState(0);
  const [p, setP] = useState<Omit<Profile, "createdAt">>(initial);
  const [busy, setBusy] = useState(false);

  const last = step === STEPS.length - 1;
  const canNext = STEPS[step] !== "mercado" || !!p.marketId;

  function next() {
    if (!canNext) return;
    if (!last) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    if (p.meals.length === 0) {
      toast("Escolha pelo menos uma refeição para planejar");
      setStep(STEPS.indexOf("refeicoes"));
      return;
    }
    setBusy(true);
    const profile: Profile = { ...p, createdAt: existing?.createdAt ?? new Date().toISOString() };
    actions.setProfile(profile);
    const result = generatePlan(allRecipes(custom), profile, {
      weekStart: nextMonday(),
      marketFactor: getMarket(profile.marketId).factor,
      previous: editing ? plan : null,
    });
    actions.setPlan(result.plan);
    router.push("/plano");
  }

  function back() {
    if (step === 0) {
      if (editing) router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  const current = STEPS[step];

  return (
    <main className="min-h-dvh pb-40" style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}>
      <header className="flex items-center gap-3 px-4 py-2">
        <button
          type="button"
          aria-label="Voltar"
          onClick={back}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink disabled:opacity-20"
          disabled={step === 0 && !editing}
        >
          <ChevronLeft size={24} />
        </button>
        <Progress value={((step + 1) / STEPS.length) * 100} className="flex-1" />
        <span className="w-10 text-right text-[12px] tabular-nums text-muted">
          {step + 1}/{STEPS.length}
        </span>
      </header>

      <section key={current} className="fade-up px-5 pt-4">
        {current === "mercado" && (
          <>
            <Title>Onde você faz compras?</Title>
            <Subtitle>Os preços da semana são estimados com base no mercado escolhido.</Subtitle>
            <div className="mt-6">
              <MarketGrid selected={p.marketId || null} onSelect={(id) => setP({ ...p, marketId: id })} />
            </div>
          </>
        )}

        {current === "pessoas" && (
          <>
            <Title>Para quantas pessoas você cozinha?</Title>
            <Subtitle>Vamos ajustar seu plano e orçamento.</Subtitle>
            <div className="mx-auto mt-10 flex h-40 w-40 items-center justify-center rounded-[32px] bg-accent text-[72px] shadow-inner">
              🍽️
            </div>
            <div className="mt-10">
              <Stepper value={p.people} onChange={(v) => setP({ ...p, people: v })} />
            </div>
          </>
        )}

        {current === "orcamento" && (
          <>
            <Title>Qual é o seu orçamento semanal?</Title>
            <Subtitle>Deslize até o valor que você deseja gastar.</Subtitle>
            <div className="mt-14">
              <BudgetSlider value={p.budget} onChange={(v) => setP({ ...p, budget: v })} />
            </div>
          </>
        )}

        {current === "refeicoes" && (
          <>
            <Title>Quais refeições quer planejar?</Title>
            <Subtitle>O orçamento é dividido entre elas ao longo dos 7 dias.</Subtitle>
            <div className="mt-6">
              <OptionGrid options={MEALS} selected={p.meals} onToggle={(id) => setP({ ...p, meals: toggle(p.meals, id) })} columns={3} />
            </div>
          </>
        )}

        {current === "vontades" && (
          <>
            <Title>Do que você está com vontade?</Title>
            <Subtitle>Escolha até 3</Subtitle>
            <div className="mt-6">
              <OptionGrid options={CRAVINGS} selected={p.cravings} onToggle={(id) => setP({ ...p, cravings: toggle(p.cravings, id, 3) })} />
            </div>
          </>
        )}

        {current === "restricoes" && (
          <>
            <Title>Alguma restrição alimentar?</Title>
            <Subtitle>Pode pular se não tiver nenhuma.</Subtitle>
            <div className="mt-6">
              <OptionGrid options={RESTRICTIONS} selected={p.restrictions} onToggle={(id) => setP({ ...p, restrictions: toggle(p.restrictions, id) })} />
            </div>
          </>
        )}

        {current === "alergias" && (
          <>
            <Title>Tem alguma alergia alimentar?</Title>
            <Subtitle>Receitas com esses ingredientes ficam de fora.</Subtitle>
            <div className="mt-6">
              <OptionGrid options={ALLERGENS} selected={p.allergies} onToggle={(id) => setP({ ...p, allergies: toggle(p.allergies, id) })} />
            </div>
          </>
        )}

        {current === "proteinas" && (
          <>
            <Title>Quais fontes de proteína você prefere?</Title>
            <Subtitle>Sem escolher nada, vale tudo.</Subtitle>
            <div className="mt-6">
              <OptionGrid options={PROTEINS} selected={p.proteins} onToggle={(id) => setP({ ...p, proteins: toggle(p.proteins, id) })} />
            </div>
          </>
        )}

        {current === "cozinha" && (
          <>
            <Title>O que tem na sua cozinha?</Title>
            <Subtitle>Selecione todos os aparelhos que você tem.</Subtitle>
            <div className="mt-5">
              <KitchenScene selected={p.appliances} onToggle={(id) => setP({ ...p, appliances: toggle(p.appliances, id) })} />
            </div>
            <p className="mt-3 text-center text-[12px] text-muted">
              {p.appliances.length} de {APPLIANCES.length} selecionados
            </p>
          </>
        )}
      </section>

      <BottomBar>
        <Button onClick={next} disabled={!canNext || busy}>
          {busy ? "Montando seu plano…" : last ? "Gerar" : "Avançar"}
        </Button>
      </BottomBar>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingGate />
    </Suspense>
  );
}
