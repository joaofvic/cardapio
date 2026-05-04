# PRD — Harvest Bites

> Cardápio digital + gestão de pedidos de meal prep saudável (multi-cidade RN/CE), com configurador de combos manual e por IA, painel administrativo completo e recomendações via Genkit/Gemini.

## 1. Visão e Escopo

**Harvest Bites** é uma aplicação web mobile-first para venda de marmitas saudáveis sob demanda. O cliente final monta sua cesta a partir do cardápio ou configura combos semanais (manualmente ou enviando seu plano alimentar para análise por IA). O gerente opera tudo a partir de um painel único: pedidos, leads, cardápio, categorias, cupons, horários e visibilidade de features. A entrega é por rotas semanais em sete cidades de RN/CE.

## 2. Personas

- **Cliente final** — não tem login. É identificado por nome + telefone (WhatsApp), com endereço e cidade salvos via `localStorage` e replicados em `users` para que próximos pedidos sejam pré-preenchidos.
- **Gerente** — opera `/adminconfiguration`. Autenticado via Supabase Auth (email/senha). Conta criada manualmente no Supabase (sem signup público).

## 3. Funcionalidades implementadas

### Catálogo
- Sete categorias: Frango, Carne Bovina, Peixe/Outros, Combo, Carboidratos, Vegetais.
- Filtro por categoria + busca textual.
- Card com nome, descrição, preço, macros (proteína/carboidratos/calorias), flags (sem glúten, sem lactose, sem açúcar), imagem.
- Visibilidade da categoria vegetariana e do badge de IA controlada por toggle no painel.

### Carrinho e Checkout
- Sheet lateral com itens, quantidade, remoção e edição de combo.
- Frete grátis acima de R$ 56,50 — abaixo, taxa fixa R$ 9,90.
- Captura de localização via GPS ou endereço manual.
- Aplicação de cupom (código `ADAS` por enquanto, hardcoded; cupons dinâmicos cadastrados no admin).
- Métodos de pagamento: PIX, Cartão (online/maquininha), Apple/Google Pay, NuPay, Dinheiro com troco. **Sem integração real** — registro manual.
- Pedido é gravado em `orders` com status `pending`.

### Combos
- **Manual**: wizard de quatro passos — quantidade (mín. 5), nomes das pessoas (opcional), tamanho (300/400/500g), e seleção de 3 itens por marmita.
- **IA (NOVO)**: cliente envia foto e/ou texto do plano alimentar. Cria um `lead` em `pending`; flow Genkit (`analyze-meal-plan-flow`) extrai metas nutricionais e sugere até 5 itens disponíveis. Gerente responde manualmente.

### Painel Admin (`/adminconfiguration`)
Oito abas:
- **Dashboard** — resumo de vendas, pedidos e leads do dia, gráficos (Recharts).
- **Pedidos** — lista por data, filtro por cidade, transição de status pending → preparing → delivery → completed/cancelled.
- **Leads** — planos enviados pela IA, com foto/texto, marca como respondido.
- **Cardápio** — CRUD de meals com macros, imagem (URL), flags, arquivamento, disponibilidade para combo.
- **Categorias** — CRUD de categorias.
- **Cupons** — criação, ativação e definição do cupom ativo global.
- **Horários** — agenda detalhada por dia da semana + datas especiais (feriados); toggle `isDeliveryOpen` global.
- **Visibilidade** — toggles para análise IA, cupons e categoria vegetariana.

### IA (Genkit + Gemini 2.5-Flash)
- `ai-meal-recommendation-flow.ts` — recebe histórico de navegação (últimas 5 meals visualizadas) + cardápio disponível; devolve até 3 recomendações.
- `analyze-meal-plan-flow.ts` — recebe foto (data URI) ou texto + cardápio; devolve resumo dos objetivos e até 5 meals match.

## 4. Em andamento / pendente

- Pagamento online real (gateway).
- Fluxo de resposta a leads no admin (atualmente só marca como respondido).
- Upload de imagens de meal pelo painel (hoje só URL).
- Notificações em tempo real para o gerente — será resolvido pelo Supabase Realtime nas tabelas `orders` e `leads`.

## 5. Modelos de domínio

Definidos em `src/app/types/meal.ts` e implícitos nos usos:

- **Meal** — id, name, category (enum 7), description, price, protein, carbs, calories, imageUrl, rating?, isDairyFree?, isGlutenFree?, isSugarFree?, isArchived?, isAvailableForCombo?, stockQuantity?, configuration? (`{ marmitaCount, selectedSize, marmitas[][], peopleNames[] }`).
- **CartItem** — Meal + quantity.
- **Order** — id, userId (telefone), customerName, items[], subtotal, deliveryFee, total, status, paymentMethod, createdAt, address.
- **UserProfile** (cliente, key = telefone) — name, phone, address (street, number, neighborhood, city, complement?, reference?).
- **MealPlanLead** — id, userId, customerName, textPlan, photoDataUri?, status, createdAt.
- **Coupon** — id, code, discountPercent, isActive, description, owner, createdAt.
- **SiteSettings** (singleton) — isAiAnalysisEnabled, isCouponsEnabled, isVeggieCategoryVisible, isDeliveryOpen, activeCouponCode, couponDiscountPercent, nextDeliveryDate, orderDeadline, openingHours, detailedSchedule, specialDates[].

## 6. Stack

### Mantida
- Next.js 15.5.9 (App Router, Turbopack)
- React 19.2.1, TypeScript 5
- Tailwind CSS 3.4 + Shadcn/UI (~30 componentes Radix)
- Genkit 1.28 + `@genkit-ai/google-genai` (Gemini 2.5-Flash)
- React Hook Form 7.54 + Zod 3.24
- date-fns 3.6, Recharts 2.15, Lucide React, Embla Carousel

### Inserida
- `@supabase/supabase-js`
- `@supabase/ssr`

### Removida
- `firebase` (única dependência Firebase no projeto)
- `apphosting.yaml` (Firebase App Hosting)

## 7. Roadmap (ordem sugerida)

1. **Migração Firebase → Supabase** (este PRD inicial).
2. Auth de gerente em `/adminconfiguration` (parte da migração).
3. Integração de gateway de pagamento (PIX + cartão).
4. Notificações no admin (Supabase Realtime já habilitado).
5. Upload de imagens de meal pelo painel (Supabase Storage).
6. Fluxo de resposta a leads (e-mail/WhatsApp template).
7. Testes (sem cobertura hoje).
