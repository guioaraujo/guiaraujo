"use client";

import { MARKETS } from "@/data/markets";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function MarketLogo({ id, className }: { id: string; className?: string }) {
  const m = MARKETS.find((x) => x.id === id) ?? MARKETS[MARKETS.length - 1];
  const long = m.short.length > 8;
  return (
    <div
      className={cn("flex items-center justify-center rounded-2xl px-2 text-center font-black uppercase tracking-tight", className)}
      style={{ background: m.bg, color: m.fg, fontSize: long ? 11 : 14 }}
    >
      {m.short}
    </div>
  );
}

export function MarketGrid({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MARKETS.map((m) => {
        const on = selected === m.id;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(m.id)}
            className={cn(
              "relative flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl border bg-white p-3 transition active:scale-[0.97]",
              on ? "border-ink shadow-[0_0_0_1px_#1c1917]" : "border-ink/8",
            )}
          >
            {on && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-cream">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <MarketLogo id={m.id} className="h-12 w-full" />
            <span className="text-[11px] leading-tight text-muted">{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}
