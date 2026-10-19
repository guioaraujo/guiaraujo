"use client";

import { brl } from "@/lib/utils";

export function BudgetSlider({
  value,
  onChange,
  min = 100,
  max = 750,
  step = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="text-center">
        <div className="font-serif text-[52px] leading-none tabular-nums">{brl(value, { cents: false })}</div>
        <div className="mt-2 text-[14px] text-muted">esta semana</div>
      </div>
      <div className="mt-10 px-1">
        <input
          type="range"
          className="budget"
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ ["--pct" as string]: `${pct}%` }}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Orçamento semanal"
        />
        <div className="mt-2 flex justify-between text-[12px] text-muted">
          <span>{brl(min, { cents: false })}</span>
          <span>{brl(max, { cents: false })}</span>
        </div>
      </div>
    </div>
  );
}
