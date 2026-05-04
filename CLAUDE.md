# CLAUDE.md — Constituição do Harvest Bites

Cardápio digital de meal prep com painel admin e IA. Visão completa em `PRD.md`.

## Stack base

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 3 + Shadcn/UI + Genkit (Gemini 2.5-Flash) + **Supabase** (Postgres, Auth, Realtime).

## Comandos

- `npm run dev` — dev server com Turbopack (porta 9002)
- `npm run build` — build de produção
- `npm run start` — servir build
- `npm run lint` — ESLint via Next
- `npm run typecheck` — `tsc --noEmit`
- `npm run genkit:dev` / `npm run genkit:watch` — devtools Genkit (flows em `src/ai/flows`)

## Convenções

- Alias `@/*` → `src/*`.
- UI primitivos em `src/components/ui` (Shadcn). Não editar manualmente — re-gerar via CLI quando preciso.
- Cliente Supabase em `src/lib/supabase/{client,server,middleware}.ts`. Browser usa `client`, RSC/Server Action usa `server`. Nunca importar `server.ts` em código `"use client"`.
- Hooks de dados em `src/lib/supabase/hooks` (`useTable`, `useRow`).
- Flows de IA em `src/ai/flows/*.ts`.
- Tipos de domínio em `src/app/types/meal.ts`.
- `apphosting.yaml` foi removido — deploy alvo: **Vercel**.

## Decisões arquiteturais

- Escolhemos Supabase em vez de Firebase para o backend/banco de dados para maior controle e facilidade com PostgreSQL.
- Escolhemos Supabase Auth apenas em `/adminconfiguration` em vez de auth global porque o fluxo do cliente é otimizado para conversão sem fricção (cliente continua identificado por telefone via `localStorage`).
- Escolhemos Realtime apenas em `orders` e `leads` em vez de em todas as tabelas porque só essas exigem reatividade ao vivo no painel do gerente.
- Escolhemos Vercel como destino de deploy em vez de Firebase App Hosting porque Next.js 15 + Server Actions têm suporte nativo e zero configuração extra.

<!-- Toda decisão arquitetural deve ser registrada acima no formato "Escolhemos X em vez de Y porque Z". -->
<!-- Workflow repetitivo vira skill em ~/.claude/skills/<nome>; aqui guarda só o link/referência. -->
<!-- Se a mesma instrução for dada >3 vezes, sugerir adicioná-la a este arquivo. -->
<!-- Limite atual: 50 linhas. Limite absoluto futuro: 200 linhas. -->
