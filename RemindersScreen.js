// UC06: Lembretes de cuidado de um pet (RN19)
import React, { useLayoutEffect } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Card, EmptyState, ErrorState, Fab, Loading, Muted, OfflineBanner } from '../../components/ui'
import { useLoad } from '../../hooks/useLoad'
import { db } from '../../lib/db'
import { cancelReminder, scheduleReminder } from '../../lib/notifications'
import { notify } from '../../lib/confirm'
import { daysFromToday, isoToBr, relativeDay } from '../../lib/format'
import { colors, font, fontSize, radius, spacing } from '../../theme'

export default function RemindersScreen({ navigation, route }) {
  const { pet } = route.params
  const { data, setData, error, loading, refreshing, refresh, reload } = useLoad(() => db.list('reminders', { eq: { pet_id: pet.id }, order: 'data', asc: true }), [pet.id])

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Lembretes · ${pet.nome}` })
  }, [navigation, pet])

  async function toggle(r) {
    const feito = !r.feito
    setData((list) => list.map((x) => (x.id === r.id ? { ...x, feito } : x)))
    try {
      await db.update('reminders', r.id, { feito })
      if (feito) await cancelReminder(r.id)
      else await scheduleReminder(r, pet.nome)
    } catch (err) {
      setData((list) => list.map((x) => (x.id === r.id ? { ...x, feito: r.feito } : x)))
      notify('Não foi possível atualizar', err.message)
    }
  }

  const pending = (data || []).filter((r) => !r.feito)
  const done = (data || []).filter((r) => r.feito)
  const items = [...pending, ...(done.length ? [{ id: '__done', header: true }] : []), ...done]

  let empty = null
  if (loading) empty = <Loading />
  else if (error && !data) empty = <ErrorState text={error} onRetry={reload} />
  else empty = <EmptyState icon="bell" title="Nenhum lembrete" text={`Crie lembretes de vermífugo, banho, remédio ou consulta para ${pet.nome}.`} action="Criar lembrete" onAction={() => navigation.navigate('ReminderForm', { pet })} />

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <OfflineBanner />
      <FlatList
        data={loading || (error && !data) ? [] : items}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={empty}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        renderItem={({ item }) =>
          item.header ? (
            <Text style={styles.section}>Concluídos</Text>
          ) : (
            <ReminderRow reminder={item} onToggle={() => toggle(item)} onPress={() => navigation.navigate('ReminderForm', { pet, reminder: item })} />
          )
        }
      />
      {data?.length ? <Fab label="Criar lembrete" onPress={() => navigation.navigate('ReminderForm', { pet })} /> : null}
    </View>
  )
}

function ReminderRow({ reminder, onToggle, onPress }) {
  const diff = daysFromToday(reminder.data)
  const late = !reminder.feito && diff < 0
  return (
    <Card style={[styles.row, reminder.feito && { opacity: 0.6 }]} onPress={onPress} accessibilityLabel={reminder.titulo}>
      <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: reminder.feito }} accessibilityLabel="Marcar como feito" style={[styles.check, reminder.feito && styles.checkOn]}>
        {reminder.feito ? <Feather name="check" size={16} color="#fff" /> : null}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, reminder.feito && { textDecorationLine: 'line-through' }]} numberOfLines={2}>
          {reminder.titulo}
        </Text>
        <Muted style={late ? { color: colors.danger } : null}>
          {isoToBr(reminder.data)} às {reminder.hora}
          {!reminder.feito ? ` · ${late ? 'atrasado' : relativeDay(reminder.data)}` : ''}
        </Muted>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textLight} />
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, marginBottom: spacing.md },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary },
  title: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  section: { fontFamily: font.semibold, fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.md, borderRadius: radius.sm },
})
