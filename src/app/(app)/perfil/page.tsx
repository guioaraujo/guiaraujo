"use client";

import { MarketLogo } from "@/components/market-grid";
import { Button, Card, Chip, Title } from "@/components/ui";
import { getMarket } from "@/data/markets";
import { ALLERGENS, APPLIANCES, CRAVINGS, MEALS, PROTEINS, RESTRICTIONS } from "@/data/options";
import { aiAvailable } from "@/lib/ai-client";
import { actions, useStore } from "@/lib/store";
import { brl } from "@/lib/utils";
import { Share, SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

function isStandalone() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function useStandalone() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    isStandalone,
    () => true,
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile)!;
  const cooked = useStore((s) => s.cooked);
  const customCount = useStore((s) => s.customRecipes.length);
  const standalone = useStandalone();
  const [ai, setAi] = useState<boolean | null>(null);
  useEffect(() => {
    aiAvailable().then(setAi);
  }, []);
  const market = getMarket(profile.marketId);

  const labels = <T extends string>(opts: { id: T; label: string; emoji: string }[], ids: T[]) =>
    opts.filter((o) => ids.includes(o.id));

  return (
    <main className="px-5 pb-8" style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}>
      <Title className="pt-3 text-[24px]">Perfil</Title>

      <Card className="mt-4 flex items-center gap-3">
        <MarketLogo id={profile.marketId} className="h-14 w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{market.name}</p>
          <p className="text-[13px] text-muted">
            {profile.people} {profile.people === 1 ? "pessoa" : "pessoas"} · {brl(profile.budget, { cents: false })}/semana
          </p>
        </div>
      </Card>

      <Group title="Refeições planejadas" items={labels(MEALS, profile.meals)} />
      <Group title="Vontades" items={labels(CRAVINGS, profile.cravings)} empty="Nenhuma" />
      <Group title="Restrições" items={labels(RESTRICTIONS, profile.restrictions)} empty="Nenhuma" />
      <Group title="Alergias" items={labels(ALLERGENS, profile.allergies)} empty="Nenhuma" />
      <Group title="Proteínas preferidas" items={labels(PROTEINS, profile.proteins)} empty="Todas" />
      <Group title="Na cozinha" items={labels(APPLIANCES, profile.appliances)} empty="Nenhum aparelho" />

      <Button variant="secondary" className="mt-5" onClick={() => router.push("/onboarding?edit=1")}>
        Editar preferências
      </Button>

      {!standalone && (
        <Card className="mt-6 bg-accent-soft/60">
          <p className="font-semibold">Instalar no iPhone</p>
          <ol className="mt-2 space-y-1.5 text-[14px] text-ink-soft">
            <li className="flex items-center gap-2">
              1. No Safari, toque em <Share size={16} className="inline" /> Compartilhar
            </li>
            <li className="flex items-center gap-2">
              2. Escolha <SquarePlus size={16} className="inline" /> Adicionar à Tela de Início
            </li>
            <li>3. Toque em Adicionar. O app abre em tela cheia e funciona offline.</li>
          </ol>
        </Card>
      )}

      <Card className="mt-4">
        <p className="text-[13px] text-muted">Receitas feitas</p>
        <p className="font-serif text-[28px]">{Object.keys(cooked).length}</p>
        <p className="mt-2 text-[12px] text-muted">
          {customCount > 0 ? `${customCount} receitas criadas por IA guardadas neste aparelho. ` : ""}
          Geração com IA: {ai === null ? "verificando…" : ai ? "ativa" : "não configurada neste servidor"}.
        </p>
      </Card>

      <button
        type="button"
        onClick={() => {
          if (window.confirm("Apagar plano, lista e preferências deste aparelho?")) {
            actions.reset();
            router.replace("/onboarding");
          }
        }}
        className="mt-8 w-full text-center text-[13px] font-semibold text-danger"
      >
        Apagar meus dados
      </button>
    </main>
  );
}

function Group({ title, items, empty }: { title: string; items: { id: string; label: string; emoji: string }[]; empty?: string }) {
  return (
    <section className="mt-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-[13px] text-muted">{empty}</span>}
        {items.map((i) => (
          <Chip key={i.id}>
            {i.emoji} {i.label}
          </Chip>
        ))}
      </div>
    </section>
  );
}
