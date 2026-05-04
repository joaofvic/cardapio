# Harvest Bites

Cardápio digital de meal prep saudável (multi-cidade RN/CE) com painel admin, configurador de combos manual + IA e recomendações via Genkit/Gemini.

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind + Shadcn/UI, Genkit + Gemini 2.5-Flash, Supabase (Postgres + Auth + Realtime).

## Setup

1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha as chaves do Supabase e do Google AI.
3. No projeto Supabase, aplique `supabase/migrations/0001_initial.sql` e `supabase/seed.sql` (via dashboard SQL Editor ou Supabase CLI).
4. `npm run dev` — abre em http://localhost:9002.

Documentação: ver `PRD.md` e `CLAUDE.md` na raiz.
