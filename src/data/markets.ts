export interface Market {
  id: string;
  name: string;
  short: string;
  /** Fator sobre o preço de referência (1 = média nacional). */
  factor: number;
  /** Cores da marca para o "logo" tipográfico. */
  bg: string;
  fg: string;
}

export const MARKETS: Market[] = [
  { id: "atacadao", name: "Atacadão", short: "Atacadão", factor: 0.88, bg: "#E4002B", fg: "#FFFFFF" },
  { id: "assai", name: "Assaí Atacadista", short: "Assaí", factor: 0.9, bg: "#1D3C8F", fg: "#FFC20E" },
  { id: "carrefour", name: "Carrefour", short: "Carrefour", factor: 1.0, bg: "#004E9A", fg: "#FFFFFF" },
  { id: "extra", name: "Extra Mercado", short: "Extra", factor: 1.03, bg: "#D81F26", fg: "#FFFFFF" },
  { id: "bh", name: "Supermercados BH", short: "BH", factor: 0.94, bg: "#FFD400", fg: "#1A1A1A" },
  { id: "paodeacucar", name: "Pão de Açúcar", short: "Pão de Açúcar", factor: 1.18, bg: "#007A3D", fg: "#FFFFFF" },
  { id: "dia", name: "Dia Supermercado", short: "Dia", factor: 0.96, bg: "#D71920", fg: "#FFFFFF" },
  { id: "guanabara", name: "Supermercados Guanabara", short: "Guanabara", factor: 0.92, bg: "#0A5AA8", fg: "#FFFFFF" },
  { id: "mundial", name: "Supermercados Mundial", short: "Mundial", factor: 0.95, bg: "#F26522", fg: "#FFFFFF" },
  { id: "outro", name: "Outro mercado", short: "Outro", factor: 1.0, bg: "#1C1917", fg: "#FAF7F2" },
];

export function getMarket(id: string | undefined) {
  return MARKETS.find((m) => m.id === id) ?? MARKETS[MARKETS.length - 1];
}
