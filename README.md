# Despensa

App de planejamento de refeições por orçamento, no estilo dos apps de
"plano alimentar da semana": você diz onde compra, para quantas pessoas
cozinha, quanto quer gastar, do que está com vontade, restrições, alergias,
proteínas preferidas e o que tem na cozinha. O app monta a semana, estima o
custo de cada refeição, gera a lista de compras por corredor e guia o preparo
passo a passo.

Funciona como PWA instalável no iPhone (Safari → Compartilhar → Adicionar à
Tela de Início) e salva tudo no próprio aparelho: não precisa de login nem de
banco de dados.

## O que tem

- **Onboarding em 9 passos**: mercado, pessoas, orçamento (slider), refeições
  a planejar, vontades (até 3), restrições, alergias, proteínas e a cozinha
  ilustrada com os aparelhos clicáveis.
- **Plano semanal**: 7 dias × refeições escolhidas, custo estimado por
  refeição e total contra o orçamento. Fixe as que gostou e gere o resto de
  novo. Receitas respeitam restrições, alergias, aparelhos disponíveis e
  proteína principal; o planejador troca pratos até caber no orçamento.
- **Lista de compras**: quantidades somadas de todas as receitas, agrupadas
  por corredor ou por receita, com checkbox, progresso, custo por item e
  compartilhamento (menu nativo do iOS).
- **Receita**: capa, macros por porção, porções ajustáveis (reescala
  ingredientes e custo), ingredientes, preparo, favoritos e histórico.
- **Modo cozinhar**: um passo por tela, ingredientes destacados, timer nos
  passos com tempo, tela que não apaga (Wake Lock).
- **Catálogo**: 50 receitas brasileiras do dia a dia (café, almoço e jantar)
  com ~110 ingredientes e preços de referência por kg/L/un, ajustados por um
  fator por rede (Atacadão, Assaí, Carrefour, Extra, BH, Pão de Açúcar, Dia,
  Guanabara, Mundial).
- **IA opcional**: com `ANTHROPIC_API_KEY` no servidor aparece o botão ✨ no
  plano, que cria receitas inéditas para os dias não fixados usando a API da
  Anthropic com saída estruturada. Sem a chave, tudo funciona com o catálogo.
- **PWA**: manifest, ícones, service worker (Serwist) com fallback offline.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 |
| Ícones | lucide-react |
| Toasts | sonner |
| PWA | @serwist/next (configurator mode, build separado) |
| IA | @anthropic-ai/sdk (`/api/plan`) |
| Dados | `localStorage` do aparelho |
| Host | Netlify (`netlify.toml` na raiz) |

## Rodando local

```bash
npm install
npm run dev        # http://localhost:3000
```

Build de produção (gera também o `public/sw.js`):

```bash
npm run build
npm run start
```

Para testar a instalação no iPhone é preciso HTTPS (o service worker só
registra em origem segura). Em desenvolvimento o SW fica desligado.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | `next build` + `serwist build` |
| `npm run start` | servidor de produção |
| `npm run typecheck` | TypeScript do app e do service worker |
| `npm run lint` | ESLint |
| `npm run icons` | regera os ícones do PWA a partir de `public/icon.svg` |

## Variáveis de ambiente

| Variável | Obrigatória | Para quê |
|---|---|---|
| `ANTHROPIC_API_KEY` | não | habilita a geração de receitas com IA em `/api/plan` |

Cadastre na Netlify em **Site configuration → Environment variables**. Nunca
prefixe com `NEXT_PUBLIC_`.

## Deploy na Netlify

1. Conecte o repositório; o `netlify.toml` já define build, plugin do Next e
   headers (inclusive `Cache-Control` do `sw.js`).
2. Opcional: cadastre `ANTHROPIC_API_KEY`.
3. Deploy. Abra no Safari do iPhone e adicione à Tela de Início.

## Estrutura

```
src/
  app/
    onboarding/         fluxo de perguntas
    (app)/              telas com barra de abas: plano, lista, receitas, perfil
    receita/[id]/       detalhe + modo cozinhar
    api/plan/           geração com IA (opcional)
    offline/            fallback do service worker
  components/           UI (botões, grid de opções, cena da cozinha, cards)
  data/                 receitas, ingredientes e preços, mercados, opções
  lib/                  planejador, preços, lista de compras, store persistido
  service-worker/       fonte do SW compilado pelo Serwist
public/                 manifest, ícones
scripts/                gerador de ícones
```

## Como o planejador decide

1. Filtra o catálogo pelos filtros rígidos: restrições, alergias, aparelhos
   disponíveis e proteína principal (quando há preferência).
2. Pontua cada receita pelas vontades (rápido, baixa caloria, família,
   delivery caseiro, intestino, proteico, conforto, econômico).
3. Divide o orçamento entre os slots da semana (café pesa menos que almoço e
   jantar) e escolhe, com um pouco de aleatoriedade, entre as melhores
   receitas que cabem na meta de cada slot, evitando repetir a proteína do
   dia anterior.
4. Se o total passar do orçamento, troca os pratos mais caros por opções
   mais baratas, primeiro sem repetir receitas, depois permitindo até duas
   repetições.

Os preços são estimativas médias de varejo para orçar a semana, não a
etiqueta do mercado.
