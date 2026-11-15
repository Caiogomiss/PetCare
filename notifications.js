// Notificações locais dos lembretes (UC06). Funcionam sem internet.
// O id da notificação fica salvo no aparelho, ligado ao id do lembrete.
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { readJson, writeJson } from './storage'

const supported = Platform.OS !== 'web'

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

let channelReady = false
async function ensurePermission() {
  if (!supported) return false
  if (Platform.OS === 'android' && !channelReady) {
    await Notifications.setNotificationChannelAsync('lembretes', {
      name: 'Lembretes de cuidado',
      importance: Notifications.AndroidImportance.HIGH,
    })
    channelReady = true
  }
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  const asked = await Notifications.requestPermissionsAsync()
  return asked.granted
}

// Agenda o aviso no dia e hora do lembrete. Retorna false se não deu para agendar.
export async function scheduleReminder(reminder, petName) {
  try {
    if (!(await ensurePermission())) return false
    const [y, m, d] = reminder.data.split('-').map(Number)
    const [hh, mm] = (reminder.hora || '09:00').split(':').map(Number)
    const when = new Date(y, m - 1, d, hh, mm)
    if (when.getTime() <= Date.now()) return false

    await cancelReminder(reminder.id)
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Lembrete: ${petName}`,
        body: reminder.titulo,
        data: { reminderId: reminder.id, petId: reminder.pet_id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'lembretes' },
    })
    const map = await readJson('notif-map', {})
    map[reminder.id] = notifId
    await writeJson('notif-map', map)
    return true
  } catch (e) {
    console.warn('Falha ao agendar notificação', e)
    return false
  }
}

export async function cancelReminder(reminderId) {
  if (!supported) return
  try {
    const map = await readJson('notif-map', {})
    if (map[reminderId]) {
      await Notifications.cancelScheduledNotificationAsync(map[reminderId])
      delete map[reminderId]
      await writeJson('notif-map', map)
    }
  } catch {}
}
