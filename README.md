# Gui Araujo

Sistema de gestão para produção audiovisual: projetos, documentos em blocos,
CRM, propostas, financeiro e agenda sincronizada com o Google Calendar.

Funciona em desktop e como PWA instalável no iPhone/iPad.

---

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Server Actions e streaming |
| Estilo | Tailwind CSS v4 + shadcn/ui | dark mode nativo, tokens em OKLCH |
| Animação | Framer Motion | transições de rota e indicador de aba |
| Banco / Auth | Supabase (Postgres + RLS) | segurança na linha, não no app |
| Editor | Tiptap 3 | blocos com slash commands |
| Kanban | @hello-pangea/dnd | drag-and-drop mantido, compatível com React 19 |
| PWA | @serwist/next | sucessor do next-pwa; funciona com Turbopack |
| Host | Netlify | `netlify.toml` na raiz |

---

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | `next build` + gera o service worker |
| `npm run start` | servidor de produção |
| `npm run typecheck` | TypeScript do app e do service worker |
| `npm run lint` | ESLint |
| `npm run icons` | regera os ícones do PWA a partir do vetor |
| `npm run db:check` | confere se o schema foi aplicado no Supabase |
| `npm run google:check` | confere a integração com o Google Calendar |

---

## Banco de dados

Rode os arquivos **em ordem** no SQL Editor do Supabase:

1. `supabase/schema.sql` — tabelas, RLS, view de DRE, funções
2. `supabase/migrations/002_google_calendar.sql` — tokens do Google e eventos
3. `supabase/migrations/003_event_kinds.sql` — tipos de evento abertos
4. `supabase/migrations/004_ai_assistant.sql` — assistente de IA (chave da
   Anthropic e histórico de conversa)

Confira com `npm run db:check` — ele não cobre a migration 004, então valide o
assistente pela própria tela de configurações.

### Modelo de segurança

- RLS ligado em todas as tabelas; cada linha pertence a um `owner_id`.
- `google_credentials` tem RLS **sem nenhuma policy** e os privilégios revogados
  de `anon`/`authenticated`: um refresh token dá acesso permanente à agenda e
  nunca pode ser alcançável pelo navegador. Só o servidor lê, com a service role key.
- Proposta pública não expõe a tabela: a função `get_public_proposal(token)`
  (SECURITY DEFINER) devolve uma proposta por vez, e só se publicada.

---

## Variáveis de ambiente

Cadastre no painel da Netlify (**Site configuration → Environment variables**)
e em `.env.local` para rodar local.

| Variável | Onde achar | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL do site, sem barra final | sim |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → anon/publishable | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → service_role/secret | sim (Calendar) |
| `GOOGLE_CLIENT_ID` | Google Cloud → Credentials | sim (Calendar) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud → Credentials | sim (Calendar) |

As três últimas são **secretas**: nunca prefixe com `NEXT_PUBLIC_`, senão vão
parar no bundle do navegador.

### Google Cloud

1. Ative a **Google Calendar API**.
2. Credencial OAuth 2.0 tipo **Web application**.
3. Authorized redirect URI: `https://<projeto>.supabase.co/auth/v1/callback`
4. Publique o app (**Publishing status → In production**). Em modo *Testing* o
   Google expira o refresh token a cada 7 dias, e a agenda desconectaria toda semana.

### Supabase

Authentication → Providers → **Google**: ativar e colar client id + secret.
Em URL Configuration, incluir o domínio de produção nas **Redirect URLs**.

---

## Deploy na Netlify

O `netlify.toml` já define build, plugin do Next, headers e o tratamento de
deploy previews. Depois de conectar o repositório:

1. Cadastre as variáveis de ambiente acima.
2. Deploy.
3. Ajuste `NEXT_PUBLIC_SITE_URL` para o domínio final.
4. Adicione esse domínio nas Redirect URLs do Supabase.
