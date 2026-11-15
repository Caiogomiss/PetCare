// Endereço do projeto e chave pública (anon) do Supabase.
// Ficam em Supabase > Project Settings > API.
// A chave anon é pública: quem protege os dados são as regras do supabase/schema.sql.
// NUNCA coloque aqui a chave service_role.
//
// Com os dois campos vazios, o app roda em MODO LOCAL: tudo fica salvo só no
// aparelho, sem precisar de internet. Bom para testar e como plano B na apresentação.

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const ONLINE_MODE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
