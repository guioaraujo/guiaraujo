"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 12,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "lg" | "sm";
}) {
  const btn = cn(
    "flex items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition active:scale-95 disabled:opacity-30",
    size === "lg" ? "h-12 w-12" : "h-8 w-8",
  );
  return (
    <div className={cn("flex items-center justify-center", size === "lg" ? "gap-8" : "gap-3")}>
      <button type="button" aria-label="Diminuir" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={size === "lg" ? 20 : 14} />
      </button>
      <span className={cn("font-serif tabular-nums", size === "lg" ? "text-[56px] leading-none" : "text-[18px]")}>{value}</span>
      <button type="button" aria-label="Aumentar" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={size === "lg" ? 20 : 14} />
      </button>
    </div>
  );
}
