"use client";

import type { Option } from "@/data/options";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function OptionGrid<T extends string>({
  options,
  selected,
  onToggle,
  columns = 2,
}: {
  options: Option<T>[];
  selected: T[];
  onToggle: (id: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={cn("grid gap-3", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.id)}
            className={cn(
              "relative flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-3xl border px-3 py-4 text-center transition active:scale-[0.97]",
              on ? "border-ink bg-white shadow-[0_0_0_1px_#1c1917]" : "border-ink/8 bg-white/70",
            )}
          >
            {on && (
              <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-cream">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <span className="text-[34px] leading-none">{o.emoji}</span>
            <span className="text-[13px] font-medium leading-tight text-ink">{o.label}</span>
            {o.hint && <span className="-mt-1 text-[11px] text-muted">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
