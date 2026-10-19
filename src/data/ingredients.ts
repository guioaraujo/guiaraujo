import type { Ingredient } from "@/lib/types";

type Def = Omit<Ingredient, "id">;

// Preços de referência (R$) por kg, por litro ou por unidade. São estimativas
// médias de varejo no Brasil; o fator do mercado escolhido ajusta para cima ou
// para baixo. Servem para orçar a semana, não para substituir a etiqueta.
export const INGREDIENTS = {
  // Hortifrúti
  tomate: { name: "tomate", emoji: "🍅", aisle: "Hortifrúti", unit: "g", pricePer: 8.5 },
  cebola: { name: "cebola", emoji: "🧅", aisle: "Hortifrúti", unit: "g", pricePer: 6 },
  alho: { name: "alho", emoji: "🧄", aisle: "Hortifrúti", unit: "g", pricePer: 38 },
  batata: { name: "batata", emoji: "🥔", aisle: "Hortifrúti", unit: "g", pricePer: 6.5 },
  "batata-doce": { name: "batata-doce", emoji: "🍠", aisle: "Hortifrúti", unit: "g", pricePer: 7 },
  cenoura: { name: "cenoura", emoji: "🥕", aisle: "Hortifrúti", unit: "g", pricePer: 6 },
  abobrinha: { name: "abobrinha", emoji: "🥒", aisle: "Hortifrúti", unit: "g", pricePer: 8 },
  abobora: { name: "abóbora cabotiá", emoji: "🎃", aisle: "Hortifrúti", unit: "g", pricePer: 5.5 },
  brocolis: { name: "brócolis", emoji: "🥦", aisle: "Hortifrúti", unit: "un", pricePer: 7.5 },
  alface: { name: "alface", emoji: "🥬", aisle: "Hortifrúti", unit: "un", pricePer: 4 },
  couve: { name: "couve (maço)", emoji: "🥬", aisle: "Hortifrúti", unit: "un", pricePer: 4.5 },
  espinafre: { name: "espinafre (maço)", emoji: "🌿", aisle: "Hortifrúti", unit: "un", pricePer: 5 },
  pimentao: { name: "pimentão", emoji: "🫑", aisle: "Hortifrúti", unit: "g", pricePer: 11 },
  limao: { name: "limão", emoji: "🍋", aisle: "Hortifrúti", unit: "g", pricePer: 6 },
  banana: { name: "banana", emoji: "🍌", aisle: "Hortifrúti", unit: "g", pricePer: 7 },
  maca: { name: "maçã", emoji: "🍎", aisle: "Hortifrúti", unit: "g", pricePer: 10 },
  mamao: { name: "mamão", emoji: "🍈", aisle: "Hortifrúti", unit: "g", pricePer: 6 },
  morango: { name: "morango (bandeja)", emoji: "🍓", aisle: "Hortifrúti", unit: "un", pricePer: 9 },
  abacate: { name: "abacate", emoji: "🥑", aisle: "Hortifrúti", unit: "un", pricePer: 6 },
  mandioca: { name: "mandioca", emoji: "🍠", aisle: "Hortifrúti", unit: "g", pricePer: 7 },
  coentro: { name: "coentro (maço)", emoji: "🌿", aisle: "Hortifrúti", unit: "un", pricePer: 3 },
  salsinha: { name: "salsinha e cebolinha (maço)", emoji: "🌿", aisle: "Hortifrúti", unit: "un", pricePer: 3 },
  gengibre: { name: "gengibre", emoji: "🫚", aisle: "Hortifrúti", unit: "g", pricePer: 22 },
  cogumelo: { name: "cogumelo paris", emoji: "🍄", aisle: "Hortifrúti", unit: "g", pricePer: 48 },
  repolho: { name: "repolho", emoji: "🥬", aisle: "Hortifrúti", unit: "g", pricePer: 4.5 },
  pepino: { name: "pepino", emoji: "🥒", aisle: "Hortifrúti", unit: "g", pricePer: 6 },
  milho: { name: "milho verde (lata)", emoji: "🌽", aisle: "Mercearia", unit: "un", pricePer: 4.5 },
  ervilha: { name: "ervilha (lata)", emoji: "🫛", aisle: "Mercearia", unit: "un", pricePer: 4.5 },

  // Açougue e peixaria
  "frango-peito": { name: "peito de frango", emoji: "🍗", aisle: "Açougue e peixaria", unit: "g", pricePer: 22 },
  "frango-coxa": { name: "coxa e sobrecoxa de frango", emoji: "🍗", aisle: "Açougue e peixaria", unit: "g", pricePer: 14 },
  "carne-moida": { name: "carne moída (patinho)", emoji: "🥩", aisle: "Açougue e peixaria", unit: "g", pricePer: 38 },
  acem: { name: "acém em cubos", emoji: "🥩", aisle: "Açougue e peixaria", unit: "g", pricePer: 40 },
  "bife-alcatra": { name: "bife de alcatra", emoji: "🥩", aisle: "Açougue e peixaria", unit: "g", pricePer: 52 },
  linguica: { name: "linguiça toscana", emoji: "🌭", aisle: "Açougue e peixaria", unit: "g", pricePer: 27 },
  "linguica-calabresa": { name: "linguiça calabresa", emoji: "🌭", aisle: "Açougue e peixaria", unit: "g", pricePer: 30 },
  bacon: { name: "bacon", emoji: "🥓", aisle: "Açougue e peixaria", unit: "g", pricePer: 42 },
  "lombo-suino": { name: "lombo suíno", emoji: "🥩", aisle: "Açougue e peixaria", unit: "g", pricePer: 30 },
  tilapia: { name: "filé de tilápia", emoji: "🐟", aisle: "Açougue e peixaria", unit: "g", pricePer: 46 },
  camarao: { name: "camarão limpo", emoji: "🦐", aisle: "Açougue e peixaria", unit: "g", pricePer: 62 },
  "carne-seca": { name: "carne seca", emoji: "🥩", aisle: "Açougue e peixaria", unit: "g", pricePer: 60 },

  // Laticínios e frios
  ovo: { name: "ovos", emoji: "🥚", aisle: "Laticínios e frios", unit: "un", pricePer: 0.95, pack: 12 },
  leite: { name: "leite integral", emoji: "🥛", aisle: "Laticínios e frios", unit: "ml", pricePer: 6, pack: 1000 },
  mussarela: { name: "queijo mussarela", emoji: "🧀", aisle: "Laticínios e frios", unit: "g", pricePer: 52 },
  "queijo-minas": { name: "queijo minas frescal", emoji: "🧀", aisle: "Laticínios e frios", unit: "g", pricePer: 48 },
  "queijo-coalho": { name: "queijo coalho", emoji: "🧀", aisle: "Laticínios e frios", unit: "g", pricePer: 60 },
  parmesao: { name: "parmesão ralado", emoji: "🧀", aisle: "Laticínios e frios", unit: "g", pricePer: 110 },
  requeijao: { name: "requeijão", emoji: "🥣", aisle: "Laticínios e frios", unit: "g", pricePer: 45 },
  "creme-de-leite": { name: "creme de leite", emoji: "🥛", aisle: "Laticínios e frios", unit: "g", pricePer: 20, pack: 200 },
  manteiga: { name: "manteiga", emoji: "🧈", aisle: "Laticínios e frios", unit: "g", pricePer: 62 },
  iogurte: { name: "iogurte natural", emoji: "🥛", aisle: "Laticínios e frios", unit: "g", pricePer: 21, pack: 170 },
  presunto: { name: "presunto", emoji: "🍖", aisle: "Laticínios e frios", unit: "g", pricePer: 36 },
  tofu: { name: "tofu firme", emoji: "🧈", aisle: "Laticínios e frios", unit: "g", pricePer: 30 },

  // Mercearia
  arroz: { name: "arroz branco", emoji: "🍚", aisle: "Mercearia", unit: "g", pricePer: 6.5, pack: 1000 },
  "arroz-arborio": { name: "arroz arbóreo", emoji: "🍚", aisle: "Mercearia", unit: "g", pricePer: 22, pack: 1000 },
  feijao: { name: "feijão carioca", emoji: "🫘", aisle: "Mercearia", unit: "g", pricePer: 9, pack: 1000 },
  "feijao-preto": { name: "feijão preto", emoji: "🫘", aisle: "Mercearia", unit: "g", pricePer: 9.5, pack: 1000 },
  lentilha: { name: "lentilha", emoji: "🫘", aisle: "Mercearia", unit: "g", pricePer: 16, pack: 500 },
  "grao-de-bico": { name: "grão-de-bico", emoji: "🫘", aisle: "Mercearia", unit: "g", pricePer: 20, pack: 500 },
  macarrao: { name: "macarrão espaguete", emoji: "🍝", aisle: "Mercearia", unit: "g", pricePer: 10, pack: 500 },
  "macarrao-penne": { name: "macarrão penne", emoji: "🍝", aisle: "Mercearia", unit: "g", pricePer: 10, pack: 500 },
  "macarrao-yakisoba": { name: "macarrão para yakisoba", emoji: "🍜", aisle: "Mercearia", unit: "g", pricePer: 20, pack: 500 },
  "farinha-trigo": { name: "farinha de trigo", emoji: "🌾", aisle: "Mercearia", unit: "g", pricePer: 6, pack: 1000 },
  "farinha-mandioca": { name: "farinha de mandioca", emoji: "🌾", aisle: "Mercearia", unit: "g", pricePer: 9, pack: 500 },
  aveia: { name: "aveia em flocos", emoji: "🌾", aisle: "Mercearia", unit: "g", pricePer: 14, pack: 500 },
  granola: { name: "granola", emoji: "🥣", aisle: "Mercearia", unit: "g", pricePer: 32, pack: 500 },
  tapioca: { name: "goma de tapioca", emoji: "⚪", aisle: "Mercearia", unit: "g", pricePer: 16, pack: 500 },
  cuscuz: { name: "flocão de milho", emoji: "🌽", aisle: "Mercearia", unit: "g", pricePer: 8, pack: 500 },
  fuba: { name: "fubá", emoji: "🌽", aisle: "Mercearia", unit: "g", pricePer: 6, pack: 1000 },
  tortilha: { name: "tortilha de trigo", emoji: "🫓", aisle: "Mercearia", unit: "un", pricePer: 1.6, pack: 10 },
  "molho-tomate": { name: "molho de tomate", emoji: "🥫", aisle: "Mercearia", unit: "g", pricePer: 12, pack: 340 },
  "extrato-tomate": { name: "extrato de tomate", emoji: "🥫", aisle: "Mercearia", unit: "g", pricePer: 18, pack: 140 },
  atum: { name: "atum em lata", emoji: "🐟", aisle: "Mercearia", unit: "un", pricePer: 9 },
  sardinha: { name: "sardinha em lata", emoji: "🐟", aisle: "Mercearia", unit: "un", pricePer: 7.5 },
  "leite-coco": { name: "leite de coco", emoji: "🥥", aisle: "Mercearia", unit: "ml", pricePer: 26, pack: 200 },
  azeite: { name: "azeite", emoji: "🫒", aisle: "Mercearia", unit: "ml", pricePer: 70, pack: 500 },
  oleo: { name: "óleo de soja", emoji: "🛢️", aisle: "Mercearia", unit: "ml", pricePer: 9, pack: 900 },
  sal: { name: "sal", emoji: "🧂", aisle: "Mercearia", unit: "g", pricePer: 3, pack: 1000 },
  acucar: { name: "açúcar", emoji: "🍬", aisle: "Mercearia", unit: "g", pricePer: 5, pack: 1000 },
  mel: { name: "mel", emoji: "🍯", aisle: "Mercearia", unit: "g", pricePer: 65, pack: 300 },
  "pasta-amendoim": { name: "pasta de amendoim", emoji: "🥜", aisle: "Mercearia", unit: "g", pricePer: 45, pack: 500 },
  castanha: { name: "castanha-de-caju", emoji: "🌰", aisle: "Mercearia", unit: "g", pricePer: 90 },
  cacau: { name: "cacau em pó", emoji: "🍫", aisle: "Mercearia", unit: "g", pricePer: 60, pack: 200 },
  "batata-palha": { name: "batata palha", emoji: "🍟", aisle: "Mercearia", unit: "g", pricePer: 40, pack: 120 },
  azeitona: { name: "azeitona", emoji: "🫒", aisle: "Mercearia", unit: "g", pricePer: 35, pack: 200 },
  "molho-shoyu": { name: "shoyu", emoji: "🍶", aisle: "Temperos e molhos", unit: "ml", pricePer: 38, pack: 150 },
  mostarda: { name: "mostarda", emoji: "🟡", aisle: "Temperos e molhos", unit: "g", pricePer: 25, pack: 200 },
  ketchup: { name: "ketchup", emoji: "🔴", aisle: "Temperos e molhos", unit: "g", pricePer: 20, pack: 400 },
  maionese: { name: "maionese", emoji: "⚪", aisle: "Temperos e molhos", unit: "g", pricePer: 22, pack: 500 },
  curry: { name: "curry em pó", emoji: "🟠", aisle: "Temperos e molhos", unit: "g", pricePer: 120, pack: 30 },
  paprica: { name: "páprica defumada", emoji: "🌶️", aisle: "Temperos e molhos", unit: "g", pricePer: 100, pack: 30 },
  cominho: { name: "cominho", emoji: "🟤", aisle: "Temperos e molhos", unit: "g", pricePer: 90, pack: 30 },
  oregano: { name: "orégano", emoji: "🌿", aisle: "Temperos e molhos", unit: "g", pricePer: 110, pack: 20 },
  "pimenta-do-reino": { name: "pimenta-do-reino", emoji: "⚫", aisle: "Temperos e molhos", unit: "g", pricePer: 120, pack: 30 },
  "louro": { name: "folha de louro", emoji: "🍃", aisle: "Temperos e molhos", unit: "g", pricePer: 200, pack: 10 },
  "caldo-legumes": { name: "caldo de legumes (tablete)", emoji: "🧊", aisle: "Temperos e molhos", unit: "un", pricePer: 0.6, pack: 6 },
  canela: { name: "canela em pó", emoji: "🟤", aisle: "Temperos e molhos", unit: "g", pricePer: 120, pack: 30 },
  "fermento": { name: "fermento em pó", emoji: "⚪", aisle: "Mercearia", unit: "g", pricePer: 40, pack: 100 },
  "chia": { name: "semente de chia", emoji: "⚫", aisle: "Mercearia", unit: "g", pricePer: 60, pack: 200 },

  // Padaria
  "pao-frances": { name: "pão francês", emoji: "🥖", aisle: "Padaria", unit: "un", pricePer: 1.3 },
  "pao-forma": { name: "pão de forma integral", emoji: "🍞", aisle: "Padaria", unit: "un", pricePer: 0.5, pack: 20 },
  "pao-hamburguer": { name: "pão de hambúrguer", emoji: "🍔", aisle: "Padaria", unit: "un", pricePer: 1.6, pack: 4 },
  "pao-sirio": { name: "pão sírio", emoji: "🫓", aisle: "Padaria", unit: "un", pricePer: 1.5, pack: 6 },

  // Bebidas
  cafe: { name: "café em pó", emoji: "☕", aisle: "Bebidas", unit: "g", pricePer: 42, pack: 500 },
} satisfies Record<string, Def>;

export type IngredientId = keyof typeof INGREDIENTS;

export const INGREDIENT_LIST: Ingredient[] = Object.entries(INGREDIENTS).map(
  ([id, def]) => ({ id, ...def }),
);

export function getCatalogIngredient(id: string): Ingredient | undefined {
  const def = (INGREDIENTS as Record<string, Def>)[id];
  return def ? { id, ...def } : undefined;
}
