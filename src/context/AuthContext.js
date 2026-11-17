// Login, cadastro e perfil do tutor (UC01, UC02).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ONLINE_MODE } from '../config'
import { MSG } from '../constants/messages'
import { sb, recoveryFromUrl, RESET_REDIRECT } from '../lib/supabase'
import { setDbUser } from '../lib/db'
import { readJson, writeJson, removeKey, uuid } from '../lib/storage'

const AuthContext = createContext(null)

// Hash simples só para o modo local de demonstração (no modo online quem cuida da senha é o Supabase)
function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16)
}

function authError(err) {
  const msg = String(err?.message || '').toLowerCase()
  if (msg.includes('invalid login')) return new Error(MSG.MSG09)
  if (msg.includes('already registered') || msg.includes('already been registered')) return new Error(MSG.MSG03)
  if (msg.includes('email not confirmed')) return new Error('Seu e-mail ainda não foi confirmado. Abra o link que enviamos e tente de novo.')
  if (msg.includes('password') && msg.includes('characters')) return new Error('A senha precisa ter pelo menos 6 caracteres.')
  if (msg.includes('rate limit') || msg.includes('too many')) return new Error('Muitas tentativas seguidas. Aguarde alguns minutos.')
  if (msg.includes('network') || msg.includes('fetch')) return new Error(MSG.OFFLINE)
  return new Error(err?.message || MSG.GENERIC)
}

// ---------- Modo local ----------
const localAuth = {
  async restore() {
    const id = await readJson('session', null)
    if (!id) return null
    const accounts = await readJson('accounts', [])
    const acc = accounts.find((a) => a.id === id)
    return acc ? { user: { id: acc.id, email: acc.email }, profile: acc.profile } : null
  },
  async signUp({ nome, email, senha, telefone }) {
    const accounts = await readJson('accounts', [])
    const mail = email.trim().toLowerCase()
    if (accounts.some((a) => a.email === mail)) throw new Error(MSG.MSG03)
    const id = uuid()
    const profile = { id, nome: nome.trim(), telefone: telefone || null, cpf: null, endereco: null }
    await writeJson('accounts', [...accounts, { id, email: mail, senha: hash(senha), profile }])
    await writeJson('session', id)
    return { user: { id, email: mail }, profile, needsConfirmation: false }
  },
  async signIn({ email, senha }) {
    const accounts = await readJson('accounts', [])
    const acc = accounts.find((a) => a.email === email.trim().toLowerCase())
    if (!acc || acc.senha !== hash(senha)) throw new Error(MSG.MSG09)
    await writeJson('session', acc.id)
    return { user: { id: acc.id, email: acc.email }, profile: acc.profile }
  },
  async signOut() {
    await removeKey('session')
  },
  async resetPassword() {
    throw new Error('No modo local não há envio de e-mail. Crie uma nova conta neste aparelho.')
  },
  async updatePassword() {
    throw new Error('Indisponível no modo local.')
  },
  async updateProfile(userId, patch) {
    const accounts = await readJson('accounts', [])
    const idx = accounts.findIndex((a) => a.id === userId)
    if (idx < 0) throw new Error(MSG.GENERIC)
    accounts[idx].profile = { ...accounts[idx].profile, ...patch }
    await writeJson('accounts', accounts)
    return accounts[idx].profile
  },
}

// ---------- Modo online (Supabase) ----------
async function loadProfile(user) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (data) {
    writeJson(`profile:${user.id}`, data).catch(() => {})
    return data
  }
  // Perfil ainda não existe (ex.: conta criada antes do schema): cria agora
  const nome = user.user_metadata?.nome || user.email.split('@')[0]
  const { data: created, error: e2 } = await sb.from('profiles').insert({ id: user.id, nome }).select().single()
  if (e2) throw e2
  return created
}

const onlineAuth = {
  async restore() {
    const { data } = await sb.auth.getSession()
    const user = data?.session?.user
    if (!user) return null
    let profile
    try {
      profile = await loadProfile(user)
    } catch {
      profile = await readJson(`profile:${user.id}`, { id: user.id, nome: user.user_metadata?.nome || '' })
    }
    return { user: { id: user.id, email: user.email }, profile }
  },
  async signUp({ nome, email, senha, telefone }) {
    const { data, error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: { data: { nome: nome.trim(), telefone: telefone || '' } },
    })
    if (error) throw authError(error)
    // Com "Confirm email" ligado o Supabase não devolve sessão, e com e-mail repetido devolve usuário sem identidades
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error(MSG.MSG03)
    if (!data.session) return { user: null, profile: null, needsConfirmation: true }
    const profile = await loadProfile(data.user).catch(() => ({ id: data.user.id, nome }))
    return { user: { id: data.user.id, email: data.user.email }, profile, needsConfirmation: false }
  },
  async signIn({ email, senha }) {
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha })
    if (error) throw authError(error)
    const profile = await loadProfile(data.user).catch(() => ({ id: data.user.id, nome: data.user.user_metadata?.nome || '' }))
    return { user: { id: data.user.id, email: data.user.email }, profile }
  },
  async signOut() {
    await sb.auth.signOut().catch(() => {})
  },
  async resetPassword(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: RESET_REDIRECT })
    if (error) throw authError(error)
  },
  async updatePassword(senha) {
    const { error } = await sb.auth.updateUser({ password: senha })
    if (error) {
      const msg = String(error.message || '').toLowerCase()
      if (msg.includes('different from the old')) throw new Error('A nova senha precisa ser diferente da anterior.')
      throw authError(error)
    }
  },
  async updateProfile(userId, patch) {
    const { data, error } = await sb.from('profiles').update(patch).eq('id', userId).select().single()
    if (error) throw authError(error)
    writeJson(`profile:${userId}`, data).catch(() => {})
    return data
  },
}

const api = ONLINE_MODE ? onlineAuth : localAuth

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState(ONLINE_MODE && recoveryFromUrl)

  const apply = useCallback((res) => {
    setDbUser(res?.user?.id || null)
    setUser(res?.user || null)
    setProfile(res?.profile || null)
  }, [])

  useEffect(() => {
    let alive = true
    api
      .restore()
      .then((res) => alive && apply(res))
      .catch(() => alive && apply(null))
      .finally(() => alive && setLoading(false))

    if (!ONLINE_MODE) return () => (alive = false)
    // Sessão expirada ou encerrada em outro lugar
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') apply(null)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => {
      alive = false
      data?.subscription?.unsubscribe()
    }
  }, [apply])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      onlineMode: ONLINE_MODE,
      recovery,
      async signIn(payload) {
        const res = await api.signIn(payload)
        apply(res)
        return res
      },
      async signUp(payload) {
        const res = await api.signUp(payload)
        if (res.user) apply(res)
        return res
      },
      async signOut() {
        await api.signOut()
        apply(null)
      },
      async resetPassword(email) {
        await api.resetPassword(email)
      },
      async updatePassword(senha) {
        await api.updatePassword(senha)
        setRecovery(false)
      },
      async cancelRecovery() {
        setRecovery(false)
        await api.signOut()
        apply(null)
      },
      async updateProfile(patch) {
        const p = await api.updateProfile(user.id, patch)
        setProfile(p)
        return p
      },
    }),
    [user, profile, loading, recovery, apply]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
