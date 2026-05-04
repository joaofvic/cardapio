// Gera supabase/seed.sql a partir de src/app/data/meals.ts
// Uso: node scripts/build-seed.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const mealsTs = readFileSync(resolve(root, 'src/app/data/meals.ts'), 'utf8');

// Parsing leve: extrai apenas os literais de objeto dentro de MEALS = [ ... ]
const arrayMatch = mealsTs.match(/export const MEALS:[^=]*=\s*\[([\s\S]*?)\];/);
if (!arrayMatch) {
  console.error('Não consegui localizar `export const MEALS = [...]` em src/app/data/meals.ts');
  process.exit(1);
}

const body = arrayMatch[1];
const objects = [];
let depth = 0;
let start = -1;
for (let i = 0; i < body.length; i++) {
  const ch = body[i];
  if (ch === '{') {
    if (depth === 0) start = i;
    depth++;
  } else if (ch === '}') {
    depth--;
    if (depth === 0 && start !== -1) {
      objects.push(body.slice(start, i + 1));
      start = -1;
    }
  }
}

const sqlEscape = (s) => String(s).replace(/'/g, "''");

const rows = objects.map((raw) => {
  const get = (key) => {
    const re = new RegExp(`${key}\\s*:\\s*('([^']*)'|"([^"]*)"|([\\w.\\-]+))`);
    const m = raw.match(re);
    if (!m) return undefined;
    return m[2] ?? m[3] ?? m[4];
  };
  const id = get('id');
  const name = get('name');
  const category = get('category');
  const description = get('description') ?? '';
  const price = Number(get('price') ?? 0);
  const protein = Number(get('protein') ?? 0);
  const carbs = Number(get('carbs') ?? 0);
  const calories = Number(get('calories') ?? 0);
  const rating = get('rating');
  const imageUrlMatch = raw.match(/imageUrl\s*:\s*getImg\(\s*['"]([^'"]+)['"]\s*\)/);
  const imageUrl = imageUrlMatch
    ? `https://picsum.photos/seed/${imageUrlMatch[1]}/400/300`
    : null;
  const isSugarFree = /isSugarFree\s*:\s*true/.test(raw);
  const isGlutenFree = /isGlutenFree\s*:\s*true/.test(raw);
  const isDairyFree = /isDairyFree\s*:\s*true/.test(raw);
  const isAvailableForCombo = !/isAvailableForCombo\s*:\s*false/.test(raw);

  return [
    `'${sqlEscape(id)}'`,
    `'${sqlEscape(name)}'`,
    `'${sqlEscape(category)}'`,
    `'${sqlEscape(description)}'`,
    String(price),
    String(protein),
    String(carbs),
    String(calories),
    imageUrl ? `'${sqlEscape(imageUrl)}'` : 'null',
    rating ? String(Number(rating)) : 'null',
    String(isDairyFree),
    String(isGlutenFree),
    String(isSugarFree),
    'false',
    String(isAvailableForCombo),
  ].join(', ');
});

const sql = `-- Gerado por scripts/build-seed.mjs a partir de src/app/data/meals.ts
-- Re-execute o script após alterar o array MEALS para regenerar este arquivo.

insert into public.meals (
  id, name, category, description, price, protein, carbs, calories,
  "imageUrl", rating, "isDairyFree", "isGlutenFree", "isSugarFree",
  "isArchived", "isAvailableForCombo"
) values
${rows.map((r) => `  (${r})`).join(',\n')}
on conflict (id) do nothing;
`;

mkdirSync(resolve(root, 'supabase'), { recursive: true });
writeFileSync(resolve(root, 'supabase/seed.sql'), sql, 'utf8');
console.log(`Gravado supabase/seed.sql com ${rows.length} meals.`);
