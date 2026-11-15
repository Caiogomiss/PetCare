// Leitura e gravação de JSON no aparelho (AsyncStorage), sem deixar erro estourar na tela.
import AsyncStorage from '@react-native-async-storage/async-storage'

const PREFIX = '@petcare:'

export async function readJson(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.warn('Falha ao ler', key, e)
    return fallback
  }
}

export async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (e) {
    console.warn('Falha ao gravar', key, e)
    throw new Error('Não foi possível salvar no aparelho. Verifique se há espaço livre.')
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(PREFIX + key)
  } catch {}
}

export function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
