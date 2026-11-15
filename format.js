// Datas, idade, distância e validações.

const pad = (n) => String(n).padStart(2, '0')

// "2026-03-15" -> "15/03/2026"
export function isoToBr(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

// "15/03/2026" -> "2026-03-15" (ou null se a data não existir)
export function brToIso(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(br || '').trim())
  if (!m) return null
  const [, d, mo, y] = m.map(Number)
  const date = new Date(y, mo - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  if (y < 1990 || y > 2100) return null
  return `${y}-${pad(mo)}-${pad(d)}`
}

// Aplica a máscara DD/MM/AAAA enquanto a pessoa digita
export function maskDate(text) {
  const digits = String(text).replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function maskTime(text) {
  const digits = String(text).replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

export function isValidTime(t) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(t || ''))
  return Boolean(m)
}

export function maskPhone(text) {
  const d = String(text).replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCpf(text) {
  const d = String(text).replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

export function isValidCpf(cpf) {
  const d = String(cpf || '').replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const calc = (len) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10])
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim())
}

export function isValidPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '')
  return d.length === 10 || d.length === 11
}

export function todayIso() {
  const t = new Date()
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

// Diferença em dias entre hoje e a data (negativo = já passou)
export function daysFromToday(iso) {
  if (!iso) return null
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const t = new Date()
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return Math.round((target - today) / 86400000)
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// "2026-12-12" -> "12 de dezembro"
export function isoToLong(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const sameYear = y === new Date().getFullYear()
  return `${d} de ${MESES[m - 1]}${sameYear ? '' : ` de ${y}`}`
}

export function relativeDay(iso) {
  const diff = daysFromToday(iso)
  if (diff === null) return ''
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  if (diff === -1) return 'ontem'
  if (diff > 1 && diff <= 30) return `em ${diff} dias`
  if (diff < -1 && diff >= -30) return `há ${-diff} dias`
  return isoToBr(iso)
}

// Idade a partir da data de nascimento: "7 meses", "2 anos"
export function petAge(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const now = new Date()
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() - (m - 1))
  if (now.getDate() < d) months -= 1
  if (months < 0) return ''
  if (months < 1) return 'menos de 1 mês'
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'ano' : 'anos'}`
}

export function timeAgo(isoDateTime) {
  if (!isoDateTime) return ''
  const diff = (Date.now() - new Date(isoDateTime).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  const days = Math.floor(diff / 86400)
  if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  return isoToBr(isoDateTime.slice(0, 10))
}

// Distância em km entre dois pontos (fórmula de Haversine)
export function distanceKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatKm(km) {
  if (km === null || km === undefined) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

export function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || ''
}
