"use client";

import { StepText } from "@/components/step-text";
import { Button } from "@/components/ui";
import { actions, useRecipe, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    const request = async () => {
      try {
        lock = (await nav.wakeLock?.request("screen")) ?? null;
      } catch {
        /* sem suporte ou negado */
      }
    };
    request();
    const onVis = () => document.visibilityState === "visible" && request();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);
}

function Timer({ minutes }: { minutes: number }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          toast("⏰ Tempo esgotado!");
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = ((total - left) / total) * 100;

  return (
    <div className="mt-6 rounded-3xl border border-ink/8 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-wide text-muted">Timer</p>
          <p className={cn("font-serif text-[40px] leading-none tabular-nums", left === 0 && "text-accent")}>
            {mm}:{ss}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Reiniciar"
            onClick={() => {
              setLeft(total);
              setRunning(false);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            aria-label={running ? "Pausar" : "Iniciar"}
            onClick={() => setRunning((r) => !r && left > 0)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream"
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-dark">
        <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const recipe = useRecipe(id);
  const hydrated = useStore((s) => s.hydrated);
  const [i, setI] = useState(0);
  useWakeLock();

  const total = recipe?.steps.length ?? 0;
  const next = useCallback(() => setI((v) => Math.min(total - 1, v + 1)), [total]);
  const prev = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!hydrated) return null;
  if (!recipe) return null;

  const step = recipe.steps[i];
  const last = i === total - 1;

  function finish() {
    actions.markCooked(recipe!.id);
    toast.success("Bom apetite! Receita concluída.");
    router.replace(`/receita/${recipe!.id}`);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-cream" style={{ paddingTop: "calc(var(--safe-top) + 8px)", paddingBottom: "calc(var(--safe-bottom) + 16px)" }}>
      <header className="flex items-center justify-between px-4">
        <button type="button" aria-label="Fechar" onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <X size={20} />
        </button>
        <p className="text-[13px] font-semibold text-muted">
          Passo {i + 1} de {total}
        </p>
        <span className="w-10" />
      </header>

      <div className="mt-3 flex gap-1 px-5">
        {recipe.steps.map((_, k) => (
          <button key={k} type="button" aria-label={`Ir para o passo ${k + 1}`} onClick={() => setI(k)} className="flex-1 py-2">
            <span className={cn("block h-1.5 rounded-full", k <= i ? "bg-ink" : "bg-sand-dark")} />
          </button>
        ))}
      </div>

      <section key={i} className="fade-up flex flex-1 flex-col px-6 pt-8">
        <p className="text-[12px] uppercase tracking-wide text-muted">{recipe.name}</p>
        <StepText text={step.text} className="step-text mt-4 font-serif text-[30px] leading-[1.25] text-ink" />
        {step.minutes && <Timer key={i} minutes={step.minutes} />}
      </section>

      <div className="mt-6 flex items-center gap-3 px-5">
        <button
          type="button"
          aria-label="Passo anterior"
          onClick={prev}
          disabled={i === 0}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-white disabled:opacity-30"
        >
          <ChevronLeft size={22} />
        </button>
        {last ? (
          <Button onClick={finish}>Concluir</Button>
        ) : (
          <Button onClick={next}>
            Próximo passo <ChevronRight size={18} />
          </Button>
        )}
      </div>
    </main>
  );
}
