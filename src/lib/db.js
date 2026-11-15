// Acesso a dados. Mesma interface para os dois modos:
// - ONLINE (Supabase): lê e grava no banco; guarda uma cópia das listas no aparelho
//   para mostrar quando estiver sem internet.
// - LOCAL: tudo fica no AsyncStorage do aparelho (sem internet, sem conta real).
import { ONLINE_MODE } from '../config'
import { MSG } from '../constants/messages'
import { PLACES, GUIDES } from '../data/seed'
import { sb } from './supabase'
import { readJson, writeJson, uuid } from './storage'

// Tabelas em que cada linha pertence a um usuário (coluna de dono)
const OWNER = { pets: 'tutor_id', health_records: 'tutor_id', reminders: 'tutor_id', alerts: 'autor_id' }
const PRIVATE = ['pets', 'health_records', 'reminders']
const SEED = { places: PLACES, guides: GUIDES }

let currentUserId = null
export function setDbUser(id) {
  currentUserId = id
}

// Avisos de "sem conexão" para a faixa no topo do app
const listeners = new Set()
let offline = false
export function subscribeOffline(fn) {
  listeners.add(fn)
  fn(offline)
  return () => listeners.delete(fn)
}
function setOffline(v) {
  if (offline === v) return
  offline = v
  listeners.forEach((fn) => fn(v))
}

function isNetworkError(err) {
  const msg = String(err?.message || err || '').toLowerCase()
  return msg.includes('network') || msg.includes('failed to fetch') || msg.includes('fetch failed') || msg.includes('timeout')
}

function friendly(err) {
  if (isNetworkError(err)) return new Error(MSG.OFFLINE)
  if (err?.code === '23514' || err?.code === '22P02' || err?.code === '22007') return new Error(MSG.MSG05)
  if (err?.code === '42501') return new Error('Você não tem permissão para fazer isso.')
  return new Error(err?.message || MSG.GENERIC)
}

function sortRows(rows, order, asc) {
  return [...rows].sort((a, b) => {
    const va = a[order] ?? ''
    const vb = b[order] ?? ''
    if (va === vb) return 0
    return (va > vb ? 1 : -1) * (asc ? 1 : -1)
  })
}

// ---------- Modo local ----------
async function localTable(table) {
  const rows = await readJson(`t:${table}`, null)
  if (rows) return rows
  return SEED[table] ? SEED[table].map((r) => ({ created_at: '2026-11-01T00:00:00.000Z', ...r })) : []
}

const local = {
  async list(table, { eq = {}, order = 'created_at', asc = false } = {}) {
    let rows = await localTable(table)
    if (PRIVATE.includes(table)) rows = rows.filter((r) => r[OWNER[table]] === currentUserId)
    rows = rows.filter((r) => Object.entries(eq).every(([k, v]) => r[k] === v))
    return sortRows(rows, order, asc)
  },
  async get(table, id) {
    const rows = await local.list(table)
    return rows.find((r) => r.id === id) || null
  },
  async insert(table, row) {
    const rows = await localTable(table)
    const novo = { id: uuid(), created_at: new Date().toISOString(), ...row }
    if (OWNER[table]) novo[OWNER[table]] = currentUserId
    await writeJson(`t:${table}`, [...rows, novo])
    return novo
  },
  async update(table, id, patch) {
    const rows = await localTable(table)
    const idx = rows.findIndex((r) => r.id === id)
    if (idx < 0) throw new Error('Registro não encontrado.')
    const owner = OWNER[table]
    if (owner && rows[idx][owner] !== currentUserId) throw new Error('Você não tem permissão para fazer isso.')
    rows[idx] = { ...rows[idx], ...patch }
    await writeJson(`t:${table}`, rows)
    return rows[idx]
  },
  async remove(table, id) {
    const rows = await localTable(table)
    const row = rows.find((r) => r.id === id)
    const owner = OWNER[table]
    if (row && owner && row[owner] !== currentUserId) throw new Error('Você não tem permissão para fazer isso.')
    await writeJson(`t:${table}`, rows.filter((r) => r.id !== id))
    // Igual ao "on delete cascade" do banco
    if (table === 'pets') {
      for (const child of ['health_records', 'reminders']) {
        const childRows = await localTable(child)
        await writeJson(`t:${child}`, childRows.filter((r) => r.pet_id !== id))
      }
    }
  },
}

// ---------- Modo online ----------
const online = {
  async list(table, { eq = {}, order = 'created_at', asc = false } = {}) {
    const cacheKey = `cache:${currentUserId || 'anon'}:${table}:${JSON.stringify(eq)}`
    try {
      let q = sb.from(table).select('*')
      Object.entries(eq).forEach(([k, v]) => (q = q.eq(k, v)))
      const { data, error } = await q.order(order, { ascending: asc })
      if (error) throw error
      setOffline(false)
      writeJson(cacheKey, data).catch(() => {})
      return data
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = await readJson(cacheKey, null)
        setOffline(true)
        if (cached) return cached
      }
      throw friendly(err)
    }
  },
  async get(table, id) {
    try {
      const { data, error } = await sb.from(table).select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data
    } catch (err) {
      throw friendly(err)
    }
  },
  async insert(table, row) {
    try {
      const { data, error } = await sb.from(table).insert(row).select().single()
      if (error) throw error
      setOffline(false)
      return data
    } catch (err) {
      if (isNetworkError(err)) setOffline(true)
      throw friendly(err)
    }
  },
  async update(table, id, patch) {
    try {
      const { data, error } = await sb.from(table).update(patch).eq('id', id).select().single()
      if (error) throw error
      return data
    } catch (err) {
      if (isNetworkError(err)) setOffline(true)
      throw friendly(err)
    }
  },
  async remove(table, id) {
    try {
      const { error } = await sb.from(table).delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      if (isNetworkError(err)) setOffline(true)
      throw friendly(err)
    }
  },
}

export const db = ONLINE_MODE ? online : local
