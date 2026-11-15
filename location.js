// Localização do usuário (UC07, RN22): só usa o GPS depois da autorização.
// Se a pessoa negar ou o GPS falhar, ela escolhe uma região do DF.
import * as Location from 'expo-location'
import { readJson, writeJson } from './storage'

export const REGIONS = [
  { nome: 'Gama', latitude: -16.0187, longitude: -48.0617 },
  { nome: 'Santa Maria', latitude: -16.0081, longitude: -48.0128 },
  { nome: 'Plano Piloto', latitude: -15.7942, longitude: -47.8822 },
  { nome: 'Taguatinga', latitude: -15.8333, longitude: -48.0564 },
  { nome: 'Ceilândia', latitude: -15.8193, longitude: -48.1081 },
  { nome: 'Samambaia', latitude: -15.8786, longitude: -48.0848 },
  { nome: 'Recanto das Emas', latitude: -15.9142, longitude: -48.0631 },
  { nome: 'Águas Claras', latitude: -15.8394, longitude: -48.0261 },
  { nome: 'Guará', latitude: -15.8237, longitude: -47.9779 },
  { nome: 'Sobradinho', latitude: -15.6522, longitude: -47.7897 },
  { nome: 'Planaltina', latitude: -15.6214, longitude: -47.6487 },
]

// Retorna { latitude, longitude, label } ou lança erro com o motivo
export async function getUserPosition() {
  const perm = await Location.requestForegroundPermissionsAsync()
  if (!perm.granted) throw new Error('permissao')
  const last = await Location.getLastKnownPositionAsync().catch(() => null)
  const pos =
    last ||
    (await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ]))
  const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, label: 'Sua localização' }
  await writeJson('last-position', point).catch(() => {})
  return point
}

export async function getSavedPosition() {
  return readJson('last-position', null)
}

export async function saveRegion(region) {
  const point = { latitude: region.latitude, longitude: region.longitude, label: region.nome }
  await writeJson('last-position', point).catch(() => {})
  return point
}
