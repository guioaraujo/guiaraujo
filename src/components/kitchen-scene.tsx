"use client";

import { APPLIANCES, KITCHEN_SPOTS } from "@/data/options";
import type { ApplianceId } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Cozinha ilustrada com os aparelhos como etiquetas clicáveis. */
export function KitchenScene({
  selected,
  onToggle,
}: {
  selected: ApplianceId[];
  onToggle: (id: ApplianceId) => void;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-ink/8">
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dfe6c8" />
            <stop offset="1" stopColor="#cfd9b2" />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c89a6a" />
            <stop offset="1" stopColor="#a97a4e" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#wall)" />
        {/* janela */}
        <rect x="290" y="40" width="90" height="120" rx="8" fill="#bfe3f5" stroke="#ffffff" strokeWidth="6" />
        <line x1="335" y1="40" x2="335" y2="160" stroke="#ffffff" strokeWidth="4" />
        <line x1="290" y1="100" x2="380" y2="100" stroke="#ffffff" strokeWidth="4" />
        {/* relógio */}
        <circle cx="60" cy="70" r="22" fill="#fff" stroke="#c0392b" strokeWidth="5" />
        <line x1="60" y1="70" x2="60" y2="56" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="70" x2="70" y2="74" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
        {/* prateleira */}
        <rect x="100" y="90" width="170" height="8" rx="3" fill="#8a6a4a" />
        <rect x="110" y="62" width="22" height="28" rx="3" fill="#d97b3c" />
        <rect x="140" y="58" width="22" height="32" rx="3" fill="#4f7a4a" />
        <rect x="170" y="66" width="30" height="24" rx="3" fill="#f1c40f" />
        <rect x="215" y="60" width="18" height="30" rx="3" fill="#2a6f97" />
        {/* azulejo */}
        <rect x="0" y="200" width="400" height="70" fill="#f4efe3" />
        <g stroke="#e4dbcc" strokeWidth="2">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={i * 40} y1="200" x2={i * 40} y2="270" />
          ))}
          <line x1="0" y1="235" x2="400" y2="235" />
        </g>
        {/* bancada e armários */}
        <rect x="0" y="270" width="400" height="18" rx="2" fill="#6b4f3a" />
        <rect x="0" y="288" width="400" height="120" fill="#e9e2d5" />
        <g stroke="#cfc5b4" strokeWidth="3">
          <line x1="100" y1="288" x2="100" y2="408" />
          <line x1="200" y1="288" x2="200" y2="408" />
          <line x1="300" y1="288" x2="300" y2="408" />
        </g>
        <g fill="#8a6a4a">
          <rect x="44" y="340" width="12" height="4" rx="2" />
          <rect x="144" y="340" width="12" height="4" rx="2" />
          <rect x="244" y="340" width="12" height="4" rx="2" />
          <rect x="344" y="340" width="12" height="4" rx="2" />
        </g>
        {/* forno */}
        <rect x="112" y="300" width="76" height="60" rx="6" fill="#3b3b3b" />
        <rect x="120" y="312" width="60" height="38" rx="4" fill="#9ad1ea" opacity="0.7" />
        {/* chão */}
        <rect x="0" y="408" width="400" height="92" fill="url(#floor)" />
        <g stroke="#8f663f" strokeWidth="2" opacity="0.5">
          <line x1="0" y1="440" x2="400" y2="440" />
          <line x1="0" y1="472" x2="400" y2="472" />
        </g>
        {/* potes e vasinho */}
        <circle cx="30" cy="258" r="12" fill="#c0392b" />
        <circle cx="30" cy="246" r="7" fill="#e74c3c" />
        <rect x="360" y="236" width="20" height="34" rx="4" fill="#d9a066" />
        <circle cx="370" cy="228" r="12" fill="#4f7a4a" />
      </svg>

      {APPLIANCES.map((a) => {
        const spot = KITCHEN_SPOTS[a.id];
        const on = selected.includes(a.id);
        return (
          <button
            key={a.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(a.id)}
            className={cn(
              "absolute flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1.5 text-[11px] font-semibold shadow-md transition active:scale-95",
              spot.align === "center" && "-translate-x-1/2",
              on ? "border-ink bg-ink text-cream" : "border-white bg-white/90 text-ink-soft",
            )}
            style={{
              top: `${spot.y}%`,
              ...(spot.align === "left" ? { left: `${spot.x}%` } : spot.align === "right" ? { right: `${spot.x}%` } : { left: `${spot.x}%` }),
            }}
          >
            <span className="text-[14px] leading-none">{a.emoji}</span>
            {spot.short}
          </button>
        );
      })}
    </div>
  );
}
