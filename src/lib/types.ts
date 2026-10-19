export type Unit = "g" | "ml" | "un";

export type Aisle =
  | "Hortifrúti"
  | "Açougue e peixaria"
  | "Laticínios e frios"
  | "Mercearia"
  | "Padaria"
  | "Congelados"
  | "Temperos e molhos"
  | "Bebidas";

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  aisle: Aisle;
  unit: Unit;
  /** Preço em R$ por 1000 g, 1000 ml ou 1 unidade. */
  pricePer: number;
  /** Tamanho típico da embalagem na unidade base (para arredondar a lista). */
  pack?: number;
}

export type MealType = "cafe" | "almoco" | "jantar";

export type RestrictionId =
  | "vegano"
  | "vegetariano"
  | "pescetariano"
  | "sem-gluten"
  | "sem-lactose";

export type AllergenId =
  | "amendoim"
  | "castanhas"
  | "ovos"
  | "crustaceos"
  | "peixe"
  | "soja";

export type ProteinId =
  | "bovina"
  | "frango"
  | "suina"
  | "peixe"
  | "leguminosas"
  | "tofu"
  | "laticinios"
  | "ovos";

export type ApplianceId =
  | "fogao"
  | "forno"
  | "microondas"
  | "airfryer"
  | "pressao"
  | "liquidificador"
  | "batedeira"
  | "sanduicheira"
  | "churrasqueira"
  | "processador"
  | "panela-arroz"
  | "grill";

export type CravingId =
  | "rapido"
  | "baixa-caloria"
  | "familia"
  | "delivery"
  | "intestino"
  | "proteico"
  | "conforto"
  | "economico";

export interface CustomIngredient {
  name: string;
  emoji?: string;
  aisle: Aisle;
  unit: Unit;
  pricePer: number;
}

export interface RecipeIngredient {
  /** id do catálogo ou um id próprio quando `custom` está preenchido */
  ingredientId: string;
  /** quantidade para `servings` porções, na unidade do ingrediente */
  qty: number;
  note?: string;
  custom?: CustomIngredient;
}

export interface RecipeStep {
  text: string;
  minutes?: number;
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Diet {
  vegan?: boolean;
  vegetarian?: boolean;
  pescatarian?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  /** matiz (0-360) do fundo da capa */
  hue: number;
  description: string;
  meals: MealType[];
  cuisine: string;
  minutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  /** por porção */
  macros: Macros;
  tags: CravingId[];
  proteins: ProteinId[];
  allergens: AllergenId[];
  diet: Diet;
  appliances: ApplianceId[];
  source?: "catalog" | "ai";
}

export interface Profile {
  marketId: string;
  people: number;
  budget: number;
  meals: MealType[];
  cravings: CravingId[];
  restrictions: RestrictionId[];
  allergies: AllergenId[];
  proteins: ProteinId[];
  appliances: ApplianceId[];
  createdAt: string;
}

export interface PlanSlot {
  id: string;
  /** 0 = segunda ... 6 = domingo */
  day: number;
  meal: MealType;
  recipeId: string;
  locked: boolean;
  servings: number;
}

export interface Plan {
  id: string;
  createdAt: string;
  /** ISO da segunda-feira da semana planejada */
  weekStart: string;
  slots: PlanSlot[];
  saved: boolean;
}
