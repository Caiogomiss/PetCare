// Gera supabase/seed.sql a partir de src/data/seed.js
// Uso: node scripts/gerar-seed-sql.js
const fs = require('fs')
const path = require('path')
const { PLACES, GUIDES } = require('../src/data/seed')

const q = (v) => {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return v.length ? `array[${v.map(q).join(', ')}]::text[]` : 'null'
  return `'${String(v).replace(/'/g, "''")}'`
}

function upsert(table, rows) {
  const cols = Object.keys(rows[0])
  const values = rows.map((r) => `  (${cols.map((c) => q(r[c])).join(', ')})`).join(',\n')
  const updates = cols.filter((c) => c !== 'id').map((c) => `${c} = excluded.${c}`).join(', ')
  return `insert into public.${table} (${cols.join(', ')}) values\n${values}\non conflict (id) do update set ${updates};\n`
}

const sql =
  '-- Gerado por scripts/gerar-seed-sql.js. Não edite à mão: altere src/data/seed.js.\n' +
  '-- Rode no SQL Editor do Supabase depois do schema.sql. Pode rodar de novo.\n\n' +
  upsert('places', PLACES) + '\n' + upsert('guides', GUIDES)

const out = path.join(__dirname, '..', 'supabase', 'seed.sql')
fs.writeFileSync(out, sql)
console.log('Gerado:', out)
