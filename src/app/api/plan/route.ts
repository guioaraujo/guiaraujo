import Anthropic from "@anthropic-ai/sdk";
import { INGREDIENT_LIST } from "@/data/ingredients";
import { ALLERGENS, APPLIANCE_LABEL, CRAVINGS, MEAL_LABEL, PROTEINS, RESTRICTIONS } from "@/data/options";
import { getMarket } from "@/data/markets";
import type { Aisle, MealType, Profile, Recipe } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = "claude-opus-5-5";

export async function GET() {
  return Response.json({ available: !!process.env.ANTHROPIC_API_KEY });
}

interface Body {
  profile: Profile;
  slots: { day: number; meal: MealType }[];
  avoidNames?: string[];
}

const AISLES: Aisle[] = ["Hortifrúti", "Açougue e peixaria", "Laticínios e frios", "Mercearia", "Padaria", "Congelados", "Temperos e molhos", "Bebidas"];

// Esquema de saída: todas as propriedades obrigatórias para o modo estrito.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["recipes"],
  properties: {
    recipes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "day", "meal", "name", "emoji", "description", "cuisine", "minutes",
          "ingredients", "steps", "macros", "tags", "proteins", "allergens", "diet", "appliances",
        ],
        properties: {
          day: { type: "integer", minimum: 0, maximum: 6 },
          meal: { type: "string", enum: ["cafe", "almoco", "jantar"] },
          name: { type: "string" },
          emoji: { type: "string", description: "um único emoji que represente o prato" },
          description: { type: "string", description: "uma frase apetitosa, até 140 caracteres" },
          cuisine: { type: "string" },
          minutes: { type: "integer" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["catalogId", "customName", "customAisle", "customUnit", "customPricePer", "qty", "note"],
              properties: {
                catalogId: { type: "string", description: "id do catálogo, ou string vazia se não existir no catálogo" },
                customName: { type: "string", description: "nome do ingrediente quando catalogId é vazio; senão string vazia" },
                customAisle: { type: "string", enum: AISLES },
                customUnit: { type: "string", enum: ["g", "ml", "un"] },
                customPricePer: { type: "number", description: "preço médio em R$ por kg, por litro ou por unidade (0 se usar catalogId)" },
                qty: { type: "number", description: "quantidade para 2 porções, na unidade do ingrediente" },
                note: { type: "string", description: "observação curta ou string vazia" },
              },
            },
          },
          steps: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["text", "minutes"],
              properties: {
                text: { type: "string", description: "passo em português, com ingredientes entre **asteriscos duplos**" },
                minutes: { type: "integer", description: "tempo de espera/cozimento do passo, 0 se não houver" },
              },
            },
          },
          macros: {
            type: "object",
            additionalProperties: false,
            required: ["kcal", "protein", "carbs", "fat"],
            properties: {
              kcal: { type: "integer" },
              protein: { type: "integer" },
              carbs: { type: "integer" },
              fat: { type: "integer" },
            },
          },
          tags: { type: "array", items: { type: "string", enum: CRAVINGS.map((c) => c.id) } },
          proteins: { type: "array", items: { type: "string", enum: PROTEINS.map((p) => p.id) }, description: "proteína principal primeiro" },
          allergens: { type: "array", items: { type: "string", enum: ALLERGENS.map((a) => a.id) } },
          diet: {
            type: "object",
            additionalProperties: false,
            required: ["vegan", "vegetarian", "pescatarian", "glutenFree", "lactoseFree"],
            properties: {
              vegan: { type: "boolean" },
              vegetarian: { type: "boolean" },
              pescatarian: { type: "boolean" },
              glutenFree: { type: "boolean" },
              lactoseFree: { type: "boolean" },
            },
          },
          appliances: { type: "array", items: { type: "string", enum: Object.keys(APPLIANCE_LABEL) } },
        },
      },
    },
  },
} as const;

type Out = {
  recipes: {
    day: number;
    meal: MealType;
    name: string;
    emoji: string;
    description: string;
    cuisine: string;
    minutes: number;
    ingredients: {
      catalogId: string;
      customName: string;
      customAisle: string;
      customUnit: "g" | "ml" | "un";
      customPricePer: number;
      qty: number;
      note: string;
    }[];
    steps: { text: string; minutes: number }[];
    macros: Recipe["macros"];
    tags: Recipe["tags"];
    proteins: Recipe["proteins"];
    allergens: Recipe["allergens"];
    diet: Required<Recipe["diet"]>;
    appliances: Recipe["appliances"];
  }[];
};

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildPrompt(body: Body) {
  const p = body.profile;
  const market = getMarket(p.marketId);
  const label = <T extends string>(opts: { id: T; label: string }[], ids: T[]) =>
    ids.map((id) => opts.find((o) => o.id === id)?.label ?? id).join(", ") || "nenhuma";

  const catalog = INGREDIENT_LIST.map((i) => `${i.id} | ${i.name} | ${i.unit} | R$ ${i.pricePer.toFixed(2)}`).join("\n");
  const slots = body.slots.map((s) => `- dia ${s.day} (${["seg", "ter", "qua", "qui", "sex", "sáb", "dom"][s.day]}): ${MEAL_LABEL[s.meal]} (meal="${s.meal}")`).join("\n");

  return `Crie uma receita nova para cada slot abaixo, em português do Brasil, para uma família que cozinha em casa.

PERFIL
- Pessoas: ${p.people} (mas escreva as quantidades para 2 porções; o app escala)
- Orçamento semanal total: R$ ${p.budget} para ${p.meals.length} refeições/dia × 7 dias, comprando no ${market.name}
- Vontades: ${label(CRAVINGS, p.cravings)}
- Restrições (obrigatórias): ${label(RESTRICTIONS, p.restrictions)}
- Alergias (obrigatórias, nunca use): ${label(ALLERGENS, p.allergies)}
- Proteínas preferidas: ${p.proteins.length ? label(PROTEINS, p.proteins) : "qualquer uma"}
- Aparelhos disponíveis (use só estes): ${p.appliances.map((a) => APPLIANCE_LABEL[a]).join(", ") || "nenhum, só preparo a frio"}

SLOTS A PREENCHER
${slots}

EVITE repetir estes pratos já no plano: ${body.avoidNames?.join("; ") || "nenhum"}

REGRAS
- Ingredientes: use o catálogo abaixo sempre que existir (catalogId). Só crie ingrediente novo quando realmente não houver equivalente; aí preencha customName, customAisle, customUnit e customPricePer com um preço médio realista de varejo no Brasil.
- Quantidades em g, ml ou un conforme a unidade do ingrediente. Inclua temperos básicos (sal, óleo/azeite) quando usados.
- Receitas variadas entre si (proteína principal diferente em dias seguidos), realistas para o dia a dia brasileiro e com custo por refeição compatível com o orçamento.
- Passos claros e curtos (4 a 6), com os ingredientes citados entre **asteriscos duplos**.
- Macros por porção, estimativa honesta.
- tags: só as que realmente se aplicam. "rapido" exige até 25 minutos; "baixa-caloria" exige até 450 kcal.

CATÁLOGO DE INGREDIENTES (id | nome | unidade | preço por kg, L ou un)
${catalog}`;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Geração com IA não configurada: defina ANTHROPIC_API_KEY no servidor." }, { status: 501 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Corpo inválido" }, { status: 400 });
  }
  if (!body?.profile || !Array.isArray(body.slots) || body.slots.length === 0) {
    return Response.json({ error: "Perfil e slots são obrigatórios" }, { status: 400 });
  }
  if (body.slots.length > 21) body.slots = body.slots.slice(0, 21);

  const client = new Anthropic();
  const encoder = new TextEncoder();

  // Resposta em streaming: espaços periódicos mantêm a conexão viva enquanto
  // o modelo gera (a hospedagem costuma cortar respostas que demoram para
  // enviar o primeiro byte). O cliente faz trim e lê o JSON final.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(" ")), 3000);
      try {
        const message = await client.beta.messages
          .stream({
            model: MODEL,
            max_tokens: 32000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system:
              "Você é um chef e nutricionista brasileiro que planeja refeições caseiras baratas, gostosas e realistas. Responda apenas no formato JSON pedido.",
            messages: [{ role: "user", content: buildPrompt(body) }],
            output_config: { format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> } },
          })
          .finalMessage();

        if (message.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "A IA não pôde atender a esse pedido." })));
          return;
        }
        const text = message.content.find((b) => b.type === "text")?.text ?? "";
        const out = JSON.parse(text) as Out;
        const stamp = Date.now().toString(36);

        const recipes = out.recipes.map((r, idx) => {
          const id = `ai-${slug(r.name)}-${stamp}${idx}`;
          const recipe: Recipe & { day: number; meal: MealType } = {
            id,
            day: r.day,
            meal: r.meal,
            name: r.name,
            emoji: r.emoji || "🍽️",
            hue: (Array.from(r.name).reduce((h, c) => h + c.charCodeAt(0), 0) * 37) % 360,
            description: r.description,
            meals: [r.meal],
            cuisine: r.cuisine,
            minutes: r.minutes,
            servings: 2,
            ingredients: r.ingredients.map((i, k) =>
              i.catalogId
                ? { ingredientId: i.catalogId, qty: i.qty, note: i.note || undefined }
                : {
                    ingredientId: `custom-${slug(i.customName || `item-${k}`)}`,
                    qty: i.qty,
                    note: i.note || undefined,
                    custom: {
                      name: i.customName || `ingrediente ${k + 1}`,
                      aisle: ((AISLES as string[]).includes(i.customAisle) ? i.customAisle : "Mercearia") as Aisle,
                      unit: i.customUnit,
                      pricePer: Math.max(0, i.customPricePer),
                    },
                  },
            ),
            steps: r.steps.map((st) => (st.minutes > 0 ? { text: st.text, minutes: st.minutes } : { text: st.text })),
            macros: r.macros,
            tags: r.tags,
            proteins: r.proteins,
            allergens: r.allergens,
            diet: r.diet,
            appliances: r.appliances,
            source: "ai",
          };
          return recipe;
        });

        controller.enqueue(encoder.encode(JSON.stringify({ recipes })));
      } catch (e) {
        let msg = "Falha ao gerar com IA.";
        if (e instanceof Anthropic.AuthenticationError) msg = "Chave da Anthropic inválida no servidor.";
        else if (e instanceof Anthropic.RateLimitError) msg = "Muitas requisições. Tente de novo em instantes.";
        else if (e instanceof Anthropic.APIError) msg = `Erro da API (${e.status}).`;
        else if (e instanceof SyntaxError) msg = "A IA devolveu um formato inesperado. Tente de novo.";
        controller.enqueue(encoder.encode(JSON.stringify({ error: msg })));
      } finally {
        clearInterval(keepAlive);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}
