// Escolher foto da galeria/câmera e enviar para o Storage do Supabase.
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import { ONLINE_MODE } from '../config'
import { MSG } from '../constants/messages'
import { sb } from './supabase'

const OPTIONS = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true }

// Retorna o asset escolhido ou null se a pessoa cancelar
export async function pickPhoto(fromCamera = false) {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!perm.granted) {
    throw new Error(fromCamera ? 'Permita o acesso à câmera nas configurações do aparelho.' : 'Permita o acesso às fotos nas configurações do aparelho.')
  }
  const res = fromCamera ? await ImagePicker.launchCameraAsync(OPTIONS) : await ImagePicker.launchImageLibraryAsync(OPTIONS)
  if (res.canceled || !res.assets?.length) return null
  return res.assets[0]
}

// Retorna a URL da foto para salvar no registro
export async function uploadPhoto(asset, userId) {
  if (!asset) return null
  // No navegador a imagem às vezes vem só como data URI: extrai o base64 dela
  if (!asset.base64 && String(asset.uri).startsWith('data:')) {
    asset = { ...asset, base64: String(asset.uri).split(',')[1] }
  }
  if (!asset.base64) return asset.uri
  // Modo local: guarda a própria imagem (já comprimida) como data URI
  if (!ONLINE_MODE) return `data:image/jpeg;base64,${asset.base64}`

  const path = `${userId}/${Date.now()}.jpg`
  try {
    const { error } = await sb.storage.from('fotos').upload(path, decode(asset.base64), { contentType: 'image/jpeg', upsert: false })
    if (error) throw error
    return sb.storage.from('fotos').getPublicUrl(path).data.publicUrl
  } catch (err) {
    const msg = String(err?.message || '').toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) throw new Error(MSG.OFFLINE)
    throw new Error('Não foi possível enviar a foto. Tente outra imagem.')
  }
}
