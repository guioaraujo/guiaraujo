import type { Unit } from "./types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function brl(value: number, opts: { cents?: boolean } = {}) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: opts.cents === false ? 0 : 2,
    maximumFractionDigits: opts.cents === false ? 0 : 2,
  }).format(value);
}

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Gerador pseudo-aleatório determinístico (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const DAY_NAMES = [
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
  "domingo",
];

export const DAY_SHORT = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

/** Segunda-feira da semana (ou da próxima, se já for fim de semana). */
export function nextMonday(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  if (dow >= 5) d.setDate(d.getDate() + (7 - dow));
  else d.setDate(d.getDate() - dow);
  return d;
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
}

export function shortDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
}

export function formatQty(qty: number, unit: Unit): string {
  if (unit === "un") {
    const r = Math.round(qty * 2) / 2;
    return `${r % 1 === 0 ? r : r.toFixed(1).replace(".", ",")} un`;
  }
  if (qty >= 1000) {
    const v = qty / 1000;
    return `${(Math.round(v * 10) / 10).toString().replace(".", ",")} ${unit === "g" ? "kg" : "L"}`;
  }
  return `${Math.round(qty)} ${unit}`;
}

