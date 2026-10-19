"use client";

import type { Ingredient } from "@/lib/types";
import { brl } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui";

const UNIT_LABEL = { g: "por kg", ml: "por litro", un: "por unidade" } as const;

export function PriceEditor({
  ingredient,
  marketName,
  estimated,
  current,
  onSave,
  onReset,
  onClose,
}: {
  ingredient: Ingredient;
  marketName: string;
  /** preço estimado (catálogo × fator) por kg, L ou un */
  estimated: number;
  /** preço informado pelo usuário, se houver */
  current?: number;
  onSave: (pricePer: number) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(() => (current ?? estimated).toFixed(2).replace(".", ","));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  const valid = Number.isFinite(parsed) && parsed >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-[28px] bg-cream px-5 pt-4"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 20px)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Preço de ${ingredient.name}`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-sand-dark" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-wide text-muted">{marketName}</p>
            <h2 className="font-serif text-[22px] leading-tight">
              {ingredient.emoji} {ingredient.name}
            </h2>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <X size={18} />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-[13px] text-muted">Preço na etiqueta, {UNIT_LABEL[ingredient.unit]}</span>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-4">
            <span className="text-[18px] text-muted">R$</span>
            <input
              autoFocus
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="h-14 w-full bg-transparent font-serif text-[30px] tabular-nums outline-none"
            />
          </div>
        </label>
        <p className="mt-2 text-[12px] text-muted">
          Estimativa do app: {brl(estimated)} {UNIT_LABEL[ingredient.unit]}. O preço informado passa a valer para esse mercado em todas as receitas.
        </p>

        <div className="mt-5 flex gap-2">
          {current !== undefined && (
            <Button variant="secondary" className="flex-1" onClick={onReset}>
              Usar estimativa
            </Button>
          )}
          <Button className="flex-[1.4]" disabled={!valid} onClick={() => valid && onSave(Math.round(parsed * 100) / 100)}>
            Salvar preço
          </Button>
        </div>
      </div>
    </div>
  );
}
