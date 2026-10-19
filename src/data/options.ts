import type {
  AllergenId,
  ApplianceId,
  CravingId,
  MealType,
  ProteinId,
  RestrictionId,
} from "@/lib/types";

export interface Option<T extends string> {
  id: T;
  label: string;
  emoji: string;
  hint?: string;
}

export const MEALS: Option<MealType>[] = [
  { id: "cafe", label: "Café da manhã", emoji: "☕" },
  { id: "almoco", label: "Almoço", emoji: "🍛" },
  { id: "jantar", label: "Jantar", emoji: "🍽️" },
];

export const MEAL_LABEL: Record<MealType, string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  jantar: "Jantar",
};

export const CRAVINGS: Option<CravingId>[] = [
  { id: "rapido", label: "Rápido e fácil", emoji: "⏱️", hint: "até 25 minutos" },
  { id: "baixa-caloria", label: "Baixa caloria", emoji: "🥗", hint: "até 450 kcal" },
  { id: "familia", label: "Favoritos da família", emoji: "🍝" },
  { id: "delivery", label: "Delivery caseiro", emoji: "🍔", hint: "o que você pediria" },
  { id: "intestino", label: "Amigo do intestino", emoji: "🌾", hint: "mais fibras" },
  { id: "proteico", label: "Rico em proteína", emoji: "💪" },
  { id: "conforto", label: "Conforto brasileiro", emoji: "🍲" },
  { id: "economico", label: "Mais econômico", emoji: "🪙" },
];

export const CRAVING_LABEL = Object.fromEntries(
  CRAVINGS.map((c) => [c.id, c.label]),
) as Record<CravingId, string>;

export const RESTRICTIONS: Option<RestrictionId>[] = [
  { id: "vegano", label: "Vegano", emoji: "🥑" },
  { id: "vegetariano", label: "Vegetariano", emoji: "🥕" },
  { id: "pescetariano", label: "Pescetariano", emoji: "🐟" },
  { id: "sem-gluten", label: "Sem glúten", emoji: "🍚" },
  { id: "sem-lactose", label: "Sem lactose", emoji: "🥛" },
];

export const ALLERGENS: Option<AllergenId>[] = [
  { id: "amendoim", label: "Sem amendoim", emoji: "🥜" },
  { id: "castanhas", label: "Sem castanhas e nozes", emoji: "🌰" },
  { id: "ovos", label: "Sem ovos", emoji: "🥚" },
  { id: "crustaceos", label: "Sem crustáceos e moluscos", emoji: "🦐" },
  { id: "peixe", label: "Sem peixe", emoji: "🐠" },
  { id: "soja", label: "Sem soja", emoji: "🫘" },
];

export const PROTEINS: Option<ProteinId>[] = [
  { id: "bovina", label: "Carne bovina", emoji: "🥩" },
  { id: "frango", label: "Frango", emoji: "🍗" },
  { id: "suina", label: "Carne suína", emoji: "🥓" },
  { id: "peixe", label: "Peixes e frutos do mar", emoji: "🐟" },
  { id: "leguminosas", label: "Leguminosas", emoji: "🫘" },
  { id: "tofu", label: "Tofu", emoji: "🧈" },
  { id: "laticinios", label: "Laticínios", emoji: "🧀" },
  { id: "ovos", label: "Ovos", emoji: "🥚" },
];

export const APPLIANCES: Option<ApplianceId>[] = [
  { id: "fogao", label: "Fogão", emoji: "🔥" },
  { id: "forno", label: "Forno", emoji: "♨️" },
  { id: "microondas", label: "Micro-ondas", emoji: "📻" },
  { id: "airfryer", label: "Fritadeira elétrica", emoji: "🍟" },
  { id: "pressao", label: "Panela de pressão", emoji: "🍲" },
  { id: "liquidificador", label: "Liquidificador", emoji: "🥤" },
  { id: "batedeira", label: "Batedeira planetária", emoji: "🎂" },
  { id: "sanduicheira", label: "Sanduicheira", emoji: "🥪" },
  { id: "churrasqueira", label: "Churrasqueira", emoji: "🍖" },
  { id: "processador", label: "Processador de alimentos", emoji: "🔪" },
  { id: "panela-arroz", label: "Panela elétrica de arroz", emoji: "🍚" },
  { id: "grill", label: "Grill elétrico", emoji: "🥩" },
];

export const APPLIANCE_LABEL = Object.fromEntries(
  APPLIANCES.map((a) => [a.id, a.label]),
) as Record<ApplianceId, string>;

/** Posição (em %), alinhamento e rótulo curto de cada aparelho na cena da cozinha. */
export const KITCHEN_SPOTS: Record<ApplianceId, { x: number; y: number; align: "left" | "center" | "right"; short: string }> = {
  microondas: { x: 3, y: 14, align: "left", short: "Micro-ondas" },
  airfryer: { x: 3, y: 14, align: "right", short: "Airfryer" },
  forno: { x: 3, y: 30, align: "left", short: "Forno" },
  pressao: { x: 3, y: 30, align: "right", short: "Panela de pressão" },
  fogao: { x: 3, y: 46, align: "left", short: "Fogão" },
  liquidificador: { x: 3, y: 46, align: "right", short: "Liquidificador" },
  batedeira: { x: 3, y: 62, align: "left", short: "Batedeira" },
  processador: { x: 3, y: 62, align: "right", short: "Processador" },
  sanduicheira: { x: 3, y: 78, align: "left", short: "Sanduicheira" },
  "panela-arroz": { x: 3, y: 78, align: "right", short: "Panela de arroz" },
  grill: { x: 3, y: 92, align: "left", short: "Grill elétrico" },
  churrasqueira: { x: 3, y: 92, align: "right", short: "Churrasqueira" },
};
